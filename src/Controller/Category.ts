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

export default getCategory;