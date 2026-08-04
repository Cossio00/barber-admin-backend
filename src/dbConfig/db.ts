import { createPool } from "mysql2/promise";
import config from "./configDB";

const pool = createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(sql: string, params: any[] = []) {
  const [results] = await pool.execute(sql, params);
  return results;
}

export default { query };