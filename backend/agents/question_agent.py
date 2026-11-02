"""
Question Agent — Generates guided requirement questions tailored to the project idea.
Covers:
  1. Platform / Interface (Web, Desktop, Mobile, API, CLI)
  2. Project Scope / Environment (Personal/Prototype, Production MVP, Enterprise)
  3. Authentication Requirements (JWT, OAuth2, None)
  4. External API Integrations (Vision/LLM, Cloud Storage, Payments, None)
  5. Dataset & Data Pipeline Requirements (Custom Image/Text pairs, Pretrained, Kaggle, None)
  6. Deployment Target (Docker, Cloud VM/AWS, Vercel/Netlify, Local)
"""

import json
import re
from typing import Any

from config import settings
from models.project import Question, QuestionOption


def _generate_fallback_questions(idea: str) -> list[Question]:
    """Domain-aware intelligent guided questions fallback."""
    idea_lower = idea.lower()
    is_ml_ai = any(kw in idea_lower for kw in ["cnn", "rnn", "lstm", "model", "ai", "ml", "caption", "vision", "detection", "nlp", "llm", "predict", "classifier", "neural"])
    is_mobile = any(kw in idea_lower for kw in ["mobile", "android", "ios", "react native", "flutter"])
    is_api = any(kw in idea_lower for kw in ["api", "microservice", "backend", "endpoint"])

    # Q1: Platform
    if is_mobile:
        rec_platform = "mobile_app"
    elif is_api:
        rec_platform = "api_service"
    elif is_ml_ai:
        rec_platform = "web_ai_app"
    else:
        rec_platform = "web_app"

    q1 = Question(
        id="q_platform",
        category="platform",
        text="What type of application platform and user interface do you need?",
        options=[
            QuestionOption(label="Web Application (Full Stack with UI)", value="web_app", recommended=(rec_platform in ["web_app", "web_ai_app"])),
            QuestionOption(label="Interactive AI Web Interface (Streamlit / Gradio)", value="web_ai_app", recommended=(rec_platform == "web_ai_app" and is_ml_ai)),
            QuestionOption(label="RESTful API / Microservice (Backend only)", value="api_service", recommended=(rec_platform == "api_service")),
            QuestionOption(label="Mobile App (React Native / Expo)", value="mobile_app", recommended=(rec_platform == "mobile_app")),
            QuestionOption(label="Desktop / CLI Tool", value="desktop_cli", recommended=False),
        ],
    )

    # Q2: Scope
    q2 = Question(
        id="q_scope",
        category="scope",
        text="What is the scope and target environment for this project?",
        options=[
            QuestionOption(label="Personal / Research Prototype (Quick setup, lightweight)", value="personal_prototype", recommended=is_ml_ai),
            QuestionOption(label="Production MVP (Modular architecture, scalable)", value="production_mvp", recommended=not is_ml_ai),
            QuestionOption(label="Enterprise / Scaled Service (Multi-worker, queue, metrics)", value="enterprise_scaled", recommended=False),
        ],
    )

    # Q3: Authentication
    needs_auth = any(kw in idea_lower for kw in ["user", "account", "login", "auth", "saas", "dashboard", "billing", "profile", "admin"])
    q3 = Question(
        id="q_auth",
        category="auth",
        text="Does your application require user authentication and accounts?",
        options=[
            QuestionOption(label="Yes — JWT / OAuth2 (Secure user registration & login)", value="jwt_auth", recommended=needs_auth),
            QuestionOption(label="Yes — Social Login (Google / GitHub OAuth)", value="social_auth", recommended=False),
            QuestionOption(label="No — Public Access / Self-Contained (Direct access)", value="no_auth", recommended=not needs_auth),
        ],
    )

    # Q4: API Integration
    is_fintech = any(kw in idea_lower for kw in ["payment", "stripe", "billing", "invoice", "money"])
    q4 = Question(
        id="q_api_integration",
        category="integrations",
        text="What external API integrations will the project require?",
        options=[
            QuestionOption(label="AI Model Inference / Hugging Face / Cloud Vision APIs", value="ai_cloud_apis", recommended=is_ml_ai),
            QuestionOption(label="Payment Gateway (Stripe / PayPal)", value="payment_stripe", recommended=is_fintech),
            QuestionOption(label="Cloud Storage (AWS S3 / MinIO for media & datasets)", value="cloud_storage", recommended=(is_ml_ai or "image" in idea_lower)),
            QuestionOption(label="None — Self-contained without third-party API dependencies", value="none_self_contained", recommended=(not is_ml_ai and not is_fintech)),
        ],
    )

    # Q5: Dataset
    if "caption" in idea_lower or "image" in idea_lower:
        rec_dataset = "flickr_coco"
    elif is_ml_ai:
        rec_dataset = "custom_dataset"
    else:
        rec_dataset = "no_dataset"

    q5 = Question(
        id="q_dataset",
        category="dataset",
        text="Does this project require a training or benchmark dataset?",
        options=[
            QuestionOption(label="Image-Captioning Dataset (Flickr8k / MS COCO image-text pairs)", value="flickr_coco", recommended=(rec_dataset == "flickr_coco")),
            QuestionOption(label="Custom Dataset (Local image / text / audio directory structure)", value="custom_dataset", recommended=(rec_dataset == "custom_dataset")),
            QuestionOption(label="Pretrained Weights Only (Download model checkpoints, no raw training data)", value="pretrained_weights", recommended=False),
            QuestionOption(label="No Dataset Required (Standard transactional application data)", value="no_dataset", recommended=(rec_dataset == "no_dataset")),
        ],
    )

    # Q6: Deployment
    q6 = Question(
        id="q_deployment",
        category="deployment",
        text="What is your primary deployment target?",
        options=[
            QuestionOption(label="Docker Container (Docker Compose ready for local & cloud deployment)", value="docker_compose", recommended=True),
            QuestionOption(label="Cloud Server / VM (AWS EC2 / DigitalOcean with GPU support)", value="cloud_vm", recommended=False),
            QuestionOption(label="Serverless / Edge (Vercel / Netlify / Modal Labs)", value="serverless_edge", recommended=False),
            QuestionOption(label="Local Development Machine Only", value="local_only", recommended=False),
        ],
    )

    return [q1, q2, q3, q4, q5, q6]


