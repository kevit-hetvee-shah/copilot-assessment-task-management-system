"""
Application entry point.
Creates the FastAPI app instance, registers middleware, and mounts routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from libs.utils.db_setup import init_db
from src.routes import router


def create_app() -> FastAPI:
    """Factory function that builds and configures the FastAPI application."""

    # Ensure the JSON datastore exists before the app starts
    init_db(settings.DB_FILE_PATH)

    app = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ---------------------------------------------------------------------------
    # Middleware
    # ---------------------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---------------------------------------------------------------------------
    # Routers
    # ---------------------------------------------------------------------------
    app.include_router(router, prefix=settings.API_PREFIX)

    # ---------------------------------------------------------------------------
    # Health-check
    # ---------------------------------------------------------------------------
    @app.get("/health", tags=["health"])
    async def health_check() -> dict:
        """Returns API liveness status."""
        return {"status": "ok", "env": settings.APP_ENV}

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.APP_ENV == "development",
    )
