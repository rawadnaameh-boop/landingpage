"use client";

import type { ReactElement } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import TitleRoundedIcon from "@mui/icons-material/TitleRounded";
import SmartButtonRoundedIcon from "@mui/icons-material/SmartButtonRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import type { BlockType } from "../types/blocks";
import { WIDGET_LIBRARY } from "../constants/blockLibrary";

const ICONS: Record<BlockType, ReactElement> = {
  HeroImage: <ImageRoundedIcon />,
  Headline: <TitleRoundedIcon />,
  Button: <SmartButtonRoundedIcon />,
  CountdownTimer: <TimerRoundedIcon />,
  Paragraph: <NotesRoundedIcon />,
};

export function WidgetCard({
  type,
  label,
}: {
  type: BlockType;
  label: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {ICONS[type]}
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, textAlign: "center" }}
      >
        {label}
      </Typography>
    </Paper>
  );
}

function PaletteItem({ type, label }: { type: BlockType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { origin: "palette", blockType: type },
  });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        cursor: "grab",
        opacity: isDragging ? 0.4 : 1,
        "&:hover .MuiPaper-root": {
          borderColor: "primary.main",
          bgcolor: "grey.50",
        },
      }}
    >
      <WidgetCard type={type} label={label} />
    </Box>
  );
}

export default function BlockPalette() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Elements
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 2 }}
      >
        Drag and drop to build
      </Typography>
      <Stack 
      sx={{direction:"row", flexWrap:"wrap", gap:1.5,}}>
        {WIDGET_LIBRARY.map((widget) => (
          <Box key={widget.type} sx={{ width: "calc(50% - 6px)" }}>
            <PaletteItem type={widget.type} label={widget.label} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
