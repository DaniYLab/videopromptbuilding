"""Scene generation agent using DeepAgents."""

import json

from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model

from app.agents.utils import parse_json_array

from app.config import settings

SCENE_SYSTEM_PROMPT = """You are a cinematographer and scene director for AI video generation.
Your task is to break down a story into precise 5-second scenes for Veo3 video generation.

CRITICAL: Each scene is EXACTLY 5 seconds. Design action and pace accordingly.

For each scene, return a JSON object:
{
  "title": "string - brief scene title",
  "description": "string - what happens",
  "action": "string - specific character movements and actions within 5 seconds",
  "dialogue": "string or null - any spoken words (keep very brief)",
  "camera_angle": "string - e.g. 'Close-up on face, slow push in', 'Wide shot, static'",
  "lighting": "string - lighting description",
  "mood": "string - emotional tone of scene",
  "visual_prompt": "string - complete Veo3 scene prompt"
}

For visual_prompt include:
- Scene description with characters present
- Camera movement and angle
- Lighting and atmosphere
- Action happening
- Visual style (cinematic quality, aspect ratio 16:9)
- Duration hint: '5-second clip'
"""


def create_scene_agent():
    """Create a specialized scene generation agent."""
    model = init_chat_model(
        f"openai:{settings.default_model}",
        api_key=settings.llm_api_key,
        base_url=settings.openai_baseurl,
        temperature=0.7,
    )
    return create_deep_agent(
        model=model,
        system_prompt=SCENE_SYSTEM_PROMPT,
    )


async def generate_scenes_content(
    story_synopsis: str,
    story_title: str,
    plot_points: list[str],
    characters_summary: str,
    raw_visual_prompt: str,
    num_scenes: int,
    thread_id: str,
) -> list[dict]:
    """Generate all scenes for the story."""
    agent = create_scene_agent()

    prompt = f"""Break down this story into exactly {num_scenes} scenes, each 5 seconds long:

Story: {story_title}
Synopsis: {story_synopsis}
Key Plot Points: {json.dumps(plot_points)}
Characters: {characters_summary}
Visual Style: {raw_visual_prompt}

Create exactly {num_scenes} scene objects in chronological order.
Return ONLY a JSON array of scene objects, no markdown, no explanation."""

    result = await agent.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config={"configurable": {"thread_id": f"{thread_id}_scenes"}},
    )

    content = result["messages"][-1].content
    return parse_json_array(content)
