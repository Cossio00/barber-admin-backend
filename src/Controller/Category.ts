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
        res.status(404).json({message: 'ERROR_CREATING_ITEM:', error});
    }
}

async function updateCategory(req: any, res: any) {
    const category = new Category(req.body);
    const categoryId = req.params['id'];
    category.setId(categoryId);
    
    const sql: string = `UPDATE category
            SET categorydescription = '${category.getDescription()}', categoryvalue = ${category.getValue()}
            WHERE categoryid = ${category.getId()}`;

    try{
        await db.query(sql, null);
    }catch(err){
        res.status(404).json({message: 'INVALID_DATA'});
    }finally{
        res.status(202).json({message: 'CATEGORY_UPDATED_SUCCESSFULLY'});
    }
}

async function deleteCategory(req: any, res: any){
    const categoryId = req.params['id'];
    
    const sql: string = `DELETE FROM category
            WHERE categoryid = '${categoryId}'`;
    
    try{
        await db.query(sql, null);
    }catch(err){
        res.status(404).json({message: 'ERROR'});
    }finally{
        res.status(202).json({message: 'CATEGORY_DELETED_SUCCESSFULLY'});
    }
}

export {getCategory, createCategory, updateCategory, deleteCategory};