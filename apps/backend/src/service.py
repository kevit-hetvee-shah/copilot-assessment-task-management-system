# Business logic for the Task domain.
# All CRUD operations and status-workflow enforcement live here.
# Raw DB access is fully delegated to TaskRepository in libs/utils/database.py.
from __future__ import annotations

import uuid
from typing import Optional, Dict

from fastapi import HTTPException, status

from libs.utils.database import task_repo
from src.dto import TaskCreate, TaskOut, TaskPriority, TaskStatus, TaskUpdate
from src.models import TaskModel

# Status transition map — defines the only legal forward move for each status
_NEXT_STATUS: Dict[TaskStatus, TaskStatus] = {
    TaskStatus.todo: TaskStatus.in_progress,
    TaskStatus.in_progress: TaskStatus.done,
}


def _to_task_out(model: TaskModel) -> TaskOut:
    """Convert a TaskModel ORM instance to a TaskOut response schema."""
    return TaskOut(
        id=uuid.UUID(model.id),
        title=model.title,
        description=model.description,
        status=TaskStatus(model.status),
        priority=TaskPriority(model.priority),
        createdAt=model.createdAt,
        updatedAt=model.updatedAt,
    )


def _require_row(row: TaskModel | None, task_id: uuid.UUID) -> TaskModel:
    """Raise 404 if the repository returned None for the given task ID."""
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found",
        )
    return row


class TaskService:
    """Pure business-logic layer. All persistence is handled by TaskRepository."""

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def list(
        self,
        status: Optional[TaskStatus] = None,
        priority: Optional[TaskPriority] = None,
    ) -> list[TaskOut]:
        """Return all tasks, optionally filtered by status and/or priority."""
        rows = task_repo.get_all(
            status=status.value if status else None,
            priority=priority.value if priority else None,
        )
        return [_to_task_out(row) for row in rows]

    def get_by_id(self, task_id: uuid.UUID) -> TaskOut:
        """Return a single task by ID. Raises 404 if not found."""
        row = _require_row(task_repo.get_by_id(str(task_id)), task_id)
        return _to_task_out(row)

    def get_stats(self) -> dict:
        """Return task counts grouped by status and priority."""
        rows = task_repo.get_all_rows()
        stats: dict = {
            "total": len(rows),
            "by_status": {s.value: 0 for s in TaskStatus},
            "by_priority": {p.value: 0 for p in TaskPriority},
        }
        for row in rows:
            stats["by_status"][row.status] += 1
            stats["by_priority"][row.priority] += 1
        return stats

    # ------------------------------------------------------------------
    # Mutations
    # ------------------------------------------------------------------

    def create(self, payload: TaskCreate) -> TaskOut:
        """Create and persist a new task."""
        row = task_repo.insert(
            title=payload.title,
            description=payload.description,
            status=payload.status.value,
            priority=payload.priority.value,
        )
        return _to_task_out(row)

    def update(self, task_id: uuid.UUID, payload: TaskUpdate) -> TaskOut:
        """Update an existing task. Raises 404 if not found."""
        fields = {k: v.value if hasattr(v, "value") else v
                  for k, v in payload.model_dump(exclude_none=True).items()}
        row = _require_row(task_repo.update(str(task_id), fields), task_id)
        return _to_task_out(row)

    def delete(self, task_id: uuid.UUID) -> None:
        """Delete a task. Raises 404 if not found."""
        deleted = task_repo.delete(str(task_id))
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task {task_id} not found",
            )

    def complete(self, task_id: uuid.UUID) -> TaskOut:
        """Advance a task through the status workflow (todo→in-progress→done).
        Raises 422 if the task is already done.
        """
        row = _require_row(task_repo.get_by_id(str(task_id)), task_id)
        current = TaskStatus(row.status)
        next_status = _NEXT_STATUS.get(current)
        if next_status is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Task is already '{current.value}' — no further transitions allowed",
            )
        updated = task_repo.update(str(task_id), {"status": next_status.value})
        return _to_task_out(updated)


# Module-level singleton — import and use directly in routes
task_service = TaskService()
