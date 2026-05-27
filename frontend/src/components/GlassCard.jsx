/**
 * components/GlassCard.jsx  ← NEW
 * Reusable glassmorphism card with optional gradient border, hover, and padding variants.
 */

import React from "react";
import { motion } from "framer-motion";

const GlassCard = ({
  children,
  className = "",
  hover = false,
  gradient = false,
  padding = "p-6",
  delay = 0,
  animate = true,
  onClick,
}) => {
  const base =
    `relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all duration-300 ${padding} ${className}`;

  const style = {
    background: "var(--bg-card)",
    borderColor: "var(--border)",
  };

  const hoverClass = hover
    ? "hover:border-brand-500/30 hover:shadow-glow-sm hover:scale-[1.005] cursor-pointer"
    : "";

  const variants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  const Tag = animate ? motion.div : "div";
  const motionProps = animate
    ? { variants, initial: "hidden", animate: "show" }
    : {};

  return (
    <Tag
      className={`${base} ${hoverClass}`}
      style={style}
      onClick={onClick}
      {...motionProps}
    >
      {/* Subtle inner highlight */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
        }}
      />
      {gradient && (
        <div
          className="absolute top-0 left-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
        />
      )}
      {children}
    </Tag>
  );
};

export default GlassCard;