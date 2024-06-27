import { createConnection } from 'mysql2/promise';
import config from './configDB';

async function query(sql: any, params: any){
    
    const connection = await createConnection(config.db);
    const [results, ] = await connection.execute(sql, params);

    return results;
}

export default {query};