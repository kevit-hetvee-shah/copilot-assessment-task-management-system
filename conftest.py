"""
Pytest conftest — adds the monorepo root to sys.path so that
`libs.utils` is importable from `apps/backend/` tests.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent / "apps" / "backend"))
