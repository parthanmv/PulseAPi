import asyncio
import json
import time
from datetime import datetime, timezone

import httpx

from backend.db.session import SessionLocal
from backend.models.monitor import Monitor
from backend.models.ping_result import PingResult

next_run_times: dict[int, float] = {}


async def perform_ping(
    monitor_id: int,
    url: str,
    method: str,
    headers_str: str = None,
    body: str = None,
):
    headers = {}
    if headers_str:
        try:
            headers = json.loads(headers_str)
        except json.JSONDecodeError:
            pass

    start = time.time()
    status_code = None
    response_time = None
    is_up = False

    try:
        async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
            response = await client.request(
                method, url, headers=headers, content=body
            )
            elapsed = (time.time() - start) * 1000
            status_code = response.status_code
            is_up = 200 <= status_code < 400
            response_time = elapsed
    except Exception:
        response_time = (time.time() - start) * 1000

    db = SessionLocal()
    try:
        db.add(
            PingResult(
                monitor_id=monitor_id,
                status_code=status_code,
                response_time=response_time,
                is_up=is_up,
                timestamp=datetime.now(timezone.utc),
            )
        )
        db.commit()
    except Exception as e:
        print(f"Error saving ping result for monitor {monitor_id}: {e}")
    finally:
        db.close()


async def start_scheduler():
    print("Background monitoring scheduler successfully initialized.")
    while True:
        try:
            db = SessionLocal()
            active_monitors = (
                db.query(Monitor).filter(Monitor.is_active.is_(True)).all()
            )
            db.close()

            now = time.time()
            pending = []

            for monitor in active_monitors:
                next_run = next_run_times.get(monitor.id, 0)
                if now >= next_run:
                    pending.append(
                        perform_ping(
                            monitor_id=monitor.id,
                            url=monitor.url,
                            method=monitor.method,
                            headers_str=monitor.headers,
                            body=monitor.body,
                        )
                    )
                    next_run_times[monitor.id] = now + monitor.interval

            if pending:
                await asyncio.gather(*pending)

        except Exception as e:
            print(f"Scheduler exception: {e}")

        await asyncio.sleep(1)
