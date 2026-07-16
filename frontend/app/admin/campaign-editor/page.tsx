import CampaignEditor from "../../../features/campaign-editor/components/CampaignEditor";

interface CampaignEditorPageProps {
  searchParams: Promise<{
    slug?: string | string[];
  }>;
}

export default async function CampaignEditorPage({
  searchParams,
}: CampaignEditorPageProps) {
  const resolvedSearchParams = await searchParams;

  const slugParameter = resolvedSearchParams.slug;
  const slug = Array.isArray(slugParameter) ? slugParameter[0] : slugParameter;

  return <CampaignEditor initialSlug={slug ?? null} />;
}
