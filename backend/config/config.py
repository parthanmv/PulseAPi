import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

base_dir = Path(__file__).resolve().parent.parent.parent
env_path = base_dir / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pulseapi.db")
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "d7a9b08f4c0627e7f919cf62be44d320857ef51a7e58a5c37894a45a31a9829f",
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    SENDGRID_FROM_EMAIL: str = os.getenv(
        "SENDGRID_FROM_EMAIL", "PulseAPI <noreply@example.com>"
    )
    OTP_EXPIRE_MINUTES: int = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
    OTP_RESEND_SECONDS: int = int(os.getenv("OTP_RESEND_SECONDS", "60"))
    OTP_MAX_ATTEMPTS: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

    class Config:
        extra = "ignore"


settings = Settings()
