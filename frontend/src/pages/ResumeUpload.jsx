/**
 * pages/ResumeUpload.jsx  ← UPDATED
 * Drop zone with animation + AnalysisLoadingScreen integration.
 */

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import GlassCard from "../components/GlassCard.jsx";
import AnalysisLoadingScreen from "../components/AnalysisLoadingScreen.jsx";
import {
  Upload, FileText, X, AlertCircle,
  BrainCircuit, Sparkles, CheckCircle2, Info,
} from "lucide-react";

const TIPS = [
  "Use a text-based PDF (not a scanned image)",
  "Include clear sections: Summary, Experience, Skills, Education",
  "Quantify achievements wherever possible (e.g. 'Reduced load time by 40%')",
  "Include relevant keywords for your target role",
  "Keep it to 1–2 pages for best ATS compatibility",
];

export default function ResumeUpload() {
  const navigate  = useNavigate();
  const inputRef  = useRef(null);

  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [phase,    setPhase]    = useState("idle");       // idle|running|error
  const [step,     setStep]     = useState(0);            // 0-3 active step
  const [done,     setDone]     = useState([]);           // completed step indices
  const [errMsg,   setErrMsg]   = useState("");

  /* ── Helpers ─────────────────────────────────────────────────── */
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") { toast.error("Only PDF files are supported."); return; }
    if (f.size > 5 * 1024 * 1024)    { toast.error("File must be under 5 MB.");      return; }
    setFile(f);
    setPhase("idle");
    setErrMsg("");
  };

  const onDrop     = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); };
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave= () => setDragging(false);

  /* ── Submit ──────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!file) return;
    setPhase("running");
    setStep(0);
    setDone([]);
    setErrMsg("");

    try {
      // Step 0 — upload PDF
      const fd = new FormData();
      fd.append("resume", file);
      const uploadRes = await api.post("/resumes/upload", fd, {
        headers: { "Content-Type":"multipart/form-data" },
      });
      setDone([0]); setStep(1);
      await sleep(400);

      // Step 1 — extracting (happens server-side, simulate delay)
      await sleep(1200);
      setDone([0,1]); setStep(2);

      // Step 2 — AI analysis (real call)
      const analysisRes = await api.post("/analyses/run", {
        resumeId: uploadRes.data.resume.id,
      });
      setDone([0,1,2]); setStep(3);
      await sleep(600);

      // Step 3 — finalizing
      setDone([0,1,2,3]);
      await sleep(500);

      toast.success("Analysis complete! 🎉");
      navigate(`/analysis/${analysisRes.data.analysis.id}`);
    } catch (err) {
      setPhase("error");
      const msg = err.displayMessage || "Something went wrong. Please try again.";
      setErrMsg(msg);
      toast.error(msg);
    }
  };

  const isRunning = phase === "running";

  return (
    <>
      {/* Full-screen loading overlay */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.3 }}
          >
            <AnalysisLoadingScreen currentStep={step} completedSteps={done} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col" style={{ background:"var(--bg-primary)" }}>
        <Navbar />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>

            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4 text-xs font-medium"
                style={{ background:"rgba(139,92,246,0.1)", borderColor:"rgba(139,92,246,0.25)", color:"var(--text-primary)" }}>
                <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini AI
              </div>
              <h1 className="page-title">Analyze Your Resume</h1>
              <p className="mt-1 text-sm" style={{ color:"var(--text-secondary)" }}>
                Upload a PDF and receive an ATS score, skill analysis, job matches, and tailored interview questions.
              </p>
            </div>

            {/* Drop Zone */}
            <motion.div
              whileHover={!isRunning ? { scale:1.005 } : {}}
              onClick={() => !isRunning && inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
                transition-all duration-300 mb-6 overflow-hidden
                ${dragging ? "border-brand-400 scale-[1.01]" : ""}
                ${file    ? "border-brand-500/50" : "border-white/10 hover:border-brand-500/40"}
                ${isRunning ? "pointer-events-none opacity-60" : ""}
              `}
              style={{ background: dragging ? "rgba(124,58,237,0.08)" : file ? "rgba(124,58,237,0.05)" : "var(--bg-card)" }}
            >
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

              {/* Animated ring decoration */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <motion.div
                  animate={{ rotate:360 }}
                  transition={{ duration:20, repeat:Infinity, ease:"linear" }}
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full border border-brand-500/10"
                />
                <motion.div
                  animate={{ rotate:-360 }}
                  transition={{ duration:30, repeat:Infinity, ease:"linear" }}
                  className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full border border-brand-400/8"
                />
              </div>

              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div key="file"
                    initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                    className="flex flex-col items-center gap-3 relative"
                  >
                    <motion.div
                      animate={{ y:[0,-4,0] }}
                      transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
                      className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/25"
                    >
                      <FileText className="h-10 w-10 text-brand-400" />
                    </motion.div>
                    <div>
                      <p className="font-semibold mb-0.5" style={{ color:"var(--text-primary)" }}>{file.name}</p>
                      <p className="text-sm" style={{ color:"var(--text-muted)" }}>
                        {(file.size / 1024).toFixed(0)} KB · PDF ·{" "}
                        <span className="text-emerald-400">Ready to analyze</span>
                      </p>
                    </div>
                    {!isRunning && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setPhase("idle"); }}
                        className="flex items-center gap-1 text-xs transition-colors hover:text-red-400"
                        style={{ color:"var(--text-muted)" }}
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="empty"
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    className="flex flex-col items-center gap-3 relative"
                  >
                    <motion.div
                      animate={{ y:[0,-6,0] }}
                      transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
                      className="p-4 rounded-2xl border"
                      style={{ background:"var(--bg-primary)", borderColor:"var(--border)" }}
                    >
                      <Upload className="h-10 w-10" style={{ color:"var(--text-muted)" }} />
                    </motion.div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color:"var(--text-primary)" }}>
                        {dragging ? "Drop it here!" : "Drag & drop your resume"}
                      </p>
                      <p className="text-sm" style={{ color:"var(--text-muted)" }}>
                        or <span className="text-brand-400 underline underline-offset-2">click to browse</span> · PDF only · max 5 MB
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {phase === "error" && (
                <motion.div
                  initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                  className="flex items-start gap-3 p-4 rounded-xl border mb-4 text-sm"
                  style={{ background:"rgba(239,68,68,0.08)", borderColor:"rgba(239,68,68,0.25)" }}
                >
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-red-400">{errMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <motion.button
              onClick={handleSubmit}
              disabled={!file || isRunning}
              whileHover={file && !isRunning ? { scale:1.01 } : {}}
              whileTap={file && !isRunning ? { scale:0.99 } : {}}
              className="btn-primary w-full py-4 text-base mb-6"
            >
              <BrainCircuit className="h-5 w-5" />
              Analyze with AI
              <Sparkles className="h-4 w-4" />
            </motion.button>

            {/* Tips */}
            <GlassCard padding="p-5" animate={false}>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"
                style={{ color:"var(--text-secondary)" }}>
                <Info className="h-4 w-4 text-brand-400" />
                Tips for a higher ATS score
              </h3>
              <ul className="space-y-2">
                {TIPS.map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity:0, x:-8 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2 text-xs"
                    style={{ color:"var(--text-muted)" }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        </main>
        <Footer />
      </div>
    </>
  );
}
