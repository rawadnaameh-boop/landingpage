import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import UrgencyMeter from "./UrgencyMeter";
import type { CampaignFormData, SaveStatus } from "../types/campaign";
import Link from "next/link";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
interface CampaignFormProps {
  campaign: CampaignFormData;
  saving: boolean;
  status: SaveStatus;

  topic: string;
  generatingCopy: boolean;

  onTopicChange: (value: string) => void;
  onGenerateCopy: () => Promise<void>;

  onChange: (field: keyof CampaignFormData, value: string) => void;

  onSave: () => Promise<void>;
}

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export default function CampaignForm({
  campaign,
  saving,
  status,
  topic,
  generatingCopy,
  onTopicChange,
  onGenerateCopy,
  onChange,
  onSave,
}: CampaignFormProps) {
  const safeColor = HEX_COLOR_PATTERN.test(campaign.primaryColor)
    ? campaign.primaryColor
    : "#d32f2f";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave();
  };

  return (
    <Paper
      component="form"
      elevation={3}
      square
      onSubmit={handleSubmit}
      sx={{
        minHeight: { xs: "auto", md: "100vh" },
        p: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 1,
        boxShadow: {
          xs: "none",
          md: "4px 0 20px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "stretch",
            sm: "flex-start",
          },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Campaign Settings
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Edit the campaign information and view your changes instantly.
        </Typography>
        <Button
          component={Link}
          href="/dashboard"
          variant="outlined"
          startIcon={<DashboardRoundedIcon />}
          sx={{
            flexShrink: 0,
            color: "#333333",
            boxShadow: "none",

            "&:hover": {
              bgcolor: "#e0e0e0",
              boxShadow: "none",
            },
          }}
        >
          View Dashboard
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1.5,
              fontWeight: 700,
            }}
          >
            AI Copy Generator
          </Typography>

          <Stack
            spacing={1.5}
            sx={{
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              alignItems: {
                xs: "stretch",
                sm: "flex-start",
              },
            }}
          >
            <TextField
              label="Topic"
              value={topic}
              onChange={(event) => onTopicChange(event.target.value)}
              placeholder="Example: Fitness App"
              helperText={`${topic.length}/100 characters`}
              disabled={generatingCopy}
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
            />
            <Button
              type="button"
              variant="outlined"
              disabled={generatingCopy || !topic.trim()}
              startIcon={
                generatingCopy ? (
                  <CircularProgress size={17} color="inherit" />
                ) : (
                  <AutoAwesomeRoundedIcon fontSize="small" />
                )
              }
              onClick={() => {
                void onGenerateCopy();
              }}
              sx={{
                minWidth: 180,
                height: 48,
                px: 2.25,

                borderRadius: 2,
                borderColor: "#b8cdf5",

                bgcolor: "#eef4ff",
                color: "#1a5fb4",

                fontSize: "0.875rem",
                fontWeight: 700,
                textTransform: "none",
                whiteSpace: "nowrap",

                boxShadow: "none",

                transition:
                  "background-color 160ms ease, border-color 160ms ease, transform 160ms ease",

                "&:hover": {
                  bgcolor: "#e2ecff",
                  borderColor: "#8eb0ef",
                  boxShadow: "none",
                  transform: "translateY(-1px)",
                },

                "&:active": {
                  transform: "translateY(0)",
                },

                "&.Mui-disabled": {
                  bgcolor: "#f4f5f7",
                  borderColor: "#dedede",
                  color: "#9a9a9a",
                },
              }}
            >
              {generatingCopy ? "Generating..." : "Generate with AI"}
            </Button>
          </Stack>
          <UrgencyMeter headline={campaign.headlineText} />
        </Box>
        <TextField
          label="Campaign Name"
          value={campaign.campaignName}
          onChange={(event) => onChange("campaignName", event.target.value)}
          required
        />

        <TextField
          label="Slug"
          value={campaign.slug}
          onChange={(event) => onChange("slug", event.target.value)}
          helperText="Example: summer-launch-2026"
          required
        />

        <TextField
          label="Headline"
          value={campaign.headlineText}
          onChange={(event) => onChange("headlineText", event.target.value)}
          required
        />

        <TextField
          label="Subheadline"
          value={campaign.subheadlineText}
          onChange={(event) => onChange("subheadlineText", event.target.value)}
          multiline
          minRows={3}
        />

        <TextField
          label="Image URL"
          value={campaign.mainImageUrl}
          onChange={(event) => onChange("mainImageUrl", event.target.value)}
          placeholder="https://example.com/campaign-image.jpg"
        />

        <TextField
          label="Button Text"
          value={campaign.buttonText}
          onChange={(event) => onChange("buttonText", event.target.value)}
          required
        />

        <Box>
          <Typography
            component="label"
            htmlFor="campaign-button-color"
            variant="body2"
            sx={{
              display: "block",
              mb: 1,
              fontWeight: 500,
            }}
          >
            Button Color
          </Typography>

          <Stack direction="row" spacing={2}>
            <Box
              id="campaign-button-color"
              component="input"
              type="color"
              aria-label="Choose button color"
              value={safeColor}
              onChange={(event) => onChange("primaryColor", event.target.value)}
              sx={{
                width: 64,
                height: 56,
                p: 0.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "background.paper",
                cursor: "pointer",
              }}
            />

            <TextField
              label="Hex Code"
              value={campaign.primaryColor}
              onChange={(event) => onChange("primaryColor", event.target.value)}
              error={
                campaign.primaryColor.length > 0 &&
                !HEX_COLOR_PATTERN.test(campaign.primaryColor)
              }
              helperText={
                campaign.primaryColor.length > 0 &&
                !HEX_COLOR_PATTERN.test(campaign.primaryColor)
                  ? "Use a value such as #d32f2f"
                  : " "
              }
            />
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ flexGrow: 1, minHeight: 32 }} />

      {status && (
        <Alert severity={status.severity} sx={{ mb: 2 }}>
          {status.message}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={saving}
        startIcon={
          saving ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SaveRoundedIcon />
          )
        }
        sx={{
          py: 1.5,
          fontSize: "1rem",
          bgcolor: "#eeeeee",
          color: "#333333",
          boxShadow: "none",

          "&:hover": {
            bgcolor: "#e0e0e0",
            boxShadow: "none",
          },
        }}
      >
        {saving ? "Saving..." : "Save Campaign"}
      </Button>
    </Paper>
  );
}
