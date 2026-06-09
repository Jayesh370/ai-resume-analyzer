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
    const [result] = await pool.execute(
      `INSERT INTO interview_answers (session_id, question, user_answer, score, feedback, improved_answer)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, question, userAnswer, score, JSON.stringify(feedback || {}), improvedAnswer]
    );
    return result.insertId;
  },

  async findBySessionId(sessionId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT * FROM interview_answers WHERE session_id = ? ORDER BY created_at ASC",
      [sessionId]
    );
    return rows.map(parseAnswer);
  },
};

module.exports = InterviewAnswer;
