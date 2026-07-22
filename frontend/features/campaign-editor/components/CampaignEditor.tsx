"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

import {
  createCampaign,
  getCampaignBySlug,
  parsePageConfigBlocks,
  updateCampaign,
} from "../api/campaignApi";
import { generateCampaignCopy } from "../api/copyGenerationApi";
import { DEFAULT_CAMPAIGN } from "../constants/defaultCampaign";
import { createBlock } from "../constants/blockLibrary";

import type { CampaignFormData, SaveStatus } from "../types/campaign";
import type { BlockType, BlockUpdate, CampaignBlock } from "../types/blocks";

import { renderBlockView } from "./blocks/BlockViews";
import { WidgetCard } from "./BlockPalette";
import BlockPalette from "./BlockPalette";
import MobilePreviewCanvas from "./MobilePreviewCanvas";
import BlockSettingsPanel from "./BlockSettingsPanel";
import UrgencyMeter from "./UrgencyMeter";

interface CampaignEditorProps {
  initialSlug?: string | null;
}

type ActiveDrag =
  | { origin: "palette"; blockType: BlockType }
  | { origin: "canvas"; block: CampaignBlock };

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
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

  // Small activation distance so a plain click (to select a block)
  // isn't misread as a drag start.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

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
        if (cancelled) return;

        setEditingId(page.id);
        setCampaign({
          campaignName: page.campaignName,
          slug: page.slug,
          blocks: parsePageConfigBlocks(page.pageConfig),
        });
      } catch (error) {
        if (cancelled) return;
        setEditingId(null);
        setStatus({
          severity: "error",
          message:
            error instanceof Error
              ? error.message
              : "The campaign could not be loaded.",
        });
      } finally {
        if (!cancelled) setLoadingCampaign(false);
      }
    }

    void loadExistingCampaign();
    return () => {
      cancelled = true;
    };
  }, [initialSlug]);

  const headlineBlock = campaign.blocks.find(
    (b): b is Extract<CampaignBlock, { type: "Headline" }> =>
      b.type === "Headline",
  );
  const heroImageBlock = campaign.blocks.find(
    (b): b is Extract<CampaignBlock, { type: "HeroImage" }> =>
      b.type === "HeroImage",
  );
  const selectedBlock =
    campaign.blocks.find((b) => b.id === selectedBlockId) ?? null;

  const handleDragStart = (event: DragStartEvent) => {
    const origin = event.active.data.current?.origin;

    if (origin === "palette") {
      setActiveDrag({
        origin: "palette",
        blockType: event.active.data.current!.blockType,
      });
      return;
    }

    const block = campaign.blocks.find((b) => b.id === event.active.id);
    if (block) setActiveDrag({ origin: "canvas", block });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over) return;

    const origin = active.data.current?.origin;

    if (origin === "palette") {
      const blockType = active.data.current?.blockType as BlockType | undefined;
      if (!blockType) return;

      const newBlock = createBlock(blockType);

      setCampaign((current) => {
        const overIndex = current.blocks.findIndex((b) => b.id === over.id);
        const nextBlocks = [...current.blocks];
        if (overIndex === -1) {
          nextBlocks.push(newBlock); // dropped on the empty canvas / past the last item
        } else {
          nextBlocks.splice(overIndex, 0, newBlock);
        }
        return { ...current, blocks: nextBlocks };
      });

      setSelectedBlockId(newBlock.id);
      return;
    }

    if (active.id !== over.id) {
      setCampaign((current) => {
        const oldIndex = current.blocks.findIndex((b) => b.id === active.id);
        const newIndex = current.blocks.findIndex((b) => b.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return current;
        return {
          ...current,
          blocks: arrayMove(current.blocks, oldIndex, newIndex),
        };
      });
    }
  };

  const handleBlockChange = (id: string, updates: BlockUpdate) => {
    setCampaign((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === id ? ({ ...block, ...updates } as CampaignBlock) : block,
      ),
    }));
  };

  const handleBlockRemove = (id: string) => {
    setCampaign((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== id),
    }));
    setSelectedBlockId((current) => (current === id ? null : current));
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

    try {
      setGeneratingCopy(true);
      setStatus(null);
      const generatedCopy = await generateCampaignCopy(normalizedTopic);

      setCampaign((current) => {
        const hasHeadline = current.blocks.some((b) => b.type === "Headline");
        const hasParagraph = current.blocks.some((b) => b.type === "Paragraph");

        let nextBlocks = current.blocks.map((block) => {
          if (block.type === "Headline")
            return { ...block, text: generatedCopy.headline };
          if (block.type === "Paragraph")
            return { ...block, text: generatedCopy.subheadline };
          return block;
        });

        if (!hasHeadline) nextBlocks = [createBlock("Headline"), ...nextBlocks];
        if (!hasParagraph)
          nextBlocks = [...nextBlocks, createBlock("Paragraph")];

        return { ...current, blocks: nextBlocks };
      });

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

  const validateCampaign = (): string | null => {
    if (!campaign.campaignName.trim()) return "Campaign name is required.";
    if (!campaign.slug.trim()) return "Slug is required.";
    if (campaign.blocks.length === 0)
      return "Add at least one block before saving.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validateCampaign();
    if (validationError) {
      setStatus({ severity: "error", message: validationError });
      return;
    }

    try {
      setSaving(true);
      setStatus(null);

      if (editingId !== null) {
        await updateCampaign(editingId, campaign);
      } else {
        await createCampaign(campaign);
      }

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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mr: 1 }}>
            Visual Campaign Engine
          </Typography>

          <TextField
            size="small"
            label="Campaign Name"
            value={campaign.campaignName}
            onChange={(e) =>
              setCampaign((c) => ({ ...c, campaignName: e.target.value }))
            }
          />
          <TextField
            size="small"
            label="Slug"
            value={campaign.slug}
            onChange={(e) =>
              setCampaign((c) => ({ ...c, slug: e.target.value }))
            }
          />
          <TextField
            size="small"
            label="AI Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            sx={{ minWidth: 180 }}
          />
          <Button
            variant="outlined"
            size="small"
            disabled={generatingCopy || !topic.trim()}
            startIcon={
              generatingCopy ? (
                <CircularProgress size={14} />
              ) : (
                <AutoAwesomeRoundedIcon fontSize="small" />
              )
            }
            onClick={() => void handleGenerateCopy()}
          >
            Generate
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            component={Link}
            href="/dashboard"
            variant="text"
            startIcon={<DashboardRoundedIcon />}
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveRoundedIcon />
              )
            }
            onClick={() => void handleSave()}
          >
            {saving ? "Saving..." : "Save Layout"}
          </Button>
        </Toolbar>

        {headlineBlock && (
          <Box sx={{ px: 2, pb: 1 }}>
            <UrgencyMeter headline={headlineBlock.text} />
          </Box>
        )}
        {status && (
          <Alert severity={status.severity} sx={{ mx: 2, mb: 1 }}>
            {status.message}
          </Alert>
        )}
      </AppBar>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "260px 1fr 320px" },
          }}
        >
          <Box sx={{ borderRight: "1px solid", borderColor: "divider" }}>
            <BlockPalette />
          </Box>

          <MobilePreviewCanvas
            blocks={campaign.blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
          />

          <Box sx={{ borderLeft: "1px solid", borderColor: "divider" }}>
            <BlockSettingsPanel
              block={selectedBlock}
              heroImageUrl={heroImageBlock?.imageUrl ?? null}
              onChange={handleBlockChange}
              onRemove={handleBlockRemove}
            />
          </Box>
        </Box>

        <DragOverlay>
          {activeDrag?.origin === "palette" && (
            <WidgetCard
              type={activeDrag.blockType}
              label={activeDrag.blockType}
            />
          )}
          {activeDrag?.origin === "canvas" && (
            <Box sx={{ width: 340, opacity: 0.9 }}>
              {renderBlockView(activeDrag.block)}
            </Box>
          )}
        </DragOverlay>
      </DndContext>
    </Box>
  );
}
