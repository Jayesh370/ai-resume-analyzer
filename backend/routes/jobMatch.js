/**
 * routes/jobMatch.js  ← NEW
 * All routes: /api/job-matches/*
 */

const express = require("express");
const { body }  = require("express-validator");
const router    = express.Router();

const authenticate = require("../middleware/auth");
const {
  runJobMatch, getJobMatches, getJobMatch, deleteJobMatch,
} = require("../controllers/jobMatchController");

// All routes require a valid JWT
router.use(authenticate);

// Validation rules for the analyze endpoint
const analyzeValidation = [
  body("resumeId")
    .isInt({ min: 1 }).withMessage("A valid resume ID is required."),
  body("jobDescription")
    .trim()
    .isLength({ min: 50 })
    .withMessage("Job description must be at least 50 characters.")
    .isLength({ max: 8000 })
    .withMessage("Job description must be under 8000 characters."),
];

router.post("/analyze", analyzeValidation, runJobMatch);
router.get("/",                            getJobMatches);
router.get("/:id",                         getJobMatch);
router.delete("/:id",                      deleteJobMatch);

module.exports = router;