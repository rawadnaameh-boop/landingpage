import logging
from typing import Any

from fastapi import APIRouter, HTTPException, status

from models.page_layout_models import (
    CampaignBlock,
    GeneratePageLayoutRequest,
)
from services.page_layout_service import (
    generate_page_layout as generate_layout_service,
)


logger = logging.getLogger(__name__)

router = APIRouter(tags=["AI Page Layout"])


@router.post(
    "/generate-page-layout",
    response_model=list[CampaignBlock],
    status_code=status.HTTP_200_OK,
)
def generate_page_layout_endpoint(
    request: GeneratePageLayoutRequest,
) -> list[dict[str, Any]]:
    """
    Generate a complete landing-page block array from a marketer's prompt.
    """

    try:
        return generate_layout_service(request.prompt)

    except ValueError as error:
        # Invalid prompt or generated layout that violates conversion rules.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    except RuntimeError as error:
        # Groq failed, returned invalid JSON, or returned the wrong schema.
        logger.exception("The AI page-layout service failed.")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI could not generate the page layout. Please try again.",
        ) from error

    except Exception as error:
        logger.exception("Unexpected page-layout generation error.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating the page.",
        ) from error