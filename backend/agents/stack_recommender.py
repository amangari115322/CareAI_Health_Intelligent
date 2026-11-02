"""
Stack Recommender Agent — picks the best UI stack and LLM based on answers.
"""

from models.project import Answer

STACK_RECOMMENDATIONS = {
    "web_app": {"ui": "nextjs", "llm": "groq"},
    "mobile_app": {"ui": "react-vite", "llm": "groq"},
    "cli": {"ui": "react-vite", "llm": "groq"},
    "api": {"ui": "react-vite", "llm": "groq"},
    "data_pipeline": {"ui": "nextjs", "llm": "gemini"},
}


def get_stack_recommendation(answers: list[Answer]) -> dict[str, str]:
    """Return recommended UI stack and LLM based on project answers."""
    project_type = next(
        (a.value for a in answers if a.question_id == "q_type"),
        "web_app",
    )
    return STACK_RECOMMENDATIONS.get(project_type, {"ui": "nextjs", "llm": "groq"})
