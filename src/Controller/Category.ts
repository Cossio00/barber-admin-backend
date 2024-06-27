import { error } from "console";
import db from "../dbConfig/db";
import { Category, Categories } from "../Model/Category";

async function getCategory(req: any, res: any) {
    
    const rows: any = await db.query(`SELECT * FROM category`, null);
    const categories = new Categories();

    for(var row of rows){
        const category = new Category(row);
        categories.add(category);
    }

    return categories;
}

async function createCategory(req: any, res: any){

    const category = new Category(req.body);

    const sql: string = `INSERT INTO category (categorydescription, categoryvalue)
            VALUES
            ('${category.getDescription()}','${category.getValue()}')`;

        try{
            const result: any = await db.query(sql, null);
            if (result.affectedRows != 0)
                res.status(202).json({message: 'CATEGORY_CREATED_SUCCESSFULLY'});
            else throw error
        }catch(error){
            res.status(404).json({message: 'ERROR_CREATING_ITEM'});
        }
}

export {getCategory, createCategory};