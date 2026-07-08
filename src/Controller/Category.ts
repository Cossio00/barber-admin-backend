import db from "../dbConfig/db";
import { Category, Categories } from "../Model/Category";
import ApiResponse from "../Utils/apiResponse";

async function getCategory(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;

  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const rows: any = await db.query(
      `SELECT * FROM category WHERE barbershopid = ?`, 
      [barbershopid]
    );

    const categories = new Categories();
    for (const row of rows) {
      categories.add(new Category(row));
    }

    return ApiResponse.successList(res, { 
      categories: categories.list() 
    }, "Categorias listadas com sucesso");
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_CON_COUNT_ERROR') {
      return ApiResponse.error(res, "Erro de conexão com o banco de dados", "DB_CONNECTION_ERROR", 500);
    }
    return ApiResponse.error(res, "Erro ao buscar lista de categorias", "DB_SELECT_FAILED", 500);
  }
}

async function createCategory(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const category = new Category(req.body);

    const sql = `
      INSERT INTO category (categorydescription, categoryvalue, barbershopid)
      VALUES (?, ?, ?)
    `;

    const result: any = await db.query(sql, [
      category.getDescription(),
      category.getValue(),
      barbershopid
    ]);

    if (result.affectedRows > 0) {
      const generatedId = result.insertId;
      return ApiResponse.success(res, "Categoria criada com sucesso", { categoryId: generatedId }, 201);
    }

    return ApiResponse.error(res, "Não foi possível inserir a categoria", "DB_INSERT_FAILED", 500);
  } catch (err: any) {
    console.error('Error creating category:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return ApiResponse.error(res, "Categoria com identificador duplicado", "DUPLICATE_CATEGORY_ENTRY", 409);
    }
    return ApiResponse.error(res, "Erro interno ao criar categoria", "CREATE_CATEGORY_FAILED", 500);
  }
}

async function updateCategory(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const category = new Category(req.body);
    const categoryId = req.params['id'];
    category.setId(categoryId);

    const checkSql = `SELECT categoryid FROM category WHERE categoryid = ? AND barbershopid = ?`;
    const checkResult: any = await db.query(checkSql, [categoryId, barbershopid]);

    if (checkResult.length === 0) {
      return ApiResponse.error(res, "Categoria não encontrada", "CATEGORY_NOT_FOUND", 404);
    }

    const sql = `
      UPDATE category
      SET categorydescription = ?, categoryvalue = ?
      WHERE categoryid = ? AND barbershopid = ?
    `;

    const result: any = await db.query(sql, [
      category.getDescription(),
      category.getValue(),
      category.getId(),
      barbershopid
    ]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Categoria atualizada com sucesso");
    }

    return ApiResponse.error(res, "Não foi possível atualizar a categoria", "DB_UPDATE_FAILED", 500);
  } catch (err: any) {
    console.error('Error updating category:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return ApiResponse.error(res, "Conflito de dados ao atualizar categoria", "DUPLICATE_CATEGORY_ENTRY", 409);
    }
    return ApiResponse.error(res, "Erro interno ao atualizar categoria", "UPDATE_CATEGORY_FAILED", 500);
  }
}

async function deleteCategory(req: any, res: any) {
  const barbershopid = req.user?.barbershopid;
  if (!barbershopid) {
    return ApiResponse.error(res, "Barbearia não identificada", "MISSING_BARBERSHOP_ID", 401);
  }

  try {
    const categoryId = req.params['id'];

    const checkSql = `SELECT categoryid FROM category WHERE categoryid = ? AND barbershopid = ?`;
    const checkResult: any = await db.query(checkSql, [categoryId, barbershopid]);

    if (checkResult.length === 0) {
      return ApiResponse.error(res, "Categoria não encontrada", "CATEGORY_NOT_FOUND", 404);
    }

    const sql = `DELETE FROM category WHERE categoryid = ? AND barbershopid = ?`;
    const result: any = await db.query(sql, [categoryId, barbershopid]);

    if (result.affectedRows > 0) {
      return ApiResponse.success(res, "Categoria removida com sucesso");
    }

    return ApiResponse.error(res, "Não foi possível remover a categoria", "DB_DELETE_FAILED", 500);
  } catch (err: any) {
    console.error('Error deleting category:', err);

    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return ApiResponse.error(res, "Não é possível excluir categoria pois existem registros vinculados", "CATEGORY_HAS_DEPENDENCIES", 409);
    }

    return ApiResponse.error(res, "Erro interno ao remover categoria", "DELETE_CATEGORY_FAILED", 500);
  }
}

export { getCategory, createCategory, updateCategory, deleteCategory };