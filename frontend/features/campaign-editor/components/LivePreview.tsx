import { Box, Button, Paper, Typography } from "@mui/material";

import type { CampaignFormData } from "../types/campaign";

interface LivePreviewProps {
  campaign: CampaignFormData;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export default function LivePreview({ campaign }: LivePreviewProps) {
  const imageUrl =
    campaign.mainImageUrl.trim() || "/images/campaign-placeholder.svg";

  const buttonColor = HEX_COLOR_PATTERN.test(campaign.primaryColor)
    ? campaign.primaryColor
    : "#d32f2f";

  return (
    <Box
      component="section"
      aria-label="Live campaign preview"
      sx={{
        minHeight: { xs: 720, md: "100vh" },
        bgcolor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 390 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mb: 2,
            fontWeight: 700,
            letterSpacing: 1.2,
          }}
        >
          Live Preview
        </Typography>

        <Paper
          elevation={18}
          sx={{
            width: "100%",
            aspectRatio: "9 / 18",
            bgcolor: "#ffffff",
            border: "8px solid #202124",
            borderRadius: 5,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
          }}
        >
          <Box
            sx={{
              height: 64,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              LUMINA
            </Typography>
          </Box>

          <Box
            component="img"
            src={imageUrl}
            alt={campaign.headlineText || "Campaign preview"}
            onError={(event) => {
              event.currentTarget.src = "/images/campaign-placeholder.svg";
            }}
            sx={{
              display: "block",
              width: "100%",
              height: 240,
              flexShrink: 0,
              objectFit: "cover",
            }}
          />

          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              {campaign.headlineText || "Your headline"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              {campaign.subheadlineText ||
                "Your campaign subheadline will appear here."}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: buttonColor,
                color: "#ffffff",
                py: 1.5,
                mb: 1,
                "&:hover": {
                  bgcolor: buttonColor,
                  filter: "brightness(0.9)",
                },
              }}
            >
              {campaign.buttonText || "SUBSCRIBE & PLAY"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
