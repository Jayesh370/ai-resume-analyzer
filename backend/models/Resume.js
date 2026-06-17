/**
 * models/Resume.js — Data-access layer for the `resumes` table
 *
 * Same migration pattern as User.js: $1/$2 placeholders, { rows } destructuring,
 * RETURNING id instead of insertId, result.rowCount instead of result.affectedRows.
 */

const { getPool } = require("../config/db");

const Resume = {
  /** Save a newly uploaded resume record */
  async create({ userId, originalName, storedName, filePath, fileSize }) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO resumes (user_id, original_name, stored_name, file_path, file_size)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, originalName, storedName, filePath, fileSize]
    );
    return rows[0].id;
  },

  /** Get all resumes for a user, newest first */
  async findByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  },

  /** Get a single resume by ID */
  async findById(id) {
    const pool = getPool();
    const { rows } = await pool.query("SELECT * FROM resumes WHERE id = $1 LIMIT 1", [id]);
    return rows[0] || null;
  },

  /** Update the extracted text after parsing */
  async updateExtractedText(id, text) {
    const pool = getPool();
    await pool.query("UPDATE resumes SET extracted_text = $1 WHERE id = $2", [text, id]);
  },

  /** Delete a resume (only if it belongs to the requesting user) */
  async delete(id, userId) {
    const pool = getPool();
    const result = await pool.query(
      "DELETE FROM resumes WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    // MySQL: result.affectedRows  →  Postgres: result.rowCount
    return result.rowCount > 0;
  },
};

module.exports = Resume;