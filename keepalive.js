const mysql = require("mysql2/promise");

async function pingDB() {
  try {
    console.log("HOST:", process.env.DB_HOST);
    console.log("PORT:", process.env.DB_PORT);
    console.log("USER:", process.env.DB_USER);
    console.log("DB:", process.env.DB_NAME);

    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const [rows] = await conn.query("SELECT NOW() AS time");

    console.log("Connected successfully");
    console.log(rows);

    await conn.end();

  } catch (err) {
    console.error("FULL ERROR:");
    console.error(err);
    process.exit(1);
  }
}

pingDB();