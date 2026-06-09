/**
 * models/Analysis.js — Data-access layer for `analyses` and `interview_questions` tables
 */

const { getPool } = require("../config/db");

const Analysis = {
  /** Save a complete analysis result */
  async create({
  resumeId,
  userId,
  atsScore,
  skills,
  jobRoles,
  missingSkills,
  summary,
  aiProvider,
}) {
  const pool = getPool();

  const [result] = await pool.execute(
    `INSERT INTO analyses
      (
        resume_id,
        user_id,
        ats_score,
        skills,
        job_roles,
        missing_skills,
        summary,
        ai_provider
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resumeId,
      userId,
      atsScore,
      JSON.stringify(skills),
      JSON.stringify(jobRoles),
      JSON.stringify(missingSkills),
      summary,
      aiProvider,
    ]
  );

  return result.insertId;
},

  /** Save interview questions linked to an analysis */
  async saveQuestions(analysisId, questions) {
    const pool = getPool();
    const values = questions.map((q) => [analysisId, q.question, q.category, q.difficulty]);
    await pool.query(
      "INSERT INTO interview_questions (analysis_id, question, category, difficulty) VALUES ?",
      [values]
    );
  },

  /** Retrieve a single analysis with its questions */
  async findById(id, userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT a.*, r.original_name AS resume_name
         FROM analyses a
         JOIN resumes r ON r.id = a.resume_id
        WHERE a.id = ? AND a.user_id = ?
        LIMIT 1`,
      [id, userId]
    );
    const analysis = rows[0];
    if (!analysis) return null;

//newly added
    const safeParse = (value, fallback = []) => {
  try {
    if (!value) return fallback;

    // If already parsed object/array
    if (typeof value === "object") return value;

    return JSON.parse(value);
  } catch (err) {
    console.error("JSON parse failed:", value);
    return fallback;
  }
};//end

    // Parse JSON columns
    // analysis.skills        = JSON.parse(analysis.skills || "[]");
    // analysis.job_roles     = JSON.parse(analysis.job_roles || "[]");
    // analysis.missing_skills = JSON.parse(analysis.missing_skills || "[]");
    analysis.skills = safeParse(analysis.skills);
analysis.job_roles = safeParse(analysis.job_roles);
analysis.missing_skills = safeParse(analysis.missing_skills);

    // Attach interview questions
    const [questions] = await pool.execute(
      "SELECT * FROM interview_questions WHERE analysis_id = ? ORDER BY id ASC",
      [id]
    );
    analysis.interview_questions = questions;

    return analysis;
  },

  /** Get all analyses for a user, newest first */
  async findByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT a.id, a.ats_score, a.summary, a.created_at, r.original_name AS resume_name
         FROM analyses a
         JOIN resumes r ON r.id = a.resume_id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC`,
      [userId]
    );
    return rows;
  },

  /** Get the most recent analysis for a user (dashboard widget) */
  async findLatestByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT a.id, a.ats_score, a.job_roles, a.summary, a.created_at, r.original_name AS resume_name
         FROM analyses a
         JOIN resumes r ON r.id = a.resume_id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
        LIMIT 1`,
      [userId]
    );
    const row = rows[0];
    if (!row) return null;
    try {
      row.job_roles = typeof row.job_roles === "string" ? JSON.parse(row.job_roles || "[]") : row.job_roles || [];
    } catch {
      row.job_roles = [];
    }
    return row;
  },

  /** Count analyses for a user */
  async countByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM analyses WHERE user_id = ?",
      [userId]
    );
    return rows[0].total;
  },

  /** Delete an analysis (and cascade deletes questions via FK) */
  async delete(id, userId) {
    const pool = getPool();
    const [result] = await pool.execute(
      "DELETE FROM analyses WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Analysis;
