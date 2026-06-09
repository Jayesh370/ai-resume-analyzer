/**
 * controllers/analysisController.js
 * Orchestrates: fetch resume → extract text → AI analysis → persist results
 */

const path = require("path");
const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");
const InterviewSession = require("../models/InterviewSession");
const JobMatch = require("../models/JobMatch");
const ResumeRewrite = require("../models/ResumeRewrite");
const ResumeTailoring = require("../models/ResumeTailoring");
const { extractTextFromPDF } = require("../services/pdfService");
const { analyzeResume } = require("../services/aiService");

// ── POST /api/analyses/run ─────────────────────────────────────────────────
const runAnalysis = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: "resumeId is required." });
    }

    // Verify the resume belongs to the requesting user
    const resume = await Resume.findById(resumeId);
    if (!resume || resume.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    // Get or (re-)extract text
    let text = resume.extracted_text;
    if (!text || text.trim().length < 50) {
      text = await extractTextFromPDF(resume.file_path);
      await Resume.updateExtractedText(resume.id, text);
    }

    if (!text || text.trim().length < 10) {
      return res.status(422).json({ success: false, message: "Could not extract readable text from the PDF. Please upload a text-based PDF." });
    }

    // Run AI analysis
    const { atsScore, skills, jobRoles, missingSkills, summary, questions,aiProvider, } = await analyzeResume(text);

    // Persist analysis
    const analysisId = await Analysis.create({
      resumeId:     resume.id,
      userId:       req.user.id,
      atsScore,
      skills,
      jobRoles,
      missingSkills,
      summary,
      aiProvider,
      
    });

    // Persist interview questions
    if (questions && questions.length) {
      await Analysis.saveQuestions(analysisId, questions);
    }

    // Return the full analysis
    const analysis = await Analysis.findById(analysisId, req.user.id);

    res.status(201).json({ success: true, message: "Analysis complete!", analysis });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/analyses — All analyses for current user ─────────────────────
const getHistory = async (req, res, next) => {
  try {
    const analyses = await Analysis.findByUserId(req.user.id);
    res.json({ success: true, analyses });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/analyses/:id — Single analysis detail ───────────────────────
const getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id, req.user.id);
    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found." });
    }
    res.json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/analyses/:id ──────────────────────────────────────────────
const deleteAnalysis = async (req, res, next) => {
  try {
    const deleted = await Analysis.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Analysis not found." });
    }
    res.json({ success: true, message: "Analysis deleted." });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/analyses/dashboard — Stats for dashboard ────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalAnalyses,
      latestAnalysis,
      resumes,
      totalTailoredResumes,
      totalRewrites,
      totalInterviews,
      interviewStats,
      jobMatches,
      atsImprovementTrend,
      analyses,
    ] = await Promise.all([
      Analysis.countByUserId(req.user.id),
      Analysis.findLatestByUserId(req.user.id),
      require("../models/Resume").findByUserId(req.user.id),
      ResumeTailoring.countByUserId(req.user.id),
      ResumeRewrite.countByUserId(req.user.id),
      InterviewSession.countByUserId(req.user.id),
      InterviewSession.statsByUserId(req.user.id),
      JobMatch.findByUserId(req.user.id),
      ResumeTailoring.trendByUserId(req.user.id),
      Analysis.findByUserId(req.user.id),
    ]);
    const avgAtsScore =
      analyses.length > 0
        ? Math.round(analyses.reduce((sum, item) => sum + Number(item.ats_score || 0), 0) / analyses.length)
        : null;

    res.json({
      success: true,
      stats: {
        totalAnalyses,
        totalResumes: resumes.length,
        avgAtsScore,
        totalTailoredResumes,
        totalRewrites,
        totalInterviews,
        averageInterviewScore:
          interviewStats.average_score == null ? null : Number(interviewStats.average_score).toFixed(1),
        bestInterviewScore: interviewStats.best_score == null ? null : Number(interviewStats.best_score).toFixed(1),
        interviewTrend: interviewStats.trend,
        atsImprovementTrend,
        jobMatchTrend: jobMatches
          .slice()
          .reverse()
          .slice(-12)
          .map((match) => ({
            id: match.id,
            label: match.job_title || "Job Match",
            score: match.match_score,
            created_at: match.created_at,
          })),
        latestAnalysis,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { runAnalysis, getHistory, getAnalysis, deleteAnalysis, getDashboardStats };
