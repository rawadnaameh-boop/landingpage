import { notFound } from "next/navigation";

import { getLandingPageBySlug } from
  "../../../features/public-landing-page/api/publicLandingPageApi";

import PublicLandingPage from
  "../../../features/public-landing-page/components/PublicLandingPage";

interface PublicLandingPageRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicLandingPageRoute({
  params,
}: PublicLandingPageRouteProps) {
  const { slug } = await params;

  const page = await getLandingPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <PublicLandingPage page={page} />;
}