import type { CampaignBlock } from "../types/blocks";

const ML_API_BASE_URL =
  process.env.NEXT_PUBLIC_ML_API_URL ?? "http://127.0.0.1:8000";

interface GeneratePageLayoutError {
  detail?: string;
}

function isCampaignBlockArray(value: unknown): value is CampaignBlock[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((block) => {
    if (
      typeof block !== "object" ||
      block === null ||
      !("id" in block) ||
      !("type" in block)
    ) {
      return false;
    }

    const candidate = block as Record<string, unknown>;

    if (typeof candidate.id !== "string" || !candidate.id.trim()) {
      return false;
    }

    switch (candidate.type) {
      case "Headline":
        return (
          typeof candidate.text === "string" &&
          typeof candidate.fontSize === "number" &&
          typeof candidate.color === "string" &&
          ["left", "center", "right"].includes(
            candidate.align as string,
          )
        );

      case "Paragraph":
        return typeof candidate.text === "string";

      case "HeroImage":
        return typeof candidate.imageUrl === "string";

      case "Button":
        return (
          typeof candidate.text === "string" &&
          typeof candidate.color === "string"
        );

      case "CountdownTimer":
        return typeof candidate.endDate === "string";

      default:
        return false;
    }
  });
}

export async function generatePageLayout(
  prompt: string,
): Promise<CampaignBlock[]> {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    throw new Error("Enter a page description before generating.");
  }

  const response = await fetch(
    `${ML_API_BASE_URL}/generate-page-layout`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: normalizedPrompt,
      }),
    },
  );

  if (!response.ok) {
    let message = "The AI could not generate the page layout.";

    try {
      const errorBody =
        (await response.json()) as GeneratePageLayoutError;

      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Keep the default error message if the response is not JSON.
    }

    throw new Error(message);
  }

  const data: unknown = await response.json();

  if (!isCampaignBlockArray(data)) {
    throw new Error(
      "The AI returned an invalid landing-page layout.",
    );
  }

  return data;
}