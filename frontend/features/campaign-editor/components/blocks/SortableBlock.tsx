"use client";

import { Box } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import type { CampaignBlock } from "../../types/blocks";
import { renderBlockView } from "./BlockViews";

interface SortableBlockProps {
  block: CampaignBlock;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function SortableBlock({
  block,
  isSelected,
  onSelect,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { origin: "canvas" },
  });

  return (
    <Box
      ref={setNodeRef}
      onClick={() => onSelect(block.id)}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        position: "relative",
        p: 1.5,
        mb: 1,
        cursor: "pointer",
        border: "2px solid",
        borderColor: isSelected ? "primary.main" : "transparent",
        borderRadius: 1.5,
        opacity: isDragging ? 0.4 : 1,
        "&:hover": { borderColor: isSelected ? "primary.main" : "grey.300" },
      }}
    >
      <Box
        {...attributes}
        {...listeners}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          color: "grey.400",
          cursor: "grab",
          display: "flex",
        }}
      >
        <DragIndicatorRoundedIcon fontSize="small" />
      </Box>
      {renderBlockView(block)}
    </Box>
  );
}
