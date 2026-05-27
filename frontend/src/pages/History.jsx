/**
 * pages/History.jsx  ← UPDATED
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import GlassCard from "../components/GlassCard.jsx";
import {
  Clock, FileText, Trash2, ChevronRight,
  Upload, TrendingUp, Search,
} from "lucide-react";

const ScorePill = ({ score }) => {
  const cfg =
    score >= 85 ? { color:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/25", label:"A" } :
    score >= 70 ? { color:"text-brand-400",   bg:"bg-brand-500/10 border-brand-500/25",     label:"B" } :
    score >= 50 ? { color:"text-amber-400",   bg:"bg-amber-500/10 border-amber-500/25",     label:"C" } :
                  { color:"text-red-400",     bg:"bg-red-500/10 border-red-500/25",         label:"D" };
  return (
    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border flex-shrink-0 ${cfg.bg}`}>
      <span className={`font-display font-bold text-lg leading-none ${cfg.color}`}>{score}</span>
      <span className={`text-[10px] font-mono ${cfg.color} opacity-70`}>{cfg.label}</span>
    </div>
  );
};

export default function History() {
  const [all,      setAll]      = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search,   setSearch]   = useState("");

  useEffect(() => {
    api.get("/analyses")
      .then((r) => { setAll(r.data.analyses || []); setFiltered(r.data.analyses || []); })
      .catch(() => toast.error("Failed to load history."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(all); return; }
    const q = search.toLowerCase();
    setFiltered(all.filter((a) =>
      a.resume_name?.toLowerCase().includes(q) ||
      a.summary?.toLowerCase().includes(q)
    ));
  }, [search, all]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this analysis permanently?")) return;
    setDeleting(id);
    try {
      await api.delete(`/analyses/${id}`);
      const next = all.filter((a) => a.id !== id);
      setAll(next);
      toast.success("Deleted.");
    } catch (err) {
      toast.error(err.displayMessage || "Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  const avg = all.length ? Math.round(all.reduce((s, a) => s + a.ats_score, 0) / all.length) : 0;
  const best = all.length ? Math.max(...all.map((a) => a.ats_score)) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background:"var(--bg-primary)" }}>
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Clock className="h-7 w-7 text-brand-400" />
                Analysis History
              </h1>
              <p className="text-sm mt-1" style={{ color:"var(--text-secondary)" }}>
                All your past resume analyses
              </p>
            </div>
            <Link to="/upload" className="btn-primary text-sm flex-shrink-0">
              <Upload className="h-4 w-4" /> New Analysis
            </Link>
          </div>

          {/* Stat row */}
          {all.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label:"Total Analyses", value:all.length, color:"text-brand-400" },
                { label:"Avg ATS Score",  value:avg,        color:"text-amber-400"   },
                { label:"Best Score",     value:best,       color:"text-emerald-400" },
              ].map(({ label, value, color }) => (
                <GlassCard key={label} padding="p-4" animate>
                  <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}>{label}</p>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Search bar */}
          {all.length > 2 && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color:"var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search by filename or summary…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          )}
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner text="Loading history…" />
          </div>
        ) : all.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center text-center gap-5 py-16" animate={false}>
            <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
              className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <FileText className="h-10 w-10 text-brand-400" />
            </motion.div>
            <div>
              <h3 className="font-display font-semibold text-lg mb-1" style={{ color:"var(--text-primary)" }}>
                No history yet
              </h3>
              <p className="text-sm max-w-xs" style={{ color:"var(--text-muted)" }}>
                Run your first AI analysis to start building your history.
              </p>
            </div>
            <Link to="/upload" className="btn-primary"><Upload className="h-4 w-4" /> Upload Resume</Link>
          </GlassCard>
        ) : filtered.length === 0 ? (
          <GlassCard className="text-center py-10" animate={false}>
            <p style={{ color:"var(--text-muted)" }}>No results for "{search}"</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity:0, y:16 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, x:-20 }}
                  transition={{ delay: i * 0.05, duration:0.4 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
                    hover:border-brand-500/30 group"
                  style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}
                >
                  <ScorePill score={a.ats_score} />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate mb-0.5" style={{ color:"var(--text-primary)" }}>
                      {a.resume_name}
                    </p>
                    <p className="text-xs mb-1.5" style={{ color:"var(--text-muted)" }}>
                      {new Date(a.created_at).toLocaleDateString("en-US",
                        { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                    </p>
                    <p className="text-xs line-clamp-1" style={{ color:"var(--text-secondary)" }}>
                      {a.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/analysis/${a.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                        text-brand-400 hover:bg-brand-500/10 transition-all">
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                      className="p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100
                        hover:bg-red-500/10 text-red-400/60 hover:text-red-400"
                    >
                      {deleting === a.id
                        ? <span className="block h-4 w-4 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Avg footer */}
        {all.length > 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
            className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm border"
            style={{ borderColor:"var(--border)", color:"var(--text-muted)" }}>
            <TrendingUp className="h-4 w-4 text-brand-400" />
            {all.length} {all.length === 1 ? "analysis" : "analyses"} ·
            Average score: <span className="font-mono font-semibold text-brand-300 ml-1">{avg}/100</span> ·
            Best: <span className="font-mono font-semibold text-emerald-300 ml-1">{best}/100</span>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}