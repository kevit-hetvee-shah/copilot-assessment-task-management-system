"""
Application configuration using Pydantic BaseSettings.
All environment variables are loaded from a .env file or the environment.
"""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import List

# Root of the monorepo (three levels up from this file)
ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Central app configuration. Override any field via environment variables."""

    # Application
    APP_ENV: str = "development"
    APP_TITLE: str = "Task Management API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "Full-stack Task Management System — FastAPI backend"
    API_PREFIX: str = "/api"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Persistence — JSON (legacy) & SQLite
    DB_FILE_PATH: Path = ROOT_DIR / "data" / "tasks.json"
    DATABASE_URL: str = f"sqlite:///{ROOT_DIR / 'data' / 'tasks.db'}"

    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Singleton instance — import this everywhere
settings = Settings()
