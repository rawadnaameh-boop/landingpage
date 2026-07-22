import type { CampaignFormData } from "../types/campaign";

export const DEFAULT_CAMPAIGN: CampaignFormData = {
  campaignName: "Summer Launch 2026",
  slug: "summer-launch-2026",
  blocks: [
    {
      id: crypto.randomUUID(),
      type: "Headline",
      text: "Experience the future of Design",
      fontSize: 28,
      color: "#1a1a1a",
      align: "center",
    },
    {
      id: crypto.randomUUID(),
      type: "Paragraph",
      text: "Join thousands of creators building the next generation of digital products",
    },
    {
      id: crypto.randomUUID(),
      type: "Button",
      text: "SUBSCRIBE & PLAY",
      color: "#d32f2f",
    },
  ],
};