import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.agents.frame_agent import generate_frame_prompts_content
from app.schemas import FramePrompt, FramePromptGenerateRequest
from app.services.project_service import store

router = APIRouter()


async def _stream_frames(
    project_id: str, thread_id: str
) -> AsyncGenerator[dict, None]:
    yield {"event": "status", "data": json.dumps({"message": "Đang khởi tạo Frame Agent..."})}

    story = store.get_story(project_id)
    scenes = store.get_scenes(project_id)
    characters = store.get_characters(project_id)

    if not story or not scenes:
        yield {"event": "error", "data": json.dumps({"message": "Story and scenes required"})}
        return

    char_visual_prompts = [c.visual_prompt for c in characters]
    previous_end_frame: str | None = None

    try:
        for scene in scenes:
            yield {
                "event": "status",
                "data": json.dumps({"message": f"Đang tạo frame prompts cảnh {scene.scene_index + 1}/{len(scenes)}..."}),
            }

            data = await generate_frame_prompts_content(
                scene_description=scene.description,
                scene_action=scene.action,
                scene_camera=scene.camera_angle,
                scene_lighting=scene.lighting,
                characters_visual_prompts=char_visual_prompts,
                raw_visual_prompt=story.raw_prompt or "",
                previous_scene_end_frame=previous_end_frame,
                thread_id=thread_id,
                scene_index=scene.scene_index,
            )

            frame = FramePrompt(
                project_id=project_id,
                scene_id=scene.id,
                scene_index=scene.scene_index,
                **data,
            )
            store.save_frame(frame)
            previous_end_frame = frame.end_frame_prompt

            yield {"event": "frame", "data": frame.model_dump_json()}

        yield {"event": "done", "data": json.dumps({"message": f"Đã tạo frame prompts cho {len(scenes)} cảnh!"})}

    except Exception as exc:
        yield {"event": "error", "data": json.dumps({"message": str(exc)})}


@router.post("/generate")
async def generate_frames(body: FramePromptGenerateRequest) -> EventSourceResponse:
    project = store.get_project(body.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return EventSourceResponse(_stream_frames(body.project_id, project.thread_id))


@router.get("/{project_id}", response_model=list[FramePrompt])
async def get_frames(project_id: str) -> list[FramePrompt]:
    return store.get_frames(project_id)
