/**
 * config/db.js — MySQL connection pool via mysql2/promise
 */

const mysql = require("mysql2/promise");

let pool;

const connectDB = async () => {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Required for Aiven
    ssl: {
      rejectUnauthorized: false,
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
  });

  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    process.exit(1);
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return pool;
};

module.exports = { connectDB, getPool };