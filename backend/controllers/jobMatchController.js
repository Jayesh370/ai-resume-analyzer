/**
 * controllers/jobMatchController.js  ← NEW
 *
 * Endpoints:
 *   POST   /api/job-matches/analyze   — run a new job-match analysis
 *   GET    /api/job-matches            — list all for current user
 *   GET    /api/job-matches/:id        — get one by id
 *   DELETE /api/job-matches/:id        — delete one
 */

const { validationResult } = require("express-validator");
const Resume     = require("../models/Resume");
const JobMatch   = require("../models/JobMatch");
const { extractTextFromPDF } = require("../services/pdfService");
const { analyzeJobMatch }    = require("../services/jobMatchService");

// ── POST /api/job-matches/analyze ─────────────────────────────────────────
const runJobMatch = async (req, res, next) => {
  try {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { resumeId, jobDescription } = req.body;

    // Verify resume belongs to requesting user
    const resume = await Resume.findById(resumeId);
    if (!resume || resume.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    // Get or (re-)extract resume text
    let resumeText = resume.extracted_text;
    if (!resumeText || resumeText.trim().length < 50) {
      resumeText = await extractTextFromPDF(resume.file_path);
      await Resume.updateExtractedText(resume.id, resumeText);
    }

    if (!resumeText || resumeText.trim().length < 10) {
      return res.status(422).json({
        success: false,
        message: "Could not extract text from the selected PDF. Please re-upload a text-based PDF.",
      });
    }

    // Run Gemini job-match analysis
    const {
      matchScore, jobTitle, summary,
      matchedKeywords, missingKeywords,
      strengths, weaknesses, improvements, questions,
    } = await analyzeJobMatch(resumeText, jobDescription);

    // Persist to DB
    const jobMatchId = await JobMatch.create({
      userId:          req.user.id,
      resumeId:        resume.id,
      jobDescription,
      jobTitle,
      matchScore,
      matchedKeywords,
      missingKeywords,
      strengths,
      weaknesses,
      improvements,
      questions,
      summary,
    });

    // Return full record
    const record = await JobMatch.findById(jobMatchId, req.user.id);

    res.status(201).json({
      success: true,
      message: "Job match analysis complete!",
      jobMatch: record,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/job-matches ──────────────────────────────────────────────────
const getJobMatches = async (req, res, next) => {
  try {
    const records = await JobMatch.findByUserId(req.user.id);
    res.json({ success: true, jobMatches: records });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/job-matches/:id ──────────────────────────────────────────────
const getJobMatch = async (req, res, next) => {
  try {
    const record = await JobMatch.findById(req.params.id, req.user.id);
    if (!record) {
      return res.status(404).json({ success: false, message: "Job match not found." });
    }
    res.json({ success: true, jobMatch: record });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/job-matches/:id ───────────────────────────────────────────
const deleteJobMatch = async (req, res, next) => {
  try {
    const deleted = await JobMatch.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Job match not found." });
    }
    res.json({ success: true, message: "Job match deleted." });
  } catch (err) {
    next(err);
  }
};

module.exports = { runJobMatch, getJobMatches, getJobMatch, deleteJobMatch };