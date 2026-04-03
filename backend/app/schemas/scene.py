import uuid
from typing import Optional

from pydantic import BaseModel, Field


class SceneGenerateRequest(BaseModel):
    project_id: str


class Scene(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    scene_index: int
    title: str
    duration_seconds: int = Field(default=5, description="Fixed: 5 seconds per scene")
    description: str = Field(..., description="What happens in this scene")
    action: str = Field(..., description="Character actions and movements")
    dialogue: Optional[str] = Field(None, description="Spoken lines if any")
    camera_angle: str = Field(..., description="Camera direction and movement")
    lighting: str
    mood: str
    visual_prompt: str = Field(..., description="Full scene visual prompt for Veo3")
