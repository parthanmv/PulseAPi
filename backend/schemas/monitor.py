from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MonitorBase(BaseModel):
    name: str
    url: str
    method: str = "GET"
    interval: int = 60
    headers: Optional[dict | str] = None
    body: Optional[str] = None


class MonitorCreate(MonitorBase):
    pass


class MonitorUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    method: Optional[str] = None
    interval: Optional[int] = None
    headers: Optional[dict | str] = None
    body: Optional[str] = None
    is_active: Optional[bool] = None


class MonitorResponse(MonitorBase):
    id: int
    is_active: bool
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MonitorStatsResponse(BaseModel):
    monitor: MonitorResponse
    current_status: Optional[str] = None
    uptime_pct: float = 0.0
    avg_response_time: float = 0.0
    last_checked: Optional[datetime] = None
