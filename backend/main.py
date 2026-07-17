import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from alembic.config import Config
from alembic import command

from backend.api.auth import router as auth_router
from backend.api.monitors import router as monitors_router
from backend.scheduler.scheduler import start_scheduler

logger = logging.getLogger(__name__)


def run_migrations():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    logger.info("Alembic migrations up to date.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_migrations()
    scheduler_task = asyncio.create_task(start_scheduler())
    yield
    scheduler_task.cancel()
    try:
        await scheduler_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="PulseAPI Backend",
    description="PulseAPI core performance monitoring services API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        #Render frontent url
        "https://pulseapi-frontend.onrender.com",
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(monitors_router)


@app.get("/")
def read_root():
    return {"message": "PulseAPI Backend Running"}
