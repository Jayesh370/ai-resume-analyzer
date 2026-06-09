const { generateGeminiJson } = require("./aiGenerationService");

const textFallback = (resumeText = "") => {
  const summary = resumeText.split(/\n+/).find((line) => line.trim().length > 40) || resumeText.slice(0, 260);
  return {
    sections: [
      {
        section: "Professional Summary",
        originalText: summary,
        improvedText: `Results-focused professional with experience across ${summary
          .split(/\s+/)
          .slice(0, 12)
          .join(" ")} and a track record of delivering clear, measurable outcomes.`,
        reason: "Adds stronger positioning, clearer impact language, and a recruiter-friendly opening.",
      },
    ],
    rewrittenResume:
      resumeText.slice(0, 1200) +
      "\n\nSuggested improvements: add quantified achievements, stronger action verbs, role keywords, and concise ATS-friendly section headings.",
    improvementSummary: [
      "Strengthened summary language.",
      "Suggested quantified impact for experience bullets.",
      "Improved keyword density without changing facts.",
    ],
    provider: "Fallback",
  };
};

const rewriteResume = async ({ resumeText, analysis }) => {
  const fallback = () => textFallback(resumeText);
  const prompt = `
You are an expert resume writer, recruiter, and ATS optimizer.
Return ONLY valid JSON. Do not use markdown.

RESUME TEXT:
"""
${String(resumeText || "").slice(0, 9000)}
"""

EXISTING ANALYSIS:
${JSON.stringify(analysis || {}).slice(0, 3000)}

Return this JSON:
{
  "sections": [
    {
      "section": "Professional Summary|Experience|Projects|Skills",
      "originalText": "exact or concise original excerpt",
      "improvedText": "rewritten excerpt",
      "reason": "why the change improves ATS, readability, action verbs, keywords, or recruiter impact"
    }
  ],
  "rewrittenResume": "complete improved resume text preserving truthful facts",
  "improvementSummary": ["specific improvement", "..."],
  "provider": "Gemini"
}

Rules:
- Rewrite the professional summary, experience bullets, projects, and skills/keywords where present.
- Use stronger action verbs and measurable framing, but do not invent employers, degrees, dates, or fake metrics.
- Include 6-12 section rewrite objects.
- Preserve the candidate's facts and make the output ATS-readable.
`;

  const parsed = await generateGeminiJson(prompt, fallback, { temperature: 0.25, maxOutputTokens: 7000 });
  return {
    sections: Array.isArray(parsed.sections) ? parsed.sections.slice(0, 12) : [],
    rewrittenResume: parsed.rewrittenResume || fallback().rewrittenResume,
    improvementSummary: Array.isArray(parsed.improvementSummary) ? parsed.improvementSummary.slice(0, 12) : [],
    provider: parsed.provider || "Gemini",
  };
};

module.exports = { rewriteResume };
