/**
 * server.js — Application entry point
 * Boots Express, connects to MySQL, registers all middleware & routes.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");

const { connectDB } = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// ── Route imports ──────────────────────────────────────────────────────────

const authRoutes     = require("./routes/auth");
const resumeRoutes   = require("./routes/resume");
const analysisRoutes = require("./routes/analysis");
const userRoutes     = require("./routes/user");
const jobMatchRoutes = require("./routes/jobMatch");  // ← NEW
const resumeBuilderRoutes = require("./routes/resumeBuilder");


const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & utility middleware ──────────────────────────────────────────
app.use(helmet());                                   // Sets secure HTTP headers
app.use(cors({ origin: process.env.CLIENT_URL || "ai-resume-analyzer-alrlj89hu-jpatil-s-projects.vercel.app", credentials: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// ── Global rate limiter (100 req / 15 min per IP) ──────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// ── Stricter limiter for auth endpoints ───────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts, please wait 15 minutes." },
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",        authLimiter, authRoutes);
app.use("/api/resumes",     resumeRoutes);
app.use("/api/analyses",    analysisRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/job-matches", jobMatchRoutes);  // ← NEW
app.use("/api/resume-builder", resumeBuilderRoutes);


// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Central error handler (must be last)
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀  Server running on http://localhost:${PORT}`);
      console.log(`📦  Environment : ${process.env.NODE_ENV}`);
      console.log(`🤖  AI Service  : ${process.env.GEMINI_API_KEY ? "Gemini AI" : "Mock (set GEMINI_API_KEY)"}\n`);
    });
  } catch (err) {
    console.error("❌  Failed to start server:", err.message);
    process.exit(1);
  }
};

start();
