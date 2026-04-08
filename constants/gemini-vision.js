const PRIMARY_VISION_MODEL = "gemini-3.1-flash-lite-preview";
const SECONDARY_VISION_MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const FETCH_TIMEOUT = 20_000;

const PROMPT = `You are a nutrition expert with deep knowledge of Indian and global food.
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

async function callGemini(model, base64Image, mimeType, apiKey) {
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: { response_mime_type: "application/json" },
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

export async function logMealFromImage(base64Image, mimeType, apiKey) {
  if (!apiKey) throw new Error("no_api_key");
  if (!base64Image) throw new Error("no_image");

  try {
    // 🔹 Try PRIMARY model
    return await callGemini(
      PRIMARY_VISION_MODEL,
      base64Image,
      mimeType,
      apiKey
    );
  } catch (primaryError) {
    console.warn("Primary model failed, switching to secondary:", primaryError);

    try {
      // 🔹 Fallback to SECONDARY model
      return await callGemini(
        SECONDARY_VISION_MODEL,
        base64Image,
        mimeType,
        apiKey
      );
    } catch (secondaryError) {
      console.error("Secondary model also failed:", secondaryError);

      if (secondaryError.name === "AbortError") {
        throw new Error("Request timed out. Check your connection and try again.");
      }

      throw new Error("Both AI models failed. Please try again later.");
    }
  }
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