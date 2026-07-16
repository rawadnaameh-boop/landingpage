"use client";

import { useEffect, useState } from "react";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import { getCampaigns } from "../api/campaignDashboardApi";

import type { CampaignListItem } from "../types/campaignDashboard";

import CampaignCard from "./CampaignCard";

export default function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /*
   * Changing this value causes the API request
   * to run again when Retry is clicked.
   */
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCampaigns() {
      try {
        setLoading(true);
        setError(null);

        const campaignList = await getCampaigns(controller.signal);

        setCampaigns(campaignList);
      } catch (requestError) {
        /*
         * Do not show an error when the request was
         * intentionally cancelled because the user
         * navigated away.
         */
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        const message =
          requestError instanceof Error
            ? requestError.message
            : "The campaigns could not be loaded.";

        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadCampaigns();

    /*
     * Cancel the request if the user leaves the page
     * before the request finishes.
     */
    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              mb: 1,
              fontWeight: 700,
            }}
          >
            Campaign Dashboard
          </Typography>

          <Typography color="text.secondary">
            View and manage all your landing-page campaigns.
          </Typography>
        </Box>

        {loading && (
          <Stack
            spacing={2}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              minHeight: 320,
            }}
          >
            <CircularProgress />

            <Typography color="text.secondary">Loading campaigns...</Typography>
          </Stack>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => {
                  setReloadKey((currentValue) => currentValue + 1);
                }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <Box
            sx={{
              minHeight: 320,
              p: 4,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              textAlign: "center",

              bgcolor: "background.paper",

              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Box>
              <Typography variant="h6" gutterBottom>
                No campaigns found
              </Typography>

              <Typography color="text.secondary">
                Campaigns will appear here after they have been created.
              </Typography>
            </Box>
          </Box>
        )}

        {!loading && !error && campaigns.length > 0 && (
          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",

                sm: "repeat(2, minmax(0, 1fr))",

                lg: "repeat(3, minmax(0, 1fr))",
              },

              gap: 3,
            }}
          >
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
