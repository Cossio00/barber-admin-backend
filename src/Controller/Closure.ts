import db from "../dbConfig/db";
import { Closure, Closures } from "../Model/Closure";
import { randomUUID } from 'crypto';
import { error } from "console";

async function getClosures(req: any, res: any) {

    const page = parseInt(req.query.page as string) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    

    try {
        const countResult: any = await db.query(`SELECT COUNT(*) as total FROM closure`, null);
        const totalClosures = Number(countResult[0]?.total) || 0;
        const totalPages = Math.ceil(totalClosures / limit);
        const query = `SELECT * FROM closure ORDER BY closuremonthyear DESC LIMIT ${limit} OFFSET ${offset}`;

        const rows: any = await db.query(query, null);

        const closures = new Closures();
        for (const row of rows) {
            const closure = new Closure(row);
            closures.add(closure);
        }

        res.status(200).json({
            closures,
            currentPage: page,
            totalPages,
            totalClosures,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });

    } catch (err: any) {
        console.error('Error fetching closures:', err);
        res.status(500).json({ message: 'Internal error while fetching closures' });
    }
}

async function getClosureDetails(req: any, res: any){

    const closureId = req.params['id'];

    try{
    const startDate = req.body.startDate;  
    const endDate = req.body.endDate;      
    const categoryId = req.body.categoryId;  

    const sql: string = `SELECT closuremonthyear, closuretotalcalculated FROM closure WHERE closureid = ?`;
    const pendingResult: any = await db.query(sql, [closureId]);

    const { 
        closuremonthyear: closuremonth, 
        closuretotalcalculated: totalvalue 
    } = pendingResult[0];


    let dateFilter = '';
    let params: any[] = [closuremonth]

    if (startDate || endDate) {

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Both startDate and endDate are required when using date filter'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const startYearMonth = startDate.substring(0, 7);
        const endYearMonth = endDate.substring(0, 7);

        if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
            return res.status(400).json({ message: 'Invalid startDate format (YYYY-MM-DD)' });
        }
        if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            return res.status(400).json({ message: 'Invalid endDate format (YYYY-MM-DD)' });
        }
        
        if (startYearMonth !== closuremonth || endYearMonth !== closuremonth) {
            return res.status(400).json({ 
                message: 'Filter dates must be within the closed month' 
            });
        }
        if (end < start) {
            return res.status(400).json({ 
                message: 'endDate cannot be before startDate' 
            });
        }

        
        dateFilter = 'AND servicedate >= ? AND servicedate <= ?';
        params.push(startDate || `${closuremonth}-01`);
        params.push(endDate || `${closuremonth}-31`); 
    }

    let categoryFilter = '';
    if (categoryId) {
        categoryFilter = 'AND ser.servicecategoryid = ?';
        params.push(categoryId);
    }

    const detailsQuery = `SELECT cat.categorydescription, ser.servicedate, cat.categoryvalue as totalValue
                            FROM service ser
                            JOIN category cat ON ser.servicecategoryid = cat.categoryid
                            WHERE DATE_FORMAT(ser.servicedate, '%Y-%m') = ?
                            ${dateFilter}
                            ${categoryFilter}
                            AND ser.servicestatus = 'concluido'
                            ORDER BY ser.servicedate;`

    const detailsResult: any = await db.query(detailsQuery, params);

    res.status(200).json({
        detailsResult
    })
    }catch(err: any){
        console.error('Error fetching closure details:', err);
        res.status(500).json({ message: 'Internal error while fetching closure details' });
    }
}

