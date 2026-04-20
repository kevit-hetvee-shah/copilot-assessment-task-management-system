# DB setup — ensures both the JSON datastore and the SQLite/SQLAlchemy tables exist before app startup.
import json
from pathlib import Path


def init_db(db_path: Path) -> None:
    """Create the datastore file with an empty task list if it does not exist."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if not db_path.exists():
        db_path.write_text(json.dumps([]), encoding="utf-8")
        print(f"[db_setup] Created new datastore at {db_path}")
    else:
        # Validate that the file contains a JSON array; reset if corrupt
        try:
            content = json.loads(db_path.read_text(encoding="utf-8"))
            if not isinstance(content, list):
                raise ValueError("Datastore root must be a JSON array")
        except (json.JSONDecodeError, ValueError) as exc:
            print(f"[db_setup] Corrupt datastore ({exc}) — resetting to empty list.")
            db_path.write_text(json.dumps([]), encoding="utf-8")

    # Create SQLAlchemy tables (no-op if they already exist)
    from libs.utils.database import engine
    from src.models import Base
    Base.metadata.create_all(bind=engine)
    print("[db_setup] SQLAlchemy tables verified / created.")
