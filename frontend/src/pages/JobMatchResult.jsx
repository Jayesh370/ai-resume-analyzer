/**
 * pages/JobMatchResult.jsx  ← NEW
 *
 * Displays the full job-match analysis:
 *   1. Match score ring
 *   2. AI summary
 *   3. Matched vs missing keywords
 *   4. Strengths
 *   5. Weaknesses
 *   6. Improvements
 *   7. Tailored interview questions
 */

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import GlassCard from "../components/GlassCard.jsx";
import MatchScoreCard from "../components/MatchScoreCard.jsx";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  Lightbulb, MessageSquare, FileText, Briefcase,
  ChevronDown, ChevronUp, TrendingUp, Sparkles, Cpu,
  AlertCircle, Plus,
} from "lucide-react";

/* ─── Animation variants ──────────────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ─── Difficulty badge ────────────────────────────────────────────────── */
const DiffBadge = ({ d }) => {
  const map = { Easy: "badge-green", Medium: "badge-yellow", Hard: "badge-red" };
  return <span className={map[d] || "badge-blue"}>{d}</span>;
};
const CatBadge = ({ c }) => <span className="badge badge-purple">{c}</span>;

/* ─── Collapsible question row ───────────────────────────────────────── */
const QuestionRow = ({ q, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border overflow-hidden transition-all hover:border-brand-500/30"
      style={{ borderColor: "var(--border)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left"
        style={{ background: "var(--bg-card)" }}
      >
        <span className="text-xs font-mono w-6 flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="flex-1 text-sm font-medium leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {q.question}
        </p>
        {open
          ? <ChevronUp  className="h-4 w-4 text-brand-400 flex-shrink-0 mt-0.5" />
          : <ChevronDown className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} />
        }
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 flex items-center gap-2 border-t"
              style={{ borderColor: "var(--border)" }}>
              <CatBadge c={q.category} />
              <DiffBadge d={q.difficulty} />
              <span className="text-xs italic ml-auto" style={{ color: "var(--text-muted)" }}>
                Use the STAR method
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Keyword pill ───────────────────────────────────────────────────── */
const KeywordPill = ({ word, type, index }) => {
  const styles = {
    matched: "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
    missing: "bg-red-500/10    border-red-500/25    text-red-300",
  };
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, ease: "backOut" }}
      whileHover={{ scale: 1.08 }}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border cursor-default ${styles[type]}`}
    >
      {type === "matched"
        ? <CheckCircle2 className="h-3 w-3" />
        : <Plus className="h-3 w-3" />
      }
      {word}
    </motion.span>
  );
};

/* ─── List section (strengths / weaknesses / improvements) ───────────── */
const BulletSection = ({ items, type, delay = 0 }) => {
  const cfg = {
    strength:    { icon: CheckCircle2,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    weakness:    { icon: XCircle,        color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20"         },
    improvement: { icon: TrendingUp,     color: "text-brand-400",   bg: "bg-brand-500/10 border-brand-500/20"     },
  };
  const { icon: Icon, color, bg } = cfg[type];

  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + i * 0.07 }}
          className={`flex items-start gap-3 p-3.5 rounded-xl border ${bg}`}
        >
          <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${color}`} />
          <span className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {item}
          </span>
        </motion.li>
      ))}
    </ul>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function JobMatchResult() {
  const { id } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.get(`/job-matches/${id}`)
      .then((r) => setData(r.data.jobMatch))
      .catch((e) => setError(e.displayMessage || "Failed to load job match."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <LoadingSpinner text="Loading your match report…" />
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <GlassCard className="text-center max-w-sm" animate={false}>
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="font-medium mb-4" style={{ color: "var(--text-primary)" }}>{error}</p>
          <Link to="/job-match" className="btn-secondary text-sm">← New Match</Link>
        </GlassCard>
      </main>
    </div>
  );

  const {
    job_title, match_score, summary,
    matched_keywords, missing_keywords,
    strengths, weaknesses, improvements,
    interview_questions,
    resume_name, created_at,
  } = data;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={container} initial="hidden" animate="show">

          {/* ── Page header ─────────────────────────────────────── */}
          <motion.div variants={cardItem} className="mb-8">
            <Link to="/job-match"
              className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-brand-300"
              style={{ color: "var(--text-muted)" }}>
              <ArrowLeft className="h-4 w-4" /> New Job Match
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="page-title flex items-center gap-2 mb-2">
                  <Briefcase className="h-7 w-7 text-brand-400" />
                  Job Match Report
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  {resume_name && (
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <FileText className="h-4 w-4" />
                      {resume_name}
                    </span>
                  )}
                  {job_title && (
                    <>
                      <span style={{ color: "var(--border-strong)" }}>→</span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-brand-300">
                        <Briefcase className="h-4 w-4" />
                        {job_title}
                      </span>
                    </>
                  )}
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(created_at).toLocaleDateString("en-US",
                      { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
              </div>
              <Link to="/job-match" className="btn-primary text-sm">
                <Sparkles className="h-4 w-4" /> New Match
              </Link>
            </div>
          </motion.div>

          {/* ── Row 1: Score ring + AI Summary ──────────────────── */}
          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            <motion.div variants={cardItem} className="flex justify-center">
              <MatchScoreCard score={match_score} jobTitle={job_title} size={190} />
            </motion.div>

            <motion.div variants={cardItem} className="lg:col-span-2">
              <GlassCard gradient className="h-full" animate={false}>
                <h2 className="section-title flex items-center gap-2 mb-4">
                  <Cpu className="h-5 w-5 text-brand-400" />
                  Gemini AI Summary
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {summary}
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
                  {[
                    { label: "Keywords Matched", value: matched_keywords?.length ?? 0, color: "text-emerald-400" },
                    { label: "Keywords Missing", value: missing_keywords?.length  ?? 0, color: "text-red-400"     },
                    { label: "Improvements",     value: improvements?.length      ?? 0, color: "text-brand-400"   },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Row 2: Matched + Missing keywords ───────────────── */}
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <motion.div variants={cardItem}>
              <GlassCard animate={false} className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Matched Keywords
                  </h2>
                  <span className="badge badge-green">{matched_keywords?.length ?? 0} found</span>
                </div>
                {matched_keywords?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {matched_keywords.map((w, i) => (
                      <KeywordPill key={w} word={w} type="matched" index={i} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No direct keyword matches found.
                  </p>
                )}
              </GlassCard>
            </motion.div>

            <motion.div variants={cardItem}>
              <GlassCard animate={false} className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Missing Keywords
                  </h2>
                  <span className="badge badge-red">{missing_keywords?.length ?? 0} gaps</span>
                </div>
                {missing_keywords?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missing_keywords.map((w, i) => (
                      <KeywordPill key={w} word={w} type="missing" index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-300">
                      All key JD keywords are present in your resume!
                    </p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Row 3: Strengths + Weaknesses ───────────────────── */}
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <motion.div variants={cardItem}>
              <GlassCard animate={false} className="h-full">
                <h2 className="section-title flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Your Strengths
                </h2>
                <BulletSection items={strengths || []} type="strength" />
              </GlassCard>
            </motion.div>

            <motion.div variants={cardItem}>
              <GlassCard animate={false} className="h-full">
                <h2 className="section-title flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-red-400" />
                  Identified Weaknesses
                </h2>
                <BulletSection items={weaknesses || []} type="weakness" />
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Row 4: Improvements ─────────────────────────────── */}
          {improvements?.length > 0 && (
            <motion.div variants={cardItem} className="mb-6">
              <GlassCard animate={false}>
                <h2 className="section-title flex items-center gap-2 mb-5">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  Recommended Resume Improvements
                  <span className="ml-auto badge badge-yellow">{improvements.length} actions</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {improvements.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-3 p-4 rounded-xl border"
                      style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
                        text-xs font-mono font-bold bg-brand-500/15 border border-brand-500/25 text-brand-400">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── Row 5: Interview Questions ───────────────────────── */}
          {interview_questions?.length > 0 && (
            <motion.div variants={cardItem}>
              <GlassCard animate={false}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="section-title flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-brand-400" />
                    Tailored Interview Questions
                  </h2>
                  <span className="badge badge-blue">{interview_questions.length} questions</span>
                </div>
                <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
                  These questions are generated based on both the job requirements AND your specific background.
                  Click any question to expand it.
                </p>
                <div className="space-y-2">
                  {interview_questions.map((q, i) => (
                    <QuestionRow key={i} q={q} index={i} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── CTA ─────────────────────────────────────────────── */}
          <motion.div variants={cardItem} className="mt-8 flex flex-wrap gap-3 justify-end">
            <Link to="/job-match" className="btn-primary">Try Another Job</Link>
            <Link to="/upload"    className="btn-secondary">Improve Resume</Link>
            <Link to="/history"   className="btn-secondary">View Analysis History</Link>
          </motion.div>

        </motion.div>
      </main>
      <Footer />
    </div>
  );
}