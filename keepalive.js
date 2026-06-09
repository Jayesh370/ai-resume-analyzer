const mysql = require("mysql2/promise");

async function pingDB() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await conn.query("SELECT 1");
  console.log("Ping successful");
  await conn.end();
}

pingDB();