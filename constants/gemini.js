const PRIMARY_MODEL = "gemini-3.1-flash-lite-preview";
const SECONDARY_MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const FETCH_TIMEOUT = 15_000;

const PROMPT = `You are a nutrition expert with deep knowledge of Indian and global food.
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

export async function logMeal(userInput, apiKey) {
  if (!apiKey) throw new Error("no_api_key");
  if (!userInput?.trim()) throw new Error("empty_input");

  async function attemptFetch(modelName) {
    const url = `${API_BASE}/${modelName}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: PROMPT + "\n\nUser said: " + userInput }] }],
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
      return data;
    } catch (e) {
      if (e.name === "AbortError")
        throw new Error(
          "Request timed out. Check your connection and try again.",
        );
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }

  try {
    const data = await attemptFetch(PRIMARY_MODEL);
    return parseGeminiResponse(data);
  } catch {
    try {
      const data = await attemptFetch(SECONDARY_MODEL);
      return parseGeminiResponse(data);
    } catch (fallbackError) {
      throw new Error(
        fallbackError.message ||
          "Both AI models are currently unavailable. Please try again in a moment.",
      );
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
