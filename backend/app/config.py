from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", WORKSPACE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "ScriptForge API"
    database_url: str = "sqlite:///./data/app.db"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # LLM endpoint (llmgate.app or OpenAI direct)
    openai_baseurl: str = "https://api.openai.com/v1"
    apikey: str = ""
    default_model: str = "gpt-4o"
    use_fake_llm: bool = False

    # Legacy field (kept for compatibility)
    openai_api_key: str = ""

    langsmith_tracing: bool = False
    langsmith_api_key: str = ""
    langsmith_project: str = "scriptforge"
    app_env: str = "development"
    max_scenes: int = 20

    @property
    def llm_api_key(self) -> str:
        """Use APIKEY if set, fallback to OPENAI_API_KEY."""
        return self.apikey or self.openai_api_key

    @property
    def database_path(self) -> Path:
        """Resolve DATABASE_URL to a filesystem path for sqlite."""
        prefix = "sqlite:///"
        if not self.database_url.startswith(prefix):
            raise ValueError(
                "Only sqlite DATABASE_URL values are supported, e.g. sqlite:///./data/app.db"
            )

        raw_path = self.database_url[len(prefix):]
        path = Path(raw_path)
        if raw_path.startswith("./"):
            return (BACKEND_DIR / raw_path[2:]).resolve()
        if path.is_absolute():
            return path
        return (BACKEND_DIR / path).resolve()

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
