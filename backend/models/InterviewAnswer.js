/**
 * models/InterviewAnswer.js — Data-access layer for `interview_answers`
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

const parseAnswer = (row) => ({
  ...row,
  feedback: parseJson(row.feedback, {}),
});

const InterviewAnswer = {
  async create({ sessionId, question, userAnswer, score, feedback, improvedAnswer }) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO interview_answers (session_id, question, user_answer, score, feedback, improved_answer)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [sessionId, question, userAnswer, score, JSON.stringify(feedback || {}), improvedAnswer]
    );
    return rows[0].id;
  },

  async findBySessionId(sessionId) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT * FROM interview_answers WHERE session_id = $1 ORDER BY created_at ASC",
      [sessionId]
    );
    return rows.map(parseAnswer);
  },
};

module.exports = InterviewAnswer;