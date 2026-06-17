/**
 * config/db.js — PostgreSQL connection pool via `pg` (Neon-hosted)
 *
 * MIGRATION NOTE (MySQL → Postgres):
 *  - mysql2/promise  →  pg
 *  - pool.execute()  →  pool.query()   (still works the same way for parameterised queries)
 *  - [rows]          →  { rows }       (pg returns an object, not an array — every model file
 *                                        that destructures results had to change because of this)
 *  - Neon requires `?sslmode=require` in the connection string, or `ssl: { rejectUnauthorized: false }`
 *    passed explicitly — same idea as the old Aiven MySQL SSL config, just a different driver.
 */

const { Pool } = require("pg");

let pool;

const connectDB = async () => {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // Neon (like Aiven before) requires SSL. Neon's pooled connection strings
    // already include ?sslmode=require, but we set this explicitly too so the
    // app still works even if someone pastes a non-pooled / bare connection string.
    ssl: {
      rejectUnauthorized: false,
    },

    // Equivalent of mysql2's connectionLimit
    max: 10,

    // How long a client can sit idle in the pool before being closed
    idleTimeoutMillis: 30000,

    // How long to wait for a connection before throwing
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL (Neon) connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    process.exit(1);
  }

  // Surface unexpected pool-level errors (e.g. connection dropped) instead of
  // letting them crash the process silently
  pool.on("error", (err) => {
    console.error("⚠️  Unexpected PostgreSQL pool error:", err.message);
  });
};

const getPool = () => {
  if (!pool) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return pool;
};

module.exports = { connectDB, getPool };