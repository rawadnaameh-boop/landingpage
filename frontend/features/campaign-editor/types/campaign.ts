export interface CampaignFormData {
    campaignName: string;
    slug: string;
    headlineText: string;
    subheadlineText: string;
    mainImageUrl: string;
    primaryColor: string;
    buttonText: string;

}

export type SaveStatus = 
| {
    severity: "success" | "error";
    message: string;
}
| null;