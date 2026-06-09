const { analyzeResume } = require("./aiService");
const { generateGeminiJson } = require("./aiGenerationService");
const { normaliseContent } = require("./resumeBuilderService");

const fallbackTailor = async (content, jobDescription) => {
  const jobWords = jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 18);

  const uniqueKeywords = [...new Set(jobWords)].slice(0, 12);
  const tailored = normaliseContent({
    ...content,
    summary: `${content.summary || "Experienced professional"} Targeted for this role with emphasis on ${uniqueKeywords
      .slice(0, 5)
      .join(", ")}.`,
    skills: [...new Set([...(content.skills || []), ...uniqueKeywords])].slice(0, 40),
  });

  return {
    tailoredContent: tailored,
    suggestions: [
      "Mirror the job title and top role keywords in the headline or summary.",
      "Add measurable outcomes to the first two experience bullets.",
      "Move the most relevant technical skills into the top third of the resume.",
    ],
    keywordsAdded: uniqueKeywords.filter(
      (word) => !(content.skills || []).some((skill) => skill.toLowerCase().includes(word))
    ),
    keywordGaps: uniqueKeywords.filter(
      (word) => !(content.skills || []).some((skill) => skill.toLowerCase().includes(word))
    ),
    atsBefore: 62,
    atsAfter: 78,
    provider: "Mock",
  };
};

const tailorResume = async ({ content, jobDescription, companyName = "", jobTitle = "" }) => {
  const safeContent = normaliseContent(content);
  const jd = String(jobDescription || "").trim().slice(0, 8000);

  if (!jd || jd.length < 80) {
    const err = new Error("Paste a job description with at least 80 characters.");
    err.statusCode = 422;
    throw err;
  }

  try {
    const prompt = `
You are an expert resume writer, recruiter, and ATS optimizer.
Return ONLY valid JSON. Do not use markdown.

ORIGINAL RESUME JSON:
${JSON.stringify(safeContent).slice(0, 9000)}

JOB DESCRIPTION:
"""
${jd}
"""

TARGET COMPANY: ${companyName || "Not specified"}
JOB TITLE: ${jobTitle || "Not specified"}

Return this JSON:
{
  "tailoredContent": <same resume JSON shape, preserving truthful facts but rewriting summary, skills ordering, bullets, projects, achievements for the job>,
  "suggestions": ["specific improvement", "..."],
  "keywordsAdded": ["keyword naturally added to resume", "..."],
  "keywordGaps": ["missing keyword", "..."],
  "atsBefore": <integer 0-100>,
  "atsAfter": <integer 0-100>
}

Rules:
- Do not invent employers, degrees, dates, certifications, or fake metrics.
- Improve bullet wording using action verbs and measurable framing.
- Prioritize job description keywords naturally.
- Keep output ATS-readable and concise.
`;

    const parsed = await generateGeminiJson(prompt, () => fallbackTailor(safeContent, jd), {
      temperature: 0.25,
      maxOutputTokens: 6000,
    });
    return {
      tailoredContent: normaliseContent(parsed.tailoredContent || safeContent),
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 10) : [],
      keywordsAdded: Array.isArray(parsed.keywordsAdded) ? parsed.keywordsAdded.slice(0, 20) : [],
      keywordGaps: Array.isArray(parsed.keywordGaps) ? parsed.keywordGaps.slice(0, 20) : [],
      atsBefore: Math.max(0, Math.min(100, parseInt(parsed.atsBefore, 10) || 0)),
      atsAfter: Math.max(0, Math.min(100, parseInt(parsed.atsAfter, 10) || 0)),
      provider: "Gemini",
    };
  } catch (err) {
    console.error("Gemini tailoring error:", err.message);
    return fallbackTailor(safeContent, jd);
  }
};

const compareResumeToJob = async ({ originalContent, tailoredContent }) => {
  const originalText = JSON.stringify(originalContent);
  const tailoredText = JSON.stringify(tailoredContent);
  const [before, after] = await Promise.all([analyzeResume(originalText), analyzeResume(tailoredText)]);
  return {
    beforeScore: before.atsScore,
    afterScore: after.atsScore,
    improvement: after.atsScore - before.atsScore,
  };
};

module.exports = { tailorResume, compareResumeToJob };
