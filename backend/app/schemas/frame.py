import uuid

from pydantic import BaseModel, Field


class FramePromptGenerateRequest(BaseModel):
    project_id: str


class FramePrompt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    scene_id: str
    scene_index: int
    start_frame_prompt: str = Field(
        ..., description="Detailed image prompt for the first frame of the scene"
    )
    end_frame_prompt: str = Field(
        ..., description="Detailed image prompt for the last frame of the scene"
    )
    style_notes: str = Field(..., description="Visual style consistency notes")
