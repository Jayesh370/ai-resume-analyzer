/**
 * routes/resume.js — /api/resumes/*
 */

const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadResume, getResumes, deleteResume } = require("../controllers/resumeController");

// All routes require authentication
router.use(authenticate);

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/",                                 getResumes);
router.delete("/:id",                           deleteResume);

module.exports = router;
