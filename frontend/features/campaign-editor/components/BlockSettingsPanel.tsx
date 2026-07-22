"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ColorizeRoundedIcon from "@mui/icons-material/ColorizeRounded";
import { extractColorsFromImage } from "../api/colorApi";
import type { BlockUpdate, CampaignBlock } from "../types/blocks";

interface BlockSettingsPanelProps {
  block: CampaignBlock | null;
  heroImageUrl: string | null;
  onChange: (id: string, updates: BlockUpdate) => void;
  onRemove: (id: string) => void;
}

export default function BlockSettingsPanel({
  block,
  heroImageUrl,
  onChange,
  onRemove,
}: BlockSettingsPanelProps) {
  const [matchingColor, setMatchingColor] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const handleMatchToImage = async () => {
    if (!block || !heroImageUrl?.trim()) return;

    try {
      setMatchingColor(true);
      setMatchError(null);
      const { primary } = await extractColorsFromImage(heroImageUrl);
      onChange(block.id, { color: primary });
    } catch (error) {
      setMatchError(
        error instanceof Error
          ? error.message
          : "Could not extract a color from the image.",
      );
    } finally {
      setMatchingColor(false);
    }
  };

  if (!block) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Properties
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Select a block in the preview to edit its properties.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Properties
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {block.type} Block
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Stack spacing={2.5}>
        {block.type === "Headline" && (
          <>
            <TextField
              label="Content"
              multiline
              minRows={2}
              value={block.text}
              onChange={(e) => onChange(block.id, { text: e.target.value })}
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Text Alignment
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={block.align}
                onChange={(_, value) =>
                  value && onChange(block.id, { align: value })
                }
                size="small"
              >
                <ToggleButton value="left">Left</ToggleButton>
                <ToggleButton value="center">Center</ToggleButton>
                <ToggleButton value="right">Right</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Font Size ({block.fontSize}px)
              </Typography>
              <Slider
                min={14}
                max={48}
                value={block.fontSize}
                onChange={(_, value) =>
                  onChange(block.id, { fontSize: value as number })
                }
              />
            </Box>
            <TextField
              label="Text Color"
              type="color"
              value={block.color}
              onChange={(e) => onChange(block.id, { color: e.target.value })}
            />
          </>
        )}

        {block.type === "Paragraph" && (
          <TextField
            label="Content"
            multiline
            minRows={4}
            value={block.text}
            onChange={(e) => onChange(block.id, { text: e.target.value })}
          />
        )}

        {block.type === "HeroImage" && (
          <TextField
            label="Image URL"
            value={block.imageUrl}
            placeholder="https://example.com/image.jpg"
            onChange={(e) => onChange(block.id, { imageUrl: e.target.value })}
          />
        )}

        {block.type === "Button" && (
          <>
            <TextField
              label="Button Text"
              value={block.text}
              onChange={(e) => onChange(block.id, { text: e.target.value })}
            />
            <TextField
              label="Button Color"
              type="color"
              value={block.color}
              onChange={(e) => onChange(block.id, { color: e.target.value })}
            />
            <Button
              variant="outlined"
              size="small"
              disabled={matchingColor || !heroImageUrl?.trim()}
              startIcon={
                matchingColor ? (
                  <CircularProgress size={14} />
                ) : (
                  <ColorizeRoundedIcon fontSize="small" />
                )
              }
              onClick={() => void handleMatchToImage()}
            >
              Match Color to Image
            </Button>
            {!heroImageUrl?.trim() && (
              <Typography variant="caption" color="text.secondary">
                Add a Hero Image with a URL to enable color matching.
              </Typography>
            )}
            {matchError && <Alert severity="error">{matchError}</Alert>}
          </>
        )}

        {block.type === "CountdownTimer" && (
          <TextField
            label="Ends At"
            type="datetime-local"
            value={block.endDate.slice(0, 16)}
            onChange={(e) =>
              onChange(block.id, {
                endDate: new Date(e.target.value).toISOString(),
              })
            }
          />
        )}
      </Stack>

      <Button
        fullWidth
        color="error"
        variant="outlined"
        startIcon={<DeleteRoundedIcon />}
        sx={{ mt: 4 }}
        onClick={() => onRemove(block.id)}
      >
        Remove Block
      </Button>
    </Box>
  );
}
