from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "HirePrep"
    SECRET_KEY: str = "YOUR_SECRET_KEY"  # Default for dev, override in prod
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./hireprep.db"
    
    # CORS - set CORS_ORIGINS as a JSON array in Railway env vars for production
    # e.g. ["https://hire-prep-beta.vercel.app","https://hire-prep-git-master-dastagiri-githubs-projects.vercel.app"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://hire-prep-beta.vercel.app",
        "https://hire-prep-git-master-dastagiri-githubs-projects.vercel.app",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
