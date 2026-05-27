/**
 * pages/JobMatch.jsx  ← NEW
 *
 * Step 1: User selects an existing resume (or is prompted to upload one first)
 *         and pastes a job description.
 * Step 2: On submit, runs POST /api/job-matches/analyze.
 * Step 3: Navigates to /job-match/:id result page.
 */

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import GlassCard from "../components/GlassCard.jsx";
import {
  Briefcase, FileText, ChevronDown, Sparkles,
  BrainCircuit, AlertCircle, CheckCircle2,
  ArrowRight, Upload, X, Info,
} from "lucide-react";

// ── Loading step definitions ──────────────────────────────────────────────
const STEPS = [
  { icon: FileText,    title: "Reading Resume",         desc: "Extracting text from your selected resume…"                },
  { icon: Briefcase,   title: "Parsing Job Description", desc: "Identifying key requirements, skills, and keywords…"       },
  { icon: BrainCircuit,title: "Gemini AI Analysis",     desc: "Comparing your profile against the job requirements…"       },
  { icon: Sparkles,    title: "Generating Report",      desc: "Building your match score, gaps, and recommendations…"      },
];

const LoadingOverlay = ({ step, done }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
    style={{ background: "var(--bg-primary)" }}
  >
    {/* Glow orbs */}
    <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
      style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-[80px] opacity-15 pointer-events-none"
      style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }} />

    <div className="relative max-w-sm w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-brand-500/15 border border-brand-500/30"
          style={{ boxShadow: "0 0 30px rgba(124,58,237,0.3)" }}
        >
          <BrainCircuit className="h-7 w-7 text-brand-400" />
        </motion.div>
        <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Analyzing Your Match
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Gemini AI is comparing your resume to the job description
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-6">
        {STEPS.map((s, i) => {
          const isDone   = done.includes(i);
          const isActive = step === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                isActive  ? "bg-brand-500/10 border-brand-500/25"   :
                isDone    ? "bg-emerald-500/5 border-emerald-500/20" :
                            "opacity-35"
              }`}
              style={!isActive && !isDone ? { borderColor: "var(--border)" } : {}}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 rounded-full border-2 border-brand-500/30 border-t-brand-400" />
                ) : (
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${isActive ? "text-brand-300" : isDone ? "text-emerald-300" : ""}`}
                  style={!isActive && !isDone ? { color: "var(--text-muted)" } : {}}>
                  {s.title}
                </p>
                {isActive && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {s.desc}
                  </motion.p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-card)" }}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500"
          initial={{ width: "0%" }}
          animate={{ width: `${((done.length + 0.5) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: "0 0 10px rgba(124,58,237,0.6)" }}
        />
      </div>
    </div>
  </motion.div>
);

// ── Main Page ─────────────────────────────────────────────────────────────
export default function JobMatch() {
  const navigate = useNavigate();

  const [resumes,   setResumes]   = useState([]);
  const [resumeId,  setResumeId]  = useState("");
  const [jd,        setJd]        = useState("");
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState(0);
  const [done,      setDone]      = useState([]);
  const [error,     setError]     = useState("");
  const [fetchingResumes, setFetchingResumes] = useState(true);

  // Remaining character count
  const MAX_JD = 8000;
  const remaining = MAX_JD - jd.length;

  useEffect(() => {
    api.get("/resumes")
      .then((r) => {
        setResumes(r.data.resumes || []);
        if (r.data.resumes?.length > 0) setResumeId(r.data.resumes[0].id);
      })
      .catch(() => toast.error("Could not load your resumes."))
      .finally(() => setFetchingResumes(false));
  }, []);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!resumeId)        { setError("Please select a resume.");              return; }
    if (jd.trim().length < 50) { setError("Job description must be at least 50 characters."); return; }

    setLoading(true);
    setStep(0);
    setDone([]);

    try {
  // Simulate step 0
  await sleep(600);
  setDone([0]);
  setStep(1);

  // Step 1
  await sleep(700);
  setDone([0, 1]);
  setStep(2);

  // API
  const res = await api.post(
    "/job-matches/analyze",
    {
      resumeId: Number(resumeId),
      jobDescription: jd.trim(),
    }
  );

  setDone([0, 1, 2]);
  setStep(3);

  // Finalizing
  await sleep(500);
  setDone([0, 1, 2, 3]);

  await sleep(400);

  toast.success(
    "Match analysis complete! 🎯"
  );

  // IMPORTANT FIX
  setLoading(false);

  navigate(
    `/job-match/${res.data.jobMatch.id}`
  );

} catch (err) {
  const msg =
    err.displayMessage ||
    "Analysis failed. Please try again.";

  setError(msg);

  toast.error(msg);

  console.error(err);

  setLoading(false);
}
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay step={step} done={done} />}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
        <Navbar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* ── Header ──────────────────────────────────────────── */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 text-xs font-medium"
                style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.25)", color: "var(--text-primary)" }}>
                <Sparkles className="h-3.5 w-3.5" />
                Powered by Gemini AI
              </div>
              <h1 className="page-title flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-brand-400" />
                Job Description Matcher
              </h1>
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                Paste any job description and see exactly how well your resume matches — with AI-powered gap analysis and tailored interview prep.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── Resume selector ─────────────────────────────── */}
              <GlassCard animate={false}>
                <label className="label flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-brand-400" />
                  Select Your Resume
                </label>

                {fetchingResumes ? (
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <div className="h-4 w-4 rounded-full border-2 border-brand-500/30 border-t-brand-400 animate-spin" />
                    Loading your resumes…
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="flex flex-col items-start gap-3">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      You have no resumes yet. Upload one first.
                    </p>
                    <Link to="/upload" className="btn-primary text-sm">
                      <Upload className="h-4 w-4" /> Upload Resume
                    </Link>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={resumeId}
                      onChange={(e) => setResumeId(e.target.value)}
                      className="input appearance-none pr-10 cursor-pointer"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.originalName} — uploaded {new Date(r.createdAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                      style={{ color: "var(--text-muted)" }} />
                  </div>
                )}
              </GlassCard>

              {/* ── Job description textarea ─────────────────────── */}
              <GlassCard animate={false}>
                <div className="flex items-center justify-between mb-3">
                  <label className="label flex items-center gap-2 mb-0">
                    <Briefcase className="h-4 w-4 text-brand-400" />
                    Job Description
                  </label>
                  <span className={`text-xs font-mono ${remaining < 500 ? "text-amber-400" : ""}`}
                    style={remaining >= 500 ? { color: "var(--text-muted)" } : {}}>
                    {remaining.toLocaleString()} chars left
                  </span>
                </div>

                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  maxLength={MAX_JD}
                  rows={12}
                  placeholder={`Paste the full job description here…\n\nExample:\nSoftware Engineer – Full Stack\nWe are looking for a talented engineer with 3+ years of experience in React, Node.js, and cloud technologies…`}
                  className="input resize-none leading-relaxed text-sm"
                  style={{ minHeight: "280px" }}
                />

                {/* Tips */}
                <div className="mt-3 flex items-start gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-brand-400" />
                  Paste the complete JD including requirements, responsibilities, and preferred qualifications for the most accurate match.
                </div>
              </GlassCard>

              {/* ── Error ────────────────────────────────────────── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl border text-sm"
                    style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)" }}
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-400">{error}</span>
                    <button onClick={() => setError("")} className="ml-auto text-red-400/60 hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Submit ───────────────────────────────────────── */}
              <motion.button
                type="submit"
                disabled={loading || resumes.length === 0}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                className="btn-primary w-full py-4 text-base"
              >
                <BrainCircuit className="h-5 w-5" />
                Match Resume to Job
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </form>
          </motion.div>
        </main>
        <Footer />
      </div>
    </>
  );
}
