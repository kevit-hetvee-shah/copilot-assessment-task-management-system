# AGENTS.md — Task Management System

## 📐 Project Architecture

### Tech Stack

#### Backend
- **Framework:** FastAPI 0.104+
- **Language:** Python 3.10+
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2 (BaseModel, BaseSettings)
- **Server:** Uvicorn
- **Persistence:** JSON (legacy) + SQLite
- **CORS:** Built-in FastAPI middleware

#### Frontend
- **Framework:** React 18.3+
- **Language:** TypeScript 5.4+
- **Build Tool:** Vite 5.3+
- **HTTP Client:** Axios 1.7+
- **Testing:** Vitest 1.6+
- **Package Manager:** npm

### Project Structure

```
copilot-assessment-task-management-system/
├── apps/
│   ├── backend/
│   │   ├── main.py                    # FastAPI app factory
│   │   ├── config.py                  # Pydantic Settings
│   │   ├── requirements.txt
│   │   └── src/
│   │       ├── __init__.py
│   │       ├── dto.py                 # Pydantic request/response schemas
│   │       ├── models.py              # SQLAlchemy ORM models
│   │       ├── routes.py              # FastAPI route handlers
│   │       └── service.py             # Business logic layer
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           ├── index.css
│           ├── api/                   # API client layer
│           ├── components/            # React components
│           ├── hooks/                 # Custom React hooks
│           └── types/                 # TypeScript type definitions
├── libs/
│   └── utils/
│       ├── database.py                # TaskRepository (data access)
│       ├── db_setup.py                # Database initialization
│       └── db.py                      # DB connection management
└── data/
    ├── tasks.json                     # JSON datastore
    └── tasks.db                       # SQLite database
```

---

## 🔌 API Response Envelope

**All API endpoints must return a standardized response format:**

```json
{
  "success": boolean,
  "data": object | array | null
}
```

### Examples

**Success Response (200, 201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "todo",
    "priority": "medium",
    "createdAt": "2025-04-20T10:30:00Z",
    "updatedAt": "2025-04-20T10:30:00Z"
  }
}
```

**List Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "...", "title": "Task 1", ... },
    { "id": "...", "title": "Task 2", ... }
  ]
}
```

**Error Response (4xx, 5xx):**
```json
{
  "success": false,
  "data": {
    "detail": "Task 550e8400... not found"
  }
}
```

---

## 🎯 Backend Coding Standards

### Core Architecture Layers

1. **Route Layer** (`src/routes.py`)
   - Handle HTTP semantics (status codes, headers)
   - Parse query/path parameters using FastAPI Query/Path
   - Delegate all business logic to TaskService
   - Wrap all responses in APIResponse envelope

2. **Service Layer** (`src/service.py`)
   - Pure business logic (no FastAPI imports except HTTPException)
   - Enforce domain rules (status workflow, validation)
   - Convert DTOs to/from domain models
   - Raise HTTPException with correct status codes:
     - `400` — Bad request (invalid input)
     - `404` — Not found
     - `422` — Unprocessable Entity (validation failure)
     - `500` — Server error

3. **Data Layer** (`libs/utils/database.py`)
   - Raw CRUD operations via repository pattern
   - No business logic in repository
   - Convert models to/from SQLAlchemy instances

4. **DTOs** (`src/dto.py`)
   - Use Pydantic for validation at request boundary
   - Enums for status and priority (no magic strings)
   - Request schemas (TaskCreate, TaskUpdate)
   - Response schemas (TaskOut, APIResponse)

### Function Documentation Standard

Every public function must have a docstring:

```python
def create(self, payload: TaskCreate) -> TaskOut:
    """Create and persist a new task.
    
    Args:
        payload: Task creation request with title, description, status, priority.
        
    Returns:
        TaskOut: The created task with generated ID and timestamps.
        
    Raises:
        HTTPException: 400 if title is empty, 422 if status/priority invalid.
    """
```

### Input Validation Rules

- **Routes:** Use Pydantic Field with constraints (min_length, max_length, etc.)
- **Service:** Validate enum values; enforce business rules (status transitions)
- **Repository:** Assume clean input; raise only on persistence errors

### HTTP Status Code Rules

| Code | When | Example |
|------|------|---------|
| 200  | GET, PUT success | Fetch task, update field |
| 201  | POST success | Create task |
| 204  | DELETE success | Remove task (no body) |
| 400  | Bad request | Missing required field, invalid enum |
| 404  | Not found | Task ID doesn't exist |
| 422  | Invalid state | Status transition not allowed |
| 500  | Server error | Unexpected exception |

### Response Wrapping

All route handlers must return the APIResponse envelope:

```python
@router.get("/{task_id}", response_model=APIResponse)
async def get_task(task_id: UUID):
    task = TaskService.get_by_id(task_id)
    return JSONResponse({"success": True, "data": task.model_dump()})
```

---

## 🎨 Frontend Coding Standards

