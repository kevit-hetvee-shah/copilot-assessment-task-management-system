# GitHub Copilot Review Instructions

When reviewing code in this repository, check for the following issues and list every violation with the file name, line number, and a short description of the fix required.

---

## 1 — Docstrings / JSDoc on All Public Functions

### Backend (Python)
- Every `public` function, method, and class must have a docstring.
- The docstring must describe: what the function does, its arguments (`Args:`), return value (`Returns:`), and any exceptions it raises (`Raises:`).
- Example of a compliant docstring:
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
- Flag any public function that has:
  - No docstring at all
  - A one-liner that does not cover Args/Returns/Raises

### Frontend (TypeScript / React)
- Every exported function, React component, and custom hook must have a JSDoc comment.
- Example:
  ```typescript
  /**
   * Fetches all tasks with optional status/priority filters.
   * @param filters - Optional status and priority filter values.
   * @returns Promise resolving to an array of Task objects.
   * @throws AxiosError if the request fails.
   */
  export async function fetchTasks(filters?: {...}): Promise<Task[]>
  ```
- Flag any exported function or component without a JSDoc block comment.

---

## 2 — Input Validation on Every POST / PUT Route

### Backend
- Every `POST` and `PUT` route handler must validate input through a Pydantic schema.
- `TaskCreate` must enforce: `title` is required with `min_length=1, max_length=200`.
- `TaskUpdate` must enforce the same constraints on optional fields.
- The service layer must additionally check enum values for `status` and `priority`.
- Flag any route that:
  - Accepts `str` instead of an enum for `status` or `priority`
  - Does not use a Pydantic model for the request body
  - Allows an empty title through to the database

### Frontend
- Every form submission must validate required fields client-side before calling the API.
- Flag any `onSubmit` handler that does not check for empty `title`.

---

## 3 — Correct HTTP Status Codes

All route handlers and service calls must return the correct HTTP status code:

| Scenario | Required Code |
|----------|--------------|
| Successful GET / PUT / POST (retrieve or update) | `200` |
| Successful POST (resource created) | `201` |
| Successful DELETE (no body returned) | `204` |
| Missing required field / bad enum value | `400` |
| Resource not found | `404` |
| Invalid state transition (e.g. skip workflow) | `422` |
| Unexpected server error | `500` |

Flag any route that:
- Returns `200` for a creation endpoint (should be `201`)
- Returns `500` for a validation failure (should be `400` or `422`)
- Does not pass the `status_code` parameter through `JSONResponse` when overriding the default

---

## 4 — No Empty Catch Blocks

### Backend (Python)
Flag any `except` clause that:
- Has only `pass`
- Re-raises without logging or adding context
- Silently swallows the error without an informative message

Example of a violation:
```python
try:
    do_something()
except Exception:
    pass   # ← VIOLATION
```

### Frontend (TypeScript)
Flag any `catch` block that:
- Has no statements inside it
- Only has `console.log` without re-throwing or updating UI state
- Does not surface the error to the user (no toast, no state update, no re-throw)

Example of a violation:
```typescript
try {
  await deleteTask(id);
} catch (error) {
  // ← VIOLATION — empty catch
}
```

---

## 5 — Frontend Loading States & Error Handling

Every component or hook that performs an async operation (fetching, creating, updating, deleting) must:

- Maintain an `isLoading` (or equivalent) boolean state variable.
- Set it to `true` before the async call and `false` in a `finally` block.
- Display a visible loading indicator (spinner, skeleton, disabled button, etc.) while `isLoading === true`.
- Catch errors in a `try/catch` block and surface them to the user via a toast notification or inline error message.

Flag any component that:
- Calls an API function without `isLoading` state management
- Has a `catch` block that does not update UI (no toast, no error state)
- Performs the async call outside a `try/finally` structure

---

## 6 — Test Coverage > 80 %

### Backend (pytest)
- The `service.py` and `routes.py` modules must have at least **80% line coverage**.
- Tests must cover:
  - All CRUD operations (create, read, update, delete)
  - All validation error paths (400, 404, 422)
  - Status workflow transitions (todo → in-progress, in-progress → done, done → error)
  - Edge cases: empty title, invalid enum values, duplicate IDs

### Frontend (Vitest)
- Each component and hook file must have a corresponding `*.test.tsx` or `*.test.ts` file.
- Tests must cover:
  - Rendering with various prop combinations
  - Error states (mocked API failures)
  - Loading state visibility
  - User interactions (click, submit, filter)

Flag any module that:
- Has no corresponding test file
- Has a test file that does not test error paths
- Has overall coverage below 80% as reported by the coverage tool

---

## Summary Checklist

When Copilot reviews a file, produce a list of issues in this format:

```
[ISSUE] <file>:<line> — <category> — <description> — <suggested fix>
```

Categories: `DOCSTRING`, `VALIDATION`, `STATUS_CODE`, `EMPTY_CATCH`, `LOADING_STATE`, `TEST_COVERAGE`

Example:
```
[ISSUE] routes.py:35 — DOCSTRING — list_tasks has no docstring — Add a docstring describing query params and return type
[ISSUE] routes.py:42 — STATUS_CODE — create_task returns 200 instead of 201 — Pass status_code=201 to JSONResponse
[ISSUE] TaskModal.tsx:88 — EMPTY_CATCH — catch block does not update UI state — Call showToast with error message
```

