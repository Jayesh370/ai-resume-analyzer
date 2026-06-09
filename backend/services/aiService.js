/**
 * services/aiService.js — Gemini + fallback mock
 * Uses the Gemini API directly through REST so we can safely list available models
 * and avoid hardcoding stale model names.
 */

const mockAi = require("./mockAiService");
const { withRetry } = require("./aiGenerationService");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let cachedModelName = null;

const buildPrompt = (resumeText) => `
You are an expert HR analyst and ATS system.
Analyse the following resume text and return ONLY valid JSON with no markdown and no prose.

RESUME TEXT:
"""
${resumeText.slice(0, 3000)}
"""

Return exactly this JSON structure:
{
  "atsScore": <integer 0-100>,
  "skills": ["skill1", "skill2", ...],
  "jobRoles": [
    { "role": "Role Name", "matchScore": <integer 0-100> },
    ...
  ],
  "missingSkills": ["skill1", "skill2", ...],
  "summary": "<2-3 sentence executive summary of the resume quality>",
  "questions": [
    { "question": "...", "category": "Behavioral|Technical|System Design|Cultural Fit", "difficulty": "Easy|Medium|Hard" },
    ...
  ]
}

Rules:
- atsScore: overall ATS compatibility score considering formatting, keywords, sections, quantified achievements.
- skills: extract ALL mentioned technical and soft skills.
- jobRoles: top 3 most suitable roles with percentage match scores.
- missingSkills: top 5 skills that would most improve the top job role match.
- questions: generate 6 targeted interview questions based on the actual resume content.
- Respond ONLY with the JSON object.
`;

const stripCodeFences = (text) =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const safeParse = (value, fallback) => {
  try {
    if (typeof value === "string") return JSON.parse(value);
    if (value && typeof value === "object") return value;
    return fallback;
  } catch {
    return fallback;
  }
};

const listModels = async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
  const res = await withRetry(() => fetch(url));
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || `Failed to list models (${res.status})`);
  }

  return data.models || [];
};

const resolveModelName = async () => {
  if (cachedModelName) return cachedModelName;

  const models = await listModels();

  const preferred = [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-3.1-flash-lite"
    
  ];

  for (const wanted of preferred) {
    const found = models.find((m) => {
      const name = (m.name || "").replace(/^models\//, "");
      const methods = m.supportedGenerationMethods || [];
      return name === wanted && methods.includes("generateContent");
    });

    if (found) {
      cachedModelName = wanted;
      return cachedModelName;
    }
  }

  const anySupported = models.find((m) =>
    (m.supportedGenerationMethods || []).includes("generateContent")
  );

  if (!anySupported) return null;

  cachedModelName = (anySupported.name || "").replace(/^models\//, "");
  return cachedModelName;
};

const analyzeResume = async (resumeText) => {
  if (!GEMINI_API_KEY) {
    console.log("No GEMINI_API_KEY found — using mock AI");
    const mockResult = await mockAi.analyzeResume(resumeText);

return {
  ...mockResult,
  aiProvider: "Mock",
};
  }

  try {
    console.log("Using Gemini AI...");

    const modelName = await resolveModelName();
    if (!modelName) {
      throw new Error("No Gemini model with generateContent support was returned by models.list");
    }

    const response = await withRetry(() => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: buildPrompt(resumeText) }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4000,
          },
        }),
      }
    ));

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `Gemini request failed (${response.status})`);
    }

    const raw =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("") || "";

    const clean = stripCodeFences(raw);

    let parsed;
    try {
      try {
  parsed = JSON.parse(clean);
} catch (err) {

  console.log("Attempting JSON repair...");

  // Try repairing truncated JSON
  let repaired = clean.trim();

  // Close unfinished summary string
  if (repaired.includes('"summary"') && !repaired.endsWith("}")) {
    repaired += '"}';
  }

  try {
    parsed = JSON.parse(repaired);
  } catch {
    console.error("Invalid Gemini JSON:");
    console.error(clean);

    const mockResult = await mockAi.analyzeResume(resumeText);

return {
  ...mockResult,
  aiProvider: "Mock",
};
  }
}
    } catch (err) {
      console.error("Invalid Gemini JSON:");
      console.error(clean);
      const mockResult = await mockAi.analyzeResume(resumeText);

return {
  ...mockResult,
  aiProvider: "Mock",
};
    }

    return {
    atsScore: (() => {
  const num = parseInt(parsed.atsScore);
  return Math.max(0, Math.min(100, isNaN(num) ? 50 : num));
})(),
      skills: parsed.skills ?? [],
      jobRoles: parsed.jobRoles ?? [],
      missingSkills: parsed.missingSkills ?? [],
      summary: parsed.summary ?? "",
      questions: parsed.questions ?? [],
      aiProvider: "Gemini",
    };
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    const mockResult = await mockAi.analyzeResume(resumeText);

return {
  ...mockResult,
  aiProvider: "Mock",
};
  }
};

module.exports = { analyzeResume };
