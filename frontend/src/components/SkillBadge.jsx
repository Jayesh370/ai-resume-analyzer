/**
 * components/SkillBadge.jsx  ← NEW
 * Categorized skill pill with hover animation and optional icon.
 */

import React from "react";
import { motion } from "framer-motion";

// Skill categories with colours — add more as needed
const CATEGORIES = {
  // Frontend
  React:         "frontend", Vue:           "frontend", Angular:       "frontend",
  "Next.js":     "frontend", JavaScript:    "frontend", TypeScript:    "frontend",
  HTML:          "frontend", CSS:           "frontend", "Tailwind CSS": "frontend",
  "Tailwind":    "frontend", Redux:         "frontend",
  // Backend
  "Node.js":     "backend",  Express:       "backend",  Python:        "backend",
  Django:        "backend",  FastAPI:       "backend",  Java:          "backend",
  "Spring Boot": "backend",  PHP:           "backend",  Laravel:       "backend",
  Ruby:          "backend",  Rails:         "backend",  "C++":         "backend",
  "C#":          "backend",  ".NET":        "backend",  Go:            "backend",
  Rust:          "backend",
  // Database
  MySQL:         "database", PostgreSQL:    "database", MongoDB:       "database",
  Redis:         "database", SQL:           "database", Firebase:      "database",
  SQLite:        "database", "Supabase":    "database",
  // DevOps / Cloud
  Docker:        "devops",   Kubernetes:    "devops",   AWS:           "devops",
  GCP:           "devops",   Azure:         "devops",   "CI/CD":       "devops",
  Linux:         "devops",   Bash:          "devops",   Terraform:     "devops",
  // AI/ML
  "Machine Learning": "ai", TensorFlow:   "ai",        PyTorch:       "ai",
  "Pandas":      "ai",       "NumPy":      "ai",        "scikit-learn":"ai",
  OpenAI:        "ai",       Gemini:       "ai",        LangChain:     "ai",
  // Tools
  Git:           "tools",    "REST APIs":   "tools",    GraphQL:       "tools",
  Agile:         "tools",    Scrum:         "tools",    Jira:          "tools",
};

const STYLES = {
  frontend: { bg:"bg-sky-500/10",     border:"border-sky-500/25",     text:"text-sky-300",     dot:"bg-sky-400"     },
  backend:  { bg:"bg-violet-500/10",  border:"border-violet-500/25",  text:"text-violet-300",  dot:"bg-violet-400"  },
  database: { bg:"bg-amber-500/10",   border:"border-amber-500/25",   text:"text-amber-300",   dot:"bg-amber-400"   },
  devops:   { bg:"bg-emerald-500/10", border:"border-emerald-500/25", text:"text-emerald-300", dot:"bg-emerald-400" },
  ai:       { bg:"bg-pink-500/10",    border:"border-pink-500/25",    text:"text-pink-300",    dot:"bg-pink-400"    },
  tools:    { bg:"bg-gray-500/10",    border:"border-gray-500/25",    text:"text-gray-300",    dot:"bg-gray-400"    },
  default:  { bg:"bg-brand-500/10",   border:"border-brand-500/25",   text:"text-brand-300",   dot:"bg-brand-400"   },
};

const SkillBadge = ({ skill, index = 0, size = "md" }) => {
  const category = CATEGORIES[skill] || "default";
  const s = STYLES[category];

  const sizeClass = size === "sm"
    ? "px-2.5 py-1 text-xs gap-1.5"
    : "px-3.5 py-1.5 text-xs gap-2";

  return (
    <motion.span
      initial={{ opacity:0, scale:0.85 }}
      animate={{ opacity:1, scale:1 }}
      transition={{ duration:0.3, delay: Math.min(index * 0.04, 0.6), ease:"backOut" }}
      whileHover={{ scale:1.08, transition:{ duration:0.15 } }}
      className={`inline-flex items-center rounded-full border font-medium cursor-default select-none
        ${s.bg} ${s.border} ${s.text} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {skill}
    </motion.span>
  );
};

export const SkillCategoryLegend = () => (
  <div className="flex flex-wrap gap-3 text-xs">
    {Object.entries(STYLES).filter(([k])=>k!=="default").map(([cat, s])=>(
      <span key={cat} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${s.bg} ${s.border} ${s.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`}/>
        {cat.charAt(0).toUpperCase()+cat.slice(1)}
      </span>
    ))}
  </div>
);

export default SkillBadge;