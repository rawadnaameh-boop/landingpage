import json

from groq import Groq
from pydantic import ValidationError

from config.settings import GROQ_API_KEY, GROQ_MODEL
from models.copy_models import GenerateCopyResponse
from prompts.copy_prompt import (
    COPY_RESPONSE_FORMAT,
    SYSTEM_PROMPT,
)


class CopyGenerationError(Exception):
    """Raised when the AI cannot generate valid copy."""


class CopyServiceNotConfiguredError(Exception):
    """Raised when the Groq API key is missing."""


def get_groq_client() -> Groq:
    if not GROQ_API_KEY:
        raise CopyServiceNotConfiguredError(
            "GROQ_API_KEY is missing from the .env file."
        )

    return Groq(api_key=GROQ_API_KEY)


def generate_copy_for_topic(
    topic: str,
) -> GenerateCopyResponse:
    normalized_topic = topic.strip()

    if len(normalized_topic) < 2:
        raise ValueError(
            "Topic must contain at least 2 characters."
        )

    client = get_groq_client()

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": (
                        "Generate landing-page copy for "
                        f"this topic: {normalized_topic}"
                    ),
                },
            ],
            temperature=0.7,
            response_format=COPY_RESPONSE_FORMAT,
        )

        content = completion.choices[0].message.content

        if not content:
            raise CopyGenerationError(
                "The AI returned an empty response."
            )

        parsed_content = json.loads(content)

        # Using the Pydantic model validates the result again
        # before it is returned by your API.
        generated_copy = GenerateCopyResponse(
            **parsed_content
        )

        return GenerateCopyResponse(
            headline=generated_copy.headline.strip(),
            subheadline=generated_copy.subheadline.strip(),
        )

    except CopyGenerationError:
        raise

    except (
        json.JSONDecodeError,
        ValidationError,
        KeyError,
        IndexError,
    ) as error:
        raise CopyGenerationError(
            "The AI returned copy in an invalid format."
        ) from error

    except Exception as error:
        raise CopyGenerationError(
            "The AI provider could not generate copy."
        ) from error