### Component Structure

- **Components are composed by feature** (TaskTable, TaskModal, FilterBar, Badge)
- **Custom hooks** for shared stateful logic (useTasks)
- **API layer** (api/tasks.ts) encapsulates all HTTP calls
- **Types** (types/task.ts) define TypeScript interfaces

### Component Patterns

#### Props & Types
```typescript
interface TaskProps {
  task: Task;
  onComplete?: (id: UUID) => Promise<void>;
  onDelete?: (id: UUID) => Promise<void>;
}

export function TaskRow({ task, onComplete, onDelete }: TaskProps): JSX.Element {
  // Component implementation
}
```

#### Error Handling
Every async operation must catch errors:

```typescript
const handleDelete = async (id: UUID) => {
  try {
    await deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
    showToast("Task deleted", "success");
  } catch (error) {
    showToast(`Delete failed: ${error.message}`, "error");
  }
}
```

#### Loading States
Always display feedback during async operations:

```typescript
const [isLoading, setIsLoading] = useState(false);

async function fetchTasks() {
  setIsLoading(true);
  try {
    const result = await getTasks();
    setTasks(result);
  } finally {
    setIsLoading(false);
  }
}
```

#### Toast Notifications
Provide user feedback for operations:

```typescript
showToast("Task created successfully", "success");
showToast("Failed to update task", "error");
showToast("Loading...", "info");
```

### API Client Pattern

```typescript
// api/tasks.ts — encapsulate all HTTP logic
export async function getTasks(
  status?: TaskStatus,
  priority?: TaskPriority
): Promise<Task[]> {
  const response = await axios.get("/api/tasks", { params: { status, priority } });
  return response.data.data || [];
}

export async function createTask(task: TaskCreate): Promise<Task> {
  const response = await axios.post("/api/tasks", task);
  return response.data.data;
}
```

### Type Safety

- Use TypeScript enums matching backend (TaskStatus, TaskPriority)
- Define all shapes: Task, TaskCreate, TaskUpdate, APIResponse
- No `any` types without justification

---

## 👥 Sub-Agents

### 1. **ui-agent** — Frontend Specialist

**File:** `agents/ui-agent.agent.md`

**Purpose:** Generate and refine frontend components, styling, and UX.

**Capabilities:**
- Build React components (functional, hooks-based)
- Create TypeScript interfaces and types
- Style with CSS (Flexbox, Grid, responsive design)
- Implement interactive features (modal forms, filters, search)
- Handle loading states, error toast notifications
- Fetch data via the API client layer
- Write unit tests for components (Vitest)

