console.log(process.env.DB_HOST)
const config = {
    db: {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "barber_admin"
    }
};
  
export default config;