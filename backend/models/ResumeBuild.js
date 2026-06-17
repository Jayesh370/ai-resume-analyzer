/**
 * models/ResumeBuild.js - Data access for resume_versions.
 * Kept as ResumeBuild to preserve the existing controller import boundary.
 *
 * Standard migration pattern. The `parseBuild()` helper is kept exactly as
 * before — pg already parses JSONB into JS objects, so parseJson() acts as
 * a harmless pass-through guard rather than doing real work, same as it
 * effectively did under MySQL once JSON columns were fetched.
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
    const { rows } = await pool.query(
      `INSERT INTO resume_versions
       (user_id, source_resume_id, parent_version_id, title, template_id, content, section_order, job_description,
        tailoring_notes, ats_before, ats_after, is_tailored)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
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
        // MySQL: TINYINT(1) accepted 1/0. Postgres: BOOLEAN expects true/false.
        Boolean(isTailored),
      ]
    );
    return rows[0].id;
  },

  async findByUserId(userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, source_resume_id, parent_version_id, title, template_id, is_tailored, is_favorite,
              ats_before, ats_after, created_at, updated_at
       FROM resume_versions
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );
    return rows;
  },

  async findById(id, userId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT *
       FROM resume_versions
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [id, userId]
    );
    return rows[0] ? parseBuild(rows[0]) : null;
  },

  async update(id, userId, { title, templateId, content }) {
    const pool = getPool();
    const sectionOrder = normaliseSectionOrder(content.sectionOrder);
    const result = await pool.query(
      `UPDATE resume_versions
       SET title = $1, template_id = $2, content = $3, section_order = $4, updated_at = NOW()
       WHERE id = $5 AND user_id = $6`,
      [title, templateId, JSON.stringify({ ...content, sectionOrder }), JSON.stringify(sectionOrder), id, userId]
    );
    return result.rowCount > 0;
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
    const result = await pool.query(
      "UPDATE resume_versions SET is_favorite = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
      [Boolean(isFavorite), id, userId]
    );
    return result.rowCount > 0;
  },

  async delete(id, userId) {
    const pool = getPool();
    const result = await pool.query(
      "DELETE FROM resume_versions WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return result.rowCount > 0;
  },
};

module.exports = ResumeBuild;