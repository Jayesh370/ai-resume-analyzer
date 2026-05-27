/**
 * services/mockJobMatchService.js  ← NEW
 * Deterministic mock for Job Description Matching.
 * Used when GEMINI_API_KEY is not set.
 */

const COMMON_JD_KEYWORDS = [
  "React", "Node.js", "TypeScript", "JavaScript", "Python", "Docker",
  "Kubernetes", "AWS", "CI/CD", "REST APIs", "GraphQL", "SQL",
  "PostgreSQL", "Redis", "Git", "Agile", "Scrum", "Communication",
  "Leadership", "Problem Solving", "System Design", "Microservices",
];

const STRENGTH_TEMPLATES = [
  "Strong alignment with the required technical stack",
  "Demonstrated experience with relevant tools and frameworks",
  "Good evidence of teamwork and collaborative projects",
  "Clear progression in roles showing career growth",
  "Quantifiable achievements that match job expectations",
];

const WEAKNESS_TEMPLATES = [
  "Limited evidence of experience with some required technologies",
  "Resume lacks explicit mention of cloud infrastructure skills",
  "No demonstrated leadership or mentorship experience visible",
  "Missing certifications that are preferred for this role",
  "Some required domain knowledge is not clearly articulated",
];

const IMPROVEMENT_TEMPLATES = [
  "Add a tailored summary that directly mirrors the job title and key requirements",
  "Quantify your achievements with metrics (%, $, team size, time saved)",
  "Include a dedicated Skills section with keywords from the job description",
  "Highlight any experience with technologies mentioned in the JD even if secondary",
  "Add a Projects section to demonstrate hands-on work with relevant tools",
  "Mirror the exact language used in the job posting to pass ATS filters",
];

const QUESTION_TEMPLATES = [
  { question: "Walk me through a project where you used the core technologies listed in this role.", category: "Technical",    difficulty: "Medium" },
  { question: "Describe a time you had to quickly learn a new technology to meet a deadline.",       category: "Behavioral",   difficulty: "Medium" },
  { question: "How do you approach debugging a complex production issue under pressure?",            category: "Technical",    difficulty: "Hard"   },
  { question: "Tell me about your experience working in an Agile/Scrum environment.",               category: "Behavioral",   difficulty: "Easy"   },
  { question: "How would you design a scalable backend system for millions of users?",              category: "System Design", difficulty: "Hard"   },
  { question: "Where do you see the biggest opportunity to make an impact in this role?",           category: "Cultural Fit", difficulty: "Easy"   },
  { question: "Describe a conflict with a teammate and how you resolved it.",                       category: "Behavioral",   difficulty: "Medium" },
  { question: "What is your experience with CI/CD pipelines and DevOps practices?",                category: "Technical",    difficulty: "Medium" },
];

/**
 * Extract keywords from text (naive but effective for mock)
 */
const extractKeywords = (text) => {
  const upper = text.toUpperCase();
  return COMMON_JD_KEYWORDS.filter((kw) => upper.includes(kw.toUpperCase()));
};

/**
 * Compute a rough match score based on keyword overlap
 */
const computeMatchScore = (resumeText, jdText) => {
  const resumeKws = extractKeywords(resumeText);
  const jdKws     = extractKeywords(jdText);

  if (jdKws.length === 0) return 55;

  const matched = resumeKws.filter((k) => jdKws.includes(k));
  const baseScore = Math.round((matched.length / jdKws.length) * 60) + 30; // 30–90 range
  return Math.min(Math.max(baseScore, 20), 95);
};

/**
 * Extract a job title from the first line or "Position:" in the JD
 */
const extractJobTitle = (jd) => {
  const lines = jd.split("\n").map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || "";
  if (firstLine.length < 60) return firstLine;

  const match = jd.match(/(?:position|role|title|job title)[:\s]+([^\n]+)/i);
  if (match) return match[1].trim();

  return "Software Engineer";
};

/**
 * Main mock analysis — mirrors the shape of the real Gemini version.
 */
const analyzeJobMatch = async (resumeText, jobDescription) => {
  const resumeKws = extractKeywords(resumeText);
  const jdKws     = extractKeywords(jobDescription);
  const matched   = resumeKws.filter((k) => jdKws.includes(k));
  const missing   = jdKws.filter((k) => !resumeKws.includes(k));

  const matchScore   = computeMatchScore(resumeText, jobDescription);
  const jobTitle     = extractJobTitle(jobDescription);

  const strengths    = STRENGTH_TEMPLATES.slice(0, 3);
  const weaknesses   = WEAKNESS_TEMPLATES.slice(0, missing.length > 2 ? 3 : 2);
  const improvements = IMPROVEMENT_TEMPLATES.slice(0, 4);
  const questions    = QUESTION_TEMPLATES.slice(0, 6);

  const summary =
    `Your resume matches this ${jobTitle} role at ${matchScore}%. ` +
    `We found ${matched.length} matching keywords out of ${jdKws.length} required. ` +
    (missing.length > 0
      ? `Key gaps include: ${missing.slice(0, 3).join(", ")}. `
      : "You cover all detected keywords. ") +
    "Focus on the improvement suggestions to significantly boost your match score.";

  return {
    matchScore,
    jobTitle,
    missingKeywords:  missing.slice(0, 10),
    matchedKeywords:  matched,
    strengths,
    weaknesses,
    improvements,
    questions,
    summary,
  };
};

module.exports = { analyzeJobMatch };