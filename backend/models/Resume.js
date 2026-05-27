/**
 * models/Resume.js — Data-access layer for the `resumes` table
 */

const { getPool } = require("../config/db");

const Resume = {
  /** Save a newly uploaded resume record */
  async create({ userId, originalName, storedName, filePath, fileSize }) {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO resumes (user_id, original_name, stored_name, file_path, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, originalName, storedName, filePath, fileSize]
    );
    return result.insertId;
  },

  /** Get all resumes for a user, newest first */
  async findByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  },

  /** Get a single resume by ID */
  async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT * FROM resumes WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  /** Update the extracted text after parsing */
  async updateExtractedText(id, text) {
    const pool = getPool();
    await pool.execute("UPDATE resumes SET extracted_text = ? WHERE id = ?", [text, id]);
  },

  /** Soft-delete a resume */
  async delete(id, userId) {
    const pool = getPool();
    const [result] = await pool.execute(
      "DELETE FROM resumes WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Resume;
