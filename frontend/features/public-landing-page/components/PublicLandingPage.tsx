import {
  Box,
  Button,
  Container,
  Typography,
} from "@mui/material";

import type {
  LandingPageConfig,
  LandingPageDto,
} from "../types/publicLandingPage";

interface PublicLandingPageProps {
  page: LandingPageDto;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function parsePageConfig(
  pageConfig: string,
): LandingPageConfig {
  if (!pageConfig.trim()) {
    return {};
  }

  try {
    const parsedValue: unknown = JSON.parse(pageConfig);

    if (
      typeof parsedValue !== "object" ||
      parsedValue === null ||
      Array.isArray(parsedValue)
    ) {
      return {};
    }

    return parsedValue as LandingPageConfig;
  } catch {
    console.warn(
      "The landing page contains invalid PageConfig JSON.",
    );

    return {};
  }
}

export default function PublicLandingPage({
  page,
}: PublicLandingPageProps) {
  const config = parsePageConfig(page.pageConfig);

  const headline =
    config.headlineText?.trim() ||
    page.campaignName;

  const subheadline =
    config.subheadlineText?.trim() ||
    "Discover everything this campaign has to offer.";

  const heroImage =
    config.mainImageUrl?.trim() ||
    "/images/campaign-placeholder.svg";

  const buttonText =
    config.buttonText?.trim() ||
    "GET STARTED";

  const buttonColor =
    config.primaryColor &&
    HEX_COLOR_PATTERN.test(config.primaryColor)
      ? config.primaryColor
      : "#1976d2";

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

      {/* Hero image */}
      <Box
        component="img"
        src={heroImage}
        alt={`${page.campaignName} hero image`}
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

      {/* Main campaign content */}
      <Container
        maxWidth="md"
        sx={{
          py: {
            xs: 6,
            md: 10,
          },
          textAlign: "center",
        }}
      >
        <Typography
          component="h1"
          sx={{
            mb: 3,

            fontSize: {
              xs: "2.25rem",
              sm: "3rem",
              md: "4rem",
            },

            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          {headline}
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 680,
            mx: "auto",
            mb: 5,
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          {subheadline}
        </Typography>

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
          {buttonText}
        </Button>
      </Container>
    </Box>
  );
}