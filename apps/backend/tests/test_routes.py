"""
Integration tests for FastAPI route handlers in routes.py.
TaskService is mocked at src.routes.task_service to avoid DB calls.
"""
from __future__ import annotations

import pytest
from uuid import UUID
from typing import Optional
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from main import app

client = TestClient(app)

TASK_ID = "550e8400-e29b-41d4-a716-446655440000"

TASK_DICT = {
    "id": TASK_ID,
    "title": "Test Task",
    "description": None,
    "status": "todo",
    "priority": "medium",
    "createdAt": "2026-01-01T00:00:00+00:00",
    "updatedAt": "2026-01-01T00:00:00+00:00",
}

STATS_DICT = {
    "total": 3,
    "by_status": {"todo": 2, "in-progress": 1, "done": 0},
    "by_priority": {"low": 1, "medium": 1, "high": 1},
}


def mock_task_out(overrides: Optional[dict] = None):
    """Build a mock TaskOut that returns TASK_DICT from .model_dump(mode='json')."""
    m = MagicMock()
    d = {**TASK_DICT, **(overrides or {})}
    m.model_dump.return_value = d
    return m


# ---------------------------------------------------------------------------
# GET /api/tasks
# ---------------------------------------------------------------------------

def test_list_tasks_returns_200():
    with patch("src.routes.task_service") as svc:
        svc.list.return_value = [mock_task_out()]
        resp = client.get("/api/tasks")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert isinstance(body["data"], list)
    assert len(body["data"]) == 1


def test_list_tasks_with_status_filter():
    with patch("src.routes.task_service") as svc:
        svc.list.return_value = []
        resp = client.get("/api/tasks?status=todo")
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# POST /api/tasks
# ---------------------------------------------------------------------------

def test_create_task_returns_201():
    with patch("src.routes.task_service") as svc:
        svc.create.return_value = mock_task_out()
        resp = client.post("/api/tasks", json={"title": "New Task", "priority": "high"})
    assert resp.status_code == 201
    body = resp.json()
    assert body["success"] is True


def test_create_task_empty_title_returns_422():
    """Pydantic min_length=1 should reject an empty title with 422."""
    resp = client.post("/api/tasks", json={"title": ""})
    assert resp.status_code == 422


def test_create_task_missing_title_returns_422():
    """Pydantic should reject a body with no title field with 422."""
    resp = client.post("/api/tasks", json={"priority": "low"})
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/tasks/stats
# ---------------------------------------------------------------------------

def test_task_stats_returns_200():
    with patch("src.routes.task_service") as svc:
        svc.get_stats.return_value = STATS_DICT
        resp = client.get("/api/tasks/stats")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["total"] == 3


# ---------------------------------------------------------------------------
# GET /api/tasks/{id}
# ---------------------------------------------------------------------------

def test_get_task_by_id_returns_200():
    with patch("src.routes.task_service") as svc:
        svc.get_by_id.return_value = mock_task_out()
        resp = client.get(f"/api/tasks/{TASK_ID}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_get_task_not_found_returns_404():
    with patch("src.routes.task_service") as svc:
        svc.get_by_id.side_effect = HTTPException(status_code=404, detail="Task not found")
        resp = client.get(f"/api/tasks/{TASK_ID}")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# PUT /api/tasks/{id}
# ---------------------------------------------------------------------------

def test_update_task_returns_200():
    with patch("src.routes.task_service") as svc:
        svc.update.return_value = mock_task_out({"title": "Updated"})
        resp = client.put(f"/api/tasks/{TASK_ID}", json={"title": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_update_task_not_found_returns_404():
    with patch("src.routes.task_service") as svc:
        svc.update.side_effect = HTTPException(status_code=404, detail="Task not found")
        resp = client.put(f"/api/tasks/{TASK_ID}", json={"title": "X"})
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /api/tasks/{id}
# ---------------------------------------------------------------------------

def test_delete_task_returns_204():
    with patch("src.routes.task_service") as svc:
        svc.delete.return_value = None
        resp = client.delete(f"/api/tasks/{TASK_ID}")
    assert resp.status_code == 204


def test_delete_task_not_found_returns_404():
    with patch("src.routes.task_service") as svc:
        svc.delete.side_effect = HTTPException(status_code=404, detail="Task not found")
        resp = client.delete(f"/api/tasks/{TASK_ID}")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# POST /api/tasks/{id}/complete
# ---------------------------------------------------------------------------

def test_complete_task_returns_200():
    with patch("src.routes.task_service") as svc:
        svc.complete.return_value = mock_task_out({"status": "in-progress"})
        resp = client.post(f"/api/tasks/{TASK_ID}/complete")
    assert resp.status_code == 200
    assert resp.json()["success"] is True


def test_complete_task_already_done_returns_422():
    with patch("src.routes.task_service") as svc:
        svc.complete.side_effect = HTTPException(
            status_code=422, detail="Task is already 'done'"
        )
        resp = client.post(f"/api/tasks/{TASK_ID}/complete")
    assert resp.status_code == 422


def test_complete_task_not_found_returns_404():
    with patch("src.routes.task_service") as svc:
        svc.complete.side_effect = HTTPException(status_code=404, detail="Task not found")
        resp = client.post(f"/api/tasks/{TASK_ID}/complete")
    assert resp.status_code == 404

