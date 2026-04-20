"""
Unit tests for TaskService — all database calls are mocked via task_repo patch.
Tests cover: list, get_by_id, get_stats, create, update, delete, complete.
"""
import uuid
import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from src.service import TaskService
from src.dto import TaskStatus, TaskPriority, TaskCreate, TaskUpdate
from src.models import TaskModel


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

NOW = datetime.now(timezone.utc)
TASK_ID = "550e8400-e29b-41d4-a716-446655440000"


def make_model(**kwargs):
    """Build a MagicMock that looks like a TaskModel row."""
    defaults = {
        "id": TASK_ID,
        "title": "Test Task",
        "description": "Test description",
        "status": "todo",
        "priority": "medium",
        "createdAt": NOW,
        "updatedAt": NOW,
    }
    defaults.update(kwargs)
    m = MagicMock(spec=TaskModel)
    for k, v in defaults.items():
        setattr(m, k, v)
    return m


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_repo():
    """Patch the module-level task_repo singleton used by TaskService."""
    with patch("src.service.task_repo") as mock:
        yield mock


@pytest.fixture
def service():
    return TaskService()


# ---------------------------------------------------------------------------
# list()
# ---------------------------------------------------------------------------

def test_list_returns_all_tasks(mock_repo, service):
    """list() without filters should pass None for both status and priority."""
    mock_repo.get_all.return_value = [make_model(), make_model(id="660e8400-e29b-41d4-a716-446655440000")]
    result = service.list()
    assert len(result) == 2
    mock_repo.get_all.assert_called_once_with(status=None, priority=None)


def test_list_filters_by_status(mock_repo, service):
    """list(status=todo) should call repo with the enum's value."""
    mock_repo.get_all.return_value = [make_model()]
    service.list(status=TaskStatus.todo)
    mock_repo.get_all.assert_called_once_with(status="todo", priority=None)


def test_list_filters_by_priority(mock_repo, service):
    """list(priority=high) should call repo with the enum's value."""
    mock_repo.get_all.return_value = []
    service.list(priority=TaskPriority.high)
    mock_repo.get_all.assert_called_once_with(status=None, priority="high")


def test_list_returns_empty_list(mock_repo, service):
    """list() should return [] when repository returns no rows."""
    mock_repo.get_all.return_value = []
    result = service.list()
    assert result == []


# ---------------------------------------------------------------------------
# get_by_id()
# ---------------------------------------------------------------------------

def test_get_by_id_returns_task_out(mock_repo, service):
    """get_by_id() should return a TaskOut for a known ID."""
    mock_repo.get_by_id.return_value = make_model(title="Specific Task")
    result = service.get_by_id(uuid.UUID(TASK_ID))
    assert result.title == "Specific Task"
    assert str(result.id) == TASK_ID


def test_get_by_id_raises_404_when_not_found(mock_repo, service):
    """get_by_id() should raise HTTPException 404 when repo returns None."""
    mock_repo.get_by_id.return_value = None
    with pytest.raises(HTTPException) as exc:
        service.get_by_id(uuid.UUID(TASK_ID))
    assert exc.value.status_code == 404


# ---------------------------------------------------------------------------
# get_stats()
# ---------------------------------------------------------------------------

def test_get_stats_counts_by_status_and_priority(mock_repo, service):
    """get_stats() should correctly group totals by status and priority."""
    mock_repo.get_all_rows.return_value = [
        make_model(status="todo", priority="high"),
        make_model(status="todo", priority="medium"),
        make_model(status="in-progress", priority="low"),
    ]
    stats = service.get_stats()
    assert stats["total"] == 3
    assert stats["by_status"]["todo"] == 2
    assert stats["by_status"]["in-progress"] == 1
    assert stats["by_status"]["done"] == 0
    assert stats["by_priority"]["high"] == 1
    assert stats["by_priority"]["medium"] == 1
    assert stats["by_priority"]["low"] == 1


# ---------------------------------------------------------------------------
# create()
# ---------------------------------------------------------------------------

def test_create_calls_repo_insert_and_returns_task_out(mock_repo, service):
    """create() should insert a row and return the resulting TaskOut."""
    mock_repo.insert.return_value = make_model(title="New Task", priority="high")
    payload = TaskCreate(title="New Task", priority=TaskPriority.high)
    result = service.create(payload)
    assert result.title == "New Task"
    assert result.priority == TaskPriority.high
    mock_repo.insert.assert_called_once()


# ---------------------------------------------------------------------------
# update()
# ---------------------------------------------------------------------------

def test_update_returns_updated_task_out(mock_repo, service):
    """update() should update fields and return the updated TaskOut."""
    mock_repo.update.return_value = make_model(title="Updated Title", status="in-progress")
    payload = TaskUpdate(title="Updated Title", status=TaskStatus.in_progress)
    result = service.update(uuid.UUID(TASK_ID), payload)
    assert result.title == "Updated Title"
    assert result.status == TaskStatus.in_progress


def test_update_raises_404_when_not_found(mock_repo, service):
    """update() should raise 404 when repo.update returns None."""
    mock_repo.update.return_value = None
    with pytest.raises(HTTPException) as exc:
        service.update(uuid.UUID(TASK_ID), TaskUpdate(title="Whatever"))
    assert exc.value.status_code == 404


# ---------------------------------------------------------------------------
# delete()
# ---------------------------------------------------------------------------

def test_delete_succeeds_when_repo_returns_true(mock_repo, service):
    """delete() should complete without exception when repo.delete returns True."""
    mock_repo.delete.return_value = True
    service.delete(uuid.UUID(TASK_ID))  # no exception
    mock_repo.delete.assert_called_once_with(TASK_ID)


def test_delete_raises_404_when_repo_returns_false(mock_repo, service):
    """delete() should raise 404 when repo.delete returns False (not found)."""
    mock_repo.delete.return_value = False
    with pytest.raises(HTTPException) as exc:
        service.delete(uuid.UUID(TASK_ID))
    assert exc.value.status_code == 404


# ---------------------------------------------------------------------------
# complete() — status workflow
# ---------------------------------------------------------------------------

def test_complete_advances_todo_to_in_progress(mock_repo, service):
    """complete() should advance a 'todo' task to 'in-progress'."""
    mock_repo.get_by_id.return_value = make_model(status="todo")
    mock_repo.update.return_value = make_model(status="in-progress")
    result = service.complete(uuid.UUID(TASK_ID))
    assert result.status == TaskStatus.in_progress
    called_fields = mock_repo.update.call_args[0][1]
    assert called_fields["status"] == "in-progress"


def test_complete_advances_in_progress_to_done(mock_repo, service):
    """complete() should advance an 'in-progress' task to 'done'."""
    mock_repo.get_by_id.return_value = make_model(status="in-progress")
    mock_repo.update.return_value = make_model(status="done")
    result = service.complete(uuid.UUID(TASK_ID))
    assert result.status == TaskStatus.done
    called_fields = mock_repo.update.call_args[0][1]
    assert called_fields["status"] == "done"


def test_complete_raises_422_when_already_done(mock_repo, service):
    """complete() should raise HTTPException 422 for a task already in 'done'."""
    mock_repo.get_by_id.return_value = make_model(status="done")
    with pytest.raises(HTTPException) as exc:
        service.complete(uuid.UUID(TASK_ID))
    assert exc.value.status_code == 422


def test_complete_raises_404_when_task_not_found(mock_repo, service):
    """complete() should raise 404 when the task does not exist."""
    mock_repo.get_by_id.return_value = None
    with pytest.raises(HTTPException) as exc:
        service.complete(uuid.UUID(TASK_ID))
    assert exc.value.status_code == 404

