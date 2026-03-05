const MODEL = "gemini-3.1-flash-lite-preview";

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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: PROMPT + "\n\nUser said: " + userInput }] }],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  // console.log("STATUS:", response.status);
  // console.log("RESPONSE:", JSON.stringify(data));

  if (!response.ok) {
    throw new Error(data?.error?.message || "API error");
  }

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
