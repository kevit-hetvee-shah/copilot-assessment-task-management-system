# SQLAlchemy session factory, engine, and low-level repository.
# TaskRepository owns every raw DB query; service.py contains only business logic.
import uuid as _uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from config import settings

# Ensure the data directory exists before SQLite tries to open the file
Path(settings.DATABASE_URL.replace("sqlite:///", "")).parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # required for SQLite + FastAPI
    echo=settings.APP_ENV == "development",
)

SessionLocal: sessionmaker[Session] = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """FastAPI dependency that yields a database session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Repository — all raw SQLAlchemy queries live here
# ---------------------------------------------------------------------------

class TaskRepository:
    """Data-access layer for the Task entity.
    Every method opens its own session and closes it in a finally block so
    callers (service.py) never touch the session directly.
    """

    def _session(self) -> Session:
        return SessionLocal()

    # ------------------------------------------------------------------
    # Reads
    # ------------------------------------------------------------------

    def get_all(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
    ):
        """Return all TaskModel rows, with optional equality filters."""
        from src.models import TaskModel  # local import avoids circular dependency

        db = self._session()
        try:
            query = db.query(TaskModel)
            if status is not None:
                query = query.filter(TaskModel.status == status)
            if priority is not None:
                query = query.filter(TaskModel.priority == priority)
            return query.order_by(TaskModel.createdAt.desc()).all()
        finally:
            db.close()

    def get_by_id(self, task_id: str):
        """Return a single TaskModel by its string UUID, or None if not found."""
        from src.models import TaskModel

        db = self._session()
        try:
            return db.query(TaskModel).filter(TaskModel.id == task_id).first()
        finally:
            db.close()

    def get_all_rows(self):
        """Return every TaskModel row (used for stats aggregation)."""
        from src.models import TaskModel

        db = self._session()
        try:
            return db.query(TaskModel).all()
        finally:
            db.close()

    # ------------------------------------------------------------------
    # Writes
    # ------------------------------------------------------------------

    def insert(
        self,
        title: str,
        description: Optional[str],
        status: str,
        priority: str,
    ):
        """Insert a new task row and return the persisted TaskModel."""
        from src.models import TaskModel

        db = self._session()
        try:
            now = datetime.now(timezone.utc)
            row = TaskModel(
                id=str(_uuid.uuid4()),
                title=title,
                description=description,
                status=status,
                priority=priority,
                createdAt=now,
                updatedAt=now,
            )
            db.add(row)
            db.commit()
            db.refresh(row)
            return row
        finally:
            db.close()

    def update(self, task_id: str, fields: dict):
        """Apply a dict of column→value updates to a task row.
        Returns the updated TaskModel, or None if not found.
        """
        from src.models import TaskModel

        db = self._session()
        try:
            row = db.query(TaskModel).filter(TaskModel.id == task_id).first()
            if row is None:
                return None
            for key, value in fields.items():
                setattr(row, key, value)
            row.updatedAt = datetime.now(timezone.utc)
            db.commit()
            db.refresh(row)
            return row
        finally:
            db.close()

    def delete(self, task_id: str) -> bool:
        """Delete a task row. Returns True if deleted, False if not found."""
        from src.models import TaskModel

        db = self._session()
        try:
            row = db.query(TaskModel).filter(TaskModel.id == task_id).first()
            if row is None:
                return False
            db.delete(row)
            db.commit()
            return True
        finally:
            db.close()


# Module-level singleton — import and use in service.py
task_repo = TaskRepository()
