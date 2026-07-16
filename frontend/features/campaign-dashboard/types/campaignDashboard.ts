export interface LandingPageDto {
  id: string;
  campaignName: string;
  slug: string;
  pageConfig: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignPageConfig {
  headlineText?: string;
  subheadlineText?: string;
  mainImageUrl?: string;
  primaryColor?: string;
  buttonText?: string;
}

export interface CampaignListItem {
  id: string;
  campaignName: string;
  slug: string;
  mainImageUrl: string;
  createdAt: string;
  updatedAt: string;
}