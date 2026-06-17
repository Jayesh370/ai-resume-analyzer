/**
 * models/ResumeTemplate.js - Template catalogue access.
 *
 * MIGRATION NOTES (the two real logic changes in this file):
 *
 *  1. seedDefaults() used MySQL's:
 *       INSERT ... ON DUPLICATE KEY UPDATE name = VALUES(name), ...
 *     Postgres equivalent:
 *       INSERT ... ON CONFLICT (template_id) DO UPDATE SET name = EXCLUDED.name, ...
 *     This requires template_id to have a UNIQUE constraint, which it already
 *     does in the schema (UNIQUE on template_id).
 *
 *  2. findActive() used MySQL's:
 *       ORDER BY FIELD(template_id, 'modern-developer', 'professional-corporate', ...)
 *     which is a MySQL-only function that doesn't exist in Postgres at all.
 *     Postgres equivalent: a CASE expression that maps each template_id to
 *     a sort rank, then ORDER BY that rank.
 */

const { getPool } = require("../config/db");

const DEFAULT_TEMPLATES = [
  {
    templateId: "modern-developer",
    name: "Modern Developer Template",
    category: "Developer",
    accent: "#2563eb",
    description: "Technical layout with project depth, tools, and measurable engineering impact.",
  },
  {
    templateId: "professional-corporate",
    name: "Professional Corporate Template",
    category: "Corporate",
    accent: "#4f46e5",
    description: "Executive ATS layout for business, operations, and leadership roles.",
  },
  {
    templateId: "minimal-ats",
    name: "Minimal ATS Template",
    category: "ATS",
    accent: "#111827",
    description: "Dense parser-friendly one-page layout with minimal decoration.",
  },
  {
    templateId: "creative-portfolio",
    name: "Creative Portfolio Template",
    category: "Portfolio",
    accent: "#be185d",
    description: "Polished portfolio layout that still keeps headings and keywords ATS-readable.",
  },
];

const ResumeTemplate = {
  async seedDefaults() {
    const pool = getPool();
    await Promise.all(
      DEFAULT_TEMPLATES.map((template) =>
        pool.query(
          `INSERT INTO resume_templates (template_id, name, category, accent, description)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (template_id) DO UPDATE SET
             name        = EXCLUDED.name,
             category    = EXCLUDED.category,
             accent      = EXCLUDED.accent,
             description = EXCLUDED.description,
             is_active   = TRUE`,
          [template.templateId, template.name, template.category, template.accent, template.description]
        )
      )
    );
  },

  async findActive() {
    const pool = getPool();
    await this.seedDefaults();

    // MySQL: ORDER BY FIELD(template_id, 'modern-developer', 'professional-corporate', 'minimal-ats', 'creative-portfolio')
    // Postgres: build the same fixed ordering with a CASE expression.
    const { rows } = await pool.query(
      `SELECT template_id AS "templateId", name, category, accent, description
       FROM resume_templates
       WHERE is_active = TRUE
       ORDER BY
         CASE template_id
           WHEN 'modern-developer'       THEN 1
           WHEN 'professional-corporate' THEN 2
           WHEN 'minimal-ats'            THEN 3
           WHEN 'creative-portfolio'     THEN 4
           ELSE 5
         END`
    );
    return rows;
  },
};

module.exports = ResumeTemplate;