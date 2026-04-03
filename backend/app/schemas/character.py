import uuid
from typing import Optional

from pydantic import BaseModel, Field


class CharacterGenerateRequest(BaseModel):
    project_id: str


class Character(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    name: str
    role: str
    age: Optional[str] = None
    appearance: str = Field(..., description="Physical appearance for visual prompts")
    personality: str
    backstory: Optional[str] = None
    visual_prompt: str = Field(
        ..., description="Detailed visual prompt for image generation"
    )
