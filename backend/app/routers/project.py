from fastapi import APIRouter, HTTPException

from app.schemas import Project, ProjectCreate
from app.services.project_service import store

router = APIRouter()


@router.post("", response_model=Project)
async def create_project(body: ProjectCreate) -> Project:
    project = Project(title=body.title, description=body.description)
    return store.create_project(project)


@router.get("", response_model=list[Project])
async def list_projects() -> list[Project]:
    return store.list_projects()


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str) -> Project:
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}")
async def delete_project(project_id: str) -> dict[str, str]:
    if not store.delete_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}


@router.get("/{project_id}/export")
async def export_project(project_id: str) -> dict:
    """Export full project as JSON for Veo3 pipeline."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "project": project.model_dump(),
        "story": store.get_story(project_id).model_dump() if store.get_story(project_id) else None,
        "characters": [c.model_dump() for c in store.get_characters(project_id)],
        "scenes": [s.model_dump() for s in store.get_scenes(project_id)],
        "frames": [f.model_dump() for f in store.get_frames(project_id)],
    }
