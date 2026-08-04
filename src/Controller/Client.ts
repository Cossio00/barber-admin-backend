import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { Client, Clients } from '../Model/Client';
import ApiResponse from '../Utils/apiResponse';

function validateClientData(client: Client): { isValid: boolean; errorMessage?: string; errorTag?: string } {
  const name = client.getName()?.trim();
  const phone = client.getPhone()?.trim();

  if (!name || name.length === 0) {
    return { isValid: false, errorMessage: "Nome do cliente é obrigatório", errorTag: "MISSING_CLIENT_NAME" };
  }
  if (!phone || phone.length === 0) {
    return { isValid: false, errorMessage: "Telefone do cliente é obrigatório", errorTag: "MISSING_CLIENT_PHONE" };
  }
  return { isValid: true };
}

async function getClient(req: any, res: any) {
  const barbershopId = req.user?.barbershopid;

  if (!barbershopId) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_barbershopid", 401);
  }

  try {
    const rows: any = await db.query(
      `SELECT * FROM client WHERE barbershopid = ?`, 
      [barbershopId]
    );

    const clientsObj = new Clients();
    for (const row of rows) {
      clientsObj.add(new Client(row));
    }

    return ApiResponse.successList(res, { 
      clients: clientsObj.list() 
    }, "Clientes listados com sucesso");
  } catch (err: any) {
    console.error('Error fetching clients:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_CON_COUNT_ERROR') {
      return ApiResponse.error(res, "Erro de conexão com o banco de dados", "DB_CONNECTION_ERROR", 500);
    }
    return ApiResponse.error(res, "Erro ao buscar lista de clientes", "DB_SELECT_FAILED", 500);
  }
}

async function createClient(req: any, res: any) {
  const barbershopId = req.user?.barbershopid;
  if (!barbershopId) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_barbershopid", 401);
  }

  try {
    let clientID = randomUUID().slice(0, 30);
    const client = new Client(req.body);
    client.setId(clientID);

    const validation = validateClientData(client);
    if (!validation.isValid) {
      return ApiResponse.error(res, validation.errorMessage!, validation.errorTag!, 400);
    }

    const sql = `
      INSERT INTO client (clientid, clientname, clientphone, barbershopid) 
      VALUES (?, ?, ?, ?)
    `;

    const result: any = await db.query(sql, [
      client.getId(), 
      client.getName(), 
      client.getPhone(),
      barbershopId
    ]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Cliente criado com sucesso", { clientId: clientID }, 201);
    }

    return ApiResponse.error(res, "Não foi possível inserir o cliente", "DB_INSERT_FAILED", 500);
  } catch (err: any) {
    console.error('Error creating client:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return ApiResponse.error(res, "Cliente com identificador duplicado", "DUPLICATE_CLIENT_ENTRY", 409);
    }
    return ApiResponse.error(res, "Erro interno ao criar cliente", "CREATE_CLIENT_FAILED", 500);
  }
}

async function updateClient(req: any, res: any) {
  const barbershopId = req.user?.barbershopid;
  if (!barbershopId) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_barbershopid", 401);
  }

  try {
    const client = new Client(req.body);
    const clientId = req.params['id'];
    client.setId(clientId);

    const validation = validateClientData(client);
    if (!validation.isValid) {
      return ApiResponse.error(res, validation.errorMessage!, validation.errorTag!, 400);
    }

    
    const checkSql = `SELECT clientid FROM client WHERE clientid = ? AND barbershopid = ?`;
    const checkResult: any = await db.query(checkSql, [clientId, barbershopId]);

    if (checkResult.length === 0) {
      return ApiResponse.error(res, "Cliente não encontrado", "CLIENT_NOT_FOUND", 404);
    }

    const sql = `
      UPDATE client
      SET clientname = ?, clientphone = ?
      WHERE clientid = ? AND barbershopid = ?
    `;

    const result: any = await db.query(sql, [
      client.getName(), 
      client.getPhone(), 
      client.getId(),
      barbershopId
    ]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Cliente atualizado com sucesso");
    }

    return ApiResponse.error(res, "Não foi possível atualizar o cliente", "DB_UPDATE_FAILED", 500);
  } catch (err: any) {
    console.error('Error updating client:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return ApiResponse.error(res, "Conflito de dados ao atualizar cliente", "DUPLICATE_CLIENT_ENTRY", 409);
    }
    return ApiResponse.error(res, "Erro interno ao atualizar cliente", "UPDATE_CLIENT_FAILED", 500);
  }
}

async function deleteClient(req: any, res: any) {
  const barbershopId = req.user?.barbershopid;
  if (!barbershopId) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_barbershopid", 401);
  }

  try {
    const clientId = req.params['id'];

    const checkSql = `SELECT clientid FROM client WHERE clientid = ? AND barbershopid = ?`;
    const checkResult: any = await db.query(checkSql, [clientId, barbershopId]);

    if (checkResult.length === 0) {
      return ApiResponse.error(res, "Cliente não encontrado", "CLIENT_NOT_FOUND", 404);
    }

    const sql = `DELETE FROM client WHERE clientid = ? AND barbershopid = ?`;
    const result: any = await db.query(sql, [clientId, barbershopId]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Cliente removido com sucesso");
    }

    return ApiResponse.error(res, "Não foi possível remover o cliente", "DB_DELETE_FAILED", 500);
  } catch (err: any) {
    console.error('Error deleting client:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return ApiResponse.error(res, "Não é possível excluir cliente pois existem registros vinculados", "CLIENT_HAS_DEPENDENCIES", 409);
    }

    return ApiResponse.error(res, "Erro interno ao remover cliente", "DELETE_CLIENT_FAILED", 500);
  }
}

export { getClient, createClient, updateClient, deleteClient };