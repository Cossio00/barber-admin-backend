import db from '../dbConfig/db';
import { randomUUID } from 'crypto';
import { Service, Services } from '../Model/Service';
import { ServiceGet, ServicesGet } from '../Model/ServiceGetRequest';
import { error } from 'console';
 

async function getService(req: any, res: any){

    const id = req.params['id']

    const sql = `SELECT s.serviceid,  c.clientid, c.clientname, s.servicedate, ca.categorydescription
                    FROM service s 
                    JOIN client c ON s.serviceclientid = c.clientid
                    JOIN category ca ON s.servicecategoryid = ca.categoryid
                    WHERE s.serviceid = '${id}';`
    
    const rows : any = await db.query(sql, null);

    const service = new ServiceGet(rows[0]);
    
    return service;
}

async function getServices(req: any, res: any) {
    try {
        const sql = `
            SELECT s.serviceid,
                   c.clientid,
                   c.clientname,
                   s.servicedate,
                   cat.categorydescription as servicecategory,
                   cat.categoryvalue,
                   s.servicestatus
            FROM service s
            JOIN client c ON s.serviceclientid = c.clientid
            JOIN category cat ON s.servicecategoryid = cat.categoryid
            ORDER BY s.servicedate DESC;
        `;

        const rows: any = await db.query(sql, null);

        const services = new ServicesGet();
        for (const row of rows) {
            const service = new ServiceGet(row);
            services.add(service);
        }

        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ message: "ERROR_FETCHING_SERVICES", error: err });
    }
}

async function getServicesAgenda(req: any, res: any){

    const date = req.body.date

    const sql = `SELECT s.serviceid,
                    c.clientid,
                    c.clientname,
                    s.servicedate,
                    cat.categorydescription as servicecategory,
                    cat.categoryvalue,
                    s.servicestatus
                    FROM service s
                    JOIN client c ON s.serviceclientid = c.clientid
                    JOIN category cat ON s.servicecategoryid = cat.categoryid
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
    
    const serviceDate = new Date(service.getServiceDate());

    const restrainDate: string = `SELECT * FROM closure 
            WHERE closuremonthyear = ?;`

    const restrain: any = await db.query(restrainDate, [serviceDate.getFullYear() + "-" +
        (serviceDate.getMonth() + 1).toString().padStart(2, '0')])
    
    if (restrain.length !== 0) {
        res.status(400).json({ message: 'Closed month. Cannot create service' });
        return false;
    }
    
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

async function updateService(req: any, res: any) {
    const serviceId = req.params.id;
    const service = new Service(req.body);
    service.setServiceId(serviceId);

    try {
        const currentServiceQuery = `SELECT servicedate FROM service WHERE serviceid = ?`;
        const currentResult: any = await db.query(currentServiceQuery, [serviceId]);

        if (currentResult.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const currentDate = new Date(currentResult[0].servicedate);
        const currentMonthYear = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;

        const checkCurrentClosure: any = await db.query(
            `SELECT 1 FROM closure WHERE closuremonthyear = ? LIMIT 1`, 
            [currentMonthYear]
        );

        if (checkCurrentClosure.length > 0) {
            return res.status(403).json({ 
                message: 'Cannot update service: original month is closed' 
            });
        }

        const newServiceDate = new Date(service.getServiceDate());
        const newMonthYear = `${newServiceDate.getFullYear()}-${(newServiceDate.getMonth() + 1).toString().padStart(2, '0')}`;

        if (newMonthYear !== currentMonthYear) {
            const checkNewClosure: any = await db.query(
                `SELECT 1 FROM closure WHERE closuremonthyear = ? LIMIT 1`, 
                [newMonthYear]
            );

            if (checkNewClosure.length > 0) {
                return res.status(403).json({ 
                    message: 'Cannot move service to a closed month' 
                });
            }
        }

        const updateSql = `
            UPDATE service 
            SET serviceclientid = ?, 
                servicedate = ?, 
                servicecategoryid = ?,
                servicestatus = ?
            WHERE serviceid = ?
        `;

        await db.query(updateSql, [
            service.getServiceClient(),
            service.getServiceDate(),
            service.getServiceCategory(),
            service.getServiceStatus() || 'agendado',
            serviceId
        ]);

        res.status(200).json({ message: 'SERVICE_UPDATED_SUCCESSFULLY' });

    } catch (error: any) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'ERROR_UPDATING_SERVICE' });
    }
}

async function updateServiceStatus(req: any, res: any) {
    const serviceId = req.params.id;
    const newStatus = req.body.servicestatus;

    if (!serviceId) {
        return res.status(400).json({ message: 'Missing service ID' });
    }

    if (!newStatus || !['agendado', 'concluido', 'cancelado'].includes(newStatus)) {
        return res.status(400).json({ 
            message: 'Invalid status. Allowed values: agendado, concluido, cancelado' 
        });
    }

    try {
        const checkQuery = `
            SELECT DATE_FORMAT(s.servicedate, '%Y-%m') as monthYear 
            FROM service s 
            WHERE s.serviceid = ?
        `;
        const result: any = await db.query(checkQuery, [serviceId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const monthYear = result[0].monthYear;

        const closureCheck: any = await db.query(
            `SELECT 1 FROM closure WHERE closuremonthyear = ? LIMIT 1`,
            [monthYear]
        );

        if (closureCheck.length > 0) {
            return res.status(403).json({ 
                message: 'Cannot update status: service belongs to a closed month' 
            });
        }

        const updateSql = `
            UPDATE service 
            SET servicestatus = ? 
            WHERE serviceid = ?
        `;

        await db.query(updateSql, [newStatus, serviceId]);

        res.status(200).json({ 
            message: 'SERVICE_STATUS_UPDATED_SUCCESSFULLY',
            serviceId,
            newStatus 
        });

    } catch (error: any) {
        console.error('Error updating service status:', error);
        res.status(500).json({ message: 'ERROR_UPDATING_SERVICE_STATUS' });
    }
}

async function deleteService(req: any, res: any) {
    const serviceId = req.params.id;

    try {
        const checkQuery = `
            SELECT DATE_FORMAT(s.servicedate, '%Y-%m') as monthYear 
            FROM service s 
            WHERE s.serviceid = ?
        `;
        const result: any = await db.query(checkQuery, [serviceId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const monthYear = result[0].monthYear;

        const closureCheck: any = await db.query(
            `SELECT 1 FROM closure WHERE closuremonthyear = ? LIMIT 1`, 
            [monthYear]
        );

        if (closureCheck.length > 0) {
            return res.status(403).json({ 
                message: 'Cannot delete service from a closed month' 
            });
        }

        const deleteSql = `DELETE FROM service WHERE serviceid = ?`;
        await db.query(deleteSql, [serviceId]);

        res.status(200).json({ message: 'SERVICE_DELETED_SUCCESSFULLY' });

    } catch (error: any) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'ERROR_DELETING_SERVICE' });
    }
}

export {getService, getServices, getServicesAgenda, createService, updateService, updateServiceStatus, deleteService};