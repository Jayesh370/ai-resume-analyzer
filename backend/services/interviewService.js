const { generateGeminiJson } = require("./aiGenerationService");

const fallbackQuestions = (sessionType) => ({
  questions: [
    `Walk me through the most relevant project on your resume for this ${sessionType} interview.`,
    "Describe a technical challenge you solved and how you approached it.",
    "Tell me about a time you received difficult feedback and improved your work.",
    "How do you prioritize tasks when deadlines conflict?",
    "What would you improve in one of your recent projects if you had more time?",
  ],
  provider: "Fallback",
});

const generateInterviewQuestions = async ({ resumeText, analysis, jobDescription, sessionType }) => {
  const fallback = () => fallbackQuestions(sessionType);
  const prompt = `
You are an expert interviewer.
Return ONLY valid JSON. Do not use markdown.

SESSION TYPE: ${sessionType}
RESUME:
"""
${String(resumeText || "").slice(0, 7000)}
"""

ANALYSIS:
${JSON.stringify(analysis || {}).slice(0, 2500)}

JOB DESCRIPTION:
"""
${String(jobDescription || "").slice(0, 3000)}
"""

Return:
{
  "questions": ["question 1", "..."],
  "provider": "Gemini"
}

Generate 6 questions tailored to the session type. Mix technical depth, behavioral evidence, resume details, and job-specific prompts when a job description exists.
`;

  const parsed = await generateGeminiJson(prompt, fallback, { temperature: 0.35, maxOutputTokens: 3500 });
  return {
    questions: Array.isArray(parsed.questions) && parsed.questions.length ? parsed.questions.slice(0, 8) : fallback().questions,
    provider: parsed.provider || "Gemini",
  };
};

const evaluateInterviewAnswer = async ({ question, userAnswer, sessionType }) => {
  const fallback = () => ({
    score: Math.min(8, Math.max(4, Math.round(String(userAnswer || "").split(/\s+/).length / 18))),
    feedback: {
      communication: "Answer is understandable; add a clearer structure with situation, action, and result.",
      technicalAccuracy: "Include more concrete tools, decisions, and tradeoffs.",
      confidence: "Use direct language and avoid underselling ownership.",
      problemSolving: "Explain the reasoning path and outcome more explicitly.",
      improvementAreas: ["Add measurable results", "Use STAR structure", "Be more specific"],
    },
    improvedAnswer: "A stronger answer would briefly set context, explain your specific actions, name tools or decisions, and close with a measurable result.",
    provider: "Fallback",
  });

  const prompt = `
You are evaluating a mock interview answer.
Return ONLY valid JSON. Do not use markdown.

SESSION TYPE: ${sessionType}
QUESTION:
${question}

USER ANSWER:
"""
${String(userAnswer || "").slice(0, 5000)}
"""

Return:
{
  "score": <number 0-10>,
  "feedback": {
    "communication": "...",
    "technicalAccuracy": "...",
    "confidence": "...",
    "problemSolving": "...",
    "improvementAreas": ["...", "..."]
  },
  "improvedAnswer": "suggested better answer",
  "provider": "Gemini"
}
`;

  const parsed = await generateGeminiJson(prompt, fallback, { temperature: 0.25, maxOutputTokens: 3500 });
  const score = Math.max(0, Math.min(10, Number(parsed.score) || 0));
  return {
    score,
    feedback: parsed.feedback || fallback().feedback,
    improvedAnswer: parsed.improvedAnswer || fallback().improvedAnswer,
    provider: parsed.provider || "Gemini",
  };
};

module.exports = { generateInterviewQuestions, evaluateInterviewAnswer };
