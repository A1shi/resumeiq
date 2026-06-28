import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PORT: int = 8000
    ENVIRONMENT: str = Field(default="development")
    DATABASE_URL: str = Field(default="sqlite:///./resumes.db")
    GEMINI_API_KEY: str = Field(default="")
    BREVO_API_KEY: str = Field(default="")
    SECRET_KEY: str = Field(default="antigravity_secret_session_key_2026")
    UPLOAD_DIR: str = Field(default="uploads")
    
    # SMTP Configuration
    SMTP_HOST: str = Field(default="")
    SMTP_PORT: int = Field(default=587)
    SMTP_USERNAME: str = Field(default="")
    SMTP_PASSWORD: str = Field(default="")
    SMTP_SENDER: str = Field(default="")
    SMTP_USE_TLS: bool = Field(default=True)
    SMTP_USE_SSL: bool = Field(default=False)

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().replace("\r", "").replace("\n", "")
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql://", 1)
        return v

    @field_validator("*", mode="before")
    @classmethod
    def strip_strings(cls, v):
        if isinstance(v, str):
            return v.strip().replace("\r", "").replace("\n", "")
        return v

# Instantiate settings
settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
