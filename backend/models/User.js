/**
 * models/User.js — Data-access layer for the `users` table
 */

const { getPool } = require("../config/db");
const bcrypt = require("bcryptjs");

const User = {
  /**
   * Create a new user. Password is hashed before insert.
   * @returns {number} insertId
   */
  async create({ name, email, password }) {
    const pool = getPool();
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hashed]
    );
    return result.insertId;
  },

  /** Find a user by email (returns full row including password_hash) */
  async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
    return rows[0] || null;
  },

  /** Find a user by ID (returns row WITHOUT password_hash) */
  async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id, name, email, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  /** Update profile fields */
  async update(id, { name, email }) {
    const pool = getPool();
    await pool.execute(
      "UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?",
      [name, email, id]
    );
    return this.findById(id);
  },

  /** Change password */
  async updatePassword(id, newPassword) {
    const pool = getPool();
    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.execute(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [hashed, id]
    );
  },

  /** Verify a plaintext password against the stored hash */
  async verifyPassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  },
};

module.exports = User;
