import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { Service, Services } from '../Model/Service';
import { error } from 'console';
 

async function getServices(req: any, res: any){

    const rows : any = await db.query(`SELECT * FROM service`, null);
    const services = new Services();

    for(var row of rows){
        const service = new Service(row);
        services.add(service);
    }

    return services;
}

async function createService(req: any, res: any){

    const service = new Service(req.body)

    const sql: string = `INSERT INTO service (serviceclientid, servicedate, servicecategoryid)
            VALUES
            ('${service.getServiceClient()}', '${service.getServiceDate()}', ${service.getServiceCategory()})`

    try{
        const result : any = await db.query(sql, null);
        if(result.affectedRows != 0)
            res.status(202).json({message: 'SERVICE_CREATED_SUCCESSFULLY'});
        else throw error
    }catch(error){
        res.status(404).json({message: 'ERROR_CREATING_SERVICE:', error});
    }
}

export {getServices, createService};