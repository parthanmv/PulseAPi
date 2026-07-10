from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PingResultResponse(BaseModel):
    id: int
    monitor_id: int
    status_code: Optional[int] = None
    response_time: Optional[float] = None
    is_up: bool
    timestamp: datetime

    class Config:
        from_attributes = True
