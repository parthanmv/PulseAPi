from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from backend.db.session import Base
from backend.models.utc_datetime import UTCDateTime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(UTCDateTime, default=datetime.now(timezone.utc))

    monitors = relationship(
        "Monitor", back_populates="owner", cascade="all, delete-orphan"
    )
