/**
 * components/AnalysisLoadingScreen.jsx  ← NEW
 * Immersive full-screen loading experience with 4 animated steps.
 * Shown while the AI is processing the resume.
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, Cpu, MessageSquareDot, BarChart3, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    id: 0,
    icon: FileSearch,
    title: "Extracting PDF Content",
    desc: "Reading and parsing your resume document…",
    color: "text-sky-400",
    glow: "rgba(56,189,248,0.3)",
    bg: "bg-sky-500/10 border-sky-500/25",
    duration: 1800,
  },
  {
    id: 1,
    icon: Cpu,
    title: "Analyzing Skills & Experience",
    desc: "Identifying technical skills, tools, and experience level…",
    color: "text-violet-400",
    glow: "rgba(139,92,246,0.3)",
    bg: "bg-violet-500/10 border-violet-500/25",
    duration: 2500,
  },
  {
    id: 2,
    icon: MessageSquareDot,
    title: "Generating Interview Questions",
    desc: "Crafting tailored questions based on your resume content…",
    color: "text-pink-400",
    glow: "rgba(236,72,153,0.3)",
    bg: "bg-pink-500/10 border-pink-500/25",
    duration: 2200,
  },
  {
    id: 3,
    icon: BarChart3,
    title: "Finalizing Your Report",
    desc: "Calculating ATS score and job-role matches…",
    color: "text-emerald-400",
    glow: "rgba(16,185,129,0.3)",
    bg: "bg-emerald-500/10 border-emerald-500/25",
    duration: 1500,
  },
];

const Particle = ({ delay }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-brand-400/40"
    style={{
      left: `${Math.random() * 100}%`,
      top:  `${Math.random() * 100}%`,
    }}
    animate={{
      y:       [0, -30, 0],
      opacity: [0, 0.8, 0],
      scale:   [0, 1.5, 0],
    }}
    transition={{ duration: 2.5 + Math.random() * 2, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const AnalysisLoadingScreen = ({ currentStep = 0, completedSteps = [] }) => {
  const activeStep = STEPS[currentStep] || STEPS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background:"var(--bg-primary)" }}>

      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} delay={i * 0.3} />
        ))}
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background:"radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-15"
          style={{ background:"radial-gradient(circle, #4f46e5, transparent)" }} />
      </div>

      <div className="relative max-w-md w-full mx-4">

        {/* Header */}
        <motion.div
          initial={{ opacity:0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          className="text-center mb-10"
        >
          {/* Pulsing brain icon */}
          <motion.div
            animate={{ scale:[1, 1.08, 1], filter:["brightness(1)","brightness(1.3)","brightness(1)"] }}
            transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 mb-4"
            style={{ boxShadow:`0 0 30px ${activeStep.glow}` }}
          >
            <motion.div
              key={currentStep}
              initial={{ rotate:-90, opacity:0 }}
              animate={{ rotate:0, opacity:1 }}
              transition={{ duration:0.4, ease:"backOut" }}
            >
              <activeStep.icon className={`h-7 w-7 ${activeStep.color}`} />
            </motion.div>
          </motion.div>

          <h2 className="font-display text-2xl font-bold mb-2" style={{ color:"var(--text-primary)" }}>
            Analyzing Your Resume
          </h2>
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>
            Powered by Gemini AI — this takes about 15–30 seconds
          </p>
        </motion.div>

        {/* Steps list */}
        <div className="space-y-3 mb-8">
          {STEPS.map((step, i) => {
            const isDone    = completedSteps.includes(i);
            const isActive  = currentStep === i;
            const isPending = !isDone && !isActive;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity:0, x:-20 }}
                animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-xl transition-all duration-500 ${
                  isActive  ? `${step.bg} shadow-lg`   :
                  isDone    ? "bg-emerald-500/5 border-emerald-500/20" :
                              "border-white/5 opacity-40"
                }`}
                style={isActive ? { boxShadow:`0 4px 24px ${step.glow}` } : {}}
              >
                {/* Status icon */}
                <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                  border border-white/10"
                  style={{ background:"var(--bg-primary)" }}
                >
                  {isDone ? (
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring" }}>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate:360 }}
                      transition={{ duration:1.2, repeat:Infinity, ease:"linear" }}
                      className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white"
                    />
                  ) : (
                    <span className="text-xs font-mono" style={{ color:"var(--text-muted)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isActive ? step.color : isDone ? "text-emerald-300" : ""}`}
                    style={ isPending ? { color:"var(--text-muted)" } : {} }>
                    {step.title}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}
                    >
                      {step.desc}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Overall progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs" style={{ color:"var(--text-muted)" }}>
            <span>Overall progress</span>
            <span>{Math.round(((completedSteps.length + (currentStep < 4 ? 0.5 : 0)) / STEPS.length) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background:"var(--bg-card)" }}>
            <motion.div
              className="h-full rounded-full bg-gradient-brand"
              initial={{ width:"0%" }}
              animate={{
                width:`${((completedSteps.length + 0.5) / STEPS.length) * 100}%`,
              }}
              transition={{ duration:0.6, ease:"easeOut" }}
              style={{ boxShadow:"0 0 10px rgba(124,58,237,0.6)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoadingScreen;