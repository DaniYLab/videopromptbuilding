import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.agents.character_agent import generate_characters_content
from app.schemas import Character, CharacterGenerateRequest
from app.services.project_service import store

router = APIRouter()


async def _stream_characters(project_id: str, thread_id: str) -> AsyncGenerator[dict, None]:
    yield {"event": "status", "data": json.dumps({"message": "Đang khởi tạo Character Agent..."})}

    story = store.get_story(project_id)
    if not story:
        yield {"event": "error", "data": json.dumps({"message": "Story not found. Generate story first."})}
        return

    try:
        yield {"event": "status", "data": json.dumps({"message": "Đang xây dựng nhân vật..."})}

        data_list = await generate_characters_content(
            story_synopsis=story.synopsis,
            story_title=story.title,
            raw_visual_prompt=story.raw_prompt or "",
            thread_id=thread_id,
        )

        characters = [
            Character(project_id=project_id, **d)
            for d in data_list
        ]
        store.save_characters(project_id, characters)

        for char in characters:
            yield {"event": "character", "data": char.model_dump_json()}

        yield {"event": "done", "data": json.dumps({"message": f"Đã tạo {len(characters)} nhân vật!"})}

    except Exception as exc:
        yield {"event": "error", "data": json.dumps({"message": str(exc)})}


@router.post("/generate")
async def generate_characters(body: CharacterGenerateRequest) -> EventSourceResponse:
    project = store.get_project(body.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return EventSourceResponse(_stream_characters(body.project_id, project.thread_id))


@router.get("/{project_id}", response_model=list[Character])
async def get_characters(project_id: str) -> list[Character]:
    return store.get_characters(project_id)
