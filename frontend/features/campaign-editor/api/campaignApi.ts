import type { CampaignFormData } from "../types/campaign";
import type { CampaignBlock } from "../types/blocks"
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000";

export interface CampaignApiResponse {
  id: number;
  campaignName: string;
  slug: string;
  pageConfig: string;
}

interface CampaignPayload {
  campaignName: string;
  slug: string;
  pageConfig: string;
}

function createPayload(campaign: CampaignFormData, slug: string): CampaignPayload {
  return {
    campaignName: campaign.campaignName.trim(),
    slug,
    pageConfig: JSON.stringify(campaign.blocks),
  };
}
export function parsePageConfigBlocks(pageConfig: string): CampaignBlock[] {
  if (!pageConfig.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(pageConfig);
    return Array.isArray(parsed) ? (parsed as CampaignBlock[]) : [];
  } catch {
    return [];
  }
}

async function readResponse(
  response: Response,
): Promise<unknown> {
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
    let errorMessage =
      `The API returned status ${response.status}.`;

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string"
    ) {
      errorMessage = responseData.message;
    } else if (typeof responseData === "string") {
      errorMessage = responseData;
    }

    throw new Error(errorMessage);
  }

  return responseData;
}

// POST /api/pages
export async function createCampaign(
  campaign: CampaignFormData,
): Promise<CampaignApiResponse> {
  const uniqueRandomNumber =
    Math.floor(1000 + Math.random() * 9000);

  const uniqueSlug =
    `${campaign.slug.trim()}-${uniqueRandomNumber}`;

  const payload = createPayload(
    campaign,
    uniqueSlug,
  );

  const response = await fetch(
    `${API_BASE_URL}/api/pages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return await readResponse(
    response,
  ) as CampaignApiResponse;
}

// GET /api/pages/slug/{slug}
export async function getCampaignBySlug(
  slug: string,
): Promise<CampaignApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/pages/slug/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return await readResponse(
    response,
  ) as CampaignApiResponse;
}

// PUT /api/pages/{id}
export async function updateCampaign(
  id: number,
  campaign: CampaignFormData,
): Promise<CampaignApiResponse> {
  const payload = createPayload(
    campaign,
    campaign.slug.trim(),
  );

  const response = await fetch(
    `${API_BASE_URL}/api/pages/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return await readResponse(
    response,
  ) as CampaignApiResponse;
}