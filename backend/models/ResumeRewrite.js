/**
 * models/ResumeRewrite.js — Data-access layer for the `resume_rewrites` table
 * Standard migration pattern, no MySQL-only constructs.
 */

const { getPool } = require("../config/db");

const parseJson = (value, fallback) => {
  try {
    if (!value) return fallback;
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
};

const parseRewrite = (row) => ({
  ...row,
  rewritten_content: parseJson(row.rewritten_content, {}),
  improvement_summary: parseJson(row.improvement_summary, []),
});

const ResumeRewrite = {
  async create({ userId, resumeId, analysisId = null, originalContent, rewrittenContent, improvementSummary }) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO resume_rewrites
       (user_id, resume_id, analysis_id, original_content, rewritten_content, improvement_summary)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userId,
        resumeId,
        analysisId,
        originalContent,
        JSON.stringify(rewrittenContent || {}),
        JSON.stringify(improvementSummary || []),
      ]
    );
    return rows[0].id;
  },

  async findById(id, userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT rr.*, r.original_name AS resume_name
       FROM resume_rewrites rr
       JOIN resumes r ON r.id = rr.resume_id
       WHERE rr.id = $1 AND rr.user_id = $2
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] ? parseRewrite(rows[0]) : null;
  },

  async findByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT rr.id, rr.resume_id, rr.analysis_id, rr.created_at, r.original_name AS resume_name
       FROM resume_rewrites rr
       JOIN resumes r ON r.id = rr.resume_id
       WHERE rr.user_id = $1
       ORDER BY rr.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async countByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT COUNT(*) AS total FROM resume_rewrites WHERE user_id = $1",
      [userId]
    );
    return Number(rows[0].total);
  },
};

module.exports = ResumeRewrite;