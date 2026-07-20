from fastapi import APIRouter, HTTPException

from models.copy_models import (
    GenerateCopyRequest,
    GenerateCopyResponse,
)
from services.copy_generation_service import (
    CopyGenerationError,
    CopyServiceNotConfiguredError,
    generate_copy_for_topic,
)


router = APIRouter(
    tags=["AI Copy Generation"],
)


@router.post(
    "/generate-copy",
    response_model=GenerateCopyResponse,
)
def generate_copy(
    request: GenerateCopyRequest,
) -> GenerateCopyResponse:
    topic = request.topic.strip()

    if len(topic) < 2:
        raise HTTPException(
            status_code=400,
            detail=(
                "Topic must contain at least "
                "2 non-space characters."
            ),
        )

    try:
        return generate_copy_for_topic(topic)

    except CopyServiceNotConfiguredError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    except CopyGenerationError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error