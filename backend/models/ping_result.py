from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from backend.db.session import Base
from backend.models.utc_datetime import UTCDateTime


class PingResult(Base):
    __tablename__ = "ping_results"

    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("monitors.id"), nullable=False)
    status_code = Column(Integer, nullable=True)
    response_time = Column(Float, nullable=True)
    is_up = Column(Boolean, nullable=False)
    timestamp = Column(UTCDateTime, default=datetime.now(timezone.utc))

    monitor = relationship("Monitor", back_populates="results")
