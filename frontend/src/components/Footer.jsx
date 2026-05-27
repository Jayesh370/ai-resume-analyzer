/**
 * components/Footer.jsx  ← UPDATED
 */
import React from "react";
import { BrainCircuit } from "lucide-react";

const Footer = () => (
  <footer className="mt-auto border-t py-6" style={{ borderColor:"var(--border)" }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm" style={{ color:"var(--text-muted)" }}>
        <BrainCircuit className="h-4 w-4 text-brand-500" />
        ResumeAI — AI-powered career intelligence
      </div>
      <p className="text-xs" style={{ color:"var(--text-muted)" }}>
        © {new Date().getFullYear()} ResumeAI. Powered by Gemini AI.
      </p>
    </div>
  </footer>
);

export default Footer;