const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let cachedModelName = null;

const stripCodeFences = (text = "") =>
  String(text)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (operation, { retries = 3, delayMs = 700 } = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (err) {
      lastError = err;
      if (attempt < retries) await sleep(delayMs * attempt);
    }
  }

  throw lastError;
};

const listModels = async () => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Failed to list Gemini models (${response.status})`);
  return data.models || [];
};

const resolveModelName = async () => {
  if (cachedModelName) return cachedModelName;

  const models = await withRetry(listModels);
  const preferred = [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-3.1-flash-lite",
  ];

  for (const wanted of preferred) {
    const found = models.find((model) => {
      const name = (model.name || "").replace(/^models\//, "");
      return name === wanted && (model.supportedGenerationMethods || []).includes("generateContent");
    });
    if (found) {
      cachedModelName = wanted;
      return cachedModelName;
    }
  }

  const supported = models.find((model) => (model.supportedGenerationMethods || []).includes("generateContent"));
  cachedModelName = supported ? (supported.name || "").replace(/^models\//, "") : "gemini-1.5-flash";
  return cachedModelName;
};

const generateGeminiText = async (prompt, { temperature = 0.3, maxOutputTokens = 6000 } = {}) => {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");

  return withRetry(async () => {
    const modelName = await resolveModelName();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || `Gemini request failed (${response.status})`);

    return data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  });
};

const generateGeminiJson = async (prompt, fallback, options = {}) => {
  if (!GEMINI_API_KEY) return typeof fallback === "function" ? await fallback() : fallback;

  try {
    const raw = await generateGeminiText(prompt, options);
    return JSON.parse(stripCodeFences(raw));
  } catch (err) {
    console.error("Gemini JSON generation failed after retries:", err.message);
    return typeof fallback === "function" ? await fallback(err) : fallback;
  }
};

module.exports = { generateGeminiJson, generateGeminiText, stripCodeFences, withRetry };
