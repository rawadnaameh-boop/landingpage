const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000"
).replace(/\/$/, "");

export interface GenerateCopyResponse {
  headline: string;
  subheadline: string;
}

interface ErrorResponse {
  message?: string;
}

function isGenerateCopyResponse(
  value: unknown,
): value is GenerateCopyResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.headline === "string" &&
    typeof data.subheadline === "string"
  );
}

export async function generateCampaignCopy(
  topic: string,
): Promise<GenerateCopyResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/ai/generate-copy`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        topic: topic.trim(),
      }),
    },
  );

  const responseText = await response.text();

  let responseData: unknown = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    let message =
      `Copy generation failed with status ${response.status}.`;

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof (
        responseData as ErrorResponse
      ).message === "string"
    ) {
      message =
        (responseData as ErrorResponse).message ??
        message;
    } else if (typeof responseData === "string") {
      message = responseData;
    }

    throw new Error(message);
  }

  if (!isGenerateCopyResponse(responseData)) {
    throw new Error(
      "The AI service returned an unexpected response.",
    );
  }

  return {
    headline: responseData.headline.trim(),
    subheadline: responseData.subheadline.trim(),
  };
}