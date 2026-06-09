const Analysis = require("../models/Analysis");
const Resume = require("../models/Resume");
const ResumeBuild = require("../models/ResumeBuild");
const ResumeRewrite = require("../models/ResumeRewrite");
const { extractTextFromPDF } = require("../services/pdfService");
const { rewriteResume } = require("../services/resumeRewriteService");
const { parseUploadedText } = require("../services/resumeBuilderService");

const getResumeText = async (resume) => {
  let text = resume.extracted_text;
  if (!text || text.trim().length < 50) {
    text = await extractTextFromPDF(resume.file_path);
    await Resume.updateExtractedText(resume.id, text);
  }
  return text;
};

const runRewrite = async (req, res, next) => {
  try {
    const { resumeId, analysisId } = req.body;
    if (!resumeId) return res.status(400).json({ success: false, message: "resumeId is required." });

    const resume = await Resume.findById(resumeId);
    if (!resume || resume.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    const analysis = analysisId ? await Analysis.findById(analysisId, req.user.id) : null;
    const resumeText = await getResumeText(resume);
    if (!resumeText || resumeText.trim().length < 10) {
      return res.status(422).json({ success: false, message: "Could not read resume text." });
    }

    const result = await rewriteResume({ resumeText, analysis });
    const rewriteId = await ResumeRewrite.create({
      userId: req.user.id,
      resumeId: resume.id,
      analysisId: analysis?.id || null,
      originalContent: resumeText,
      rewrittenContent: result,
      improvementSummary: result.improvementSummary,
    });

    const rewrite = await ResumeRewrite.findById(rewriteId, req.user.id);
    res.status(201).json({ success: true, message: "Resume rewrite generated.", rewrite });
  } catch (err) {
    next(err);
  }
};

const saveRewriteVersion = async (req, res, next) => {
  try {
    const rewrite = await ResumeRewrite.findById(req.params.id, req.user.id);
    if (!rewrite) return res.status(404).json({ success: false, message: "Rewrite not found." });

    const content = parseUploadedText(rewrite.rewritten_content?.rewrittenResume || rewrite.original_content || "", req.user);
    const versionId = await ResumeBuild.create({
      userId: req.user.id,
      sourceResumeId: rewrite.resume_id,
      title: req.body.title || `${rewrite.resume_name} - Rewritten`,
      templateId: req.body.templateId || "minimal-ats",
      content,
    });
    const build = await ResumeBuild.findById(versionId, req.user.id);
    res.status(201).json({ success: true, message: "Rewritten resume version saved.", build });
  } catch (err) {
    next(err);
  }
};

const getRewrites = async (req, res, next) => {
  try {
    const rewrites = await ResumeRewrite.findByUserId(req.user.id);
    res.json({ success: true, rewrites });
  } catch (err) {
    next(err);
  }
};

const getRewrite = async (req, res, next) => {
  try {
    const rewrite = await ResumeRewrite.findById(req.params.id, req.user.id);
    if (!rewrite) return res.status(404).json({ success: false, message: "Rewrite not found." });
    res.json({ success: true, rewrite });
  } catch (err) {
    next(err);
  }
};

module.exports = { runRewrite, saveRewriteVersion, getRewrites, getRewrite };
