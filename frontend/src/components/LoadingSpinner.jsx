/**
 * components/LoadingSpinner.jsx  ← UPDATED
 */
import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

const LoadingSpinner = ({ fullScreen = false, text = "" }) => {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate:360 }}
        transition={{ duration:1.5, repeat:Infinity, ease:"linear" }}
        className="relative"
      >
        <div className="h-10 w-10 rounded-full border-2 border-brand-500/20 border-t-brand-500" />
        <BrainCircuit className="h-4 w-4 text-brand-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </motion.div>
      {text && <p className="text-sm animate-pulse" style={{ color:"var(--text-muted)" }}>{text}</p>}
    </div>
  );

  if (fullScreen) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--bg-primary)" }}>
      {content}
    </div>
  );

  return content;
};

export default LoadingSpinner;