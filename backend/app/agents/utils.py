"""Shared utilities for agent response parsing."""

import json


def extract_text(content: str | list) -> str:
    """Extract plain text from LLM message content (str or list of blocks)."""
    if isinstance(content, str):
        return content
    # list of content blocks: {"type": "text", "text": "..."}
    parts = [block.get("text", "") for block in content if isinstance(block, dict)]
    return "".join(parts)


def parse_json_object(content: str | list) -> dict:
    """Extract and parse first JSON object from LLM response."""
    text = extract_text(content)
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON object found in response: {text[:200]}")
    return json.loads(text[start:end])


def parse_json_array(content: str | list) -> list:
    """Extract and parse first JSON array from LLM response."""
    text = extract_text(content)
    start = text.find("[")
    end = text.rfind("]") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON array found in response: {text[:200]}")
    return json.loads(text[start:end])
