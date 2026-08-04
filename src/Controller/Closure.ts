import db from "../dbConfig/db";
import { Closure, Closures } from "../Model/Closure";
import { randomUUID } from 'crypto';
import ApiResponse from '../Utils/apiResponse';
import { validateDateFilters, buildFilters } from "../Utils/Filters";

async function getClosures(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    const countResult: any = await db.query(
      `SELECT COUNT(*) as total FROM closure WHERE barbershopid = ?`, 
      [barbershopid]
    );

    const totalClosures = Number(countResult[0]?.total) || 0;
    const totalPages = Math.ceil(totalClosures / limit);

    const query = `
      SELECT * FROM closure 
      WHERE barbershopid = ? 
      ORDER BY closuremonthyear DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    const rows: any = await db.query(query, [barbershopid]);

    const closures = new Closures();
    for (const row of rows) {
      const closure = new Closure(row);
      closures.add(closure);
    }

    return ApiResponse.successList(res, {
      closures: closures.list(),
      currentPage: page,
      totalPages,
      totalClosures,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }, "Fechamentos listados com sucesso");
  } catch (err: any) {
    console.error('Error fetching closures:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_CON_COUNT_ERROR') {
      return ApiResponse.error(res, "Erro de conexão com o banco de dados", "DB_CONNECTION_ERROR", 500);
    }
    return ApiResponse.error(res, "Erro ao buscar fechamentos", "FETCH_CLOSURES_FAILED", 500);
  }
}

async function getClosureDetails(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const closureId = req.params['id'];
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;

    const closureQuery = `SELECT closuremonthyear FROM closure WHERE closureid = ? AND barbershopid = ?`;
    const closureResult: any = await db.query(closureQuery, [closureId, barbershopid]);

    if (!closureResult || closureResult.length === 0) {
      return ApiResponse.error(res, "Fechamento não encontrado", "CLOSURE_NOT_FOUND", 404);
    }

    const { closuremonthyear: closureMonth } = closureResult[0];

    if (!validateDateFilters(startDate, endDate, closureMonth, res)) {
      return;
    }

    const { dateFilter, categoryFilter, params } = buildFilters(
      closureMonth, startDate, endDate, categoryId
    );

    const detailsQuery = `
      SELECT 
        cat.categorydescription, 
        ser.servicedate, 
        cat.categoryvalue as totalValue
      FROM service ser
      JOIN category cat ON ser.servicecategoryid = cat.categoryid
      WHERE DATE_FORMAT(ser.servicedate, '%Y-%m') = ?
        ${dateFilter}
        ${categoryFilter}
        AND ser.servicestatus = 'concluido'
        AND ser.barbershopid = ?
      ORDER BY ser.servicedate;
    `;

    const detailsResult: any = await db.query(detailsQuery, [...params, barbershopid]);

    return ApiResponse.successList(res, {
      services: detailsResult
    }, "Detalhes do fechamento carregados com sucesso");
  } catch (err: any) {
    console.error('Error fetching closure details:', err);
    return ApiResponse.error(res, "Erro ao buscar detalhes do fechamento", "FETCH_CLOSURE_DETAILS_FAILED", 500);
  }
}

async function getClosureOverview(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const closureId = req.params['id'];
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const categoryId = req.body.categoryId;

    const closureQuery = `SELECT closuremonthyear FROM closure WHERE closureid = ? AND barbershopid = ?`;
    const closureResult: any = await db.query(closureQuery, [closureId, barbershopid]);

    if (!closureResult || closureResult.length === 0) {
      return ApiResponse.error(res, "Fechamento não encontrado", "CLOSURE_NOT_FOUND", 404);
    }

    const { closuremonthyear } = closureResult[0];

    if (!validateDateFilters(startDate, endDate, closuremonthyear, res)) {
      return;
    }

    const { dateFilter, categoryFilter, params } = buildFilters(
      closuremonthyear, startDate, endDate, categoryId
    );

    const overviewQuery = `
      SELECT COUNT(*) as serviceCount, SUM(cat.categoryvalue) as filteredTotal
      FROM service ser
      JOIN category cat ON ser.servicecategoryid = cat.categoryid
      WHERE DATE_FORMAT(ser.servicedate, '%Y-%m') = ?
        ${dateFilter}
        ${categoryFilter}
        AND ser.servicestatus = 'concluido'
        AND ser.barbershopid = ?
    `;

    const overviewResult: any = await db.query(overviewQuery, [...params, barbershopid]);

    const { serviceCount, filteredTotal } = overviewResult[0] || { serviceCount: 0, filteredTotal: 0 };
    const average = serviceCount > 0 ? filteredTotal / serviceCount : 0;

    return ApiResponse.successList(res, {
      closuremonthyear,
      serviceCount,
      filteredTotal,
      average
    }, "Overview do fechamento carregado com sucesso");
  } catch (err: any) {
    console.error('Error fetching closure overview:', err);
    return ApiResponse.error(res, "Erro ao buscar overview do fechamento", "FETCH_CLOSURE_OVERVIEW_FAILED", 500);
  }
}

async function isPreviousMonthClosed(monthYear: string, barbershopid: number): Promise<boolean> {
  const anyClosure: any = await db.query(
    `SELECT COUNT(*) as total FROM closure WHERE barbershopid = ?`, 
    [barbershopid]
  );

  const totalClosures = Number(anyClosure[0]?.total) || 0;
  if (totalClosures === 0) {
    return true;
  }

  const [year, month] = monthYear.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevMonthYear = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const result: any = await db.query(
    `SELECT closureid FROM closure WHERE closuremonthyear = ? AND barbershopid = ?`,
    [prevMonthYear, barbershopid]
  );

  return result.length > 0;
}

async function createClosure(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  const monthYear = req.body.closuremonthyear;

  if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
    return ApiResponse.error(res, "Formato inválido. Use YYYY-MM", "INVALID_MONTH_FORMAT", 400);
  }

  const currentMonth = new Date().toISOString().slice(0, 7);

  if (monthYear >= currentMonth) {
    return ApiResponse.error(res, "Não é possível fechar o mês atual ou futuro", "CANNOT_CLOSE_CURRENT_OR_FUTURE_MONTH", 400);
  }

  try {
    const previousClosed = await isPreviousMonthClosed(monthYear, barbershopid);
    if (!previousClosed) {
      return ApiResponse.error(res,
        "Não é possível fechar este mês. O mês anterior ainda está aberto.",
        "PREVIOUS_MONTH_NOT_CLOSED",
        403
      );
    }

    const pendingQuery = `
      SELECT COUNT(*) as pending
      FROM service
      WHERE DATE_FORMAT(servicedate, '%Y-%m') = ?
        AND servicestatus != 'concluido'
        AND barbershopid = ?
    `;
    const pendingResult: any = await db.query(pendingQuery, [monthYear, barbershopid]);
    const pendingCount = pendingResult[0]?.pending || 0;

    if (pendingCount > 0) {
      return ApiResponse.error(res,
        "Não é possível fechar o mês. Existem serviços pendentes.",
        "PENDING_SERVICES_EXIST",
        403
      );
    }

    const totalQuery = `
      SELECT SUM(cat.categoryvalue) as billing
      FROM service ser
      JOIN category cat ON ser.servicecategoryid = cat.categoryid
      WHERE DATE_FORMAT(ser.servicedate, '%Y-%m') = ?
        AND ser.servicestatus = 'concluido'
        AND ser.barbershopid = ?
    `;
    const totalResult: any = await db.query(totalQuery, [monthYear, barbershopid]);
    const totalCalculated = totalResult[0]?.billing || 0;

    const closureId = randomUUID().slice(0, 30);

    const insertQuery = `
      INSERT INTO closure (closureid, closuremonthyear, closureclosed_at, closuretotalcalculated, barbershopid)
      VALUES (?, ?, NOW(), ?, ?)
    `;

    await db.query(insertQuery, [closureId, monthYear, totalCalculated, barbershopid]);

    return ApiResponse.success(res,
      "Mês fechado com sucesso!",
      {
        closureId,
        monthYear,
        totalCalculated
      },
      201
    );
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return ApiResponse.error(res,
        `O mês ${monthYear} já foi fechado anteriormente`,
        "MONTH_ALREADY_CLOSED",
        409
      );
    }
    console.error('Error creating closure:', err);
    return ApiResponse.error(res,
      "Erro interno ao fechar o mês",
      "CREATE_CLOSURE_FAILED",
      500
    );
  }
}

export { getClosures, getClosureDetails, getClosureOverview, createClosure };