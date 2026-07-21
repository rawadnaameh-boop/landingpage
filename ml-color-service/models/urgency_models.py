from pydantic import BaseModel, Field


class UrgencyScoreRequest(BaseModel):
    headline: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="The marketing headline to analyze",
    )


class UrgencyLabelScores(BaseModel):
    urgent: float
    call_to_action: float
    passive: float
    descriptive: float


class UrgencyScoreResponse(BaseModel):
    score: int
    level: str
    labels: UrgencyLabelScores