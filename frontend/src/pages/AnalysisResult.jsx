/**
 * pages/AnalysisResult.jsx  ← UPDATED
 * Full redesign: animated score, skill categories, glassmorphism cards.
 */

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ScoreCard from "../components/ScoreCard.jsx";
import GlassCard from "../components/GlassCard.jsx";
import SkillBadge, { SkillCategoryLegend } from "../components/SkillBadge.jsx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  ArrowLeft, CheckCircle2, AlertCircle, MessageSquare,
  Target, Lightbulb, Layers, FileText, Cpu, Plus,
  ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardItem = {
  hidden: { opacity:0, y:24 },
  show:   { opacity:1, y:0, transition:{ duration:0.5, ease:[0.25,0.46,0.45,0.94] } },
};

const DiffBadge = ({ d }) => {
  const map = { Easy:"badge-green", Medium:"badge-yellow", Hard:"badge-red" };
  return <span className={map[d] || "badge-blue"}>{d}</span>;
};
const CatBadge  = ({ c }) => <span className="badge badge-blue">{c}</span>;

const COLORS = ["#8b5cf6","#6366f1","#a78bfa"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs backdrop-blur-xl border"
      style={{ background:"var(--bg-card)", borderColor:"var(--border)", color:"var(--text-primary)" }}>
      <span className="text-brand-300 font-mono font-bold">{payload[0].value}%</span> match
    </div>
  );
};

