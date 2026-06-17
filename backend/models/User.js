/**
 * models/User.js — Data-access layer for the `users` table
 *
 * MIGRATION NOTES:
 *  - "?" placeholders        → "$1, $2, $3..." (Postgres positional params)
 *  - pool.execute()          → pool.query()
 *  - const [rows] = await .. → const { rows } = await ..   (pg returns an object, not a tuple)
 *  - result.insertId         → doesn't exist in pg. We add "RETURNING id" to the INSERT
 *                               and read result.rows[0].id instead.
 */

const { getPool } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = {
  /**
   * Create a new user. Password is hashed before insert.
   * @returns {number} the new user's id
   */
  async create({ name, email, password }) {
    const pool = getPool();
    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashed]
    );
    return rows[0].id;
  },

  /** Find a user by email (returns full row including password_hash) */
  async findByEmail(email) {
    const pool = getPool();
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
    return rows[0] || null;
  },

  /** Find a user by ID (returns row WITHOUT password_hash) */
  async findById(id) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  /** Update profile fields */
  async update(id, { name, email }) {
    const pool = getPool();
    await pool.query(
      "UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3",
      [name, email, id]
    );
    return this.findById(id);
  },

  /** Change password */
  async updatePassword(id, newPassword) {
    const pool = getPool();
    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [hashed, id]
    );
  },

  /** Verify a plaintext password against the stored hash */
  async verifyPassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  },
};

module.exports = User;