"""SQLite-backed project store using sqlite3 (stdlib, zero deps)."""

import sqlite3
from pathlib import Path
from typing import Optional

from app.config import settings
from app.schemas import Character, FramePrompt, Project, Scene, Story


def _get_conn(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS stories (
            project_id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS characters (
            project_id TEXT NOT NULL,
            id TEXT NOT NULL,
            data TEXT NOT NULL,
            PRIMARY KEY (project_id, id)
        );
        CREATE TABLE IF NOT EXISTS scenes (
            project_id TEXT NOT NULL,
            id TEXT NOT NULL,
            scene_index INTEGER NOT NULL,
            data TEXT NOT NULL,
            PRIMARY KEY (project_id, id)
        );
        CREATE TABLE IF NOT EXISTS frames (
            project_id TEXT NOT NULL,
            scene_id TEXT NOT NULL,
            data TEXT NOT NULL,
            PRIMARY KEY (project_id, scene_id)
        );
    """)
    conn.commit()


class ProjectStore:
    """SQLite-backed project store. Survives server restarts."""

    def __init__(self, db_path: Path | None = None) -> None:
        self.db_path = (db_path or settings.database_path).resolve()
        self._conn = _get_conn(self.db_path)
        _init_db(self._conn)

    def close(self) -> None:
        self._conn.close()

    # ── Projects ──────────────────────────────────────────
    def create_project(self, project: Project) -> Project:
        self._conn.execute(
            "INSERT OR REPLACE INTO projects (id, data) VALUES (?, ?)",
            (project.id, project.model_dump_json()),
        )
        self._conn.commit()
        return project

    def get_project(self, project_id: str) -> Optional[Project]:
        row = self._conn.execute(
            "SELECT data FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        return Project.model_validate_json(row["data"]) if row else None

    def list_projects(self) -> list[Project]:
        rows = self._conn.execute(
            "SELECT data FROM projects ORDER BY rowid DESC"
        ).fetchall()
        return [Project.model_validate_json(r["data"]) for r in rows]

    def delete_project(self, project_id: str) -> bool:
        cur = self._conn.execute(
            "DELETE FROM projects WHERE id = ?", (project_id,)
        )
        self._conn.execute(
            "DELETE FROM stories WHERE project_id = ?", (project_id,)
        )
        self._conn.execute(
            "DELETE FROM characters WHERE project_id = ?", (project_id,)
        )
        self._conn.execute(
            "DELETE FROM scenes WHERE project_id = ?", (project_id,)
        )
        self._conn.execute(
            "DELETE FROM frames WHERE project_id = ?", (project_id,)
        )
        self._conn.commit()
        return cur.rowcount > 0

    # ── Story ─────────────────────────────────────────────
    def save_story(self, story: Story) -> Story:
        self._conn.execute(
            "INSERT OR REPLACE INTO stories (project_id, data) VALUES (?, ?)",
            (story.project_id, story.model_dump_json()),
        )
        self._conn.commit()
        return story

    def get_story(self, project_id: str) -> Optional[Story]:
        row = self._conn.execute(
            "SELECT data FROM stories WHERE project_id = ?", (project_id,)
        ).fetchone()
        return Story.model_validate_json(row["data"]) if row else None

    # ── Characters ────────────────────────────────────────
    def save_characters(self, project_id: str, characters: list[Character]) -> None:
        self._conn.execute(
            "DELETE FROM characters WHERE project_id = ?", (project_id,)
        )
        self._conn.executemany(
            "INSERT INTO characters (project_id, id, data) VALUES (?, ?, ?)",
            [(project_id, c.id, c.model_dump_json()) for c in characters],
        )
        self._conn.commit()

    def get_characters(self, project_id: str) -> list[Character]:
        rows = self._conn.execute(
            "SELECT data FROM characters WHERE project_id = ?", (project_id,)
        ).fetchall()
        return [Character.model_validate_json(r["data"]) for r in rows]

    # ── Scenes ────────────────────────────────────────────
    def save_scenes(self, project_id: str, scenes: list[Scene]) -> None:
        self._conn.execute(
            "DELETE FROM scenes WHERE project_id = ?", (project_id,)
        )
        self._conn.executemany(
            "INSERT INTO scenes (project_id, id, scene_index, data) VALUES (?, ?, ?, ?)",
            [(project_id, s.id, s.scene_index, s.model_dump_json()) for s in scenes],
        )
        self._conn.commit()

    def get_scenes(self, project_id: str) -> list[Scene]:
        rows = self._conn.execute(
            "SELECT data FROM scenes WHERE project_id = ? ORDER BY scene_index",
            (project_id,),
        ).fetchall()
        return [Scene.model_validate_json(r["data"]) for r in rows]

    # ── Frames ───────────────────────────────────────────
    def save_frame(self, frame: FramePrompt) -> FramePrompt:
        self._conn.execute(
            "INSERT OR REPLACE INTO frames (project_id, scene_id, data) VALUES (?, ?, ?)",
            (frame.project_id, frame.scene_id, frame.model_dump_json()),
        )
        self._conn.commit()
        return frame

    def get_frames(self, project_id: str) -> list[FramePrompt]:
        rows = self._conn.execute(
            "SELECT data FROM frames WHERE project_id = ?", (project_id,)
        ).fetchall()
        return [FramePrompt.model_validate_json(r["data"]) for r in rows]

    def get_frame(self, project_id: str, scene_id: str) -> Optional[FramePrompt]:
        row = self._conn.execute(
            "SELECT data FROM frames WHERE project_id = ? AND scene_id = ?",
            (project_id, scene_id),
        ).fetchone()
        return FramePrompt.model_validate_json(row["data"]) if row else None


# Global singleton
store = ProjectStore()
