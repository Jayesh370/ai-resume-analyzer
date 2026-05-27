/**
 * services/mockAiService.js
 * Advanced Offline Mock AI Service
 * Designed to simulate realistic ATS + AI analysis behavior
 */

const SKILL_POOL = [
  // Frontend
  "HTML",
  "HTML5",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "React.js",
  "Next.js",
  "Tailwind CSS",
  "Bootstrap",
  "Redux",

  // Backend
  "Node.js",
  "Express",
  "Express.js",
  "REST APIs",
  "JWT",
  "Passport.js",
  "WebSockets",
  "Middleware",

  // Database
  "SQL",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Prisma ORM",

  // Languages
  "Java",
  "C",
  "C++",
  "Python",
  "PHP",
  "C#",

  // DevOps / Cloud
  "Docker",
  "Kubernetes",
  "AWS",
  "CI/CD",
  "Linux",

  // AI / Data Science
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Data Analysis",
  "Scikit-learn",

  // CS Fundamentals
  "DSA",
  "Data Structures",
  "Algorithms",
  "Operating Systems",
  "OOP",

  // Tools
  "Git",
  "GitHub",
  "Postman",
  "VS Code",
  "Cloudinary",
  "Multer",
];

const ROLE_REQUIREMENTS = {
  "Frontend Developer": [
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Redux",
  ],

  "Backend Developer": [
    "Node.js",
    "Express",
    "SQL",
    "REST APIs",
    "JWT",
    "Docker",
  ],

  "Full Stack Developer": [
    "React",
    "Node.js",
    "MongoDB",
    "REST APIs",
    "JavaScript",
    "SQL",
  ],

  "AI/ML Engineer": [
    "Python",
    "Machine Learning",
    "TensorFlow",
    "Pandas",
    "NumPy",
  ],

  "Data Scientist": [
    "Python",
    "Machine Learning",
    "Data Analysis",
    "Pandas",
    "SQL",
  ],
};

/**
 * Extract skills from resume
 */
const extractSkills = (text) => {
  const upper = text.toUpperCase();

  return SKILL_POOL.filter((skill) =>
    upper.includes(skill.toUpperCase())
  );
};

/**
 * Detect quantified achievements
 */
const countAchievements = (text) => {
  const regex =
    /\d+%|\d+\+|\d+\s(users|clients|projects|months|days|features)/gi;

  return (text.match(regex) || []).length;
};

/**
 * Detect sections
 */
const detectSections = (text) => {
  const lower = text.toLowerCase();

  return {
    hasProjects: lower.includes("project"),
    hasExperience:
      lower.includes("experience") ||
      lower.includes("internship"),
    hasEducation: lower.includes("education"),
    hasSkills: lower.includes("skills"),
    hasSummary: lower.includes("summary"),
  };
};

/**
 * Calculate realistic ATS score
 */
/**
 * More realistic ATS scoring
 */
const computeATSScore = (
  text,
  skills,
  sections,
  achievements
) => {
  let score = 45;

  // -------------------------
  // 1. Relevant Skills
  // -------------------------
  const highValueSkills = [
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "AWS",
    "Machine Learning",
    "TensorFlow",
    "Python",
  ];

  const relevantSkills = skills.filter((s) =>
    highValueSkills.includes(s)
  );

  // Max +10 only
  score += Math.min(relevantSkills.length * 1.2, 10);

  // Penalize keyword stuffing
  if (skills.length > 30) {
    score -= 4;
  }

  // -------------------------
  // 2. Resume Sections
  // -------------------------
  if (sections.hasProjects) score += 5;
  if (sections.hasExperience) score += 5;
  if (sections.hasEducation) score += 3;
  if (sections.hasSkills) score += 2;
  if (sections.hasSummary) score += 2;

  // -------------------------
  // 3. Resume Length
  // -------------------------
  if (text.length > 1000) score += 2;
  if (text.length > 1800) score += 2;

  // -------------------------
  // 4. Quantified Achievements
  // -------------------------
  if (achievements >= 1) score += 4;
  if (achievements >= 3) score += 3;

  // -------------------------
  // 5. Strong Project Keywords
  // -------------------------
  const projectKeywords = [
    "authentication",
    "dashboard",
    "crud",
    "real-time",
    "api",
  ];

  const lower = text.toLowerCase();

  const matchedProjectKeywords =
    projectKeywords.filter((k) =>
      lower.includes(k)
    ).length;

  // Max +5 only
  score += Math.min(
    matchedProjectKeywords,
    5
  );

  // -------------------------
  // 6. Penalties
  // -------------------------

  // No projects
  if (!sections.hasProjects) score -= 10;

  // No experience
  if (!sections.hasExperience) score -= 8;

  // Weak skill count
  if (skills.length < 5) score -= 10;

  // No measurable impact
  if (achievements === 0) score -= 5;

  // -------------------------
  // 7. Realistic Caps
  // -------------------------

  // Fresher ceiling
  score = Math.min(score, 85);

  // Clamp
  score = Math.max(40, score);

  return Math.round(score);
};

