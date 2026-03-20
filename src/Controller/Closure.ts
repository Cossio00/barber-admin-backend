import db from "../dbConfig/db";
import { Closure, Closures } from "../Model/Closure";
import { randomUUID } from 'crypto';
import { error } from "console";

async function getClosures(req: any, res: any) {


    const rows: any = await db.query(`SELECT * FROM closure`, null);
    const closures = new Closures();

    for(var row of rows){
        const closure = new Closure(row);
        closures.add(closure);
    }

    return closures;
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

async function isMonthClosed(req: any, res: any){

    const closureDate = req.body.closuremonthyear;

    const sql: string = `SELECT * FROM closure WHERE closuremonthyear = '${closureDate}'`;
    
}

export {getClosures, createClosure, isMonthClosed}