import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.agents.story_agent import generate_story_content
from app.schemas import Story, StoryCreate
from app.services.project_service import store

router = APIRouter()


async def _stream_story(body: StoryCreate, thread_id: str) -> AsyncGenerator[dict, None]:
    yield {"event": "status", "data": json.dumps({"message": "Đang khởi tạo Story Agent..."})}

    try:
        yield {"event": "status", "data": json.dumps({"message": "Đang tạo cốt truyện..."})}

        data = await generate_story_content(
            genre=body.genre,
            theme=body.theme,
            setting=body.setting,
            tone=body.tone,
            num_scenes=body.num_scenes,
            additional_notes=body.additional_notes,
            thread_id=thread_id,
        )

        story = Story(
            project_id=body.project_id,
            genre=body.genre,
            theme=body.theme,
            num_scenes=body.num_scenes,
            **data,
        )
        store.save_story(story)

        yield {"event": "result", "data": story.model_dump_json()}
        yield {"event": "done", "data": json.dumps({"message": "Hoàn thành!"})}

    except Exception as exc:
        yield {"event": "error", "data": json.dumps({"message": str(exc)})}


@router.post("/generate")
async def generate_story(body: StoryCreate) -> EventSourceResponse:
    project = store.get_project(body.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return EventSourceResponse(_stream_story(body, project.thread_id))


@router.get("/{project_id}", response_model=Story)
async def get_story(project_id: str) -> Story:
    story = store.get_story(project_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story
