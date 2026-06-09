/**
 * services/jobMatchService.js
 *
 * Resume ↔ Job Description matching using Gemini AI
 * Falls back to mockJobMatchService if Gemini fails.
 */

const mockService = require("./mockJobMatchService");
const { withRetry } = require("./aiGenerationService");

let geminiModel = null;

/**
 * Initialize Gemini model with fallback support
 */
const getGeminiModel = () => {
  if (geminiModel) return geminiModel;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("No Gemini API key found.");
    return null;
  }

  try {
    const {
      GoogleGenerativeAI,
    } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(
      apiKey
    );

    // SAME STRATEGY AS aiService.js
    const preferred = [
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-3.1-flash-lite",
    ];

    for (const modelName of preferred) {
      try {
        geminiModel =
          genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.3,
              topP: 0.9,
              maxOutputTokens: 3000,
            },
          });

        console.log(
          `Using Gemini model for Job Match: ${modelName}`
        );

        break;
      } catch (err) {
        console.log(
          `Failed Gemini model: ${modelName}`
        );
      }
    }

    return geminiModel;
  } catch (err) {
    console.error(
      "Failed to initialize Gemini:",
      err.message
    );

    return null;
  }
};

/**
 * Build Gemini prompt
 */
const buildPrompt = (
  resumeText,
  jobDescription
) => `
You are an expert ATS system, recruiter, and career coach.

Compare this RESUME against the JOB DESCRIPTION.

Return ONLY raw JSON.
No markdown.
No explanations.
No code fences.

════ RESUME ════
${resumeText.slice(0, 5000)}

════ JOB DESCRIPTION ════
${jobDescription.slice(0, 3000)}

Return EXACTLY this structure:

{
  "matchScore": 75,
  "jobTitle": "Full Stack Developer",
  "summary": "Short professional analysis summary.",

  "matchedKeywords": [
    "React",
    "Node.js"
  ],

  "missingKeywords": [
    "Docker",
    "AWS"
  ],

  "strengths": [
    "Strong frontend experience with React.js",
    "Good backend development knowledge"
  ],

  "weaknesses": [
    "Limited cloud deployment experience",
    "No CI/CD exposure"
  ],

  "improvements": [
    "Add Docker projects",
    "Include measurable achievements"
  ],

  "questions": [
    {
      "question": "How would you scale a MERN application?",
      "category": "System Design",
      "difficulty": "Hard"
    }
  ]
}

Rules:
- matchScore must be realistic.
- strengths and weaknesses should be specific.
- missingKeywords should contain important missing JD skills.
- Generate 6-8 interview questions.
- Respond ONLY with JSON.
`;

/**
 * Safely parse Gemini response
 */
const parseGeminiResponse = (
  rawText
) => {
  try {
    let text = rawText.trim();

    // Remove markdown code blocks
    text = text
      .replace(
        /^```(?:json)?\s*/i,
        ""
      )
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(text);
  } catch (err) {
    console.error(
      "Invalid Gemini JSON:"
    );

    console.error(rawText);

    throw err;
  }
};

/**
 * Main Job Match Analyzer
 */
const analyzeJobMatch = async (
  resumeText,
  jobDescription
) => {
  const model = getGeminiModel();

  // FALLBACK TO MOCK
  if (!model) {
    console.log(
      "Using mock job match service..."
    );

    return mockService.analyzeJobMatch(
      resumeText,
      jobDescription
    );
  }

  try {
    const prompt = buildPrompt(
      resumeText,
      jobDescription
    );

    const result =
      await withRetry(() => model.generateContent(
        prompt
      ));

    const rawText =
      result.response.text();

    const parsed =
      parseGeminiResponse(rawText);

    return {
      matchScore:
        typeof parsed.matchScore ===
        "number"
          ? parsed.matchScore
          : 50,

      jobTitle:
        parsed.jobTitle ||
        "Software Engineer",

      summary:
        parsed.summary || "",

      matchedKeywords:
        Array.isArray(
          parsed.matchedKeywords
        )
          ? parsed.matchedKeywords
          : [],

      missingKeywords:
        Array.isArray(
          parsed.missingKeywords
        )
          ? parsed.missingKeywords
          : [],

      strengths:
        Array.isArray(
          parsed.strengths
        )
          ? parsed.strengths
          : [],

      weaknesses:
        Array.isArray(
          parsed.weaknesses
        )
          ? parsed.weaknesses
          : [],

      improvements:
        Array.isArray(
          parsed.improvements
        )
          ? parsed.improvements
          : [],

      questions:
        Array.isArray(
          parsed.questions
        )
          ? parsed.questions
          : [],
    };
  } catch (err) {
    console.error(
      "Gemini job-match error, falling back to mock:",
      err.message
    );

    return mockService.analyzeJobMatch(
      resumeText,
      jobDescription
    );
  }
};

module.exports = {
  analyzeJobMatch,
};
