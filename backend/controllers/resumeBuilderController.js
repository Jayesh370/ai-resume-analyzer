/**
 * controllers/resumeBuilderController.js - Resume builder CRUD and export.
 */

const ResumeBuild = require("../models/ResumeBuild");
const ResumeTemplate = require("../models/ResumeTemplate");
const Resume = require("../models/Resume");
const { tailorResume } = require("../services/resumeTailoringService");
const {
  emptyResumeContent,
  parseUploadedText,
  renderResumeHtml,
  validateResumeBuild,
} = require("../services/resumeBuilderService");

const toClient = (build) => ({
  id: build.id,
  sourceResumeId: build.source_resume_id,
  parentVersionId: build.parent_version_id,
  title: build.title,
  templateId: build.template_id,
  content: build.content,
  sectionOrder: build.section_order || build.content?.sectionOrder || [],
  jobDescription: build.job_description,
  tailoringNotes: build.tailoring_notes,
  atsBefore: build.ats_before,
  atsAfter: build.ats_after,
  isTailored: Boolean(build.is_tailored),
  isFavorite: Boolean(build.is_favorite),
  createdAt: build.created_at,
  updatedAt: build.updated_at,
});

const listTemplates = async (req, res, next) => {
  try {
    const templates = await ResumeTemplate.findActive();
    res.json({ success: true, templates });
  } catch (err) {
    next(err);
  }
};

const listBuilds = async (req, res, next) => {
  try {
    const builds = await ResumeBuild.findByUserId(req.user.id);
    res.json({
      success: true,
      builds: builds.map((build) => ({
        id: build.id,
        sourceResumeId: build.source_resume_id,
        parentVersionId: build.parent_version_id,
        title: build.title,
        templateId: build.template_id,
        atsBefore: build.ats_before,
        atsAfter: build.ats_after,
        isTailored: Boolean(build.is_tailored),
        isFavorite: Boolean(build.is_favorite),
        createdAt: build.created_at,
        updatedAt: build.updated_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const getBuild = async (req, res, next) => {
  try {
    const build = await ResumeBuild.findById(req.params.id, req.user.id);
    if (!build) return res.status(404).json({ success: false, message: "Resume version not found." });
    res.json({ success: true, build: toClient(build) });
  } catch (err) {
    next(err);
  }
};

const createBuild = async (req, res, next) => {
  try {
    const { sourceResumeId } = req.body;
    let content = req.body.content || emptyResumeContent();

    if (sourceResumeId) {
      const sourceResume = await Resume.findById(sourceResumeId);
      if (!sourceResume || sourceResume.user_id !== req.user.id) {
        return res.status(404).json({ success: false, message: "Source resume not found." });
      }
      content = parseUploadedText(sourceResume.extracted_text || "", req.user);
    }

    const payload = validateResumeBuild({
      title: req.body.title || "Untitled Resume",
      templateId: req.body.templateId,
      content,
    });

    if (payload.errors.length) {
      return res.status(422).json({ success: false, message: payload.errors[0], errors: payload.errors });
    }

    const buildId = await ResumeBuild.create({
      userId: req.user.id,
      sourceResumeId: sourceResumeId || null,
      title: payload.title,
      templateId: payload.templateId,
      content: payload.content,
    });

    const build = await ResumeBuild.findById(buildId, req.user.id);
    res.status(201).json({ success: true, message: "Resume version saved.", build: toClient(build) });
  } catch (err) {
    next(err);
  }
};

const updateBuild = async (req, res, next) => {
  try {
    const existing = await ResumeBuild.findById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, message: "Resume version not found." });

    const payload = validateResumeBuild({
      title: req.body.title ?? existing.title,
      templateId: req.body.templateId ?? existing.template_id,
      content: req.body.content ?? existing.content,
    });

    if (payload.errors.length) {
      return res.status(422).json({ success: false, message: payload.errors[0], errors: payload.errors });
    }

    await ResumeBuild.update(req.params.id, req.user.id, payload);
    const build = await ResumeBuild.findById(req.params.id, req.user.id);
    res.json({ success: true, message: "Resume version updated.", build: toClient(build) });
  } catch (err) {
    next(err);
  }
};

const duplicateBuild = async (req, res, next) => {
  try {
    const build = await ResumeBuild.duplicate(req.params.id, req.user.id);
    if (!build) return res.status(404).json({ success: false, message: "Resume version not found." });
    res.status(201).json({ success: true, message: "Resume version duplicated.", build: toClient(build) });
  } catch (err) {
    next(err);
  }
};

const tailorBuild = async (req, res, next) => {
  try {
    const existing = await ResumeBuild.findById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ success: false, message: "Resume version not found." });

    const jobDescription = String(req.body.jobDescription || "").trim();
    const result = await tailorResume({
      content: existing.content,
      jobDescription,
    });

    const title = req.body.title || `${existing.title} - Tailored`;
    const versionId = await ResumeBuild.create({
      userId: req.user.id,
      sourceResumeId: existing.source_resume_id,
      parentVersionId: existing.id,
      title,
      templateId: existing.template_id,
      content: result.tailoredContent,
      jobDescription,
      tailoringNotes: {
        suggestions: result.suggestions,
        keywordsAdded: result.keywordsAdded,
        keywordGaps: result.keywordGaps,
        provider: result.provider,
      },
      atsBefore: result.atsBefore,
      atsAfter: result.atsAfter,
      isTailored: true,
    });

    const tailoredBuild = await ResumeBuild.findById(versionId, req.user.id);
    res.status(201).json({
      success: true,
      message: "Tailored resume version generated.",
      build: toClient(tailoredBuild),
    });
  } catch (err) {
    next(err);
  }
};

const favoriteBuild = async (req, res, next) => {
  try {
    const updated = await ResumeBuild.setFavorite(req.params.id, req.user.id, Boolean(req.body.isFavorite));
    if (!updated) return res.status(404).json({ success: false, message: "Resume version not found." });
    res.json({ success: true, message: "Resume version updated." });
  } catch (err) {
    next(err);
  }
};

const deleteBuild = async (req, res, next) => {
  try {
    const deleted = await ResumeBuild.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Resume version not found." });
    res.json({ success: true, message: "Resume version deleted." });
  } catch (err) {
    next(err);
  }
};

const exportBuild = async (req, res, next) => {
  try {
    const build = await ResumeBuild.findById(req.params.id, req.user.id);
    if (!build) return res.status(404).json({ success: false, message: "Resume version not found." });

    const html = renderResumeHtml({
      title: build.title,
      templateId: build.template_id,
      content: build.content,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `inline; filename="${build.title.replace(/[^a-z0-9-]+/gi, "-")}.html"`);
    res.send(html);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listTemplates,
  listBuilds,
  getBuild,
  createBuild,
  updateBuild,
  duplicateBuild,
  tailorBuild,
  favoriteBuild,
  deleteBuild,
  exportBuild,
};