QUESTION_SYSTEM_PROMPT = """You are a senior systems architect. Given a project idea, generate exactly 5-6 guided questions to define the project requirements.
The questions MUST cover:
1. Platform/Interface (Web, Mobile, API, Desktop, CLI)
2. Project Scale/Scope (Personal/Prototype, Production MVP, Enterprise)
3. Authentication requirements (JWT, OAuth, None)
4. External API integrations (AI APIs, Storage, Payments, None)
5. Dataset requirements (Specific dataset name if AI/ML e.g. Flickr8k/COCO/Kaggle, or Pretrained, or None)
6. Deployment target (Docker, Cloud VM, Vercel, Local)

Ensure option labels and recommendations are deeply relevant to the specific project domain (e.g. for Image Captioning, reference PyTorch, Flickr8k/COCO dataset, CNN feature extraction).

Return ONLY valid JSON in this exact structure without markdown fences:
{
  "questions": [
    {
      "id": "q_unique_id",
      "category": "platform|scope|auth|integrations|dataset|deployment",
      "text": "Question text?",
      "options": [
        {"label": "Option Description", "value": "opt_value", "recommended": true}
      ]
    }
  ]
}"""


async def run_question_agent(idea: str) -> list[Question]:
    """Generate guided clarifying questions for a project idea."""
    if settings.groq_api_key:
        try:
            return await _call_groq_questions(idea)
        except Exception as e:
            print(f"Groq question generation failed: {e}")

    if settings.gemini_api_key:
        try:
            return await _call_gemini_questions(idea)
        except Exception as e:
            print(f"Gemini question generation failed: {e}")

    return _generate_fallback_questions(idea)


async def _call_groq_questions(idea: str) -> list[Question]:
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=settings.groq_api_key,
        temperature=0.2,
        max_retries=0,
    )

    response = await llm.ainvoke([
        SystemMessage(content=QUESTION_SYSTEM_PROMPT),
        HumanMessage(content=f"Project idea: {idea}"),
    ])

    return _parse_questions(response.content, idea)


async def _call_gemini_questions(idea: str) -> list[Question]:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=settings.gemini_api_key,
        temperature=0.2,
        max_retries=0,
    )

    response = await llm.ainvoke([
        SystemMessage(content=QUESTION_SYSTEM_PROMPT),
        HumanMessage(content=f"Project idea: {idea}"),
    ])

    return _parse_questions(response.content, idea)


def _parse_questions(raw: str, idea: str) -> list[Question]:
    """Parse JSON and validate Question models."""
    clean = raw.strip()
    if clean.startswith("```"):
        clean = re.sub(r"^```(?:json)?\n?", "", clean)
        clean = re.sub(r"\n?```$", "", clean)

    data = json.loads(clean)
    questions = []
    for q in data.get("questions", []):
        options = [QuestionOption(**o) for o in q.get("options", [])]
        questions.append(
            Question(
                id=q.get("id", f"q_{len(questions)}"),
                category=q.get("category", "general"),
                text=q.get("text", ""),
                options=options,
            )
        )

    if len(questions) < 4:
        return _generate_fallback_questions(idea)

    return questions
