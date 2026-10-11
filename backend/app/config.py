from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded securely from environment variables or .env file."""
    neo4j_uri: str = ""
    neo4j_username: str = "neo4j"
    neo4j_password: str = ""

    # Google Gemini Configuration
    gemini_api_key: Optional[str] = None
    llm_api_key: Optional[str] = None
    llm_model: str = "gemini-2.5-flash"

    app_env: str = "development"
    app_port: int = 8000

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def effective_gemini_api_key(self) -> Optional[str]:
        """Return GEMINI_API_KEY if defined, else LLM_API_KEY fallback."""
        key = self.gemini_api_key or self.llm_api_key
        if key and "<your-" not in key and len(key.strip()) > 0:
            return key.strip()
        return None

    @property
    def is_neo4j_configured(self) -> bool:
        return bool(
            self.neo4j_uri
            and self.neo4j_username
            and self.neo4j_password
            and "<your-" not in self.neo4j_uri
            and "<your-" not in self.neo4j_password
        )

    @property
    def is_llm_configured(self) -> bool:
        return bool(self.effective_gemini_api_key)


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton instance of application settings."""
    return Settings()
