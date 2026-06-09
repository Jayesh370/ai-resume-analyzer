const Analysis = require("../models/Analysis");
const InterviewAnswer = require("../models/InterviewAnswer");
const InterviewSession = require("../models/InterviewSession");
const JobMatch = require("../models/JobMatch");
const Resume = require("../models/Resume");
const { extractTextFromPDF } = require("../services/pdfService");
const { evaluateInterviewAnswer, generateInterviewQuestions } = require("../services/interviewService");

const getResumeText = async (resume) => {
  let text = resume.extracted_text;
  if (!text || text.trim().length < 50) {
    text = await extractTextFromPDF(resume.file_path);
    await Resume.updateExtractedText(resume.id, text);
  }
  return text;
};

const startSession = async (req, res, next) => {
  try {
    const { resumeId, analysisId, jobMatchId, sessionType = "Resume-Based", jobDescription = "" } = req.body;
    const allowedTypes = ["Technical", "Behavioral", "HR", "Resume-Based", "Job-Specific"];
    if (!resumeId) return res.status(400).json({ success: false, message: "resumeId is required." });

    const resume = await Resume.findById(resumeId);
    if (!resume || resume.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    const analysis = analysisId ? await Analysis.findById(analysisId, req.user.id) : null;
    const jobMatch = jobMatchId ? await JobMatch.findById(jobMatchId, req.user.id) : null;
    const resumeText = await getResumeText(resume);
    const sessionId = await InterviewSession.create({
      userId: req.user.id,
      resumeId: resume.id,
      jobMatchId: jobMatch?.id || null,
      sessionType: allowedTypes.includes(sessionType) ? sessionType : "Resume-Based",
    });
    const result = await generateInterviewQuestions({
      resumeText,
      analysis,
      jobDescription: jobDescription || jobMatch?.job_description || "",
      sessionType,
    });
    const session = await InterviewSession.findById(sessionId, req.user.id);
    res.status(201).json({ success: true, message: "Interview session started.", session, questions: result.questions });
  } catch (err) {
    next(err);
  }
};

const submitAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer } = req.body;
    if (!question || !userAnswer) {
      return res.status(400).json({ success: false, message: "question and userAnswer are required." });
    }

    const session = await InterviewSession.findById(req.params.id, req.user.id);
    if (!session) return res.status(404).json({ success: false, message: "Interview session not found." });

    const evaluation = await evaluateInterviewAnswer({
      question,
      userAnswer,
      sessionType: session.session_type,
    });
    const answerId = await InterviewAnswer.create({
      sessionId: session.id,
      question,
      userAnswer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      improvedAnswer: evaluation.improvedAnswer,
    });
    const overallScore = await InterviewSession.updateOverallScore(session.id, req.user.id);
    const answers = await InterviewAnswer.findBySessionId(session.id);
    const answer = answers.find((item) => item.id === answerId) || answers[answers.length - 1];

    res.status(201).json({ success: true, message: "Answer evaluated.", answer, overallScore });
  } catch (err) {
    next(err);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.findByUserId(req.user.id);
    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
};

const getSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id, req.user.id);
    if (!session) return res.status(404).json({ success: false, message: "Interview session not found." });
    const answers = await InterviewAnswer.findBySessionId(session.id);
    res.json({ success: true, session, answers });
  } catch (err) {
    next(err);
  }
};

const getInterviewStats = async (req, res, next) => {
  try {
    const stats = await InterviewSession.statsByUserId(req.user.id);
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

module.exports = { startSession, submitAnswer, getSessions, getSession, getInterviewStats };
