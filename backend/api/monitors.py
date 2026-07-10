import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth.deps import get_current_user
from backend.db.session import get_db
from backend.models.monitor import Monitor
from backend.models.ping_result import PingResult
from backend.models.user import User
from backend.scheduler.scheduler import next_run_times
from backend.schemas.monitor import (
    MonitorCreate,
    MonitorResponse,
    MonitorStatsResponse,
    MonitorUpdate,
)
from backend.schemas.ping_result import PingResultResponse

router = APIRouter(prefix="/api/monitors", tags=["monitors"])


def _resolve_monitor(monitor_id: int, user_id: int, db: Session) -> Monitor:
    monitor = (
        db.query(Monitor)
        .filter(Monitor.id == monitor_id, Monitor.user_id == user_id)
        .first()
    )
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found"
        )
    return monitor


def _serialize_headers(headers):
    if isinstance(headers, dict):
        return json.dumps(headers)
    return headers


def _compute_monitor_stats(
    db: Session, monitor: Monitor
) -> MonitorStatsResponse:
    results = (
        db.query(PingResult)
        .filter(PingResult.monitor_id == monitor.id)
        .order_by(PingResult.timestamp.desc())
        .limit(100)
        .all()
    )

    if not monitor.is_active:
        current_status = "inactive"
    elif results:
        current_status = "up" if results[0].is_up else "down"
    else:
        current_status = "unknown"

    uptime_pct = 100.0
    avg_response_time = 0.0
    last_checked = None

    if results:
        total = len(results)
        up_count = sum(1 for r in results if r.is_up)
        uptime_pct = (up_count / total) * 100.0

        valid_latencies = [
            r.response_time for r in results if r.response_time is not None
        ]
        if valid_latencies:
            avg_response_time = sum(valid_latencies) / len(valid_latencies)

        last_checked = results[0].timestamp

    return MonitorStatsResponse(
        monitor=MonitorResponse.model_validate(monitor),
        current_status=current_status,
        uptime_pct=round(uptime_pct, 2),
        avg_response_time=round(avg_response_time, 2),
        last_checked=last_checked,
    )


@router.post(
    "/", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED
)
def create_monitor(
    monitor_in: MonitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = Monitor(
        name=monitor_in.name,
        url=monitor_in.url,
        method=monitor_in.method,
        interval=monitor_in.interval,
        headers=_serialize_headers(monitor_in.headers),
        body=monitor_in.body,
        user_id=current_user.id,
    )
    db.add(monitor)
    db.commit()
    db.refresh(monitor)
    return monitor


@router.get("/", response_model=List[MonitorStatsResponse])
def list_monitors(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Monitor).filter(Monitor.user_id == current_user.id)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Monitor.name.ilike(pattern) | Monitor.url.ilike(pattern)
        )
    monitors = query.all()
    return [_compute_monitor_stats(db, m) for m in monitors]


@router.get("/{monitor_id}", response_model=MonitorStatsResponse)
def get_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = _resolve_monitor(monitor_id, current_user.id, db)
    return _compute_monitor_stats(db, monitor)


@router.put("/{monitor_id}", response_model=MonitorResponse)
def update_monitor(
    monitor_id: int,
    monitor_in: MonitorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = _resolve_monitor(monitor_id, current_user.id, db)
    changes = monitor_in.model_dump(exclude_unset=True)
    if "headers" in changes:
        changes["headers"] = _serialize_headers(changes["headers"])
    for field, value in changes.items():
        setattr(monitor, field, value)
    db.commit()
    db.refresh(monitor)
    return monitor


@router.delete("/{monitor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = _resolve_monitor(monitor_id, current_user.id, db)
    db.delete(monitor)
    db.commit()


@router.post("/{monitor_id}/toggle", response_model=MonitorResponse)
def toggle_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = _resolve_monitor(monitor_id, current_user.id, db)
    monitor.is_active = not monitor.is_active
    db.commit()
    db.refresh(monitor)
    next_run_times.pop(monitor.id, None)
    return monitor


@router.get("/{monitor_id}/history", response_model=List[PingResultResponse])
def get_monitor_history(
    monitor_id: int,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _resolve_monitor(monitor_id, current_user.id, db)
    results = (
        db.query(PingResult)
        .filter(PingResult.monitor_id == monitor_id)
        .order_by(PingResult.timestamp.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(results))
