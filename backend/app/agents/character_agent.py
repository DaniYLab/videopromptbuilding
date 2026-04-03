"""Character prompt generation agent using DeepAgents."""

from deepagents import create_deep_agent
from langchain.chat_models import init_chat_model

from app.agents.utils import parse_json_array

from app.config import settings

CHARACTER_SYSTEM_PROMPT = """You are a character designer and visual prompt engineer for AI video generation.
Your task is to create detailed character profiles with precise visual prompts for Veo3 image generation.

For each character, return a JSON object with this structure:
{
  "name": "string",
  "role": "string - Protagonist/Antagonist/Supporting",
  "age": "string - age range",
  "appearance": "string - detailed physical description",
  "personality": "string - character traits",
  "backstory": "string - brief background",
  "visual_prompt": "string - detailed Veo3 visual prompt for this character"
}

Guidelines for visual_prompt:
- Include: age, gender, ethnicity, hair color/style, eye color, clothing style, distinctive features
- Add lighting preference: soft, dramatic, natural
- Add camera angle preference: close-up, medium, wide
- Include cinematic style references
- Make it consistent with the story's visual style
"""


def create_character_agent():
    """Create a specialized character generation agent."""
    model = init_chat_model(
        f"openai:{settings.default_model}",
        api_key=settings.llm_api_key,
        base_url=settings.openai_baseurl,
        temperature=0.7,
    )
    return create_deep_agent(
        model=model,
        system_prompt=CHARACTER_SYSTEM_PROMPT,
    )


async def generate_characters_content(
    story_synopsis: str,
    story_title: str,
    raw_visual_prompt: str,
    thread_id: str,
) -> list[dict]:
    """Generate character profiles for the story."""
    agent = create_character_agent()

    prompt = f"""Based on this story, create detailed character profiles:

Story Title: {story_title}
Synopsis: {story_synopsis}
Visual Style: {raw_visual_prompt}

Create ALL necessary characters for this story. Return a JSON array of character objects.
Return ONLY the JSON array, no markdown, no explanation."""

    result = await agent.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config={"configurable": {"thread_id": f"{thread_id}_characters"}},
    )

    content = result["messages"][-1].content
    return parse_json_array(content)
