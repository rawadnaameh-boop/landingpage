"use client";

import { useState, useEffect } from "react";
import { Box } from "@mui/material";

import { createCampaign } from "../api/campaignApi";
import { DEFAULT_CAMPAIGN } from "../constants/defaultCampaign";
import type {
  CampaignFormData,
  SaveStatus,
} from "../types/campaign";

import CampaignForm from "./CampaignForm";
import LivePreview from "./LivePreview";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export default function CampaignEditor() {
  const [campaign, setCampaign] =
    useState<CampaignFormData>(DEFAULT_CAMPAIGN);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>(null);

  // --- AUTOMATIC COLOR EXTRACTION (ML LOOP) ---
  useEffect(() => {
    const imageUrl = campaign.mainImageUrl; 

    // If there is no image URL, or it doesn't start with "http", do nothing.
    if (!imageUrl || !imageUrl.startsWith("http")) return;

    // Wait 800ms after the user stops typing before calling the backend
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:5000/api/pages/extract-colors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: imageUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update the campaign's primaryColor with the color from the ML service
          setCampaign((currentCampaign) => ({
            ...currentCampaign,
            primaryColor: data.primary,
          }));
        }
      } catch (error) {
        console.error("Error extracting colors from backend:", error);
      }
    }, 300); 

    // If the user types another character before 800ms is up, cancel the previous timer
    return () => clearTimeout(delayDebounceFn);
  }, [campaign.mainImageUrl]);
  // ---------------------------------------------

  const updateCampaignField = (
    field: keyof CampaignFormData,
    value: string,
  ) => {
    setCampaign((currentCampaign) => ({
      ...currentCampaign,
      [field]: value,
    }));

    setStatus(null);
  };

  const validateCampaign = (): string | null => {
    if (!campaign.campaignName.trim()) {
      return "Campaign name is required.";
    }

    if (!campaign.slug.trim()) {
      return "Slug is required.";
    }

    if (!campaign.headlineText.trim()) {
      return "Headline is required.";
    }

    if (!campaign.buttonText.trim()) {
      return "Button text is required.";
    }

    if (!HEX_COLOR_PATTERN.test(campaign.primaryColor)) {
      return "Button color must be a valid hex color.";
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateCampaign();

    if (validationError) {
      setStatus({
        severity: "error",
        message: validationError,
      });

      return;
    }

    try {
      setSaving(true);
      setStatus(null);

      await createCampaign(campaign);

      setStatus({
        severity: "success",
        message: "Campaign saved successfully.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The campaign could not be saved.";

      setStatus({
        severity: "error",
        message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        display: "grid",

        // Equal-width split screen on desktop.
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
        },

        minHeight: "100vh",
      }}
    >
      <CampaignForm
        campaign={campaign}
        saving={saving}
        status={status}
        onChange={updateCampaignField}
        onSave={handleSave}
      />

      <LivePreview campaign={campaign} />
    </Box>
  );
}