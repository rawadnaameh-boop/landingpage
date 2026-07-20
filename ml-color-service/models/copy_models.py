from pydantic import BaseModel, Field


class GenerateCopyRequest(BaseModel):
    topic: str = Field(
        min_length=2,
        max_length=100,
        examples=["Fitness App"],
    )


class GenerateCopyResponse(BaseModel):
    headline: str = Field(
        min_length=2,
        max_length=70,
    )

    subheadline: str = Field(
        min_length=5,
        max_length=180,
    )