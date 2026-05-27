import React from "react";
import GlassCard from "../GlassCard.jsx";

const sectionText = (content, key) => {
  if (key === "summary") return content.summary || "";
  if (key === "skills") return (content.skills || []).join(", ");
  const value = content[key];
  if (!Array.isArray(value)) return "";
  return value.map((item) => JSON.stringify(item)).join(" ");
};

export default function ResumeComparison({ original, tailored, notes }) {
  const sections = ["summary", "skills", "experience", "projects", "achievements"];

  return (
    <GlassCard animate={false}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="section-title">Original vs Tailored</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Review the sections most likely to affect ATS and recruiter scanning.
          </p>
        </div>
        {tailored?.atsAfter != null && (
          <div className="rounded-xl border px-4 py-2 text-right" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>ATS delta</p>
            <p className="text-lg font-bold text-emerald-400">+{Math.max(0, tailored.atsAfter - (tailored.atsBefore || 0))}</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <React.Fragment key={section}>
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
              <p className="mb-2 text-xs font-semibold uppercase text-brand-300">Original {section}</p>
              <p className="line-clamp-5 text-sm" style={{ color: "var(--text-secondary)" }}>
                {sectionText(original, section) || "No content"}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-emerald-300">Tailored {section}</p>
              <p className="line-clamp-5 text-sm" style={{ color: "var(--text-secondary)" }}>
                {sectionText(tailored.content, section) || "No content"}
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>

      {!!notes?.suggestions?.length && (
        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
          <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI suggestions</p>
          <div className="space-y-2">
            {notes.suggestions.map((suggestion) => (
              <p key={suggestion} className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {suggestion}
              </p>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
