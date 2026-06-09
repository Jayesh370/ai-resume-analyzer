const { getPool } = require("../config/db");

const parseJson = (value, fallback) => {
  try {
    if (!value) return fallback;
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
};

const parseTailoring = (row) => ({
  ...row,
  keywords_added: parseJson(row.keywords_added, []),
  keywords_missing: parseJson(row.keywords_missing, []),
  tailored_resume: parseJson(row.tailored_resume, {}),
});

const ResumeTailoring = {
  async create({
    userId,
    resumeId,
    jobTitle,
    companyName,
    jobDescription,
    atsBefore,
    atsAfter,
    keywordsAdded,
    keywordsMissing,
    tailoredResume,
  }) {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO resume_tailorings
       (user_id, resume_id, job_title, company_name, job_description, ats_before, ats_after,
        keywords_added, keywords_missing, tailored_resume)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        resumeId,
        jobTitle,
        companyName,
        jobDescription,
        atsBefore,
        atsAfter,
        JSON.stringify(keywordsAdded || []),
        JSON.stringify(keywordsMissing || []),
        JSON.stringify(tailoredResume || {}),
      ]
    );
    return result.insertId;
  },

  async findById(id, userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT rt.*, r.original_name AS resume_name
       FROM resume_tailorings rt
       JOIN resumes r ON r.id = rt.resume_id
       WHERE rt.id = ? AND rt.user_id = ?
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] ? parseTailoring(rows[0]) : null;
  },

  async findByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, resume_id, job_title, company_name, ats_before, ats_after, created_at
       FROM resume_tailorings
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  async countByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM resume_tailorings WHERE user_id = ?", [userId]);
    return rows[0].total;
  },

  async trendByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, company_name, job_title, ats_before, ats_after, created_at
       FROM resume_tailorings
       WHERE user_id = ?
       ORDER BY created_at ASC
       LIMIT 12`,
      [userId]
    );
    return rows;
  },
};

module.exports = ResumeTailoring;
