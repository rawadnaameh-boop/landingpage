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
  /*
   * This payload assumes Rawad's API expects:
   *
   * {
   *   campaignName: string,
   *   slug: string,
   *   pageConfig: JSON string
   * }
   *
   * Check DTO in the backend and Change this file accordingly.
   */
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
    const errorMessage =
      typeof responseData === "string"
        ? responseData
        : `The API returned status ${response.status}.`;

    throw new Error(errorMessage);
  }

  return responseData;
}