# DB utility — low-level JSON file read/write helpers.
# All functions operate on the file path supplied via settings.DB_FILE_PATH.
import json
import uuid
from pathlib import Path
from typing import Any


def _load_raw(db_path: Path) -> list[dict]:
    """Read and deserialise the JSON datastore.  Returns an empty list on any read error."""
    try:
        with open(db_path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _save_raw(db_path: Path, data: list[dict]) -> None:
    """Serialise and persist the task list to the JSON datastore."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with open(db_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, default=str)


def load_tasks(db_path: Path) -> list[dict]:
    """Return all tasks from the datastore as a list of dicts."""
    return _load_raw(db_path)


def save_tasks(db_path: Path, tasks: list[dict]) -> None:
    """Persist the full task list to the datastore."""
    _save_raw(db_path, tasks)


def find_task_by_id(db_path: Path, task_id: str) -> dict | None:
    """Return the task dict matching task_id, or None if not found."""
    return next((t for t in load_tasks(db_path) if t["id"] == task_id), None)


def upsert_task(db_path: Path, task: dict) -> None:
    """Insert a new task or replace an existing one (matched by id)."""
    tasks = load_tasks(db_path)
    idx = next((i for i, t in enumerate(tasks) if t["id"] == task["id"]), None)
    if idx is None:
        tasks.append(task)
    else:
        tasks[idx] = task
    save_tasks(db_path, tasks)


def delete_task_by_id(db_path: Path, task_id: str) -> bool:
    """Remove the task with the given id.  Returns True if deleted, False if not found."""
    tasks = load_tasks(db_path)
    filtered = [t for t in tasks if t["id"] != task_id]
    if len(filtered) == len(tasks):
        return False
    save_tasks(db_path, filtered)
    return True
