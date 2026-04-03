"""Frame prompt generation agent using DeepAgents."""

import json

from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model

from app.agents.utils import parse_json_object

from app.config import settings

FRAME_SYSTEM_PROMPT = """You are a visual prompt engineer specializing in Veo3 frame-to-frame video generation.
Your task is to create precise start and end frame prompts for each scene.

These prompts will be used as:
- start_frame_prompt: The first frame image that Veo3 receives
- end_frame_prompt: The last frame image that Veo3 receives

Veo3 will generate the 5-second video transition between these two frames.

Return a JSON object:
{
  "start_frame_prompt": "string - detailed image prompt for scene opening frame",
  "end_frame_prompt": "string - detailed image prompt for scene closing frame",
  "style_notes": "string - consistency notes for visual continuity"
}

Frame prompt requirements:
- Be extremely specific about character pose, expression, position in frame
- Specify exact lighting conditions
- Include background elements
- Mention camera angle and distance
- Use photorealistic/cinematic quality descriptors
- Keep visual style consistent across all scenes
- Format: '[subject] [action/pose] [environment] [lighting] [camera] [style], [quality tags]'
"""


def create_frame_agent():
    """Create a specialized frame prompt generation agent."""
    model = init_chat_model(
        f"openai:{settings.default_model}",
        api_key=settings.llm_api_key,
        base_url=settings.openai_baseurl,
        temperature=0.6,
    )
    return create_deep_agent(
        model=model,
        system_prompt=FRAME_SYSTEM_PROMPT,
    )


async def generate_frame_prompts_content(
    scene_description: str,
    scene_action: str,
    scene_camera: str,
    scene_lighting: str,
    characters_visual_prompts: list[str],
    raw_visual_prompt: str,
    previous_scene_end_frame: str | None,
    thread_id: str,
    scene_index: int,
) -> dict:
    """Generate start and end frame prompts for a scene."""
    agent = create_frame_agent()

    continuity_note = (
        f"IMPORTANT: The start frame must visually connect to this previous scene's end frame:\n{previous_scene_end_frame}\n\n"
        if previous_scene_end_frame
        else "This is the first scene - establish the visual world.\n\n"
    )

    prompt = f"""{continuity_note}Generate start and end frame prompts for scene {scene_index + 1}:

Scene Description: {scene_description}
Action (5 seconds): {scene_action}
Camera: {scene_camera}
Lighting: {scene_lighting}
Characters present: {json.dumps(characters_visual_prompts)}
Overall visual style: {raw_visual_prompt}

Return ONLY the JSON object, no markdown, no explanation."""

    result = await agent.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config={"configurable": {"thread_id": f"{thread_id}_frame_{scene_index}"}},
    )

    content = result["messages"][-1].content
    return parse_json_object(content)
