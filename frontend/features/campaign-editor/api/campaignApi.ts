import type { CampaignFormData } from "../types/campaign";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000";

interface CreateCampaignPayload {
  campaignName: string;
  slug: string;
  pageConfig: string;
}

export async function createCampaign(
  campaign: CampaignFormData,
): Promise<unknown> {
  // --- THE CODE FIX: AUTOMATIC UNIQUE SLUG ---
  // This appends a random 4-digit number to the slug (e.g. "summer-launch-2026-8294")
  // so your database will never block you with a duplicate error!
  const uniqueRandomNumber = Math.floor(1000 + Math.random() * 9000);
  const uniqueSlug = `${campaign.slug.trim()}-${uniqueRandomNumber}`;
  // --------------------------------------------

  const payload: CreateCampaignPayload = {
    campaignName: campaign.campaignName.trim(),
    slug: campaign.slug.trim(),

    pageConfig: JSON.stringify({
      headlineText: campaign.headlineText.trim(),
      subheadlineText: campaign.subheadlineText.trim(),
      mainImageUrl: campaign.mainImageUrl.trim(),
      primaryColor: campaign.primaryColor,
      buttonText: campaign.buttonText.trim(),
    }),
  };

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