import db from '../dbConfig/db';
import crypto from 'crypto';
import { Client, Clients } from '../Model/Client';

async function getClient(req: any, res: any){

    const rows : any = await db.query(`SELECT * FROM client`, null);
    const clients = new Clients();

    for(var row of rows){
        const client = new Client(row);
        clients.add(client);
    }

    return clients;    
}

export default getClient;