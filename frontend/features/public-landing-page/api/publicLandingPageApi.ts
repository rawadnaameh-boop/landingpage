import type { LandingPageDto } from "../types/publicLandingPage";

const API_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5101"
).replace(/\/$/, "");

function isLandingPageDto(
  value: unknown,
): value is LandingPageDto {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const page = value as Record<string, unknown>;

  return (
    typeof page.id === "string" &&
    typeof page.campaignName === "string" &&
    typeof page.slug === "string" &&
    typeof page.pageConfig === "string" &&
    typeof page.createdAt === "string" &&
    typeof page.updatedAt === "string"
  );
}

export async function getLandingPageBySlug(
  slug: string,
): Promise<LandingPageDto | null> {
  const response = await fetch(
    `${API_BASE_URL}/api/pages/slug/${encodeURIComponent(slug)}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    let message =
      `Failed to load the landing page. Status: ${response.status}.`;

    try {
      const errorBody = (await response.json()) as {
        message?: string;
      };

      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
    
    }

    throw new Error(message);
  }

  const responseData: unknown = await response.json();

  if (!isLandingPageDto(responseData)) {
    throw new Error(
      "The landing-page API returned an unexpected response format.",
    );
  }

  return responseData;
}