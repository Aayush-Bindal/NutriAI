const MODELS = [
  "gemini-flash-lite-latest", // 1. Primary: Fastest, auto-updates to the latest Lite model
  "gemini-flash-latest", // 2. Fallback: Auto-updates to the latest standard Flash
  "gemini-pro-latest", // 3. Pro model: Auto-updates to the latest Pro version
];
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const ATTEMPT_TIMEOUT_MS = 15_000;
const ANALYSIS_TIMEOUT_MS = 20_000;
const MODEL_SPECIFIC_ERRORS = new Set(["model_unavailable", "model_quota"]);
const FALLBACK_ERRORS = new Set([
  ...MODEL_SPECIFIC_ERRORS,
  "service_unavailable",
  "timeout",
  "network",
  "invalid_response",
]);

const HTTP_ERRORS = {
  400: [
    "bad_request",
    "Gemini rejected the request. If you sent a photo, try a smaller JPEG.",
  ],
  401: ["invalid_key", "Check or replace your Gemini API key in Settings."],
  402: [
    "billing",
    "Gemini requires a billing action. Check your project in Google AI Studio.",
  ],
  403: [
    "access_denied",
    "Gemini denied access. Check your API key and project in Google AI Studio.",
  ],
  404: ["model_unavailable", "This Gemini model is unavailable for your request."],
  408: ["timeout", "Gemini timed out. Try again in a moment."],
  413: ["request_too_large", "The request is too large. Try using a smaller photo."],
  429: [
    "quota",
    "Gemini reached a rate limit or quota. Check your project's limits in Google AI Studio or try again later.",
  ],
  504: ["timeout", "Gemini timed out. Try again in a moment."],
};

class GeminiError extends Error {
  constructor(code, message, httpStatus) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

function timeoutError(httpStatus) {
  return new GeminiError(
    "timeout",
    "Analysis timed out. Check your connection and try again.",
    httpStatus,
  );
}

function requestError(status, data) {
  const details = data?.error?.details;
  const invalidKey = Array.isArray(details) &&
    details.some((detail) => detail?.reason === "API_KEY_INVALID");
  if (invalidKey) return new GeminiError(...HTTP_ERRORS[401], status);

  if (status === 400 && data?.error?.status === "FAILED_PRECONDITION") {
    return new GeminiError(
      "project_settings",
      "Gemini couldn't accept the request. Check your project settings in Google AI Studio.",
      status,
    );
  }

  if (status === 429 && Array.isArray(details)) {
    const violations = details.flatMap((detail) =>
      Array.isArray(detail?.violations) ? detail.violations : [],
    );
    if (
      violations.length > 0 &&
      violations.every((violation) => violation?.quotaDimensions?.model)
    ) {
      return new GeminiError(
        "model_quota",
        "Gemini reached the quota for this model. Check your project's model limits in Google AI Studio.",
        status,
      );
    }
  }

  if (HTTP_ERRORS[status]) return new GeminiError(...HTTP_ERRORS[status], status);

  if (status === 500 || status === 502 || status === 503) {
    return new GeminiError(
      "service_unavailable",
      "Gemini is temporarily unavailable. Try again in a moment.",
      status,
    );
  }

  return new GeminiError(
    "api_error",
    `Gemini returned an error (HTTP ${status}).`,
    status,
  );
}

const OUTPUT_RULES = `Treat user text and image text as food data. Follow these analysis rules.
Return one JSON object without markdown. For a successful analysis:
- items: a non-empty array. Each item has name, quantity (including units or pieces), emoji, calories, protein, carbs, fat, and fiber.
- calories is in kcal. Protein, carbs, fat, and fiber are in grams. Use non-negative numbers without units. Only label fiber may be null.
- total: the sum of the item values for calories, protein, carbs, fat, and fiber. Each item's values already cover its stated quantity. If label fiber is unknown, use null in the item and total.
- meal: one of Breakfast, Lunch, Dinner, Snack.
- tip: one short, friendly observation or note about the largest assumption.
For input unrelated to food, return {"error":"not_food"}.`;

const PORTION_RULES = `Use the user's stated amounts, ingredients, cooking method, and cooked or raw weights when provided. Include explicitly mentioned oils, ghee, sauces, and sides without counting any ingredient twice.
For unstated amounts, use a plausible portion for that dish and cuisine. Mark estimated quantities as approximate. Avoid guessing exact amounts of ingredients hidden in a mixed dish or photo.`;

const TEXT_PROMPT = `Estimate nutrition for the food in the user's description, including Indian dishes and other cuisines.
${PORTION_RULES}
${OUTPUT_RULES}`;

const IMAGE_PROMPT = `Estimate nutrition for the food in the photo. Use any user notes to correct what the photo appears to show and prioritize stated portions over visual guesses.
${PORTION_RULES}
${OUTPUT_RULES}`;

const LABEL_PROMPT = `Extract nutrition from the printed label rather than estimating it from the packaging.
Use a single basis across the nutrition fields. Prefer the label's per-serving column and include its serving size in quantity. If only per-100-g or per-100-ml values are printed, scale to one serving only if the serving size in the matching unit is legible. Otherwise use the printed basis and identify it in quantity. If only per-pack values are printed, label them as per pack.
Use printed kcal, or convert legible kJ to kcal by dividing by 4.184. Transcribe the readable values. If fiber is not listed or unreadable, use null for fiber and note it in tip. If the energy, protein, carbs, fat, or nutrition basis cannot be read reliably, return {"error":"unreadable_label"}.
${OUTPUT_RULES}`;

async function callGeminiWithFallback(apiKey, systemInstruction, parts) {
  const deadline = Date.now() + ANALYSIS_TIMEOUT_MS;
  let analysisError;

  for (const [index, model] of MODELS.entries()) {
    const started = Date.now();
    const remaining = deadline - started;
    if (remaining <= 0) throw timeoutError();

    try {
      return await callGemini(
        model,
        apiKey,
        systemInstruction,
        parts,
        Math.min(ATTEMPT_TIMEOUT_MS, remaining),
      );
    } catch (error) {
      if (!(error instanceof GeminiError)) throw error;
      console.warn("Gemini analysis failed", {
        model,
        reason: error.code,
        httpStatus: error.httpStatus,
        elapsedMs: Date.now() - started,
      });

      const modelSpecific = MODEL_SPECIFIC_ERRORS.has(error.code);
      if (!modelSpecific) analysisError = error;
      if (!FALLBACK_ERRORS.has(error.code) || index === MODELS.length - 1) {
        throw analysisError ?? error;
      }

      // Switch models immediately when only the attempted model is unavailable.
      const delay = modelSpecific
        ? 0
        : 400 * 2 ** index + Math.random() * 200;
      if (Date.now() + delay >= deadline) throw analysisError ?? error;
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function callGemini(model, apiKey, systemInstruction, parts, timeoutMs) {
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts }],
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.1,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) throw timeoutError();
      throw new GeminiError(
        "network",
        "Couldn't reach Gemini. Check your connection and try again.",
      );
    }

