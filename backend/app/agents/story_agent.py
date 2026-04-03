"""Story generation agent using DeepAgents."""

from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model

from app.agents.utils import parse_json_object

from app.config import settings

STORY_SYSTEM_PROMPT = """You are a professional screenwriter and storyteller.
Your task is to create compelling video story outlines optimized for short-form video content.

When generating a story, you MUST return a valid JSON object with exactly this structure:
{
  "title": "string - story title",
  "synopsis": "string - 2-3 paragraph synopsis",
  "key_plot_points": ["string", "string", "string"],
  "setting": "string - time and place",
  "tone": "string - cinematic tone",
  "raw_prompt": "string - master visual style prompt for Veo3 consistency"
}

Guidelines:
- Keep each scene to exactly 5 seconds of action
- Focus on visual storytelling (minimal dialogue)
- Create strong visual hooks at scene starts and ends
- Ensure consistent visual style throughout
- Write raw_prompt as a detailed Veo3/Stable Diffusion style prompt
"""


def create_story_agent():
    """Create a specialized story generation agent."""
    model = init_chat_model(
        f"openai:{settings.default_model}",
        api_key=settings.llm_api_key,
        base_url=settings.openai_baseurl,
        temperature=0.8,
    )
    return create_deep_agent(
        model=model,
        system_prompt=STORY_SYSTEM_PROMPT,
    )


async def generate_story_content(
    genre: str,
    theme: str,
    setting: str | None,
    tone: str | None,
    num_scenes: int,
    additional_notes: str | None,
    thread_id: str,
) -> dict:
    """Generate story content and return parsed dict."""
    agent = create_story_agent()

    prompt = f"""Generate a compelling {genre} story with these parameters:
- Theme: {theme}
- Setting: {setting or "flexible/modern"}
- Tone: {tone or "cinematic"}
- Number of scenes: {num_scenes} (each exactly 5 seconds)
- Additional notes: {additional_notes or "none"}

Return ONLY the JSON object, no markdown, no explanation."""

    result = await agent.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config={"configurable": {"thread_id": f"{thread_id}_story"}},
    )

    content = result["messages"][-1].content
    return parse_json_object(content)
