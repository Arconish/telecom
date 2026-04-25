import os
from pydantic_settings import BaseSettings, SettingsConfigDict

app_env = os.getenv("APP_ENV", "development")


class Settings(BaseSettings):
    app_env: str = "development"
    app_debug: bool = True

    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "network_ops_db"
    db_user: str = "app"
    db_password: str = ""
    database_url: str = ""

    secret_key: str = ""
    access_token_expire_minutes: int = 60

    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=".env.production" if app_env == "production" else ".env.development",
        extra="ignore",
    )

    @property
    def cors_origins(self):
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

    @property
    def resolved_database_url(self):
        if self.database_url:
            return self.database_url
        return (
            f"postgresql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()
