import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { Service, Services } from '../Model/Service';
import { ServiceGet, ServicesGet } from '../Model/ServiceGetRequest';
import { error } from 'console';
 

async function getServicesAgenda(req: any, res: any){

    const date = req.body.date

    const sql = `SELECT s.serviceid,  c.clientid, c.clientname, s.servicedate, ca.categorydescription
                    FROM service s 
                    JOIN client c ON s.serviceclientid = c.clientid
                    JOIN category ca ON s.servicecategoryid = ca.categoryid
                    WHERE DATE(s.servicedate) = '${date}'
                    ORDER BY s.servicedate;`
    
    const rows : any = await db.query(sql, null);

    const services = new ServicesGet();

    for(var row of rows){
        const service = new ServiceGet(row);
        services.add(service);
    }

    return services;
}

async function createService(req: any, res: any){

    let serviceID = randomUUID();
    const service = new Service(req.body)
    service.setServiceId(serviceID.slice(0, 30));
    
    const sql: string = `INSERT INTO service (serviceid, serviceclientid, servicedate, servicecategoryid)
            VALUES
            ('${service.getServiceId()}', '${service.getServiceClient()}', '${service.getServiceDate()}', ${service.getServiceCategory()})`

    try{
        const result : any = await db.query(sql, null);
        if(result.affectedRows != 0)
            res.status(202).json({message: 'SERVICE_CREATED_SUCCESSFULLY'});
        else throw error
    }catch(error){
        res.status(404).json({message: 'ERROR_CREATING_SERVICE:', error});
    }
}

async function updateService(req: any, res: any){

    const service = new Service(req.body);
    const serviceId = req.params['id'];
    service.setServiceId(serviceId);

    const sql: string = `UPDATE service
            SET serviceclientid = '${service.getServiceClient()}', servicedate = '${service.getServiceDate()}', servicecategoryid = ${service.getServiceCategory()}
            WHERE serviceid = '${service.getServiceId()}'`;

    try{
        await db.query(sql, null);                                   // Add validation when id is not present in db
    }catch(error){    
        res.status(404).json({message: 'INVALID_DATA'});
    }finally{
        res.status(202).json({message: 'SERVICE_UPDATED_SUCCESSFULLY'});
    }
} 

async function deleteService(req: any, res: any) {
    
    const serviceId = req.params['id'];

    const sql: string = `DELETE FROM service 
            WHERE serviceid = '${serviceId}'`;

    try{
        await db.query(sql, null);                                  // Add validation when id is not present in db
    }catch(err){
        res.status(404).json({message: 'ERROR'});
    }finally{
        res.status(202).json({message: 'SERVICE_DELETED_SUCCESSFULLY'});
    }

}

export {getServicesAgenda, createService, updateService, deleteService};