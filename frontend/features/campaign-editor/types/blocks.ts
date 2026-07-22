export type BlockType =
  | "Headline"
  | "Paragraph"
  | "HeroImage"
  | "Button"
  | "CountdownTimer";

interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadlineBlock extends BaseBlock {
  type: "Headline";
  text: string;
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
}

export interface ParagraphBlock extends BaseBlock {
  type: "Paragraph";
  text: string;
}

export interface HeroImageBlock extends BaseBlock {
  type: "HeroImage";
  imageUrl: string;
}

export interface ButtonBlock extends BaseBlock {
  type: "Button";
  text: string;
  color: string;
}

export interface CountdownTimerBlock extends BaseBlock {
  type: "CountdownTimer";
  endDate: string; // ISO-8601
}

export type CampaignBlock =
  | HeadlineBlock
  | ParagraphBlock
  | HeroImageBlock
  | ButtonBlock
  | CountdownTimerBlock;

// Union of every optional field across block types, so a single
// onChange(id, updates) signature works for any selected block.
export type BlockUpdate =
  Partial<Omit<HeadlineBlock, "id" | "type">> &
  Partial<Omit<ParagraphBlock, "id" | "type">> &
  Partial<Omit<HeroImageBlock, "id" | "type">> &
  Partial<Omit<ButtonBlock, "id" | "type">> &
  Partial<Omit<CountdownTimerBlock, "id" | "type">>;
  