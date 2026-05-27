/**
 * components/MatchScoreCard.jsx  ← NEW
 *
 * Circular animated match score ring — used on the Job Match result page.
 * Similar to ScoreCard but with different colour semantics and a "% Match" label.
 */

import React, { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";

const TIERS = {
  excellent: { min: 80, stroke: "#10b981", shadow: "rgba(16,185,129,0.45)", label: "Excellent Fit",   grade: "A", bg: "from-emerald-500/15 to-emerald-600/5", border: "border-emerald-500/25" },
  good:      { min: 65, stroke: "#8b5cf6", shadow: "rgba(139,92,246,0.45)", label: "Good Match",      grade: "B", bg: "from-brand-500/15 to-brand-600/5",   border: "border-brand-500/25"   },
  fair:      { min: 45, stroke: "#f59e0b", shadow: "rgba(245,158,11,0.45)", label: "Partial Match",   grade: "C", bg: "from-amber-500/15 to-amber-600/5",   border: "border-amber-500/25"   },
  poor:      { min: 0,  stroke: "#ef4444", shadow: "rgba(239,68,68,0.45)",  label: "Low Match",       grade: "D", bg: "from-red-500/15 to-red-600/5",       border: "border-red-500/25"     },
};

const getTier = (score) =>
  score >= TIERS.excellent.min ? TIERS.excellent :
  score >= TIERS.good.min      ? TIERS.good :
  score >= TIERS.fair.min      ? TIERS.fair :
  TIERS.poor;

const MatchScoreCard = ({ score = 0, jobTitle = "", size = 190 }) => {
  const tier = getTier(score);
  const [display, setDisplay] = useState(0);

  // Animated counter
  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.4,
      ease: [0.34, 1.2, 0.64, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [score]);

  const R    = 72;
  const cx   = 92;
  const cy   = 92;
  const circ = 2 * Math.PI * R;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
      className={`relative flex flex-col items-center justify-center p-6
        rounded-2xl bg-gradient-to-br border backdrop-blur-xl
        ${tier.bg} ${tier.border}`}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-30 blur-xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${tier.shadow}, transparent 70%)` }}
      />

      <svg width={size} height={size} viewBox="0 0 184 184" className="relative">
        {/* Track ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="13" />

        {/* Score arc — Framer Motion animates strokeDashoffset */}
        <motion.circle
          cx={cx} cy={cy} r={R}
          fill="none"
          stroke={tier.stroke}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: [0.34, 1.2, 0.64, 1], delay: 0.2 }}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 10px ${tier.stroke})` }}
        />

        {/* Percentage text */}
        <text x={cx} y={cy - 10} textAnchor="middle" fill="white"
          fontSize="36" fontWeight="800" fontFamily="Syne, sans-serif">
          {display}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.45)"
          fontSize="11" fontFamily="DM Sans, sans-serif">
          job match
        </text>
      </svg>

      {/* Label row */}
      <div className="relative text-center mt-1">
        <div className="flex items-center justify-center gap-2">
          <span className="font-display font-bold text-xl" style={{ color: tier.stroke }}>
            {tier.label}
          </span>
          <span
            className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold"
            style={{
              background: `${tier.stroke}20`,
              color: tier.stroke,
              border: `1px solid ${tier.stroke}40`,
            }}
          >
            {tier.grade}
          </span>
        </div>
        {jobTitle && (
          <p className="text-xs mt-1 max-w-[160px] truncate" style={{ color: "var(--text-muted)" }}>
            {jobTitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MatchScoreCard;