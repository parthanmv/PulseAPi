from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime

from backend.db.session import Base
from backend.models.utc_datetime import UTCDateTime


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    expires_at = Column(UTCDateTime, nullable=False)
    attempts = Column(Integer, default=0)
    last_sent_at = Column(UTCDateTime, default=datetime.now(timezone.utc))
    created_at = Column(UTCDateTime, default=datetime.now(timezone.utc))
