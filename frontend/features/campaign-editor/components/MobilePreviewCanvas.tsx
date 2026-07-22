"use client";

import { Box, Paper, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { CampaignBlock } from "../types/blocks";
import SortableBlock from "./blocks/SortableBlock";

interface MobilePreviewCanvasProps {
  blocks: CampaignBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

export default function MobilePreviewCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
}: MobilePreviewCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-dropzone" });

  return (
    <Box
      component="section"
      aria-label="Live campaign preview"
      sx={{
        minHeight: { xs: 720, md: "100%" },
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
            minHeight: 640,
            bgcolor: "#fff",
            border: "8px solid #202124",
            borderRadius: 5,
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
          }}
        >
          <Box
            sx={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, letterSpacing: 1.5 }}
            >
              LUMINA
            </Typography>
          </Box>

          <Box
            ref={setNodeRef}
            sx={{
              minHeight: 500,
              p: 1.5,
              bgcolor: isOver ? "primary.50" : "transparent",
              outline: isOver ? "2px dashed" : "none",
              outlineColor: "primary.main",
              transition: "background-color 120ms ease",
            }}
          >
            {blocks.length === 0 && (
              <Box sx={{ py: 6, textAlign: "center", color: "text.disabled" }}>
                <Typography variant="body2">
                  Drag a widget here to get started
                </Typography>
              </Box>
            )}

            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isSelected={block.id === selectedBlockId}
                  onSelect={onSelectBlock}
                />
              ))}
            </SortableContext>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
