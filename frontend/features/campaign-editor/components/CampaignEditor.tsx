"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

import {
  createCampaign,
  getCampaignBySlug,
  updateCampaign,
} from "../api/campaignApi";
import { generateCampaignCopy } from "../api/copyGenerationApi";
import { DEFAULT_CAMPAIGN } from "../constants/defaultCampaign";

import type { CampaignFormData, SaveStatus } from "../types/campaign";

import CampaignForm from "./CampaignForm";
import LivePreview from "./LivePreview";

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

interface CampaignEditorProps {
  initialSlug?: string | null;
}

interface StoredPageConfig {
  headlineText?: string;
  subheadlineText?: string;
  mainImageUrl?: string;
  primaryColor?: string;
  buttonText?: string;
}

/**
 * Safely converts the backend PageConfig JSON string
 * into an object that the editor can use.
 */
function parsePageConfig(pageConfig: string): StoredPageConfig {
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

    return parsedValue as StoredPageConfig;
  } catch {
    return {};
  }
}

export default function CampaignEditor({
  initialSlug = null,
}: CampaignEditorProps) {
  const router = useRouter();

  const [campaign, setCampaign] = useState<CampaignFormData>({
    ...DEFAULT_CAMPAIGN,
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loadingCampaign, setLoadingCampaign] = useState(Boolean(initialSlug));

  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<SaveStatus>(null);
  const [topic, setTopic] = useState("");

  const [generatingCopy, setGeneratingCopy] = useState(false);
  // --- AUTOMATIC COLOR EXTRACTION (ML LOOP) ---
  useEffect(() => {
    const imageUrl = campaign.mainImageUrl;

    // If there is no image URL, or it doesn't start with "http", do nothing.
    if (!imageUrl || !imageUrl.startsWith("http")) return;

    // Wait 800ms after the user stops typing before calling the backend
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          "http://localhost:5101/api/pages/extract-colors",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: imageUrl }),
          },
        );

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

  useEffect(() => {
    const slugToLoad = initialSlug?.trim();
    if (!slugToLoad) {
      setEditingId(null);
      setLoadingCampaign(false);
      return;
    }

    let cancelled = false;

    async function loadExistingCampaign() {
      try {
        setLoadingCampaign(true);
        setStatus(null);

        const page = await getCampaignBySlug(slugToLoad!);

        if (cancelled) {
          return;
        }

        const config = parsePageConfig(page.pageConfig);
        setEditingId(page.id);

        setCampaign({
          campaignName: page.campaignName,
          slug: page.slug,

          headlineText: config.headlineText ?? "",

          subheadlineText: config.subheadlineText ?? "",

          mainImageUrl: config.mainImageUrl ?? "",

          primaryColor: config.primaryColor ?? "#d32f2f",

          buttonText: config.buttonText ?? "SUBSCRIBE & PLAY",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setEditingId(null);

        setStatus({
          severity: "error",
          message:
            error instanceof Error
              ? error.message
              : "The campaign could not be loaded.",
        });
      } finally {
        if (!cancelled) {
          setLoadingCampaign(false);
        }
      }
    }

    void loadExistingCampaign();

    return () => {
      cancelled = true;
    };
  }, [initialSlug]);

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
  const handleGenerateCopy = async () => {
    const normalizedTopic = topic.trim();

    if (!normalizedTopic) {
      setStatus({
        severity: "error",
        message: "Enter a topic before generating copy.",
      });

      return;
    }

    if (normalizedTopic.length > 100) {
      setStatus({
        severity: "error",
        message: "Topic cannot exceed 100 characters.",
      });

      return;
    }

    try {
      setGeneratingCopy(true);
      setStatus(null);

      const generatedCopy = await generateCampaignCopy(normalizedTopic);

      /*
       * Replace the existing headline and subheadline.
       * The form and preview both use this same campaign state.
       */
      setCampaign((currentCampaign) => ({
        ...currentCampaign,
        headlineText: generatedCopy.headline,
        subheadlineText: generatedCopy.subheadline,
      }));

      setStatus({
        severity: "success",
        message:
          "AI copy generated successfully. You can edit it before saving.",
      });
    } catch (error) {
      setStatus({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "The copy could not be generated.",
      });
    } finally {
      setGeneratingCopy(false);
    }
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

      if (editingId !== null) {
        // Update an existing campaign.
        await updateCampaign(editingId, campaign);
      } else {
        // Create a new campaign.
        await createCampaign(campaign);
      }

      /*
       * After the API request succeeds,
       * navigate back to the dashboard.
       */
      router.push("/dashboard");
    } catch (error) {
      setStatus({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "The campaign could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingCampaign) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <CircularProgress />

          <Typography color="text.secondary">Loading campaign...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
        },

        minHeight: "100vh",
      }}
    >
      {/* <CampaignForm
        campaign={campaign}
        saving={saving}
        status={status}
        onChange={updateCampaignField}
        onSave={handleSave}
      /> */}
      <CampaignForm
        campaign={campaign}
        saving={saving}
        status={status}
        topic={topic}
        generatingCopy={generatingCopy}
        onTopicChange={(value) => {
          setTopic(value);
          setStatus(null);
        }}
        onGenerateCopy={handleGenerateCopy}
        onChange={updateCampaignField}
        onSave={handleSave}
      />
      <LivePreview campaign={campaign} />
    </Box>
  );
}
