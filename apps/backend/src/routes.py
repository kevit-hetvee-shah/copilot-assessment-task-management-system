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
    """GET /api/tasks — returns a list of tasks, optionally filtered by status and priority.

    Args:
        status: Optional task status filter (todo | in-progress | done).
        priority: Optional task priority filter (low | medium | high).

    Returns:
        APIResponse: Envelope containing a list of matching TaskOut objects.
    """
    tasks = task_service.list(status=status, priority=priority)
    return JSONResponse({"success": True, "data": [t.model_dump(mode="json") for t in tasks]})

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED, summary="Create a task")
async def create_task(payload: TaskCreate):
    """POST /api/tasks — creates and returns a new task.

    Args:
        payload: Task creation request containing title, description, status, and priority.

    Returns:
        APIResponse: Envelope containing the newly created TaskOut object.

    Raises:
        HTTPException: 400 if title is empty or missing.
        HTTPException: 422 if status or priority value is invalid.
    """
    task = task_service.create(payload=payload)
    return JSONResponse({"success": True, "data": task.model_dump(mode="json")}, status_code=201)


@router.get("/stats", response_model=APIResponse, summary="Task statistics")
async def task_stats():
    """GET /api/tasks/stats — counts grouped by status and priority.

    Returns:
        APIResponse: Envelope containing a dict with total, by_status, and by_priority counts.
    """
    stats = task_service.get_stats()
    return JSONResponse({"success": True, "data": stats})


@router.get("/{task_id}", response_model=APIResponse, summary="Get a task")
async def get_task(task_id: UUID):
    """GET /api/tasks/:id — returns a single task by ID.

    Args:
        task_id: UUID of the task to retrieve.

    Returns:
        APIResponse: Envelope containing the matching TaskOut object.

    Raises:
        HTTPException: 404 if no task with the given ID exists.
    """
    task = task_service.get_by_id(task_id)
    return JSONResponse({"success": True, "data": task.model_dump(mode="json")})


@router.put("/{task_id}", response_model=APIResponse, summary="Update a task")
async def update_task(task_id: UUID, payload: TaskUpdate):
    """PUT /api/tasks/:id — updates and returns the task.

    Args:
        task_id: UUID of the task to update.
        payload: Partial update payload; only provided fields are changed.

    Returns:
        APIResponse: Envelope containing the updated TaskOut object.

    Raises:
        HTTPException: 404 if no task with the given ID exists.
        HTTPException: 422 if an invalid status or priority value is provided.
    """
    task = task_service.update(task_id, payload)
    return JSONResponse({"success": True, "data": task.model_dump(mode="json")})


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a task")
async def delete_task(task_id: UUID):
    """DELETE /api/tasks/:id — removes the task.

    Args:
        task_id: UUID of the task to delete.

    Returns:
        None: 204 No Content on success.

    Raises:
        HTTPException: 404 if no task with the given ID exists.
    """
    task_service.delete(task_id)


@router.post("/{task_id}/complete", response_model=APIResponse, summary="Complete a task")
async def complete_task(task_id: UUID):
    """POST /api/tasks/:id/complete — advances the task status workflow.

    Transitions: todo → in-progress → done. Raises 422 if already done.

    Args:
        task_id: UUID of the task to advance.

    Returns:
        APIResponse: Envelope containing the updated TaskOut object with the new status.

    Raises:
        HTTPException: 404 if no task with the given ID exists.
        HTTPException: 422 if the task is already in the 'done' state.
    """
    task = task_service.complete(task_id)
    return JSONResponse({"success": True, "data": task.model_dump(mode="json")})