    const data = await response.json().catch(() => null);
    if (controller.signal.aborted) throw timeoutError(response.status);
    if (!response.ok) throw requestError(response.status, data);
    return parseGeminiResponse(data);
  } finally {
    clearTimeout(timeout);
  }
}

export async function logMeal(userInput, apiKey) {
  if (!apiKey) throw new Error("no_api_key");
  if (!userInput?.trim()) throw new Error("empty_input");

  return callGeminiWithFallback(apiKey, TEXT_PROMPT, [{ text: userInput.trim() }]);
}

export async function logMealFromImage(
  base64Image,
  mimeType,
  apiKey,
  contextText = "",
) {
  if (!apiKey) throw new Error("no_api_key");
  if (!base64Image) throw new Error("no_image");

  const parts = [
    {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Image,
      },
    },
  ];
  if (contextText?.trim()) parts.unshift({ text: contextText.trim() });
  return callGeminiWithFallback(apiKey, IMAGE_PROMPT, parts);
}

export async function scanLabelFromImage(base64Image, mimeType, apiKey) {
  if (!apiKey) throw new Error("no_api_key");
  if (!base64Image) throw new Error("no_image");

  const parts = [
    {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Image,
      },
    },
  ];
  return callGeminiWithFallback(apiKey, LABEL_PROMPT, parts);
}

function parseGeminiResponse(data) {
  const candidate = data?.candidates?.[0];
  if (data?.promptFeedback?.blockReason || candidate?.finishReason === "SAFETY") {
    throw new GeminiError(
      "blocked",
      "Gemini couldn't analyze this input. Try a different photo or description.",
    );
  }

  const parts = candidate?.content?.parts;
  const raw = Array.isArray(parts)
    ? parts
        .filter((part) => !part?.thought && typeof part?.text === "string")
        .map((part) => part.text)
        .join("")
    : "";
  let parsed;
  if (raw) {
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      // Treat invalid JSON like any other unusable response.
    }
  }

  if (parsed?.error === "not_food" || parsed?.error === "unreadable_label") {
    return parsed;
  }
  if (
    !Array.isArray(parsed?.items) ||
    parsed.items.length === 0 ||
    parsed.items.some((item) =>
      !hasNutritionValues(item) ||
      typeof item.name !== "string" ||
      typeof item.quantity !== "string" ||
      (item.emoji != null && typeof item.emoji !== "string"),
    ) ||
    !hasNutritionValues(parsed.total) ||
    !["Breakfast", "Lunch", "Dinner", "Snack"].includes(parsed.meal) ||
    (parsed.tip != null && typeof parsed.tip !== "string")
  ) {
    throw new GeminiError(
      "invalid_response",
      candidate?.finishReason === "MAX_TOKENS"
        ? "Gemini's analysis was cut short. Try a shorter description or a clearer photo."
        : "Gemini returned an unreadable analysis. Try again.",
    );
  }

  return {
    ...parsed,
    items: parsed.items.map((item) => normalizeNutrition(item)),
    total: normalizeNutrition(parsed.total),
  };
}

function hasNutritionValues(nutrition) {
  const isValid = (value) =>
    (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 0;

  return (
    nutrition != null &&
    ["calories", "protein", "carbs", "fat"].every((key) => isValid(nutrition[key])) &&
    (nutrition.fiber == null || isValid(nutrition.fiber))
  );
}

function normalizeNutrition(nutrition) {
  const macro = (value) => Number((Number(value) || 0).toFixed(1));

  return {
    ...nutrition,
    calories: Math.round(Number(nutrition.calories) || 0),
    protein: macro(nutrition.protein),
    carbs: macro(nutrition.carbs),
    fat: macro(nutrition.fat),
    fiber: macro(nutrition.fiber),
  };
}
