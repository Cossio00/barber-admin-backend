import db from '../dbConfig/db';
import crypto from 'crypto';
import Clients from '../Model/Clients';
import Client from '../Model/Client';

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