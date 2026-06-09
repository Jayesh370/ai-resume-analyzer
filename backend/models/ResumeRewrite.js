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
    const [result] = await pool.execute(
      `INSERT INTO resume_rewrites
       (user_id, resume_id, analysis_id, original_content, rewritten_content, improvement_summary)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        resumeId,
        analysisId,
        originalContent,
        JSON.stringify(rewrittenContent || {}),
        JSON.stringify(improvementSummary || []),
      ]
    );
    return result.insertId;
  },

  async findById(id, userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT rr.*, r.original_name AS resume_name
       FROM resume_rewrites rr
       JOIN resumes r ON r.id = rr.resume_id
       WHERE rr.id = ? AND rr.user_id = ?
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] ? parseRewrite(rows[0]) : null;
  },

  async findByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT rr.id, rr.resume_id, rr.analysis_id, rr.created_at, r.original_name AS resume_name
       FROM resume_rewrites rr
       JOIN resumes r ON r.id = rr.resume_id
       WHERE rr.user_id = ?
       ORDER BY rr.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async countByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM resume_rewrites WHERE user_id = ?", [userId]);
    return rows[0].total;
  },
};

module.exports = ResumeRewrite;
