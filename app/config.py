import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PORT: int = 8000
    DATABASE_URL: str = Field(default="sqlite:///./resumes.db")
    GEMINI_API_KEY: str = Field(default="")
    SECRET_KEY: str = Field(default="antigravity_secret_session_key_2026")
    UPLOAD_DIR: str = Field(default="uploads")

# Instantiate settings
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
