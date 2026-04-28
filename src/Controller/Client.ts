import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { Client, Clients } from '../Model/Client';
import { error } from 'console';
import ApiResponse from '../Utils/apiResponse';


async function getClient(req: any, res: any){
  
  try {
    const rows: any = await db.query(`SELECT * FROM client`, null);
    const clientsObj = new Clients();

    for (const row of rows) {
      clientsObj.add(new Client(row));
    }

    return ApiResponse.successList(res, { clients: clientsObj.list() }, "Clientes listados com sucesso");

  } catch (err: any) {
    console.error('Error fetching clients:', err);
    return ApiResponse.error(res, "Erro ao buscar lista de clientes", "FETCH_CLIENTS_ERROR", 500);
  }

}

async function createClient(req: any, res: any) {
    
  try {
    let clientID = randomUUID().slice(0, 30);
    const client = new Client(req.body);
    client.setId(clientID);

    const sql = `INSERT INTO client (clientid, clientname, clientphone) VALUES (?, ?, ?)`;
    const result: any = await db.query(sql, [client.getId(), client.getName(), client.getPhone()]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Cliente criado com sucesso", { clientId: clientID }, 201);
    }
    return ApiResponse.error(res, "Não foi possível criar o cliente", "CREATE_FAILED", 400);
  } catch (err: any) {
    console.error('Error creating client:', err);
    return ApiResponse.error(res, "Erro ao criar cliente. Verifique os dados.", "CREATE_CLIENT_ERROR", 500);
  }

}

async function updateClient(req: any, res: any) {
  try {
    const client = new Client(req.body);
    const clientId = req.params['id'];
    client.setId(clientId);

    const checkSql = `SELECT clientid FROM client WHERE clientid = ?`;
    const checkResult: any = await db.query(checkSql, [clientId]);

    if (checkResult.length === 0) {
      return ApiResponse.error(res, "Cliente não encontrado", "CLIENT_NOT_FOUND", 404);
    }

    const sql = `
      UPDATE client 
      SET clientname = ?, clientphone = ? 
      WHERE clientid = ?
    `;

    const result: any = await db.query(sql, [client.getName(), client.getPhone(), client.getId()]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Cliente atualizado com sucesso");
    }

    return ApiResponse.error(res, "Não foi possível atualizar o cliente", "UPDATE_FAILED", 400);

  } catch (err: any) {
    console.error('Error updating client:', err);
    return ApiResponse.error(res, "Erro ao atualizar cliente", "UPDATE_CLIENT_ERROR", 500);
  }
}

async function deleteClient(req: any, res: any) {
  try {
    const clientId = req.params['id'];

    const checkSql = `SELECT clientid FROM client WHERE clientid = ?`;
    const checkResult: any = await db.query(checkSql, [clientId]);

    if (checkResult.length === 0) {
      return ApiResponse.error(res, "Cliente não encontrado", "CLIENT_NOT_FOUND", 404);
    }

    const sql = `DELETE FROM client WHERE clientid = ?`;
    const result: any = await db.query(sql, [clientId]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Cliente removido com sucesso");
    }

    return ApiResponse.error(res, "Não foi possível remover o cliente", "DELETE_FAILED", 400);

  } catch (err: any) {
    console.error('Error deleting client:', err);
    return ApiResponse.error(res, "Erro ao remover cliente", "DELETE_CLIENT_ERROR", 500);
  }
}

export {getClient, createClient, updateClient, deleteClient};