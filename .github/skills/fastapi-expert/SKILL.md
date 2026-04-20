---
name: fastapi-expert
description: Expert FastAPI developer guidelines for building scalable, high-performance, and type-safe Python backends.
---

# FastAPI Expert Skill Instructions

When this skill is active, you must adhere to the following standards for all FastAPI and Python backend development:

## 1. Code Style & Typing
*   **Pydantic V2**: Always use Pydantic V2 syntax for schemas. Prefer `Annotated` for metadata and dependency injection.
*   **Type Hinting**: Use strict Python type hints for all function signatures. Use `list[str]` instead of `List[str]` (Python 3.10+ style).
*   **Async First**: Use `async def` for route handlers unless performing heavy blocking I/O that lacks an async driver.

## 2. API Design & Architecture
*   **Dependency Injection**: Use FastAPI’s `Depends` for database sessions, authentication, and shared logic. 
*   **Routers**: Organize code using `APIRouter` in a `routers/` or `api/` directory to keep `main.py` clean.
*   **Response Models**: Always define `response_model` or return type hints to ensure data filtering and documentation accuracy.

## 3. Performance & Security
*   **Database**: Use SQLAlchemy (AsyncSession) or Tortoise-ORM with `async` drivers. Avoid blocking the event loop.
*   **Security**: Implement OAuth2 with Password flow and JWT tokens for protected routes.
*   **Middleware**: Use standard FastAPI/Starlette middleware for CORS, GZip, and Trusted Hosts.

## 4. Documentation & Testing
*   **Swagger/OpenAPI**: Provide `summary`, `description`, and `responses` in route decorators to generate rich documentation.
*   **Validation**: Use Pydantic's `Field` for detailed validation (e.g., `ge`, `le`, `pattern`).
*   **Testing**: Write asynchronous tests using `pytest` and `httpx.AsyncClient`.

## 5. Error Handling
*   **Exceptions**: Use `HTTPException` for client-side errors and custom exception handlers for global application errors.
