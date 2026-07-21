from functools import lru_cache
from typing import Any

from transformers import pipeline

from models.urgency_models import (
    UrgencyLabelScores,
    UrgencyScoreResponse,
)


MODEL_NAME = "facebook/bart-large-mnli"

URGENT_LABEL = "urgent and time-sensitive"
CALL_TO_ACTION_LABEL = "a direct call to action"
PASSIVE_LABEL = "passive and non-actionable"
DESCRIPTIVE_LABEL = "descriptive rather than action-oriented"

CANDIDATE_LABELS = [
    URGENT_LABEL,
    CALL_TO_ACTION_LABEL,
    PASSIVE_LABEL,
    DESCRIPTIVE_LABEL,
]


@lru_cache(maxsize=1)
def get_urgency_classifier() -> Any:
    """
    Load the Hugging Face model once and reuse it for later requests.
    """

    return pipeline(
        task="zero-shot-classification",
        model=MODEL_NAME,
        device=-1,
    )


def score_headline_urgency(headline: str) -> UrgencyScoreResponse:
    """
    Analyze a marketing headline and return an urgency score from 0 to 100.
    """

    classifier = get_urgency_classifier()

    result = classifier(
        headline,
        candidate_labels=CANDIDATE_LABELS,
        multi_label=True,
        hypothesis_template="This marketing headline is {}.",
    )

    scores_by_label = {
        label: float(score)
        for label, score in zip(
            result["labels"],
            result["scores"],
        )
    }

    urgent_score = scores_by_label.get(
        URGENT_LABEL,
        0.0,
    )

    call_to_action_score = scores_by_label.get(
        CALL_TO_ACTION_LABEL,
        0.0,
    )

    passive_score = scores_by_label.get(
        PASSIVE_LABEL,
        0.0,
    )

    descriptive_score = scores_by_label.get(
        DESCRIPTIVE_LABEL,
        0.0,
    )

    normalized_score = (
        (0.50 * urgent_score)
        + (0.50 * call_to_action_score)
        - (0.30 * passive_score)
        - (0.40 * descriptive_score)
    )

    normalized_score = max(
        0.0,
        min(1.0, normalized_score),
    )

    final_score = round(normalized_score * 100)

    if final_score < 40:
        level = "Passive"
    elif final_score < 70:
        level = "Okay"
    else:
        level = "Highly Actionable"

    return UrgencyScoreResponse(
        score=final_score,
        level=level,
        labels=UrgencyLabelScores(
            urgent=round(urgent_score, 4),
            call_to_action=round(
                call_to_action_score,
                4,
            ),
            passive=round(passive_score, 4),
            descriptive=round(
                descriptive_score,
                4,
            ),
        ),
    )