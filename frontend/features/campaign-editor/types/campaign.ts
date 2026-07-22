import type { CampaignBlock } from "./blocks";

export interface CampaignFormData {
  campaignName: string;
  slug: string;
  blocks: CampaignBlock[];
}

export type SaveStatus =
  | {
      severity: "success" | "error";
      message: string;
    }
  | null;