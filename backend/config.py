from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent / ".env",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "HirePrep"
    SECRET_KEY: str = "YOUR_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Email
    BREVO_API_KEY: str = ""
    SMTP_FROM: str = "HirePrep"

    # Database
    DATABASE_URL: str = "sqlite:///./hireprep.db"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
print("Loaded GOOGLE_CLIENT_ID:", settings.GOOGLE_CLIENT_ID)