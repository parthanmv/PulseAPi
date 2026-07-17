import logging
import random
from datetime import datetime, timedelta, timezone

import bcrypt
import resend
from jose import jwt

from backend.config import settings

logger = logging.getLogger(__name__)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(
    data: dict, expires_delta: timedelta | None = None
) -> str:
    payload = data.copy()
    delta = expires_delta or timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    expire = datetime.now(timezone.utc) + delta
    payload.update({"exp": expire})
    return jwt.encode(
        payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def hash_otp(otp: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(otp.encode("utf-8"), salt).decode("utf-8")


def verify_otp(otp: str, otp_hash: str) -> bool:
    try:
        return bcrypt.checkpw(otp.encode("utf-8"), otp_hash.encode("utf-8"))
    except Exception:
        return False


def send_otp_email(email: str, otp: str):
    if not settings.RESEND_API_KEY:
        print(f"\n[DEV MODE] OTP for {email}: {otp}\n")
        return True, None

    try:
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send(
            {
                "from": settings.RESEND_FROM_EMAIL,
                "to": email,
                "subject": "Your PulseAPI Verification Code",
                "html": f"""
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; width: 40px; height: 40px; background: #2563EB; border-radius: 8px; color: #fff; font-weight: 800; font-size: 1.3rem; line-height: 40px;">P</div>
                    </div>
                    <h1 style="text-align: center; font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; color: #111827;">Verify your email</h1>
                    <p style="text-align: center; color: #6B7280; font-size: 0.95rem; margin-bottom: 28px;">Enter this code to complete your PulseAPI registration.</p>
                    <div style="text-align: center; padding: 24px; background: #F8F9FA; border-radius: 12px; border: 1px solid #E5E7EB;">
                        <div style="font-size: 2.5rem; font-weight: 800; letter-spacing: 8px; color: #111827;">{otp}</div>
                    </div>
                    <p style="text-align: center; color: #9CA3AF; font-size: 0.8rem; margin-top: 24px;">This code expires in 5 minutes.</p>
                </div>
                """,
            }
        )
        return True, None
    except Exception as e:
        msg = f"Failed to send OTP email to {email}: {e}"
        logger.error(msg)
        return False, msg
