import os
from pathlib import Path

from dotenv import load_dotenv


# Locate the project directory containing main.py and .env.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load the .env file even if Uvicorn is started
# from a slightly different working directory.
load_dotenv(BASE_DIR / ".env")


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
)