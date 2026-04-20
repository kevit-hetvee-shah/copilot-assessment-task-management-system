# SQLAlchemy ORM model for the Task entity.
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime, Enum, String, Text
from sqlalchemy.orm import DeclarativeBase

from src.dto import TaskPriority, TaskStatus


class Base(DeclarativeBase):
    pass


class TaskModel(Base):
    """SQLAlchemy ORM model mapped to the `tasks` table."""

    __tablename__ = "tasks"

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: str = Column(String(200), nullable=False)
    description: Optional[str] = Column(Text, nullable=True)
    status: str = Column(
        Enum(TaskStatus, values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=TaskStatus.todo.value,
    )
    priority: str = Column(
        Enum(TaskPriority, values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=TaskPriority.medium.value,
    )
    createdAt: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updatedAt: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
