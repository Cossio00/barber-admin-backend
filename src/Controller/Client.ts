import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { Client, Clients } from '../Model/Client';
import { error } from 'console';

async function getClient(req: any, res: any){

    const rows : any = await db.query(`SELECT * FROM client`, null);
    const clients = new Clients();

    for(var row of rows){
        const client = new Client(row);
        clients.add(client);
    }

    return clients;    
}

async function createClient(req: any, res: any) {
    
    let clientID = randomUUID();
    const client = new Client(req.body);
    client.setId(clientID.slice(0, 30));

    const sql: string = `INSERT INTO client (clientid, clientname, clientphone)
            VALUES
            ('${client.getId()}', '${client.getName()}', '${client.getPhone()}')`;

    try{
        const result: any = await db.query(sql, null);
        if (result.affectedRows != 0)
            res.status(202).json({message: 'CLIENT_CREATED_SUCCESSFULLY'});
        else throw error
    }catch(error){
        res.status(404).json({message: 'ERROR_CREATING_CLIENT:', error});
    }
}

async function updateClient(req: any, res: any){
    const client = new Client(req.body);
    const clientId = req.params['id'];
    client.setId(clientId);

    const sql: string = `UPDATE client
            SET clientname = '${client.getName()}', clientphone = '${client.getPhone()}'
            WHERE clientid = '${client.getId()}'`;

    try{
        await db.query(sql, null);                              // Add validation when id is not present in db
    }catch(err){
        res.status(404).json({message: 'INVALID_DATA'});
    }finally{
        res.status(202).json({message: 'CLIENT_UPDATED_SUCCESSFULLY'});
    }
}

async function deleteClient(req: any, res: any){
    const clientId = req.params['id'];

    const sql: string = `DELETE FROM client
            WHERE clientid = '${clientId}'`;
    
    try{
        await db.query(sql, null);                              // Add validation when id is not present in db
    }catch(err){
        res.status(404).json({message: 'ERROR'});
    }finally{
        res.status(202).json({message: 'CLIENT_DELETED_SUCCESSFULLY'});
    }
}

export {getClient, createClient, updateClient, deleteClient};