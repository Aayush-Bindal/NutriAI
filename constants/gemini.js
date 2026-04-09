const MODELS = [
  "gemini-3.1-flash-lite-preview", // 1. Primary: Fastest
  "gemini-2.5-flash",              // 2. Fallback: 2.5 cluster
  "gemini-2.0-flash-001",          // 3. Pinned 2.0 stable version (highly reliable)
  "gemini-2.5-pro",                // 4. Pro model (Uses entirely different servers than Flash)
  "gemini-flash-latest"            // 5. Google's auto-router (Finds the least busy Flash node)
];
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const FETCH_TIMEOUT = 15_000;

const IMAGE_PROMPT = `You are a nutrition expert with deep knowledge of Indian and global food.
Analyze this image of food and return ONLY a valid JSON object. No markdown, no explanation, nothing else.

Format:
{
  "items": [
    { "name": "Food name", "quantity": "2 pieces / 1 bowl / etc", "calories": 240, "protein": 6, "carbs": 40, "fat": 4, "fiber": 3, "emoji": "🍛" }
  ],
  "total": { "calories": 240, "protein": 6, "carbs": 40, "fat": 4, "fiber": 3 },
  "meal": "Breakfast",
  "tip": "a short friendly tip or observation about this meal"
}

Rules:
- meal must be one of: Breakfast, Lunch, Dinner, Snack
- Estimate standard Indian serving sizes based on the visual
- Pick the most relevant emoji for each food item
- If the image is clearly not food, return { "error": "not_food" }`;

const LABEL_PROMPT = `You are a nutrition data extractor.
Analyze this image of a food packaging or nutrition label and extract the per-serving nutritional information. 
Return ONLY a valid JSON object. No markdown, no explanation, nothing else.

Format:
{
  "items": [
    { "name": "Packaged Food", "quantity": "1 serving", "calories": 240, "protein": 6, "carbs": 40, "fat": 4, "fiber": 3, "emoji": "📦" }
  ],
  "total": { "calories": 240, "protein": 6, "carbs": 40, "fat": 4, "fiber": 3 },
  "meal": "Snack",
  "tip": "Nutritional info extracted from the label."
}

Rules:
- Read the nutritional table carefully.
- Use '1 serving' or whatever serving size is mentioned on the label as the quantity.
- Try your best to get calories, protein, carbs, fat, and fiber per serving.
- If the image does not contain any nutritional information, return { "error": "not_food" }`;

const TEXT_PROMPT = `You are a nutrition expert with deep knowledge of Indian and global food.
When the user tells you what they ate, return ONLY a valid JSON object. No markdown, no explanation, nothing else.

Format:
{
  "items": [
    { "name": "Food name", "quantity": "2 pieces / 1 bowl / etc", "calories": 240, "protein": 6, "carbs": 40, "fat": 4, "fiber": 3, "emoji": "🍛" }
  ],
  "total": { "calories": 240, "protein": 6, "carbs": 40, "fat": 4, "fiber": 3 },
  "meal": "Breakfast",
  "tip": "a short friendly tip or observation about this meal"
}

Rules:
- meal must be one of: Breakfast, Lunch, Dinner, Snack
- Assume standard Indian serving sizes if quantity not mentioned
- Be accurate for Indian foods like roti, dal, sabzi, rice, idli, dosa, poha etc
- Pick the most relevant emoji for each food item
- If input is not about food, return { "error": "not_food" }`;

async function callGeminiWithFallback(apiKey, parts) {
  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`Attempting analysis with: ${model}`);
      return await callGemini(model, apiKey, parts);
    } catch (error) {
      lastError = error;
      console.warn(`${model} failed: ${error.message}. Trying next fallback...`);
      
      // If the error is related to an invalid API key, throw immediately
      // instead of trying all other models which will also fail
      const errMsg = error.message.toLowerCase();
      if (errMsg.includes("api key") || errMsg.includes("api_key_invalid")) {
        throw new Error("Invalid API Key. Please check your profile settings.");
      }
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error("Request timed out. Check your connection.");
  }
  throw new Error("All AI models are currently busy. Please try again in a few seconds.");
}

async function callGemini(model, apiKey, parts) {
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts }],
    generationConfig: { 
      response_mime_type: "application/json",
      temperature: 0.1
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "API error");

    return parseGeminiResponse(data);
  } finally {
    clearTimeout(timeout);
  }
}

export async function logMeal(userInput, apiKey) {
  if (!apiKey) throw new Error("no_api_key");
  if (!userInput?.trim()) throw new Error("empty_input");

  const parts = [{ text: TEXT_PROMPT + "\n\nUser said: " + userInput }];
  return await callGeminiWithFallback(apiKey, parts);
}

export async function logMealFromImage(base64Image, mimeType, apiKey, contextText = "") {
  if (!apiKey) throw new Error("no_api_key");
  if (!base64Image) throw new Error("no_image");

  let promptToUse = IMAGE_PROMPT;
  if (contextText?.trim()) {
    promptToUse += `\n\nUSER ADDED CONTEXT (Take this into account to refine your analysis): ${contextText.trim()}`;
  }

  const parts = [
    { text: promptToUse },
    {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Image,
      },
    },
  ];
  return await callGeminiWithFallback(apiKey, parts);
}

export async function scanLabelFromImage(base64Image, mimeType, apiKey) {
  if (!apiKey) throw new Error("no_api_key");
  if (!base64Image) throw new Error("no_image");

  const parts = [
    { text: LABEL_PROMPT },
    {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Image,
      },
    },
  ];
  return await callGeminiWithFallback(apiKey, parts);
}

function parseGeminiResponse(data) {
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Empty response from AI. Please try again.");

  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  if (parsed.error) return parsed;
  if (!parsed.items || !parsed.total || !parsed.meal) {
    throw new Error("Unexpected response format. Please try again.");
  }
  return parsed;
}