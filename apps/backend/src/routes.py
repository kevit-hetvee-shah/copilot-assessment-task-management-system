# API route definitions for the /tasks resource.
# All routes delegate to TaskService and wrap responses in the standard envelope.

# Create a few routes for tasks like:
# 1. list all tasks that supports optional filters like ?status= and ?priority= .Create a enum for possible status
# and priority values. The response should be a list of tasks wrapped in the standard APIResponse envelope.
# 2. Create a new task with POST /api/tasks. The request body should include title, description, priority, and due_date.
# 3. Get the task counts grouped by status and priority
# 4. Get a single task by ID with GET /api/tasks/:id
# 5. Update a task with PUT /api/tasks/:id
# 6. Delete a task with DELETE /api/tasks/:id
# 7. Mark a task as completed with POST /api/tasks/:id/complete which advances the task status workflow (e.g., from "pending" to "in_progress" to "completed").

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from starlette.responses import JSONResponse

from src.dto import APIResponse, TaskCreate, TaskPriority, TaskStatus, TaskOut, TaskUpdate
from src.service import task_service, TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


# ---------------------------------------------------------------------------
# Route stubs — handlers are intentionally left as pass-through placeholders.
# Business logic will be wired once service.py is implemented.
# ---------------------------------------------------------------------------



# Create a route to list tasks with optional filters for status and priority.
@router.get("", response_model=APIResponse, summary="List tasks")
async def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by task status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by task priority"),
):
    return JSONResponse(TaskService.get_tasks(status, priority))

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED, summary="Create a task")
async def create_task(payload: TaskCreate):
    """POST /api/tasks — creates and returns a new task."""
    return JSONResponse(TaskService.create(payload=payload))


@router.get("/stats", response_model=APIResponse, summary="Task statistics")
async def task_stats():
    """GET /api/tasks/stats — counts grouped by status and priority."""
    return JSONResponse(TaskService.get_stats())


@router.get("/{task_id}", response_model=APIResponse, summary="Get a task")
async def get_task(task_id: UUID):
    """GET /api/tasks/:id — returns a single task by ID."""
    return JSONResponse(TaskService.get_by_id(task_id))


@router.put("/{task_id}", response_model=APIResponse, summary="Update a task")
async def update_task(task_id: UUID, payload: TaskUpdate):
    """PUT /api/tasks/:id — updates and returns the task."""
    return JSONResponse(TaskService.update(task_id, payload))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a task")
async def delete_task(task_id: UUID):
    """DELETE /api/tasks/:id — removes the task."""
    return TaskService.delete(task_id)


@router.post("/{task_id}/complete", response_model=APIResponse, summary="Complete a task")
async def complete_task(task_id: UUID):
    """POST /api/tasks/:id/complete — advances the task status workflow."""
    return JSONResponse(TaskService.complete(task_id))
