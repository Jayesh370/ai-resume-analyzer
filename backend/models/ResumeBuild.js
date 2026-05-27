/**
 * models/ResumeBuild.js - Data access for resume_versions.
 * Kept as ResumeBuild to preserve the existing controller import boundary.
 */

const { getPool } = require("../config/db");
const { normaliseSectionOrder } = require("../services/resumeBuilderService");

const parseJson = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (typeof value === "string") return JSON.parse(value);
    return value;
  } catch {
    return fallback;
  }
};

const parseBuild = (row) => ({
  ...row,
  content: parseJson(row.content, {}),
  section_order: parseJson(row.section_order, []),
  tailoring_notes: parseJson(row.tailoring_notes, null),
});

const ResumeBuild = {
  async create({
    userId,
    sourceResumeId = null,
    parentVersionId = null,
    title,
    templateId,
    content,
    jobDescription = null,
    tailoringNotes = null,
    atsBefore = null,
    atsAfter = null,
    isTailored = false,
  }) {
    const pool = getPool();
    const sectionOrder = normaliseSectionOrder(content.sectionOrder);
    const [result] = await pool.execute(
      `INSERT INTO resume_versions
       (user_id, source_resume_id, parent_version_id, title, template_id, content, section_order, job_description,
        tailoring_notes, ats_before, ats_after, is_tailored)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        sourceResumeId,
        parentVersionId,
        title,
        templateId,
        JSON.stringify({ ...content, sectionOrder }),
        JSON.stringify(sectionOrder),
        jobDescription,
        tailoringNotes ? JSON.stringify(tailoringNotes) : null,
        atsBefore,
        atsAfter,
        isTailored ? 1 : 0,
      ]
    );
    return result.insertId;
  },

  async findByUserId(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, source_resume_id, parent_version_id, title, template_id, is_tailored, is_favorite,
              ats_before, ats_after, created_at, updated_at
       FROM resume_versions
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
      [userId]
    );
    return rows;
  },

  async findById(id, userId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT *
       FROM resume_versions
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] ? parseBuild(rows[0]) : null;
  },

  async update(id, userId, { title, templateId, content }) {
    const pool = getPool();
    const sectionOrder = normaliseSectionOrder(content.sectionOrder);
    const [result] = await pool.execute(
      `UPDATE resume_versions
       SET title = ?, template_id = ?, content = ?, section_order = ?
       WHERE id = ? AND user_id = ?`,
      [title, templateId, JSON.stringify({ ...content, sectionOrder }), JSON.stringify(sectionOrder), id, userId]
    );
    return result.affectedRows > 0;
  },

  async duplicate(id, userId) {
    const build = await this.findById(id, userId);
    if (!build) return null;

    const duplicateId = await this.create({
      userId,
      sourceResumeId: build.source_resume_id,
      parentVersionId: build.parent_version_id,
      title: `${build.title} Copy`,
      templateId: build.template_id,
      content: build.content,
      jobDescription: build.job_description,
      tailoringNotes: build.tailoring_notes,
      atsBefore: build.ats_before,
      atsAfter: build.ats_after,
      isTailored: build.is_tailored,
    });

    return this.findById(duplicateId, userId);
  },

  async setFavorite(id, userId, isFavorite) {
    const pool = getPool();
    const [result] = await pool.execute(
      "UPDATE resume_versions SET is_favorite = ? WHERE id = ? AND user_id = ?",
      [isFavorite ? 1 : 0, id, userId]
    );
    return result.affectedRows > 0;
  },

  async delete(id, userId) {
    const pool = getPool();
    const [result] = await pool.execute(
      "DELETE FROM resume_versions WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = ResumeBuild;
