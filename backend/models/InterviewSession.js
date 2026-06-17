/**
 * models/InterviewSession.js — Data-access layer for `interview_sessions`
 *
 * MIGRATION NOTE: Postgres' AVG(), COUNT(), and MAX() over numeric columns
 * return values as strings by default (this is actually true of MySQL's
 * driver too in some configs, but mysql2 auto-casts more aggressively).
 * To guarantee the API always returns real JS numbers to the frontend
 * (not "3" or "7.5" as strings), every aggregate result is explicitly
 * cast with Number() before being returned. NULL stays NULL either way.
 */

const { getPool } = require("../config/db");

const InterviewSession = {
  async create({ userId, resumeId, jobMatchId = null, sessionType }) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO interview_sessions (user_id, resume_id, job_match_id, session_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, resumeId, jobMatchId, sessionType]
    );
    return rows[0].id;
  },

  async findById(id, userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT s.*, r.original_name AS resume_name
       FROM interview_sessions s
       JOIN resumes r ON r.id = s.resume_id
       WHERE s.id = $1 AND s.user_id = $2
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT s.id, s.resume_id, s.session_type, s.overall_score, s.created_at, r.original_name AS resume_name
       FROM interview_sessions s
       JOIN resumes r ON r.id = s.resume_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async updateOverallScore(id, userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT AVG(score) AS average_score
       FROM interview_answers ia
       JOIN interview_sessions s ON s.id = ia.session_id
       WHERE s.id = $1 AND s.user_id = $2`,
      [id, userId]
    );
    const score = rows[0].average_score == null ? null : Number(rows[0].average_score).toFixed(1);
    await pool.query(
      "UPDATE interview_sessions SET overall_score = $1 WHERE id = $2 AND user_id = $3",
      [score, id, userId]
    );
    return score;
  },

  async statsByUserId(userId) {
    const pool = getPool();
    const { rows: summaryRows } = await pool.query(
      `SELECT COUNT(*) AS total, AVG(overall_score) AS average_score, MAX(overall_score) AS best_score
       FROM interview_sessions
       WHERE user_id = $1`,
      [userId]
    );

    const summary = summaryRows[0];
    const normalisedSummary = {
      total: Number(summary.total),
      average_score: summary.average_score == null ? null : Number(summary.average_score),
      best_score: summary.best_score == null ? null : Number(summary.best_score),
    };

    const { rows: trend } = await pool.query(
      `SELECT id, session_type, overall_score, created_at
       FROM interview_sessions
       WHERE user_id = $1 AND overall_score IS NOT NULL
       ORDER BY created_at ASC
       LIMIT 12`,
      [userId]
    );

    return { ...normalisedSummary, trend };
  },

  async countByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT COUNT(*) AS total FROM interview_sessions WHERE user_id = $1",
      [userId]
    );
    return Number(rows[0].total);
  },
};

module.exports = InterviewSession;