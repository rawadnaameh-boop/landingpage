import type { CampaignBlock } from "@/features/campaign-editor/types/blocks";
import type {
  CampaignListItem,
  LandingPageDto,
} from "../types/campaignDashboard";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5101"
).replace(/\/$/, "");

function parsePageConfigBlocks(
  pageConfig: string,
): CampaignBlock[] {
  if (!pageConfig.trim()) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(pageConfig);

    return Array.isArray(parsedValue)
      ? (parsedValue as CampaignBlock[])
      : [];
  } catch {
    console.warn(
      "A campaign contains invalid PageConfig JSON:",
      pageConfig,
    );

    return [];
  }
}
function mapLandingPageToListItem(
  page: LandingPageDto,
): CampaignListItem {
  const blocks = parsePageConfigBlocks(page.pageConfig);

  const heroImageBlock = blocks.find(
    (block): block is Extract<CampaignBlock, { type: "HeroImage" }> =>
      block.type === "HeroImage",
  );

  return {
    id: page.id,

    campaignName:
      page.campaignName.trim() || "Untitled Campaign",

    slug: page.slug,

    mainImageUrl:
      heroImageBlock?.imageUrl.trim() ||
      "/images/campaign-placeholder.svg",

    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

export async function getCampaigns(
  signal?: AbortSignal,
): Promise<CampaignListItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/pages`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
      cache: "no-store",

      signal,
    },
  );

  if (!response.ok) {
    let errorMessage =
      `Failed to load campaigns. Status: ${response.status}.`;

    try {
      const errorBody = (await response.json()) as {
        message?: string;
      };

      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
    }

    throw new Error(errorMessage);
  }

  const responseData: unknown = await response.json();
  if (!Array.isArray(responseData)) {
    throw new Error(
      "The campaigns API returned an unexpected format. An array was expected.",
    );
  }

  return (responseData as LandingPageDto[]).map(
    mapLandingPageToListItem,
  );
}