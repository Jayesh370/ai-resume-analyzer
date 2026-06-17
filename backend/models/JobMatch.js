/**
 * models/JobMatch.js — Data-access layer for the `job_matches` table
 *
 * Standard migration pattern — no MySQL-only constructs here besides
 * the usual placeholder/destructuring/insertId differences.
 */

const { getPool } = require("../config/db");

/** Safely parse JSON/JSONB fields (pg already parses JSONB, this is a defensive guard) */
const safeParse = (value, fallback = []) => {
  try {
    if (!value) return fallback;
    if (typeof value !== "string") return value;
    return JSON.parse(value);
  } catch (err) {
    console.log("Invalid JSON field:", value);
    return fallback;
  }
};

const JobMatch = {
  /**
   * Persist a completed job-match result.
   * All array fields are stored as JSONB columns.
   */
  async create({
    userId, resumeId, jobDescription,
    jobTitle, matchScore,
    matchedKeywords, missingKeywords,
    strengths, weaknesses, improvements,
    questions, summary,
  }) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO job_matches
         (user_id, resume_id, job_description, job_title, match_score,
          matched_keywords, missing_keywords,
          strengths, weaknesses, improvements,
          interview_questions, summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        userId,
        resumeId,
        jobDescription,
        jobTitle,
        matchScore,
        JSON.stringify(matchedKeywords  || []),
        JSON.stringify(missingKeywords  || []),
        JSON.stringify(strengths        || []),
        JSON.stringify(weaknesses       || []),
        JSON.stringify(improvements     || []),
        JSON.stringify(questions        || []),
        summary,
      ]
    );
    return rows[0].id;
  },

  /**
   * Fetch one job-match record by ID, scoped to userId for security.
   */
  async findById(id, userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT jm.*, r.original_name AS resume_name
         FROM job_matches jm
         JOIN resumes r ON r.id = jm.resume_id
        WHERE jm.id = $1 AND jm.user_id = $2
        LIMIT 1`,
      [id, userId]
    );

    const row = rows[0];
    if (!row) return null;

    row.matched_keywords    = safeParse(row.matched_keywords);
    row.missing_keywords    = safeParse(row.missing_keywords);
    row.strengths           = safeParse(row.strengths);
    row.weaknesses          = safeParse(row.weaknesses);
    row.improvements        = safeParse(row.improvements);
    row.interview_questions = safeParse(row.interview_questions);

    return row;
  },

  /**
   * Get all job-match records for a user, newest first.
   * Returns a lightweight list (no large text columns).
   */
  async findByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT jm.id, jm.job_title, jm.match_score, jm.summary, jm.created_at,
              r.original_name AS resume_name
         FROM job_matches jm
         JOIN resumes r ON r.id = jm.resume_id
        WHERE jm.user_id = $1
        ORDER BY jm.created_at DESC`,
      [userId]
    );
    return rows;
  },

  /** Count total job matches for a user */
  async countByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT COUNT(*) AS total FROM job_matches WHERE user_id = $1",
      [userId]
    );
    return Number(rows[0].total);
  },

  /** Hard-delete a job-match record (user-owned) */
  async delete(id, userId) {
    const pool = getPool();
    const result = await pool.query(
      "DELETE FROM job_matches WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return result.rowCount > 0;
  },
};

module.exports = JobMatch;