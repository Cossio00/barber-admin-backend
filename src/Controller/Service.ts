import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { Service, Services } from '../Model/Service';
import { ServiceGet, ServicesGet } from '../Model/ServiceGetRequest';
import ApiResponse from '../Utils/apiResponse';

async function getService(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const id = req.params['id'];
    const sql = `
      SELECT s.serviceid, c.clientid, c.clientname, s.servicedate, 
             s.servicecategoryid as servicecategory, 
             ca.categorydescription as servicecategoryname
      FROM service s
      JOIN client c ON s.serviceclientid = c.clientid
      JOIN category ca ON s.servicecategoryid = ca.categoryid
      WHERE s.serviceid = ? AND s.barbershopid = ?;
    `;

    const rows: any = await db.query(sql, [id, barbershopid]);

    if (rows.length === 0) {
      return ApiResponse.error(res, "Serviço não encontrado", "SERVICE_NOT_FOUND", 404);
    }

    const service = new ServiceGet(rows[0]);
    return ApiResponse.successList(res, service, "Serviço carregado com sucesso");
  } catch (err: any) {
    console.error('Error fetching service:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_CON_COUNT_ERROR') {
      return ApiResponse.error(res, "Erro de conexão com o banco de dados", "DB_CONNECTION_ERROR", 500);
    }
    return ApiResponse.error(res, "Erro ao buscar serviço", "DB_SELECT_FAILED", 500);
  }
}

async function getServices(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const sql = `
      SELECT s.serviceid, c.clientid, c.clientname, s.servicedate,
             cat.categorydescription as servicecategory,
             cat.categoryvalue, s.servicestatus
      FROM service s
      JOIN client c ON s.serviceclientid = c.clientid
      JOIN category cat ON s.servicecategoryid = cat.categoryid
      WHERE s.barbershopid = ?
      ORDER BY s.servicedate DESC;
    `;

    const rows: any = await db.query(sql, [barbershopid]);

    const services = new ServicesGet();
    for (const row of rows) {
      const service = new ServiceGet(row);
      services.add(service);
    }

    return ApiResponse.successList(res, { services: services.list() }, "Serviços listados com sucesso");
  } catch (err: any) {
    console.error('Error fetching services:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_CON_COUNT_ERROR') {
      return ApiResponse.error(res, "Erro de conexão com o banco de dados", "DB_CONNECTION_ERROR", 500);
    }
    return ApiResponse.error(res, "Erro ao buscar lista de serviços", "DB_SELECT_FAILED", 500);
  }
}

async function getServicesAgenda(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const date = req.body.date;
    const sql = `
      SELECT s.serviceid, c.clientid, c.clientname, s.servicedate,
             cat.categorydescription as servicecategory,
             cat.categoryvalue, s.servicestatus
      FROM service s
      JOIN client c ON s.serviceclientid = c.clientid
      JOIN category cat ON s.servicecategoryid = cat.categoryid
      WHERE DATE(s.servicedate) = ? AND s.barbershopid = ?
      ORDER BY s.servicedate;
    `;

    const rows: any = await db.query(sql, [date, barbershopid]);

    const services = new ServicesGet();
    for (const row of rows) {
      const service = new ServiceGet(row);
      services.add(service);
    }

    return ApiResponse.successList(res, { services: services.list() }, "Serviços da agenda listados com sucesso");
  } catch (err: any) {
    console.error('Error fetching services agenda:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_CON_COUNT_ERROR') {
      return ApiResponse.error(res, "Erro de conexão com o banco de dados", "DB_CONNECTION_ERROR", 500);
    }
    return ApiResponse.error(res, "Erro ao buscar serviços da agenda", "DB_SELECT_FAILED", 500);
  }
}