/**
 * Compute role matches
 */
const computeRoleMatches = (skills) => {
  return Object.entries(ROLE_REQUIREMENTS)
    .map(([role, requiredSkills]) => {
      const matched = requiredSkills.filter((skill) =>
        skills.includes(skill)
      );

      let matchScore = Math.round(
        (matched.length / requiredSkills.length) *
          100
      );

      // Make realistic
      matchScore = Math.min(matchScore, 88);

      return {
        role,
        matchScore,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
};

/**
 * Missing skills
 */
const getMissingSkills = (
  topRole,
  skills
) => {
  const required =
    ROLE_REQUIREMENTS[topRole] || [];

  return required.filter(
    (skill) => !skills.includes(skill)
  );
};

/**
 * Generate realistic summary
 */
const generateSummary = ({
  atsScore,
  topRole,
  missingSkills,
  achievements,
}) => {
  let quality = "average";

  if (atsScore >= 82) {
    quality = "strong";
  } else if (atsScore < 65) {
    quality = "developing";
  }

  return `
This resume demonstrates a ${quality} technical profile with relevant full-stack development skills and practical project experience.

The candidate appears best aligned with the role of ${topRole}.

${
  achievements === 0
    ? "Adding quantified achievements and measurable project impact would significantly improve ATS performance."
    : "The resume includes measurable indicators that improve recruiter and ATS perception."
}

${
  missingSkills.length
    ? `Adding technologies such as ${missingSkills
        .slice(0, 3)
        .join(", ")} would strengthen competitiveness for modern industry roles.`
    : "The resume already covers most important industry-relevant technologies for the target role."
}
`.trim();
};

/**
 * Generate contextual interview questions
 */
const generateQuestions = (
  skills,
  topRole
) => {
  const questions = [];

  // Frontend
  if (
    skills.includes("React") ||
    skills.includes("Next.js")
  ) {
    questions.push({
      question:
        "How does React component lifecycle and state management work in large-scale applications?",
      category: "Technical",
      difficulty: "Medium",
    });
  }

  // Backend
  if (
    skills.includes("Node.js") ||
    skills.includes("Express")
  ) {
    questions.push({
      question:
        "How would you design a scalable authentication system using JWT and Express.js?",
      category: "System Design",
      difficulty: "Hard",
    });
  }

  // Database
  if (
    skills.includes("MongoDB") ||
    skills.includes("SQL")
  ) {
    questions.push({
      question:
        "When would you choose SQL over MongoDB in a production application?",
      category: "Technical",
      difficulty: "Medium",
    });
  }

  // AI/ML
  if (
    skills.includes("Machine Learning") ||
    skills.includes("TensorFlow")
  ) {
    questions.push({
      question:
        "Explain the difference between supervised and unsupervised learning with practical examples.",
      category: "Technical",
      difficulty: "Medium",
    });
  }

  // Behavioral
  questions.push({
    question:
      "Describe a challenging technical problem you solved during one of your projects.",
    category: "Behavioral",
    difficulty: "Easy",
  });

  questions.push({
    question:
      "How do you approach learning new technologies and frameworks efficiently?",
    category: "Cultural Fit",
    difficulty: "Easy",
  });

  questions.push({
    question: `What improvements would you make if you had to scale one of your recent ${topRole} projects for thousands of users?`,
    category: "System Design",
    difficulty: "Hard",
  });

  return questions.slice(0, 6);
};

/**
 * MAIN ANALYSIS FUNCTION
 */
const analyzeResume = async (
  resumeText
) => {
  const skills = extractSkills(
    resumeText
  );

  const sections = detectSections(
    resumeText
  );

  const achievements =
    countAchievements(resumeText);

  const atsScore = computeATSScore(
    resumeText,
    skills,
    sections,
    achievements
  );

  const jobRoles =
    computeRoleMatches(skills);

  const topRole =
    jobRoles[0]?.role ||
    "Software Developer";

  const missingSkills =
    getMissingSkills(
      topRole,
      skills
    );

  const summary = generateSummary({
    atsScore,
    topRole,
    missingSkills,
    achievements,
  });

  const questions =
    generateQuestions(
      skills,
      topRole
    );

  return {
    atsScore,
    skills,
    jobRoles,
    missingSkills,
    summary,
    questions,
    aiProvider: "Mock",
  };
};

module.exports = {
  analyzeResume,
};