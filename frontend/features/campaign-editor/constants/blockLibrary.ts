import type { BlockType, CampaignBlock } from "../types/blocks";

export interface WidgetDefinition {
  type: BlockType;
  label: string;
}

// Order here is the order widgets appear in the palette.
export const WIDGET_LIBRARY: WidgetDefinition[] = [
  { type: "HeroImage", label: "Hero Image" },
  { type: "Headline", label: "Headline" },
  { type: "Button", label: "CTA Button" },
  { type: "CountdownTimer", label: "Countdown Timer" },
  { type: "Paragraph", label: "Text Block" },
];

export function createBlock(type: BlockType): CampaignBlock {
  const id = crypto.randomUUID();

  switch (type) {
    case "Headline":
      return { id, type, text: "New headline", fontSize: 28, color: "#1a1a1a", align: "center" };
    case "Paragraph":
      return { id, type, text: "New paragraph text goes here." };
    case "HeroImage":
      return { id, type, imageUrl: "" };
    case "Button":
      return { id, type, text: "Click me", color: "#d32f2f" };
    case "CountdownTimer":
      return { id, type, endDate: new Date(Date.now() + 86_400_000).toISOString() };
  }
}