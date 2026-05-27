/**
 * controllers/resumeController.js — Upload, list, and delete resumes
 */

const path = require("path");
const fs = require("fs");
const Resume = require("../models/Resume");
const { extractTextFromPDF } = require("../services/pdfService");

// ── POST /api/resumes/upload ───────────────────────────────────────────────
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const { originalname, filename, path: filePath, size } = req.file;

    // Persist metadata to DB
    const resumeId = await Resume.create({
      userId:       req.user.id,
      originalName: originalname,
      storedName:   filename,
      filePath:     filePath,
      fileSize:     size,
    });

    // Extract text asynchronously and update the record
    // (We don't await here so the user gets an immediate response)
    extractTextFromPDF(filePath)
      .then((text) => Resume.updateExtractedText(resumeId, text))
      .catch((err) => console.error("PDF parse error:", err.message));

    const resume = await Resume.findById(resumeId);

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully!",
      resume: {
        id:           resume.id,
        originalName: resume.original_name,
        fileSize:     resume.file_size,
        createdAt:    resume.created_at,
      },
    });
  } catch (err) {
    // Clean up file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// ── GET /api/resumes — List all resumes for the logged-in user ────────────
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.findByUserId(req.user.id);
    res.json({
      success: true,
      resumes: resumes.map((r) => ({
        id:           r.id,
        originalName: r.original_name,
        fileSize:     r.file_size,
        createdAt:    r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/resumes/:id ───────────────────────────────────────────────
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume || resume.user_id !== req.user.id) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    // Delete physical file
    if (fs.existsSync(resume.file_path)) fs.unlinkSync(resume.file_path);

    await Resume.delete(req.params.id, req.user.id);
    res.json({ success: true, message: "Resume deleted." });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getResumes, deleteResume };
