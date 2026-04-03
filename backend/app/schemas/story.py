from typing import Optional

from pydantic import BaseModel, Field


class StoryCreate(BaseModel):
    project_id: str
    genre: str = Field(..., description="Action, Romance, Horror, Comedy, Drama...")
    theme: str = Field(..., description="Core theme or message")
    setting: Optional[str] = Field(None, description="Time and place")
    tone: Optional[str] = Field(None, description="Dark, Light, Cinematic...")
    num_scenes: int = Field(default=5, ge=1, le=20)
    additional_notes: Optional[str] = None


class Story(BaseModel):
    project_id: str
    title: str
    genre: str
    theme: str
    setting: Optional[str] = None
    tone: Optional[str] = None
    synopsis: str = Field(..., description="Full story synopsis")
    key_plot_points: list[str] = Field(default_factory=list)
    num_scenes: int = 5
    raw_prompt: Optional[str] = None
