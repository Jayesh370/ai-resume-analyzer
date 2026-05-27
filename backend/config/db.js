/**
 * config/db.js — MySQL connection pool via mysql2/promise
 * Call connectDB() on startup; use pool.execute() everywhere else.
 */

const mysql = require("mysql2/promise");

let pool;

const connectDB = async () => {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "resume_analyzer",
    waitForConnections: true,
    connectionLimit: 10,       // max concurrent connections
    queueLimit: 0,
    charset: "utf8mb4",
  });

  // Verify connectivity
  const connection = await pool.getConnection();
  console.log("✅  MySQL connected successfully");
  connection.release();
};

const getPool = () => {
  if (!pool) throw new Error("Database not initialized. Call connectDB() first.");
  return pool;
};

module.exports = { connectDB, getPool };