async function getClosureOverview(req: any, res: any){

    const closureId = req.params['id'];

    try{
    const startDate = req.body.startDate;  
    const endDate = req.body.endDate;      
    const categoryId = req.body.categoryId;  

    const sql: string = `SELECT closuremonthyear, closuretotalcalculated FROM closure WHERE closureid = ?`;
    const pendingResult: any = await db.query(sql, [closureId]);

    const { 
        closuremonthyear: closuremonth, 
        closuretotalcalculated: totalvalue 
    } = pendingResult[0];


    let dateFilter = '';
    let params: any[] = [closuremonth]

    if (startDate || endDate) {

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Both startDate and endDate are required when using date filter'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const startYearMonth = startDate.substring(0, 7);
        const endYearMonth = endDate.substring(0, 7);

        if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
            return res.status(400).json({ message: 'Invalid startDate format (YYYY-MM-DD)' });
        }
        if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            return res.status(400).json({ message: 'Invalid endDate format (YYYY-MM-DD)' });
        }
        
        if (startYearMonth !== closuremonth || endYearMonth !== closuremonth) {
            return res.status(400).json({ 
                message: 'Filter dates must be within the closed month' 
            });
        }
        if (end < start) {
            return res.status(400).json({ 
                message: 'endDate cannot be before startDate' 
            });
        }

        
        dateFilter = 'AND servicedate >= ? AND servicedate <= ?';
        params.push(startDate || `${closuremonth}-01`);
        params.push(endDate || `${closuremonth}-31`); 
    }

    let categoryFilter = '';
    if (categoryId) {
        categoryFilter = 'AND ser.servicecategoryid = ?';
        params.push(categoryId);
    }

    const overviewQuery = `SELECT COUNT(*) as serviceCount, SUM(cat.categoryvalue) as filteredTotal
                            FROM service ser
                            JOIN category cat ON ser.servicecategoryid = cat.categoryid
                            WHERE DATE_FORMAT(ser.servicedate, '%Y-%m') = ?
                            ${dateFilter}
                            ${categoryFilter}
                            AND ser.servicestatus = 'concluido'
                            ORDER BY ser.servicedate;`
    

    const overviewResult: any = await db.query(overviewQuery, params);

    const { serviceCount, filteredTotal } = overviewResult[0] || { serviceCount: 0, filteredTotal: 0 };
    const average = serviceCount > 0 ? filteredTotal / serviceCount : 0;

    res.status(200).json({
        serviceCount,
        filteredTotal,
        average
    })}
    catch(err: any){
        console.error('Error fetching closure overview:', err);
        res.status(500).json({ message: 'Internal error while fetching closure overview' });
    }

}

async function createClosure(req: any, res: any) {
    const monthYear = req.body.closuremonthyear;

    if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
        return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM' });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    if (monthYear >= currentMonth) {
        return res.status(400).json({ message: 'Cannot close a future or current month' });
    }

    try {
        const pendingQuery = `
            SELECT COUNT(*) as pending 
            FROM service 
            WHERE DATE_FORMAT(servicedate, '%Y-%m') = ?
            AND servicestatus != 'concluido'
        `;
        const pendingResult: any = await db.query(pendingQuery, [monthYear]);
        const pendingCount = pendingResult[0]?.pending || 0;

        if (pendingCount > 0) {
            return res.status(403).json({
                message: 'Cannot close month: there are pending services',
                pendingCount
            });
        }

        const totalQuery = `
            SELECT SUM(cat.categoryvalue) as billing
            FROM service ser
            JOIN category cat ON ser.servicecategoryid = cat.categoryid
            WHERE DATE_FORMAT(ser.servicedate, '%Y-%m') = ?
            AND ser.servicestatus = 'concluido'
        `;
        const totalResult: any = await db.query(totalQuery, [monthYear]);
        const totalCalculated = totalResult[0]?.billing || 0;

        const closureId = randomUUID().slice(0, 30);
        const insertQuery = `
            INSERT INTO closure (closureid, closuremonthyear, closureclosed_at, closuretotalcalculated)
            VALUES (?, ?, NOW(), ?)
        `;
        await db.query(insertQuery, [closureId, monthYear, totalCalculated]);

        res.status(201).json({
            message: 'Month closed successfully',
            monthYear,
            totalCalculated
        });

    } catch (err: any) {

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: `Month ${monthYear} has already been closed`
            });
        }

        console.error('Error creating closure:', err);
        return res.status(500).json({
            message: 'Internal server error while closing month'
        });
    }
}


export {getClosures, getClosureDetails, getClosureOverview, createClosure}