import { Box, Button, Typography } from "@mui/material";
import type {
  ButtonBlock,
  CampaignBlock,
  CountdownTimerBlock,
  HeadlineBlock,
  HeroImageBlock,
  ParagraphBlock,
} from "../../types/blocks";

export function HeadlineBlockView({ block }: { block: HeadlineBlock }) {
  return (
    <Typography
      sx={{
        fontSize: block.fontSize,
        color: block.color,
        textAlign: block.align,
        fontWeight: 700,
        lineHeight: 1.2,
      }}
    >
      {block.text || "Headline"}
    </Typography>
  );
}

export function ParagraphBlockView({ block }: { block: ParagraphBlock }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
      {block.text}
    </Typography>
  );
}

export function HeroImageBlockView({ block }: { block: HeroImageBlock }) {
  return (
    <Box
      component="img"
      src={block.imageUrl.trim() || "/images/campaign-placeholder.svg"}
      onError={(event) => {
        event.currentTarget.src = "/images/campaign-placeholder.svg";
      }}
      alt="Hero"
      sx={{
        display: "block",
        width: "100%",
        height: 180,
        objectFit: "cover",
        borderRadius: 1,
      }}
    />
  );
}

export function ButtonBlockView({ block }: { block: ButtonBlock }) {
  return (
    <Button
      variant="contained"
      fullWidth
      sx={{
        bgcolor: block.color,
        color: "#fff",
        "&:hover": { bgcolor: block.color, filter: "brightness(0.9)" },
      }}
    >
      {block.text || "Button"}
    </Button>
  );
}

export function CountdownTimerBlockView({
  block,
}: {
  block: CountdownTimerBlock;
}) {
  return (
    <Box sx={{ textAlign: "center", py: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Offer ends
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {new Date(block.endDate).toLocaleString()}
      </Typography>
    </Box>
  );
}

export function renderBlockView(block: CampaignBlock) {
  switch (block.type) {
    case "Headline":
      return <HeadlineBlockView block={block} />;
    case "Paragraph":
      return <ParagraphBlockView block={block} />;
    case "HeroImage":
      return <HeroImageBlockView block={block} />;
    case "Button":
      return <ButtonBlockView block={block} />;
    case "CountdownTimer":
      return <CountdownTimerBlockView block={block} />;
  }
}
