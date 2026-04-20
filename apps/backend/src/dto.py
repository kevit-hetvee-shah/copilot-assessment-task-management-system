# Data Transfer Objects (DTOs / Pydantic schemas) for the Task domain.
# Separates wire-format validation from the internal domain model.
from enum import Enum
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    """Allowed task statuses — transitions must follow todo → in-progress → done."""
    todo = "todo"
    in_progress = "in-progress"
    done = "done"


class TaskPriority(str, Enum):
    """Allowed task priority levels."""
    low = "low"
    medium = "medium"
    high = "high"


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class TaskCreate(BaseModel):
    """Payload for POST /api/tasks."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.todo)
    priority: TaskPriority = Field(default=TaskPriority.medium)


class TaskUpdate(BaseModel):
    """Payload for PUT /api/tasks/:id — all fields are optional."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None)
    status: Optional[TaskStatus] = Field(default=None)
    priority: Optional[TaskPriority] = Field(default=None)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class TaskOut(BaseModel):
    """Serialised task returned to the client."""
    id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    createdAt: datetime
    updatedAt: datetime

    model_config = {"from_attributes": True}


class APIResponse(BaseModel):
    """Standard response envelope: { success, data }."""
    success: bool
    data: object
