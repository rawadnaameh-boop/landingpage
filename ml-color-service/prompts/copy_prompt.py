SYSTEM_PROMPT = """
You are an expert direct-response marketing copywriter.

Generate landing-page copy based only on the topic supplied by the user.

Follow these rules exactly:

1. Write exactly one headline and one subheadline.
2. The headline must contain between 3 and 8 words.
3. The headline must be short, punchy, persuasive, and clear.
4. The subheadline must be one concise, benefit-focused sentence.
5. The subheadline should create appropriate urgency.
6. Do not make false promises, guarantees, or unsupported claims.
7. Do not include greetings, explanations, alternatives, markdown,
   code fences, or commentary.
8. Return only the fields "headline" and "subheadline".
9. Both values must be non-empty strings.
"""


COPY_RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "landing_page_copy",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "headline": {
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 70,
                    "description": (
                        "A short and punchy landing-page "
                        "headline containing 3 to 8 words."
                    ),
                },
                "subheadline": {
                    "type": "string",
                    "minLength": 5,
                    "maxLength": 180,
                    "description": (
                        "One concise, urgent, and "
                        "benefit-focused marketing sentence."
                    ),
                },
            },
            "required": [
                "headline",
                "subheadline",
            ],
            "additionalProperties": False,
        },
    },
}