// Collapsible interview question card
const QuestionCard = ({ q, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border overflow-hidden transition-all duration-200 hover:border-brand-500/30"
      style={{ borderColor:"var(--border)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left"
        style={{ background:"var(--bg-card)" }}
      >
        <span className="text-xs font-mono flex-shrink-0 mt-1 w-6" style={{ color:"var(--text-muted)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="flex-1 text-sm font-medium leading-relaxed" style={{ color:"var(--text-primary)" }}>
          {q.question}
        </p>
        <div className="flex-shrink-0 mt-0.5">
          {open ? <ChevronUp className="h-4 w-4 text-brand-400" /> : <ChevronDown className="h-4 w-4" style={{ color:"var(--text-muted)" }} />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height:0 }} animate={{ height:"auto" }} exit={{ height:0 }}
            transition={{ duration:0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex items-center gap-2 border-t pt-3"
              style={{ borderColor:"var(--border)" }}>
              <CatBadge c={q.category} />
              <DiffBadge d={q.difficulty} />
              <span className="text-xs ml-auto italic" style={{ color:"var(--text-muted)" }}>
                Prepare a 2–3 min answer using the STAR method
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    api.get(`/analyses/${id}`)
      .then((r) => setAnalysis(r.data.analysis))
      .catch((e) => setError(e.displayMessage || "Failed to load analysis."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col" style={{ background:"var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <LoadingSpinner text="Loading your report…" />
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col" style={{ background:"var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <GlassCard className="text-center max-w-sm" animate={false}>
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="font-medium mb-4" style={{ color:"var(--text-primary)" }}>{error}</p>
          <Link to="/history" className="btn-secondary text-sm">← Back to History</Link>
        </GlassCard>
      </main>
    </div>
  );

  const {
    ats_score, skills, job_roles, missing_skills, summary,
    interview_questions, resume_name, created_at, ai_provider,
  } = analysis;

  const roleData = (job_roles || []).map((r) => ({
    name: r.role?.replace(" Developer","Dev")?.replace(" Engineer","Eng") || r.role,
    score: r.matchScore,
    fullRole: r.role,
  }));

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"var(--bg-primary)" }}>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={container} initial="hidden" animate="show">

          {/* ── Header ──────────────────────────────────────────────── */}
          <motion.div variants={cardItem} className="mb-8">
            <Link to="/history"
              className="inline-flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-brand-300"
              style={{ color:"var(--text-muted)" }}>
              <ArrowLeft className="h-4 w-4" /> Back to History
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="page-title mb-2">Analysis Report</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm" style={{ color:"var(--text-secondary)" }}>
                    <FileText className="h-4 w-4" />
                    {resume_name}
                  </span>
                  <span style={{ color:"var(--border-strong)" }}>·</span>
                  <span className="text-sm" style={{ color:"var(--text-muted)" }}>
                    {new Date(created_at).toLocaleDateString("en-US",
                      { year:"numeric", month:"long", day:"numeric" })}
                  </span>
                  {ai_provider && (
                    <>
                      <span style={{ color:"var(--border-strong)" }}>·</span>
                      <span className="badge badge-purple">
                        <Cpu className="h-3 w-3" />
                        {ai_provider}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Link to="/upload" className="btn-primary text-sm">
                <Sparkles className="h-4 w-4" /> Analyze Another
              </Link>
            </div>
          </motion.div>

          {/* ── Row 1: Score + Summary ───────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            <motion.div variants={cardItem} className="flex justify-center">
              <ScoreCard score={ats_score} size={180} />
            </motion.div>

            <motion.div variants={cardItem} className="lg:col-span-2">
              <GlassCard gradient className="h-full" animate={false}>
                <h2 className="section-title flex items-center gap-2 mb-4">
                  <Layers className="h-5 w-5 text-brand-400" /> AI Summary
                </h2>
                <p className="text-sm leading-relaxed" style={{ color:"var(--text-secondary)" }}>
                  {summary}
                </p>

                {/* Quick stats row */}
                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t" style={{ borderColor:"var(--border)" }}>
                  {[
                    { label:"Skills Found",  value:skills?.length ?? 0,         color:"text-emerald-400" },
                    { label:"Role Matches",  value:job_roles?.length ?? 0,       color:"text-brand-400"   },
                    { label:"Interview Qs",  value:interview_questions?.length ?? 0, color:"text-amber-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Row 2: Skills ──────────────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-5 mb-6">

            {/* Detected skills */}
            <motion.div variants={cardItem}>
              <GlassCard animate={false} className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Detected Skills
                  </h2>
                  <span className="badge badge-green">{skills?.length ?? 0} found</span>
                </div>

                {skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <SkillBadge key={s} skill={s} index={i} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color:"var(--text-muted)" }}>No skills detected.</p>
                )}

                {skills?.length > 0 && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor:"var(--border)" }}>
                    <p className="text-xs mb-2 font-medium" style={{ color:"var(--text-muted)" }}>Legend</p>
                    <SkillCategoryLegend />
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Missing skills */}
            <motion.div variants={cardItem}>
              <GlassCard animate={false} className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-amber-400" />
                    Skills to Add
                  </h2>
                  <span className="badge badge-yellow">{missing_skills?.length ?? 0} gaps</span>
                </div>

                {missing_skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missing_skills.map((s, i) => (
                      <motion.span
                        key={s}
                        initial={{ opacity:0, scale:0.8 }}
                        animate={{ opacity:1, scale:1 }}
                        transition={{ delay: i * 0.05, ease:"backOut" }}
                        whileHover={{ scale:1.08 }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border
                          bg-amber-500/10 border-amber-500/25 text-amber-300 cursor-default"
                      >
                        <Plus className="h-3 w-3" />
                        {s}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-300">
                      Great job! No major skill gaps detected for your top role match.
                    </p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Row 3: Job Role Match ──────────────────────────────────── */}
          {roleData.length > 0 && (
            <motion.div variants={cardItem} className="mb-6">
              <GlassCard animate={false}>
                <h2 className="section-title flex items-center gap-2 mb-6">
                  <Target className="h-5 w-5 text-brand-400" />
                  Job Role Match Analysis
                </h2>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                  {/* Bar chart */}
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={roleData} layout="vertical" margin={{ left:0, right:24, top:4, bottom:4 }}>
                      <XAxis type="number" domain={[0,100]}
                        tick={{ fill:"var(--text-muted)", fontSize:11 }}
                        tickLine={false} axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis type="category" dataKey="name"
                        tick={{ fill:"var(--text-secondary)", fontSize:11 }}
                        tickLine={false} axisLine={false} width={100}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(139,92,246,0.06)" }} />
                      <Bar dataKey="score" radius={[0,8,8,0]} maxBarSize={28}>
                        {roleData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]}
                            style={{ filter:`drop-shadow(0 0 6px ${COLORS[i]}60)` }} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Role detail cards */}
                  <div className="space-y-3">
                    {(job_roles || []).map((r, i) => (
                      <motion.div
                        key={r.role}
                        initial={{ opacity:0, x:20 }}
                        animate={{ opacity:1, x:0 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="flex items-center justify-between p-3.5 rounded-xl border transition-all hover:border-brand-500/30"
                        style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold"
                            style={{ background:`${COLORS[i]}20`, color:COLORS[i] }}>
                            {i + 1}
                          </div>
                          <span className="text-sm font-medium" style={{ color:"var(--text-primary)" }}>
                            {r.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 rounded-full overflow-hidden"
                            style={{ background:"var(--border)" }}>
                            <motion.div
                              initial={{ width:0 }}
                              animate={{ width:`${r.matchScore}%` }}
                              transition={{ duration:1, delay: i * 0.15 + 0.5, ease:"easeOut" }}
                              className="h-full rounded-full"
                              style={{ background:COLORS[i], boxShadow:`0 0 8px ${COLORS[i]}60` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-brand-300 w-10 text-right">
                            {r.matchScore}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── Row 4: Interview Questions ─────────────────────────────── */}
          {interview_questions?.length > 0 && (
            <motion.div variants={cardItem}>
              <GlassCard animate={false}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="section-title flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-brand-400" />
                    Interview Questions
                  </h2>
                  <span className="badge badge-blue">{interview_questions.length} questions</span>
                </div>
                <p className="text-xs mb-5" style={{ color:"var(--text-muted)" }}>
                  Click any question to expand and see its category and difficulty. Tap to practice!
                </p>
                <div className="space-y-2">
                  {interview_questions.map((q, i) => (
                    <QuestionCard key={q.id || i} q={q} index={i} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div variants={cardItem} className="mt-8 flex flex-wrap gap-3 justify-end">
            <Link to="/upload"  className="btn-primary">New Analysis</Link>
            <Link to="/history" className="btn-secondary">View History</Link>
          </motion.div>

        </motion.div>
      </main>
      <Footer />
    </div>
  );
}