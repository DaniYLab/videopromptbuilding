from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import characters, frames, project, scenes, story

app = FastAPI(
    title=settings.app_name,
    description="AI-powered video script builder",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project.router, prefix="/api/projects", tags=["projects"])
app.include_router(story.router, prefix="/api/story", tags=["story"])
app.include_router(characters.router, prefix="/api/characters", tags=["characters"])
app.include_router(scenes.router, prefix="/api/scenes", tags=["scenes"])
app.include_router(frames.router, prefix="/api/frames", tags=["frames"])


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "scriptforge"}
