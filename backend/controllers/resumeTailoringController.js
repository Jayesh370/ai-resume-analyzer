const Resume = require("../models/Resume");
const ResumeBuild = require("../models/ResumeBuild");
const ResumeTailoring = require("../models/ResumeTailoring");
const { extractTextFromPDF } = require("../services/pdfService");
const { tailorResume } = require("../services/resumeTailoringService");
const { parseUploadedText } = require("../services/resumeBuilderService");

const getResumeText = async (resume) => {
  let text = resume.extracted_text;
  if (!text || text.trim().length < 50) {
    text = await extractTextFromPDF(resume.file_path);
    await Resume.updateExtractedText(resume.id, text);
  }
  return text;
};

const runTailoring = async (req, res, next) => {
  try {
    const { resumeId, jobTitle, companyName, jobDescription } = req.body;
    if (!resumeId || !jobDescription) {
      return res.status(400).json({ success: false, message: "resumeId and jobDescription are required." });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume || resume.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    const resumeText = await getResumeText(resume);
    const originalContent = parseUploadedText(resumeText, req.user);
    const result = await tailorResume({ content: originalContent, jobDescription, companyName, jobTitle });
    const titleParts = [jobTitle || "Target Role", companyName].filter(Boolean).join(" at ");

    const versionId = await ResumeBuild.create({
      userId: req.user.id,
      sourceResumeId: resume.id,
      title: `${resume.original_name} - ${titleParts || "Tailored"}`,
      templateId: "minimal-ats",
      content: result.tailoredContent,
      jobDescription,
      tailoringNotes: {
        suggestions: result.suggestions,
        keywordsAdded: result.keywordsAdded,
        keywordGaps: result.keywordGaps,
        companyName,
        jobTitle,
        provider: result.provider,
      },
      atsBefore: result.atsBefore,
      atsAfter: result.atsAfter,
      isTailored: true,
    });

    const tailoringId = await ResumeTailoring.create({
      userId: req.user.id,
      resumeId: resume.id,
      jobTitle: jobTitle || "Target Role",
      companyName: companyName || "",
      jobDescription,
      atsBefore: result.atsBefore,
      atsAfter: result.atsAfter,
      keywordsAdded: result.keywordsAdded,
      keywordsMissing: result.keywordGaps,
      tailoredResume: { ...result.tailoredContent, versionId, suggestions: result.suggestions },
    });

    const tailoring = await ResumeTailoring.findById(tailoringId, req.user.id);
    const build = await ResumeBuild.findById(versionId, req.user.id);
    res.status(201).json({ success: true, message: "Tailored resume generated.", tailoring, build });
  } catch (err) {
    next(err);
  }
};

const getTailorings = async (req, res, next) => {
  try {
    const tailorings = await ResumeTailoring.findByUserId(req.user.id);
    res.json({ success: true, tailorings });
  } catch (err) {
    next(err);
  }
};

const getTailoring = async (req, res, next) => {
  try {
    const tailoring = await ResumeTailoring.findById(req.params.id, req.user.id);
    if (!tailoring) return res.status(404).json({ success: false, message: "Tailoring not found." });
    res.json({ success: true, tailoring });
  } catch (err) {
    next(err);
  }
};

module.exports = { runTailoring, getTailorings, getTailoring };
