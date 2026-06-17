/**
 * models/Analysis.js — Data-access layer for `analyses` and `interview_questions` tables
 *
 * MIGRATION NOTES:
 *  - JSON columns are now JSONB. We can pass JS objects/arrays directly via
 *    JSON.stringify() exactly as before — pg accepts a JSON string for a
 *    JSONB column and stores it correctly, so no logic changes needed there.
 *  - The bulk INSERT in saveQuestions() used MySQL's "INSERT ... VALUES ?"
 *    trick (passing a nested array and letting mysql2 expand it). Postgres'
 *    `pg` driver has NO equivalent — there is no automatic array-of-arrays
 *    expansion. Instead we manually build "($1,$2,$3,$4), ($5,$6,$7,$8), ..."
 *    and flatten the values into one array. This is the only real logic
 *    change in this file; everything else is a 1:1 syntax swap.
 */

const { getPool } = require("../config/db");

/** Safely parse a JSON/JSONB value that might already be parsed by pg */
const safeParse = (value, fallback = []) => {
  try {
    if (!value) return fallback;
    // pg automatically parses JSONB columns into JS objects/arrays already,
    // so `value` is usually already an object here. This guard keeps the
    // function safe either way (e.g. if a raw string ever sneaks through).
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch (err) {
    console.error("JSON parse failed:", value);
    return fallback;
  }
};

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

    const { rows } = await pool.query(
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
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
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

    return rows[0].id;
  },

  /**
   * Save interview questions linked to an analysis.
   *
   * MySQL version passed a nested array straight to `pool.query("...VALUES ?", [values])`
   * and mysql2 expanded it automatically into "(?,?,?,?),(?,?,?,?),...".
   * pg has no such helper, so we build the placeholder string ourselves:
   *   questions = [q1, q2, q3]
   *   →  "($1,$2,$3,$4), ($5,$6,$7,$8), ($9,$10,$11,$12)"
   *   →  flatValues = [analysisId, q1.question, q1.category, q1.difficulty, analysisId, q2.question, ...]
   */
  async saveQuestions(analysisId, questions) {
    if (!questions || questions.length === 0) return;

    const pool = getPool();
    const colsPerRow = 4; // analysis_id, question, category, difficulty

    const valuePlaceholders = questions
      .map((_, rowIndex) => {
        const base = rowIndex * colsPerRow;
        const placeholders = Array.from({ length: colsPerRow }, (_, colIndex) => `$${base + colIndex + 1}`);
        return `(${placeholders.join(", ")})`;
      })
      .join(", ");

    const flatValues = questions.flatMap((q) => [
      analysisId,
      q.question,
      q.category,
      q.difficulty,
    ]);

    await pool.query(
      `INSERT INTO interview_questions (analysis_id, question, category, difficulty)
       VALUES ${valuePlaceholders}`,
      flatValues
    );
  },

  /** Retrieve a single analysis with its questions */
  async findById(id, userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT a.*, r.original_name AS resume_name
         FROM analyses a
         JOIN resumes r ON r.id = a.resume_id
        WHERE a.id = $1 AND a.user_id = $2
        LIMIT 1`,
      [id, userId]
    );
    const analysis = rows[0];
    if (!analysis) return null;

    // JSONB columns come back already parsed from pg, but we still run them
    // through safeParse() for defensive consistency with the rest of the app.
    analysis.skills         = safeParse(analysis.skills);
    analysis.job_roles      = safeParse(analysis.job_roles);
    analysis.missing_skills = safeParse(analysis.missing_skills);

    // Attach interview questions
    const { rows: questions } = await pool.query(
      "SELECT * FROM interview_questions WHERE analysis_id = $1 ORDER BY id ASC",
      [id]
    );
    analysis.interview_questions = questions;

    return analysis;
  },

  /** Get all analyses for a user, newest first */
  async findByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT a.id, a.ats_score, a.summary, a.created_at, r.original_name AS resume_name
         FROM analyses a
         JOIN resumes r ON r.id = a.resume_id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC`,
      [userId]
    );
    return rows;
  },

  /** Get the most recent analysis for a user (dashboard widget) */
  async findLatestByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT a.id, a.ats_score, a.job_roles, a.summary, a.created_at, r.original_name AS resume_name
         FROM analyses a
         JOIN resumes r ON r.id = a.resume_id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
        LIMIT 1`,
      [userId]
    );
    const row = rows[0];
    if (!row) return null;
    row.job_roles = safeParse(row.job_roles);
    return row;
  },

  /** Count analyses for a user */
  async countByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT COUNT(*) AS total FROM analyses WHERE user_id = $1",
      [userId]
    );
    // Postgres COUNT(*) returns a string (e.g. "3"), not a number like mysql2 did.
    // Cast it so callers comparing/using it as a number behave the same as before.
    return Number(rows[0].total);
  },

  /** Delete an analysis (and cascade deletes questions via FK) */
  async delete(id, userId) {
    const pool = getPool();
    const result = await pool.query(
      "DELETE FROM analyses WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return result.rowCount > 0;
  },
};

module.exports = Analysis;