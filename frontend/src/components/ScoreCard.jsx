/**
 * components/ScoreCard.jsx  ← UPDATED
 * Animated SVG circular progress ring with framer-motion counter.
 */

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

const CONFIG = {
  excellent: { stroke:"#10b981", glow:"rgba(16,185,129,0.4)", label:"Excellent",       grade:"A",  bg:"from-emerald-500/15 to-emerald-600/5", border:"border-emerald-500/25" },
  good:      { stroke:"#8b5cf6", glow:"rgba(139,92,246,0.4)", label:"Good",            grade:"B",  bg:"from-brand-500/15 to-brand-600/5",   border:"border-brand-500/25"   },
  average:   { stroke:"#f59e0b", glow:"rgba(245,158,11,0.4)", label:"Average",         grade:"C",  bg:"from-amber-500/15 to-amber-600/5",   border:"border-amber-500/25"   },
  poor:      { stroke:"#ef4444", glow:"rgba(239,68,68,0.4)",  label:"Needs Improvement",grade:"D", bg:"from-red-500/15 to-red-600/5",       border:"border-red-500/25"     },
};

const getConfig = (score) => {
  if (score >= 85) return CONFIG.excellent;
  if (score >= 70) return CONFIG.good;
  if (score >= 50) return CONFIG.average;
  return CONFIG.poor;
};

// Animated counter hook
const useCounter = (target, duration = 1.4) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: [0.34, 1.2, 0.64, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [target]);

  return display;
};

const ScoreCard = ({ score = 0, size = 180, showGrade = true }) => {
  const cfg = getConfig(score);
  const displayScore = useCounter(score);

  const R    = 70;
  const cx   = 90;
  const cy   = 90;
  const circ = 2 * Math.PI * R;
  const pct  = score / 100;

  return (
    <motion.div
      initial={{ opacity:0, scale:0.85 }}
      animate={{ opacity:1, scale:1 }}
      transition={{ duration:0.55, ease:[0.34,1.2,0.64,1] }}
      className={`relative flex flex-col items-center justify-center p-6 rounded-2xl
        bg-gradient-to-br border backdrop-blur-xl ${cfg.bg} ${cfg.border}`}
    >
      {/* Glow behind ring */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-40 blur-xl"
        style={{ background:`radial-gradient(circle at 50% 50%, ${cfg.glow}, transparent 70%)` }}
      />

      <svg width={size} height={size} viewBox="0 0 180 180" className="relative">
        {/* Track */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />

        {/* Fill arc — animated via framer-motion */}
        <motion.circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={cfg.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration:1.4, ease:[0.34,1.2,0.64,1], delay:0.2 }}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter:`drop-shadow(0 0 8px ${cfg.stroke})` }}
        />

        {/* Tiny dot at the tip */}
        <motion.circle
          cx={cx + R}
          cy={cy}
          r="5"
          fill={cfg.stroke}
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.3 }}
          style={{
            transformOrigin:`${cx}px ${cy}px`,
            filter:`drop-shadow(0 0 4px ${cfg.stroke})`,
          }}
        />

        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white"
          fontSize="34" fontWeight="800" fontFamily="Syne, sans-serif">
          {displayScore}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.45)"
          fontSize="11" fontFamily="DM Sans, sans-serif">
          out of 100
        </text>
      </svg>

      <div className="relative text-center mt-1">
        {showGrade && (
          <div className="flex items-center justify-center gap-2">
            <span className="font-display font-bold text-xl" style={{ color: cfg.stroke }}>
              {cfg.label}
            </span>
            <span
              className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold"
              style={{ background: `${cfg.stroke}20`, color: cfg.stroke, border:`1px solid ${cfg.stroke}40` }}
            >
              {cfg.grade}
            </span>
          </div>
        )}
        <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>ATS Score</p>
      </div>
    </motion.div>
  );
};

export default ScoreCard;