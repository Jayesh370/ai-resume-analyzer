const express = require("express");
const authenticate = require("../middleware/auth");
const {
  getInterviewStats,
  getSession,
  getSessions,
  startSession,
  submitAnswer,
} = require("../controllers/interviewController");

const router = express.Router();

router.use(authenticate);

router.get("/stats", getInterviewStats);
router.post("/sessions", startSession);
router.get("/sessions", getSessions);
router.get("/sessions/:id", getSession);
router.post("/sessions/:id/answers", submitAnswer);

module.exports = router;
