const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000"
).replace(/\/$/, "");

export interface ExtractedColors {
  primary: string;
  accent: string;
}

interface ErrorResponse {
  message?: string;
}

function isExtractedColors(
  value: unknown,
): value is ExtractedColors {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.primary === "string" &&
    typeof data.accent === "string"
  );
}

export async function extractColorsFromImage(
  imageUrl: string,
): Promise<ExtractedColors> {
  const response = await fetch(
    `${API_BASE_URL}/api/pages/extract-colors`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        url: imageUrl.trim(),
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
      `Color extraction failed with status ${response.status}.`;

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

  if (!isExtractedColors(responseData)) {
    throw new Error(
      "The color service returned an unexpected response.",
    );
  }

  return responseData;
}
