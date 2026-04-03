import json
import uuid
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.agents.scene_agent import generate_scenes_content
from app.schemas import Scene, SceneGenerateRequest
from app.services.project_service import store

router = APIRouter()


async def _stream_scenes(project_id: str, thread_id: str) -> AsyncGenerator[dict, None]:
    yield {"event": "status", "data": json.dumps({"message": "Đang khởi tạo Scene Agent..."})}

    story = store.get_story(project_id)
    if not story:
        yield {"event": "error", "data": json.dumps({"message": "Story not found"})}
        return

    characters = store.get_characters(project_id)
    characters_summary = "; ".join(
        f"{c.name} ({c.role}): {c.appearance[:80]}" for c in characters
    )

    try:
        yield {"event": "status", "data": json.dumps({"message": f"Đang tạo {story.num_scenes} cảnh..."})}

        data_list = await generate_scenes_content(
            story_synopsis=story.synopsis,
            story_title=story.title,
            plot_points=story.key_plot_points,
            characters_summary=characters_summary,
            raw_visual_prompt=story.raw_prompt or "",
            num_scenes=story.num_scenes,
            thread_id=thread_id,
        )

        scenes = [
            Scene(
                id=str(uuid.uuid4()),
                project_id=project_id,
                scene_index=i,
                duration_seconds=5,
                **d,
            )
            for i, d in enumerate(data_list)
        ]
        store.save_scenes(project_id, scenes)

        for scene in scenes:
            yield {"event": "scene", "data": scene.model_dump_json()}

        yield {"event": "done", "data": json.dumps({"message": f"Đã tạo {len(scenes)} cảnh!"})}

    except Exception as exc:
        yield {"event": "error", "data": json.dumps({"message": str(exc)})}


@router.post("/generate")
async def generate_scenes(body: SceneGenerateRequest) -> EventSourceResponse:
    project = store.get_project(body.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return EventSourceResponse(_stream_scenes(body.project_id, project.thread_id))


@router.get("/{project_id}", response_model=list[Scene])
async def get_scenes(project_id: str) -> list[Scene]:
    return store.get_scenes(project_id)
