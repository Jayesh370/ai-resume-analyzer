/**
 * routes/analysis.js — /api/analyses/*
 */

const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const {
  runAnalysis,
  getHistory,
  getAnalysis,
  deleteAnalysis,
  getDashboardStats,
} = require("../controllers/analysisController");

// All routes require authentication
router.use(authenticate);

router.get("/dashboard", getDashboardStats);   // ← must be before /:id
router.post("/run",      runAnalysis);
router.get("/",          getHistory);
router.get("/:id",       getAnalysis);
router.delete("/:id",    deleteAnalysis);

module.exports = router;
