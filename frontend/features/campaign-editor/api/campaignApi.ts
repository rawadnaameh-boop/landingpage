import type { CampaignFormData } from "../types/campaign";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000"
).replace(/\/$/, "");

export interface LandingPageDto {
  id: string;
  campaignName: string;
  slug: string;
  pageConfig: string;
  createdAt: string;
  updatedAt: string;
}


interface CampaignPayload {
  campaignName: string;
  slug: string;
  pageConfig: string;
}


function buildCampaignPayload(
  campaign: CampaignFormData,
): CampaignPayload {
  return {
    campaignName: campaign.campaignName.trim(),
    slug: campaign.slug.trim(),

    // PageConfig is a string in your backend DTO.
    pageConfig: JSON.stringify({
      headlineText: campaign.headlineText.trim(),
      subheadlineText: campaign.subheadlineText.trim(),
      mainImageUrl: campaign.mainImageUrl.trim(),
      primaryColor: campaign.primaryColor,
      buttonText: campaign.buttonText.trim(),
    }),
  };
}


async function parseApiResponse<T>(
  response: Response,
): Promise<T> {
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

  return responseData as T;
}


export async function getCampaignBySlug(
  slug: string,
): Promise<LandingPageDto> {
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

  return parseApiResponse<LandingPageDto>(response);
}

export async function createCampaign(
  campaign: CampaignFormData,
): Promise<LandingPageDto> {
  const payload = buildCampaignPayload(campaign);

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

  return parseApiResponse<LandingPageDto>(response);
}

export async function updateCampaign(
  id: string,
  campaign: CampaignFormData,
): Promise<LandingPageDto> {
  const payload = buildCampaignPayload(campaign);

  const response = await fetch(
    `${API_BASE_URL}/api/pages/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return parseApiResponse<LandingPageDto>(response);
}