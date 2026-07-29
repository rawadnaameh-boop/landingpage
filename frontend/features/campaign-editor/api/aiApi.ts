import type { UrgencyScoreResponse } from "../types/urgency";

// ✅ Reads NEXT_PUBLIC_API_BASE_URL from env.
// In Docker production, NEXT_PUBLIC_API_BASE_URL="" -> stays "" (uses relative path /api/...)
// In Local Dev, falls back to "http://localhost:5101"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5101";

interface ApiErrorResponse {
  message?: string;
}

export async function scoreHeadlineUrgency(
  headline: string,
  signal?: AbortSignal,
): Promise<UrgencyScoreResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ai/score-urgency`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      headline,
    }),
    signal,
  });

  if (!response.ok) {
    let errorMessage = "Unable to score the headline.";

    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as UrgencyScoreResponse;
}