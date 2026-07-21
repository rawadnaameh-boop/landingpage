import logging

from fastapi import APIRouter, HTTPException

from models.urgency_models import (
    UrgencyScoreRequest,
    UrgencyScoreResponse,
)
from services.urgency_service import (
    score_headline_urgency,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Urgency Scoring"],
)


@router.post(
    "/score-urgency",
    response_model=UrgencyScoreResponse,
)
def score_urgency(
    request: UrgencyScoreRequest,
) -> UrgencyScoreResponse:
    headline = request.headline.strip()

    if not headline:
        raise HTTPException(
            status_code=400,
            detail="Headline cannot be empty.",
        )

    try:
        return score_headline_urgency(headline)

    except Exception:
        logger.exception(
            "An error occurred while scoring headline urgency."
        )

        raise HTTPException(
            status_code=500,
            detail="The urgency model could not analyze the headline.",
        )