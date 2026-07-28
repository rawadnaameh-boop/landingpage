import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import type { CampaignBlock } from "@/features/campaign-editor/types/blocks";

import type { LandingPageDto } from "../types/publicLandingPage";

interface PublicLandingPageProps {
  page: LandingPageDto;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function parsePageConfigBlocks(
  pageConfig: string,
): CampaignBlock[] {
  if (!pageConfig.trim()) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(pageConfig);

    return Array.isArray(parsedValue)
      ? (parsedValue as CampaignBlock[])
      : [];
  } catch {
    console.warn(
      "The landing page contains invalid PageConfig JSON.",
    );

    return [];
  }
}

function renderPublicBlock(block: CampaignBlock) {
  switch (block.type) {
    case "HeroImage":
      return (
        <Box
          key={block.id}
          component="img"
          src={block.imageUrl.trim() || "/images/campaign-placeholder.svg"}
          alt="Campaign hero"
          sx={{
            display: "block",
            width: "100%",
            height: {
              xs: 280,
              sm: 380,
              md: 500,
            },
            objectFit: "cover",
            bgcolor: "grey.100",
          }}
        />
      );

    case "Headline":
      return (
        <Container key={block.id} maxWidth="md" sx={{ pt: 6, textAlign: block.align }}>
          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "2.25rem",
                sm: "3rem",
                md: "4rem",
              },
              fontWeight: 800,
              lineHeight: 1.1,
              color: block.color,
            }}
          >
            {block.text}
          </Typography>
        </Container>
      );

    case "Paragraph":
      return (
        <Container key={block.id} maxWidth="md" sx={{ pt: 3, textAlign: "center" }}>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 680,
              mx: "auto",
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            {block.text}
          </Typography>
        </Container>
      );

    case "Button": {
      const buttonColor = HEX_COLOR_PATTERN.test(block.color)
        ? block.color
        : "#1976d2";

      return (
        <Container key={block.id} maxWidth="md" sx={{ py: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              minWidth: 220,
              px: 4,
              py: 1.5,

              bgcolor: buttonColor,
              color: "#ffffff",

              fontSize: "1rem",
              fontWeight: 700,

              "&:hover": {
                bgcolor: buttonColor,
                filter: "brightness(0.9)",
              },
            }}
          >
            {block.text}
          </Button>
        </Container>
      );
    }

    case "CountdownTimer":
      return (
        <Container key={block.id} maxWidth="md" sx={{ py: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Offer ends
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {new Date(block.endDate).toLocaleString()}
          </Typography>
        </Container>
      );
  }
}

export default function PublicLandingPage({
  page,
}: PublicLandingPageProps) {
  const blocks = parsePageConfigBlocks(page.pageConfig);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Header / logo area */}
      <Box
        component="header"
        sx={{
          height: 72,
          px: {
            xs: 3,
            md: 6,
          },

          display: "flex",
          alignItems: "center",

          bgcolor: "background.paper",

          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: 1.2,
          }}
        >
          {page.campaignName}
        </Typography>
      </Box>

      {/* Campaign content, rendered in the exact order it was arranged in the editor */}
      <Box sx={{ pb: 6 }}>
        {blocks.length === 0 ? (
          <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
            <Typography component="h1" sx={{ fontWeight: 800 }}>
              {page.campaignName}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Discover everything this campaign has to offer.
            </Typography>
          </Container>
        ) : (
          blocks.map(renderPublicBlock)
        )}
      </Box>
    </Box>
  );
}