**Context Files:**
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/components/`
- `apps/frontend/src/api/tasks.ts`
- `apps/frontend/src/types/task.ts`
- `apps/frontend/src/hooks/useTasks.ts`

**Instructions:**
- Always use React hooks (useState, useEffect, useCallback)
- Fetch data via api/tasks.ts, not directly in components
- Show loading indicators during async operations
- Catch errors and display error toasts
- Use semantic HTML and accessible color contrasts
- Avoid inline styles; use CSS classes

---

### 2. **backend-agent** — Backend Specialist

**File:** `agents/backend-agent.agent.md`

**Purpose:** Design API routes, business logic, and data persistence.

**Capabilities:**
- Design REST API endpoints (GET, POST, PUT, DELETE)
- Write Pydantic request/response schemas (DTOs)
- Implement business logic in service layer (TaskService)
- Define SQLAlchemy ORM models and constraints
- Create repository methods for data access (CRUD)
- Enforce HTTP status codes and error handling
- Write unit tests for services (pytest)
- Generate OpenAPI documentation

**Context Files:**
- `apps/backend/src/routes.py`
- `apps/backend/src/dto.py`
- `apps/backend/src/service.py`
- `apps/backend/src/models.py`
- `libs/utils/database.py`
- `apps/backend/config.py`

**Instructions:**
- Every route must wrap responses in APIResponse envelope
- Validate inputs using Pydantic Field constraints
- Enforce status workflow: todo → in-progress → done (no skipping)
- Return correct HTTP status codes (400/404/422/500)
- Document all public functions with docstrings
- No empty catch blocks; log or re-raise with context
- Never leak implementation details in error messages

---

### 3. **testing-agent** — Testing Specialist

**File:** `agents/testing-agent.agent.md`

**Purpose:** Design and implement comprehensive test suites (unit & E2E).

**Capabilities:**
- Write pytest fixtures and unit tests (backend)
- Write Vitest unit tests (frontend)
- Write Playwright E2E tests
- Achieve >80% code coverage
- Test success paths and error cases
- Mock external dependencies
- Generate test reports and coverage summaries

**Context Files:**
- `conftest.py`
- `apps/backend/src/service.py`
- `apps/backend/src/routes.py`
- `apps/frontend/src/api/tasks.ts`
- `apps/frontend/src/components/`

**Instructions:**
- Test all CRUD operations (create, read, update, delete)
- Test validation errors and status codes (400/404/422)
- Test status workflow transitions and edge cases
- Test loading states and error handling in frontend
- Use mocks for API calls in component tests
- Write E2E test for full user journeys (add → complete → delete)
- Fail tests immediately on missing docstrings or empty catch blocks

---

## ✅ Patterns to Follow

### Backend

- ✅ Use Pydantic enums for TaskStatus and TaskPriority
- ✅ Validate at request boundary in routes (Field constraints)
- ✅ Delegate business logic to TaskService
- ✅ Return 404 for missing resources, 422 for invalid state
- ✅ Wrap all responses in APIResponse(success=True/False, data=...)
- ✅ Use docstrings on all public functions
- ✅ Raise HTTPException with status_code and detail
- ✅ Convert SQLAlchemy models to DTOs before returning
- ✅ Test all validation rules and status transitions

### Frontend

- ✅ Fetch data via api/tasks.ts (not direct HTTP in components)
- ✅ Use React hooks (useState, useEffect, useCallback)
- ✅ Show loading indicators during async operations
- ✅ Catch errors and display error toasts
- ✅ Use TypeScript types for all props and state
- ✅ Render badge color based on priority/status
- ✅ Update state after successful mutations
- ✅ Filter and search without page reload (client-side)
- ✅ Test interactive features with Vitest and Playwright

---

## ❌ Patterns to Avoid

### Backend

- ❌ Returning raw SQLAlchemy models to clients (use TaskOut DTO)
- ❌ Mixing business logic in routes or repository
- ❌ Accepting string status/priority instead of enums
- ❌ Skipping status workflow validation (e.g., todo → done)
- ❌ Returning 500 for validation errors (use 400/422)
- ❌ Forgetting to wrap responses in APIResponse envelope
- ❌ Empty try-except blocks or silent failures
- ❌ Hardcoding magic strings for statuses/priorities
- ❌ No docstrings on public functions
- ❌ Exposing stack traces in error messages

### Frontend

- ❌ Direct HTTP calls in components (bypass api/tasks.ts)
- ❌ Using `any` type without justification
- ❌ Forgetting error handling in try-catch blocks
- ❌ No loading indicators during async operations
- ❌ Inline styles instead of CSS classes
- ❌ Manipulating DOM directly instead of React state
- ❌ No TypeScript types for props (use interfaces)
- ❌ Full page reload for filters/search
- ❌ Not catching and displaying API errors to users
- ❌ Hardcoded color values instead of CSS variables

---

## 🧪 Testing Standards

### Unit Tests

**Backend (pytest):**
- Minimum 80% coverage of service and route modules
- Test all CRUD operations, validation, status transitions
- Mock database layer (TaskRepository)
- Verify correct HTTP status codes

**Frontend (Vitest):**
- Test component rendering with different props
- Mock API calls (useTask, axios)
- Test loading and error states
- Verify button clicks trigger correct callbacks

### E2E Tests (Playwright)

- Create task → verify in table
- Update priority/status → verify changes persisted
- Complete task → verify status workflow
- Delete task → verify removed from table
- Filter by status/priority → verify results
- Search by title → verify live filtering

---

## 🔄 Development Workflow

1. **Reserve routes in `routes.py`** with comments and docstrings
2. **Implement service logic** in `service.py` with full docstrings
3. **Define DTOs first** in `dto.py` (request/response schemas)
4. **Write tests** before or alongside implementation
5. **Wrap routes** with APIResponse envelope
6. **Generate docs** via FastAPI /docs endpoint
7. **Test end-to-end** with Playwright before merging

---

## 📚 API Endpoints Summary

| Method | Endpoint | Handler | Service | Status |
|--------|----------|---------|---------|--------|
| GET | `/api/tasks` | list_tasks | TaskService.list() | 200 |
| POST | `/api/tasks` | create_task | TaskService.create() | 201 |
| GET | `/api/tasks/stats` | task_stats | TaskService.get_stats() | 200 |
| GET | `/api/tasks/:id` | get_task | TaskService.get_by_id() | 200/404 |
| PUT | `/api/tasks/:id` | update_task | TaskService.update() | 200/404/422 |
| DELETE | `/api/tasks/:id` | delete_task | TaskService.delete() | 204/404 |
| POST | `/api/tasks/:id/complete` | complete_task | TaskService.complete() | 200/404/422 |

---

## 🚀 Getting Started with Sub-Agents

### For Frontend Development:
```
@ui-agent: Create the TaskTable component to display tasks in a table with title, priority badge, status badge, and created date columns.
```

### For Backend Development:
```
@backend-agent: Add validation to the TaskCreate schema to ensure title is 1-200 characters and return 400 if invalid.
```

### For Testing:
```
@testing-agent: Write E2E tests using Playwright that verify: creating a task, filtering by priority, and deleting a task.
```

---

**Last Updated:** April 20, 2025  
**Version:** 0.1.0

