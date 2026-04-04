from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "HirePrep"
    SECRET_KEY: str = "YOUR_SECRET_KEY"  # Default for dev, override in prod
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Email (Brevo / Sendinblue API)
    BREVO_API_KEY: str = "" # Set in Railway / .env
    SMTP_FROM: str = "HirePrep"  # e.g. HirePrep <noreply@yourdomain.com>

    # Database
    DATABASE_URL: str = "sqlite:///./hireprep.db"
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""  # Add your Google OAuth Client ID here
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    
    # Execution Engine
    EXECUTION_ENGINE_URL: str = "http://localhost:8080"
    
    # CORS - set CORS_ORIGINS as a JSON array in Railway env vars for production
    # e.g. ["https://hire-prep-beta.vercel.app","https://hire-prep-git-master-dastagiri-githubs-projects.vercel.app"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:8000",  # Backend itself
        "http://127.0.0.1:8000",
        "https://hire-prep-beta.vercel.app",
        "https://hire-prep-git-master-dastagiri-githubs-projects.vercel.app",
        "http://localhost:8080",  # Alternative dev port
        "http://127.0.0.1:8080",
        "http://192.168.68.1:3000",  # Network IP (current user's IP)
        "http://192.168.68.1:3001",
        "http://192.168.68.1:5173",
        "http://192.168.68.1:8080",
        "http://0.0.0.0:3000",  # Docker/container environments
        "http://0.0.0.0:3001",
        "http://0.0.0.0:5173",
        "http://0.0.0.0:8080",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Allow extra fields in .env without validation errors

settings = Settings()