async function createService(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    let serviceID = randomUUID().slice(0, 30);
    const service = new Service(req.body);
    service.setServiceId(serviceID);

    const serviceDate = new Date(service.getServiceDate());
    const monthYear = `${serviceDate.getFullYear()}-${(serviceDate.getMonth() + 1).toString().padStart(2, '0')}`;

    const restrainDate: any = await db.query(
      `SELECT * FROM closure WHERE closuremonthyear = ? AND barbershopid = ?`,
      [monthYear, barbershopid]
    );

    if (restrainDate.length !== 0) {
      return ApiResponse.error(res, "Mês já fechado. Não é possível criar novo serviço.", "MONTH_ALREADY_CLOSED", 403);
    }

    const sql = `
      INSERT INTO service (serviceid, serviceclientid, servicedate, servicecategoryid, barbershopid)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result: any = await db.query(sql, [
      service.getServiceId(),
      service.getServiceClient(),
      service.getServiceDate(),
      service.getServiceCategory(),
      barbershopid
    ]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Serviço agendado com sucesso", { serviceId: serviceID }, 201);
    }

    return ApiResponse.error(res, "Não foi possível criar o serviço", "DB_INSERT_FAILED", 500);
  } catch (err: any) {
    console.error('Error creating service:', err);
    return ApiResponse.error(res, "Erro interno ao criar serviço", "CREATE_SERVICE_FAILED", 500);
  }
}

async function updateService(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const serviceId = req.params.id;
    const service = new Service(req.body);
    service.setServiceId(serviceId);

    const currentServiceQuery = `SELECT servicedate FROM service WHERE serviceid = ? AND barbershopid = ?`;
    const currentResult: any = await db.query(currentServiceQuery, [serviceId, barbershopid]);

    if (currentResult.length === 0) {
      return ApiResponse.error(res, "Serviço não encontrado", "SERVICE_NOT_FOUND", 404);
    }

    const currentDate = new Date(currentResult[0].servicedate);
    const currentMonthYear = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

    const checkCurrentClosure: any = await db.query(
      `SELECT 1 FROM closure WHERE closuremonthyear = ? AND barbershopid = ? LIMIT 1`,
      [currentMonthYear, barbershopid]
    );

    if (checkCurrentClosure.length > 0) {
      return ApiResponse.error(res, "Não é possível alterar serviço de um mês já fechado", "MONTH_ALREADY_CLOSED", 403);
    }

    const newServiceDate = new Date(service.getServiceDate());
    const newMonthYear = `${newServiceDate.getFullYear()}-${(newServiceDate.getMonth() + 1).toString().padStart(2, '0')}`;

    if (newMonthYear !== currentMonthYear) {
      const checkNewClosure: any = await db.query(
        `SELECT 1 FROM closure WHERE closuremonthyear = ? AND barbershopid = ? LIMIT 1`,
        [newMonthYear, barbershopid]
      );
      if (checkNewClosure.length > 0) {
        return ApiResponse.error(res, "Não é possível mover serviço para um mês já fechado", "MONTH_ALREADY_CLOSED", 403);
      }
    }

    const updateSql = `
      UPDATE service
      SET servicedate = ?, servicecategoryid = ?
      WHERE serviceid = ? AND barbershopid = ?
    `;

    const result: any = await db.query(updateSql, [
      service.getServiceDate(),
      service.getServiceCategory(),
      serviceId,
      barbershopid
    ]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Serviço atualizado com sucesso");
    }

    return ApiResponse.error(res, "Não foi possível atualizar o serviço", "DB_UPDATE_FAILED", 500);
  } catch (err: any) {
    console.error('Error updating service:', err);
    return ApiResponse.error(res, "Erro interno ao atualizar serviço", "UPDATE_SERVICE_FAILED", 500);
  }
}

async function updateServiceStatus(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const serviceId = req.params.id;
    const newStatus = req.body.servicestatus;

    if (!serviceId) {
      return ApiResponse.error(res, "ID do serviço é obrigatório", "MISSING_SERVICE_ID", 400);
    }
    if (!newStatus || !['agendado', 'concluido', 'cancelado'].includes(newStatus)) {
      return ApiResponse.error(res, "Status inválido. Valores permitidos: agendado, concluido, cancelado", "INVALID_STATUS", 400);
    }

    const checkQuery = `
      SELECT DATE_FORMAT(s.servicedate, '%Y-%m') as monthYear
      FROM service s WHERE s.serviceid = ? AND s.barbershopid = ?
    `;
    const result: any = await db.query(checkQuery, [serviceId, barbershopid]);

    if (result.length === 0) {
      return ApiResponse.error(res, "Serviço não encontrado", "SERVICE_NOT_FOUND", 404);
    }

    const monthYear = result[0].monthYear;

    const closureCheck: any = await db.query(
      `SELECT 1 FROM closure WHERE closuremonthyear = ? AND barbershopid = ? LIMIT 1`,
      [monthYear, barbershopid]
    );

    if (closureCheck.length > 0) {
      return ApiResponse.error(res, "Não é possível alterar status de serviço em mês fechado", "MONTH_ALREADY_CLOSED", 403);
    }

    const updateSql = `UPDATE service SET servicestatus = ? WHERE serviceid = ? AND barbershopid = ?`;
    const updateResult: any = await db.query(updateSql, [newStatus, serviceId, barbershopid]);

    if (updateResult.affectedRows > 0) {
      return ApiResponse.success(res, "Status do serviço atualizado com sucesso", { serviceId, newStatus });
    }

    return ApiResponse.error(res, "Não foi possível atualizar o status", "DB_UPDATE_FAILED", 500);
  } catch (err: any) {
    console.error('Error updating service status:', err);
    return ApiResponse.error(res, "Erro interno ao atualizar status", "UPDATE_STATUS_FAILED", 500);
  }
}

async function deleteService(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const serviceId = req.params.id;

    const checkQuery = `
      SELECT DATE_FORMAT(s.servicedate, '%Y-%m') as monthYear
      FROM service s WHERE s.serviceid = ? AND s.barbershopid = ?
    `;
    const result: any = await db.query(checkQuery, [serviceId, barbershopid]);

    if (result.length === 0) {
      return ApiResponse.error(res, "Serviço não encontrado", "SERVICE_NOT_FOUND", 404);
    }

    const monthYear = result[0].monthYear;

    const closureCheck: any = await db.query(
      `SELECT 1 FROM closure WHERE closuremonthyear = ? AND barbershopid = ? LIMIT 1`,
      [monthYear, barbershopid]
    );

    if (closureCheck.length > 0) {
      return ApiResponse.error(res, "Não é possível excluir serviço de um mês já fechado", "MONTH_ALREADY_CLOSED", 403);
    }

    const deleteSql = `DELETE FROM service WHERE serviceid = ? AND barbershopid = ?`;
    const deleteResult: any = await db.query(deleteSql, [serviceId, barbershopid]);

    if (deleteResult.affectedRows > 0) {
      return ApiResponse.success(res, "Serviço removido com sucesso");
    }

    return ApiResponse.error(res, "Não foi possível remover o serviço", "DB_DELETE_FAILED", 500);
  } catch (err: any) {
    console.error('Error deleting service:', err);
    return ApiResponse.error(res, "Erro interno ao remover serviço", "DELETE_SERVICE_FAILED", 500);
  }
}

export { getService, getServices, getServicesAgenda, createService, updateService, updateServiceStatus, deleteService };