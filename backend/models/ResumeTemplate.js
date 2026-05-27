/**
 * models/ResumeTemplate.js - Template catalogue access.
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
        pool.execute(
          `INSERT INTO resume_templates (template_id, name, category, accent, description)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             category = VALUES(category),
             accent = VALUES(accent),
             description = VALUES(description),
             is_active = 1`,
          [template.templateId, template.name, template.category, template.accent, template.description]
        )
      )
    );
  },

  async findActive() {
    const pool = getPool();
    await this.seedDefaults();
    const [rows] = await pool.execute(
      `SELECT template_id AS templateId, name, category, accent, description
       FROM resume_templates
       WHERE is_active = 1
       ORDER BY FIELD(template_id, 'modern-developer', 'professional-corporate', 'minimal-ats', 'creative-portfolio')`
    );
    return rows;
  },
};

module.exports = ResumeTemplate;
