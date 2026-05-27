/**
 * components/StatsCard.jsx  ← NEW
 * Animated stat card used on the Dashboard.
 */

import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({ icon: Icon, label, value, sub, color = "brand", delay = 0 }) => {
  const colorMap = {
    brand:   { ring: "bg-brand-500/10 border-brand-500/20",   icon: "text-brand-400",   glow: "rgba(139,92,246,0.15)" },
    emerald: { ring: "bg-emerald-500/10 border-emerald-500/20", icon: "text-emerald-400", glow: "rgba(16,185,129,0.12)" },
    amber:   { ring: "bg-amber-500/10 border-amber-500/20",   icon: "text-amber-400",   glow: "rgba(245,158,11,0.12)" },
    blue:    { ring: "bg-blue-500/10 border-blue-500/20",     icon: "text-blue-400",    glow: "rgba(59,130,246,0.12)"  },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <motion.div
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.45, delay, ease:[0.25,0.46,0.45,0.94] }}
      whileHover={{ scale:1.02, transition:{ duration:0.2 } }}
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border transition-all duration-300 hover:border-brand-500/25"
      style={{ background:"var(--bg-card)", borderColor:"var(--border)" }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ background: c.glow }}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color:"var(--text-muted)" }}>
            {label}
          </p>
          <p className="font-display text-3xl font-bold mb-1" style={{ color:"var(--text-primary)" }}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>{sub}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl border flex-shrink-0 ${c.ring}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;