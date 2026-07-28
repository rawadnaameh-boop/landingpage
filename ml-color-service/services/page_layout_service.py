from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any

from dotenv import load_dotenv
from groq import Groq
from pydantic import ValidationError

from models.page_layout_models import PageLayoutResponse
from prompts.page_layout_prompt import (
    PAGE_LAYOUT_SYSTEM_PROMPT,
    build_page_layout_user_prompt,
)


load_dotenv()


# This model supports Groq strict structured output.
PAGE_LAYOUT_MODEL = os.getenv(
    "GROQ_PAGE_LAYOUT_MODEL",
    "openai/gpt-oss-20b",
)


URGENCY_TERMS = (
    "sale",
    "discount",
    "flash sale",
    "limited time",
    "limited-time",
    "deadline",
    "urgent",
    "urgency",
    "ending soon",
    "ends soon",
    "24 hour",
    "24-hour",
    "today only",
    "last chance",
)


@lru_cache
def get_groq_client() -> Groq:
    """
    Create one Groq client and reuse it for future requests.
    """

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Add it to the Python service .env file."
        )

    return Groq(api_key=api_key)


def prompt_requires_countdown(marketer_prompt: str) -> bool:
    """
    Check whether the marketer's prompt implies urgency or a deadline.
    """

    normalized_prompt = marketer_prompt.lower()

    return any(term in normalized_prompt for term in URGENCY_TERMS)


def validate_conversion_rules(
    layout: PageLayoutResponse,
    marketer_prompt: str,
) -> None:
    """
    Pydantic validates the JSON shape.

    This function validates business rules that JSON Schema alone
    cannot fully enforce, such as block order.
    """

    blocks = layout.blocks
    block_types = [block.type for block in blocks]
    block_ids = [block.id for block in blocks]

    if len(blocks) < 4:
        raise ValueError("The generated page must contain at least four blocks.")
    if len(blocks) > 12:
        raise ValueError("The generated page cannot contain more than twelve blocks.")
    if blocks[0].type != "HeroImage":
        raise ValueError("The first generated block must be HeroImage.")

    if blocks[1].type != "Headline":
        raise ValueError("The second generated block must be Headline.")

    if blocks[-1].type != "Button":
        raise ValueError("The final generated block must be Button.")

    required_types = {
        "HeroImage",
        "Headline",
        "Paragraph",
        "Button",
    }

    missing_types = required_types.difference(block_types)

    if missing_types:
        missing = ", ".join(sorted(missing_types))
        raise ValueError(f"The generated page is missing required blocks: {missing}.")

    if len(block_ids) != len(set(block_ids)):
        raise ValueError("Every generated block must have a unique ID.")

    countdown_positions = [
        index
        for index, block in enumerate(blocks)
        if block.type == "CountdownTimer"
    ]

    requires_countdown = prompt_requires_countdown(marketer_prompt)

    if requires_countdown:
        expected_position = len(blocks) - 2

        if countdown_positions != [expected_position]:
            raise ValueError(
                "Urgent campaigns must contain exactly one CountdownTimer "
                "immediately before the final Button."
            )
    elif countdown_positions:
        raise ValueError(
            "A CountdownTimer should not be generated when the prompt "
            "does not mention urgency or a deadline."
        )


def generate_page_layout(marketer_prompt: str) -> list[dict[str, Any]]:
    """
    Send the marketer's prompt to Groq and return a validated block array.
    """

    normalized_prompt = marketer_prompt.strip()

    if not normalized_prompt:
        raise ValueError("The page-generation prompt cannot be empty.")

    client = get_groq_client()

    current_utc = datetime.now(timezone.utc).isoformat()

    user_prompt = (
        f"{build_page_layout_user_prompt(normalized_prompt)}\n\n"
        f"Current UTC datetime: {current_utc}\n"
        "Use this datetime when calculating relative deadlines such as "
        "'24-hour sale'."
    )

    try:
        completion = client.chat.completions.create(
            model=PAGE_LAYOUT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": PAGE_LAYOUT_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            temperature=0.3,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "landing_page_layout",
                    "strict": True,
                    "schema": PageLayoutResponse.model_json_schema(),
                },
            },
        )
    except Exception as error:
        raise RuntimeError(
            f"Groq could not generate the page layout: {error}"
        ) from error

    content = completion.choices[0].message.content

    if not content:
        raise RuntimeError("Groq returned an empty page-layout response.")

    try:
        raw_layout = json.loads(content)
    except json.JSONDecodeError as error:
        raise RuntimeError(
            "Groq returned a response that was not valid JSON."
        ) from error

    try:
        validated_layout = PageLayoutResponse.model_validate(raw_layout)
    except ValidationError as error:
        raise RuntimeError(
            f"The generated layout did not match the block schema: {error}"
        ) from error

    validate_conversion_rules(validated_layout, normalized_prompt)
    apply_safe_headline_colors(validated_layout)
    # Since PageLayoutResponse is a RootModel, model_dump()
    # returns the array directly rather than {"root": [...]}.
    return [
    block.model_dump(mode="json")
    for block in validated_layout.blocks
]

def apply_safe_headline_colors(layout: PageLayoutResponse) -> None:
    """
    Prevent invisible headlines on the editor's light background.
    """

    light_colors = {
        "#FFFFFF",
        "#FFF",
        "#F9FAFB",
        "#F8FAFC",
    }

    for block in layout.blocks:
        if block.type == "Headline":
            normalized_color = block.color.strip().upper()

            if normalized_color in light_colors:
                block.color = "#111827"