from typing import Literal, Union

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    """
    Reject fields that are not part of the frontend block schema.
    """

    model_config = ConfigDict(extra="forbid")


class BaseBlock(StrictModel):
    id: str = Field(min_length=1)


class HeadlineBlock(BaseBlock):
    type: Literal["Headline"]
    text: str = Field(min_length=1, max_length=150)
    fontSize: int = Field(ge=16, le=80)
    color: str
    align: Literal["left", "center", "right"]


class ParagraphBlock(BaseBlock):
    type: Literal["Paragraph"]
    text: str = Field(min_length=1, max_length=600)


class HeroImageBlock(BaseBlock):
    type: Literal["HeroImage"]
    imageUrl: str = Field(min_length=1)


class ButtonBlock(BaseBlock):
    type: Literal["Button"]
    text: str = Field(min_length=1, max_length=60)
    color: str


class CountdownTimerBlock(BaseBlock):
    type: Literal["CountdownTimer"]
    endDate: str = Field(min_length=1)


CampaignBlock = Union[
    HeadlineBlock,
    ParagraphBlock,
    HeroImageBlock,
    ButtonBlock,
    CountdownTimerBlock,
]


class GeneratePageLayoutRequest(StrictModel):
    prompt: str = Field(
        min_length=3,
        max_length=1000,
        description="The marketer's description of the landing page.",
    )


class PageLayoutResponse(StrictModel):
    blocks: list[CampaignBlock]

if __name__ == "__main__":
    example = [
        {
            "id": "hero-1",
            "type": "HeroImage",
            "imageUrl": "https://placehold.co/1200x600",
        },
          {
            "id": "headline-1",
            "type": "Headline",
            "text": "Enter the VIP Gaming Experience",
            "fontSize": 48,
            "color": "#FFFFFF",
            "align": "center",
        },
        {
            "id": "paragraph-1",
            "type": "Paragraph",
            "text": "Premium access for serious gamers.",
        },
        {
            "id": "button-1",
            "type": "Button",
            "text": "Join VIP",
            "color": "#7C3AED",
        },
    ]

    validated = PageLayoutResponse.model_validate(example)

    print(validated.model_dump_json(indent=2))
    