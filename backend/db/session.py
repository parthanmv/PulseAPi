from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Configure connection pool for better concurrency
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_size=20,           # Base pool size
    max_overflow=40,        # Allow up to 40 overflow connections
    pool_recycle=3600,      # Recycle connections every hour (prevents timeout)
    pool_pre_ping=True,     # Test connections before using (detects stale connections)
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
