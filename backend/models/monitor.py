from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.db.session import Base
from backend.models.utc_datetime import UTCDateTime


class Monitor(Base):
    __tablename__ = "monitors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    method = Column(String, default="GET")
    interval = Column(Integer, default=60)
    headers = Column(Text, nullable=True)
    body = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(UTCDateTime, default=datetime.now(timezone.utc))

    owner = relationship("User", back_populates="monitors")
    results = relationship(
        "PingResult", back_populates="monitor", cascade="all, delete-orphan"
    )
