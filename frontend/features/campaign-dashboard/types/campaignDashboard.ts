import { StringifyOptions } from "node:querystring";

export interface CampaignPageConfig {
    headlineText?: string;
    subheadlineText?: StringifyOptions;
    mainImageUrl?: string;
    primaryColor?: string;
    buttonText?: string;
}
