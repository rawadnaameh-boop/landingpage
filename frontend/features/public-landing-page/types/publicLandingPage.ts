export interface LandingPageDto {
  id: string;
  campaignName: string;
  slug: string;
  pageConfig: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandingPageConfig {
  headlineText?: string;
  subheadlineText?: string;
  mainImageUrl?: string;
  primaryColor?: string;
  buttonText?: string;
}