import type { Metadata } from "next";

import CampaignDashboard from
  "../../features/campaign-dashboard/components/CampaignDashboard";

export const metadata: Metadata = {
  title: "Campaign Dashboard",
  description:
    "View and manage landing-page campaigns.",
};

export default function DashboardPage() {
  return <CampaignDashboard />;
}