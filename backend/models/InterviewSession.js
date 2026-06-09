const { getPool } = require("../config/db");

const InterviewSession = {
  async create({ userId, resumeId, jobMatchId = null, sessionType }) {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO interview_sessions (user_id, resume_id, job_match_id, session_type)
       VALUES (?, ?, ?, ?)`,
      [userId, resumeId, jobMatchId, sessionType]
    );
    return result.insertId;
  },

  async findById(id, userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT s.*, r.original_name AS resume_name
       FROM interview_sessions s
       JOIN resumes r ON r.id = s.resume_id
       WHERE s.id = ? AND s.user_id = ?
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT s.id, s.resume_id, s.session_type, s.overall_score, s.created_at, r.original_name AS resume_name
       FROM interview_sessions s
       JOIN resumes r ON r.id = s.resume_id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async updateOverallScore(id, userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT AVG(score) AS average_score
       FROM interview_answers ia
       JOIN interview_sessions s ON s.id = ia.session_id
       WHERE s.id = ? AND s.user_id = ?`,
      [id, userId]
    );
    const score = rows[0].average_score == null ? null : Number(rows[0].average_score).toFixed(1);
    await pool.execute("UPDATE interview_sessions SET overall_score = ? WHERE id = ? AND user_id = ?", [score, id, userId]);
    return score;
  },

  async statsByUserId(userId) {
    const pool = getPool();
    const [summary] = await pool.execute(
      `SELECT COUNT(*) AS total, AVG(overall_score) AS average_score, MAX(overall_score) AS best_score
       FROM interview_sessions
       WHERE user_id = ?`,
      [userId]
    );
    const [trend] = await pool.execute(
      `SELECT id, session_type, overall_score, created_at
       FROM interview_sessions
       WHERE user_id = ? AND overall_score IS NOT NULL
       ORDER BY created_at ASC
       LIMIT 12`,
      [userId]
    );
    return { ...summary[0], trend };
  },

  async countByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM interview_sessions WHERE user_id = ?", [userId]);
    return rows[0].total;
  },
};

module.exports = InterviewSession;
