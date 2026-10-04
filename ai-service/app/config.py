from pydantic_settings import BaseSettings

# This class reads variables from .env automatically.
# Think of it like a typed version of process.env in Node.
class Settings(BaseSettings):
    port: int = 8000
    internal_api_key: str
    gemini_api_key: str
    gemini_model: str
    express_base_url: str = "http://localhost:5000"

    class Config:
        env_file = ".env"

settings = Settings()