# Task Management System

A full-stack task management application built with **FastAPI** (backend) and **React + Vite** (frontend), developed as part of the GitHub Copilot Developer Assignment.

---

## 🗂️ Project Structure

```
.
├── apps/
│   ├── backend/                  # FastAPI application
│   │   ├── main.py               # App factory & entry point
│   │   ├── config.py             # Pydantic BaseSettings (env vars)
│   │   ├── requirements.txt
│   │   └── src/
│   │       ├── dto.py            # Pydantic request/response schemas
│   │       ├── routes.py         # APIRouter — all /api/tasks endpoints
│   │       └── service.py        # Business logic & workflow enforcement
│   └── frontend/                 # React + Vite application
│       ├── index.html
│       ├── vite.config.ts        # Dev proxy → FastAPI on :8000
│       ├── tsconfig.json
│       └── src/
│           ├── main.tsx          # React entry point
│           ├── App.tsx           # Root component
│           ├── index.css         # Global styles & design tokens
│           ├── api/tasks.ts      # Axios wrappers for every API endpoint
│           ├── types/task.ts     # TypeScript interfaces (Task, DTOs)
│           ├── hooks/useTasks.ts # Data-fetching hook with loading/error state
│           └── components/
│               ├── Badge.tsx     # Color-coded priority / status badges
│               ├── FilterBar.tsx # Status + priority dropdowns + search input
│               ├── TaskModal.tsx # Add / Edit modal form
│               ├── TaskTable.tsx # Task list table with action buttons
│               └── Toast.tsx     # Auto-dismissing error/success notifications
├── libs/
│   └── utils/
│       ├── db.py                 # JSON file CRUD helpers (load/save/find/delete)
│       └── db_setup.py          # Ensures tasks.json exists on startup
├── data/
│   └── tasks.json               # Persistent task store (auto-created)
├── conftest.py                  # Pytest path setup for monorepo
├── .env.example                 # Environment variable template
├── AGENTS.md                    # Architecture & coding standards for Copilot
├── COPILOT-LOG.md               # Evidence log for all 6 Copilot features
└── agents/
    ├── backend-agent.agent.md
    ├── ui-agent.agent.md
    └── testing-agent.agent.md
```

---

## 🛠️ Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python 3.11+, FastAPI, Uvicorn      |
| Schemas  | Pydantic v2, pydantic-settings      |
| Storage  | JSON file (`data/tasks.json`)       |
| Frontend | React 18, TypeScript, Vite          |
| HTTP     | Axios                               |
| Testing  | pytest (backend), Vitest (frontend) |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- (Optional) A virtual environment tool such as `venv`

### 1 — Clone & configure environment

```bash
git clone <repo-url>
cd copilot_assesment
cp .env.example .env   # edit if you need custom paths / ports
```

### 2 — Backend

```bash
# Create and activate a virtual environment (recommended)
python -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r apps/backend/requirements.txt

# Start the development server
cd apps/backend
PYTHONPATH=../../ uvicorn main:app --reload --port 8000
```

API docs are available at <http://localhost:8000/docs>

### 3 — Frontend

```bash
cd apps/frontend
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

The Vite dev server proxies `/api/*` to the FastAPI backend automatically.

---

## 📡 API Overview

All endpoints return the standard envelope:

```json
{ "success": true, "data": { ... } }
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (`?status=`, `?priority=`) |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/stats` | Counts by status & priority |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/complete` | Advance workflow |

**Status workflow:** `todo → in-progress → done` (no skipping)

---

## 🧪 Running Tests

```bash
# Backend — from the repo root
pytest

# Frontend
cd apps/frontend
npm test
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | `development` or `production` |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins (JSON list) |
| `DB_FILE_PATH` | `data/tasks.json` | Path to the JSON datastore |

---

## 🤖 GitHub Copilot Usage

See [`COPILOT-LOG.md`](COPILOT-LOG.md) for a full log of all six Copilot feature demonstrations required by the assignment.
