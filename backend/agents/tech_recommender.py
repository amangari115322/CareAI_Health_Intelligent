"""
Tech Recommender Agent — Analyzes project idea and requirements answers,
and produces categorized technology stack recommendations:
  - Frontend
  - Backend
  - Language
  - AI/ML Model & Framework
  - Database & Storage
  - APIs & Integrations
  - Authentication
  - Deployment & DevOps
  - Dataset & Pipeline
"""

import json
import re
from typing import Any

from config import settings
from models.project import Answer, TechCategory, TechItem


def _domain_analysis(idea: str, answers: list[Answer]) -> dict[str, Any]:
    """Detects domain, tech requirements, and specific components."""
    idea_lower = idea.lower()
    ans_values = {a.question_id: a.value for a in answers}

    is_cv = any(kw in idea_lower for kw in ["image", "caption", "cnn", "vision", "detect", "face", "segment", "yolo", "resnet", "vgg", "video"])
    is_nlp = any(kw in idea_lower for kw in ["nlp", "text", "rnn", "lstm", "transformer", "bert", "gpt", "sentiment", "translation", "speech", "whisper"])
    is_ai_ml = is_cv or is_nlp or any(kw in idea_lower for kw in ["ai", "ml", "neural", "predict", "model", "deep learning", "classifier", "regression"])
    is_mobile = ans_values.get("q_platform") == "mobile_app" or "mobile" in idea_lower
    is_api_only = ans_values.get("q_platform") == "api_service"
    is_stream = ans_values.get("q_platform") == "web_ai_app" or (is_ai_ml and not is_mobile and not is_api_only)
    needs_auth = ans_values.get("q_auth") in ["jwt_auth", "social_auth"] or any(kw in idea_lower for kw in ["user", "account", "login", "auth", "saas"])
    is_docker = ans_values.get("q_deployment", "docker_compose") in ["docker_compose", "cloud_vm"]

    return {
        "is_cv": is_cv,
        "is_nlp": is_nlp,
        "is_ai_ml": is_ai_ml,
        "is_mobile": is_mobile,
        "is_api_only": is_api_only,
        "is_stream": is_stream,
        "needs_auth": needs_auth,
        "is_docker": is_docker,
        "ans_values": ans_values,
    }


def get_default_tech_categories(idea: str, answers: list[Answer]) -> list[TechCategory]:
    """Provides high-precision domain-specific technology recommendations."""
    info = _domain_analysis(idea, answers)
    idea_lower = idea.lower()

    # 1. AI/ML Model Category
    ai_items = []
    if "caption" in idea_lower or ("cnn" in idea_lower and "rnn" in idea_lower):
        ai_items = [
            TechItem(
                id="cnn_resnet50",
                name="CNN Feature Extractor (ResNet50 / VGG16)",
                category="ai_model",
                description="Extracts 2048-dim spatial image feature vectors from input photos",
                icon="🖼️",
                recommended=True,
                selected=True,
                tag="Vision Encoder",
            ),
            TechItem(
                id="rnn_lstm_decoder",
                name="LSTM / GRU Attention Decoder",
                category="ai_model",
                description="Autoregressive sequence decoder generating natural language word captions",
                icon="🧠",
                recommended=True,
                selected=True,
                tag="Sequence Decoder",
            ),
            TechItem(
                id="pytorch_framework",
                name="PyTorch 2.4",
                category="ai_model",
                description="High-performance deep learning tensor computation and training framework",
                icon="🔥",
                recommended=True,
                selected=True,
                tag="Core ML Framework",
            ),
            TechItem(
                id="torchvision",
                name="TorchVision Transforms",
                category="ai_model",
                description="Image normalization, augmentations, and pretrained vision backbone library",
                icon="👁️",
                recommended=True,
                selected=True,
                tag="Computer Vision",
            ),
        ]
    elif info["is_cv"]:
        ai_items = [
            TechItem(
                id="yolov8_cv",
                name="YOLOv8 / CNN Backbone",
                category="ai_model",
                description="Real-time object detection and feature extraction",
                icon="🎯",
                recommended=True,
                selected=True,
                tag="Vision",
            ),
            TechItem(
                id="opencv",
                name="OpenCV Python",
                category="ai_model",
                description="Real-time computer vision processing, bounding boxes, and filtering",
                icon="📷",
                recommended=True,
                selected=True,
                tag="CV Library",
            ),
            TechItem(
                id="pytorch_framework",
                name="PyTorch",
                category="ai_model",
                description="Deep learning framework for training and inference",
                icon="🔥",
                recommended=True,
                selected=True,
                tag="Core ML",
            ),
        ]
    elif info["is_nlp"]:
        ai_items = [
            TechItem(
                id="transformers_nlp",
                name="Hugging Face Transformers",
                category="ai_model",
                description="Pretrained tokenizers and language models (BERT / RoBERTa / LLaMA)",
                icon="🤗",
                recommended=True,
                selected=True,
                tag="NLP Model",
            ),
            TechItem(
                id="pytorch_framework",
                name="PyTorch",
                category="ai_model",
                description="Deep learning framework for NLP inference",
                icon="🔥",
                recommended=True,
                selected=True,
                tag="Core ML",
            ),
        ]
    else:
        ai_items = [
            TechItem(
                id="scikit_learn",
                name="Scikit-Learn & NumPy",
                category="ai_model",
                description="Statistical modeling, feature scaling, and predictive pipelines",
                icon="📊",
                recommended=True,
                selected=True,
                tag="ML Suite",
            ),
        ]

    # 2. Frontend Category
    if info["is_mobile"]:
        fe_items = [
            TechItem(id="react_native", name="React Native + Expo", category="frontend", description="Cross-platform iOS and Android mobile app", icon="📱", recommended=True, selected=True, tag="Mobile UI"),
            TechItem(id="tailwind_rn", name="NativeWind (Tailwind)", category="frontend", description="Tailwind CSS styling for native apps", icon="🎨", recommended=True, selected=True, tag="Styling"),
        ]
    elif info["is_api_only"]:
        fe_items = [
            TechItem(id="swagger_docs", name="FastAPI Swagger UI & Redoc", category="frontend", description="Auto-generated interactive API documentation and testing playground", icon="📖", recommended=True, selected=True, tag="API UI"),
            TechItem(id="cli_interface", name="CLI Terminal Interface (Rich)", category="frontend", description="Beautiful interactive command-line interface for testing endpoints", icon="💻", recommended=False, selected=False, tag="Terminal"),
        ]
    elif info["is_ai_ml"]:
        fe_items = [
            TechItem(id="streamlit", name="Streamlit Interactive Dashboard", category="frontend", description="Rapid Python web UI with image upload, live inference cards, and sliders", icon="👑", recommended=True, selected=True, tag="AI Web UI"),
            TechItem(id="nextjs_react", name="Next.js 14 App Router", category="frontend", description="Modern TypeScript full-stack web application for customer-facing interfaces", icon="▲", recommended=False, selected=False, tag="Full Stack Web"),
            TechItem(id="gradio", name="Gradio Interface", category="frontend", description="Lightweight machine learning web demo app with webcam & upload support", icon="🧪", recommended=False, selected=False, tag="ML Demo"),
        ]
    else:
        fe_items = [
            TechItem(id="nextjs_react", name="Next.js 14 (App Router + Tailwind)", category="frontend", description="Production React framework with SSR and responsive UI", icon="▲", recommended=True, selected=True, tag="Full Stack Web"),
            TechItem(id="shadcn_ui", name="Shadcn/UI & Radix Primitives", category="frontend", description="Accessible, customizable enterprise component system", icon="🧩", recommended=True, selected=True, tag="Design System"),
        ]

    # 3. Backend Category
    be_items = [
        TechItem(id="fastapi", name="FastAPI (Async Python)", category="backend", description="High-performance async REST API with Pydantic validation & OpenAPI schema", icon="⚡", recommended=True, selected=True, tag="REST Server"),
        TechItem(id="uvicorn", name="Uvicorn ASGI Server", category="backend", description="Blazing-fast asynchronous Python web server worker", icon="🚀", recommended=True, selected=True, tag="ASGI Server"),
        TechItem(id="celery_worker", name="Celery Task Queue", category="backend", description="Asynchronous background queue for heavy GPU/CPU batch inference", icon="⚙️", recommended=False, selected=False, tag="Job Queue"),
    ]

    # 4. Language Category
    lang_items = [
        TechItem(id="python_lang", name="Python 3.11+", category="language", description="Standard language for AI/ML, data processing, and FastAPI services", icon="🐍", recommended=True, selected=True, tag="Primary Language"),
        TechItem(id="typescript_lang", name="TypeScript", category="language", description="Type-safe language for web frontend and mobile client code", icon="📘", recommended=not info["is_ai_ml"] or not info["is_stream"], selected=not info["is_ai_ml"], tag="Frontend Language"),
    ]

    # 5. Database & Storage Category
    db_items = [
        TechItem(id="postgres_db", name="PostgreSQL 16", category="database", description="Relational database for storing user metadata, generated captions, and history", icon="🐘", recommended=True, selected=True, tag="Relational DB"),
        TechItem(id="local_file_storage", name="Local Filesystem Cache (media/)", category="database", description="Organized storage for uploaded input images and cached predictions", icon="📁", recommended=True, selected=True, tag="Media Store"),
        TechItem(id="redis_cache", name="Redis 7 Cache", category="database", description="In-memory cache for fast lookup of previously processed image hashes", icon="🔴", recommended=False, selected=False, tag="Cache"),
    ]

    # 6. APIs & Integrations Category
    api_items = []
    if info["is_cv"] or info["is_ai_ml"]:
        api_items = [
            TechItem(id="hf_hub", name="Hugging Face Hub API", category="api", description="Direct access to pretrained model weights, vocabulary files, and tokenizer configs", icon="🤗", recommended=True, selected=True, tag="Model Hub"),
            TechItem(id="pillow_imaging", name="PIL / Pillow Imaging Library", category="api", description="RGB conversion, image aspect ratio preservation, and resizing pipeline", icon="🖼️", recommended=True, selected=True, tag="Image Processing"),
        ]
    else:
        api_items = [
            TechItem(id="stripe_api", name="Stripe Payments API", category="api", description="Credit card processing, subscriptions, and webhook handling", icon="💳", recommended=False, selected=False, tag="Payments"),
        ]

    # 7. Authentication Category
    if info["needs_auth"]:
        auth_items = [
            TechItem(id="jwt_bearer", name="OAuth2 with JWT Bearer Tokens", category="auth", description="Stateless, secure token authentication with password hashing (Bcrypt)", icon="🔐", recommended=True, selected=True, tag="Security"),
        ]
    else:
        auth_items = [
            TechItem(id="public_access", name="Public / No Auth Required", category="auth", description="Self-contained application with direct access to inference and endpoints", icon="🔓", recommended=True, selected=True, tag="Open Access"),
            TechItem(id="api_key_auth", name="API Key Header (X-API-Key)", category="auth", description="Simple secret key authentication header for API endpoints", icon="🔑", recommended=False, selected=False, tag="API Key"),
        ]

    # 8. Deployment Category
    deploy_items = [
        TechItem(id="docker_compose", name="Docker & Docker Compose", category="deployment", description="Multi-container orchestration for reproducible development and deployment", icon="🐳", recommended=True, selected=True, tag="Container"),
        TechItem(id="dockerfile_spec", name="Production Multi-Stage Dockerfile", category="deployment", description="Optimized Python container build with PyTorch CUDA / CPU support", icon="📦", recommended=True, selected=True, tag="Dockerfile"),
    ]

    # 9. Dataset Category
    if "caption" in idea_lower or ("cnn" in idea_lower and "rnn" in idea_lower):
        dataset_items = [
            TechItem(
                id="flickr8k_dataset",
                name="Flickr8k Dataset (8,092 photos + 5 captions each)",
                category="dataset",
                description="Industry benchmark dataset for training and evaluating CNN-RNN image captioners",
                icon="📊",
                recommended=True,
                selected=True,
                tag="Standard Benchmark",
            ),
            TechItem(
                id="coco_dataset",
                name="MS COCO Captions (Advanced scaled dataset)",
                category="dataset",
                description="Large-scale benchmark with 330K+ images with complex human annotations",
                icon="🗃️",
                recommended=False,
                selected=False,
                tag="Large Scale",
            ),
            TechItem(
                id="custom_image_text",
                name="Custom Image-Text Folder Structure",
                category="dataset",
                description="Directory with images/ and captions.txt pair file format for proprietary data",
                icon="📁",
                recommended=False,
                selected=False,
                tag="Custom Data",
            ),
        ]
    elif info["is_ai_ml"]:
        dataset_items = [
            TechItem(
                id="custom_dataset_dir",
                name="Custom Dataset (train / val / test split)",
                category="dataset",
                description="Standard directory split format with automated data loaders",
                icon="📁",
                recommended=True,
                selected=True,
                tag="Data Directory",
            ),
        ]
    else:
        dataset_items = [
            TechItem(
                id="no_dataset_needed",
                name="No Dataset Required",
                category="dataset",
                description="Standard transactional application with seed database records",
                icon="🚫",
                recommended=True,
                selected=True,
                tag="None",
            ),
        ]

    return [
        TechCategory(id="ai_model", name="AI / ML Framework & Models", icon="🧠", items=ai_items),
        TechCategory(id="frontend", name="Frontend & User Interface", icon="💻", items=fe_items),
        TechCategory(id="backend", name="Backend API & Server", icon="⚡", items=be_items),
        TechCategory(id="language", name="Programming Languages", icon="🐍", items=lang_items),
        TechCategory(id="database", name="Database & Data Storage", icon="🗄️", items=db_items),
        TechCategory(id="dataset", name="Dataset & Data Pipeline", icon="📊", items=dataset_items),
        TechCategory(id="api", name="APIs & External Services", icon="🔌", items=api_items),
        TechCategory(id="auth", name="Authentication & Security", icon="🔐", items=auth_items),
        TechCategory(id="deployment", name="Deployment & DevOps", icon="🐳", items=deploy_items),
    ]


async def recommend_tech_stack(idea: str, answers: list[Answer]) -> list[TechCategory]:
    """Generates intelligent technology stack options using LLM with deterministic fallback."""
    if settings.groq_api_key:
        try:
            return await _call_groq_tech(idea, answers)
        except Exception as e:
            print(f"Groq tech recommendation failed: {e}")

    if settings.gemini_api_key:
        try:
            return await _call_gemini_tech(idea, answers)
        except Exception as e:
            print(f"Gemini tech recommendation failed: {e}")

    return get_default_tech_categories(idea, answers)


TECH_SYSTEM_PROMPT = """You are an expert Chief Technology Officer. Given a project idea and requirements answers, recommend the optimal technology stack across 9 categories.
Categories:
1. "ai_model": AI/ML models, neural networks, or libraries strictly relevant to the project (e.g. ResNet50, LSTM, PyTorch, YOLO, HuggingFace)
2. "frontend": UI Framework (e.g. Streamlit, Next.js, Gradio, React Native, CLI)
3. "backend": Backend Server (e.g. FastAPI, Flask, Express, Django)
4. "language": Core language (e.g. Python 3.11, TypeScript)
5. "database": Database & storage (e.g. PostgreSQL, Redis, ChromaDB, SQLite)
6. "dataset": Specific dataset if relevant (e.g. Flickr8k, MS COCO, Kaggle, Custom, None)
7. "api": External integrations (e.g. HuggingFace Hub, Pillow, S3)
8. "auth": Authentication (e.g. JWT, None, OAuth2)
9. "deployment": Deployment (e.g. Docker, Docker Compose, AWS)

CRITICAL:
- ONLY recommend technologies that make sense for THIS specific project (e.g. for Image Captioning with CNN+RNN, recommend PyTorch, ResNet50, LSTM, Flickr8k dataset, FastAPI, Streamlit).
- Mark 1-2 items per category as recommended=true and selected=true.

Return ONLY valid JSON in this exact structure without markdown code blocks:
{
  "categories": [
    {
      "id": "category_id",
      "name": "Category Display Name",
      "icon": "emoji",
      "items": [
        {
          "id": "tech_id",
          "name": "Technology Name",
          "category": "category_id",
          "description": "Short explanation why it fits",
          "icon": "emoji",
          "recommended": true,
          "selected": true,
          "tag": "Short Tag"
        }
      ]
    }
  ]
}"""


async def _call_groq_tech(idea: str, answers: list[Answer]) -> list[TechCategory]:
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage, SystemMessage

    ans_str = "\n".join([f"- {a.question_id}: {a.label} ({a.value})" for a in answers])
    llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=settings.groq_api_key, temperature=0.2, max_retries=0)

    response = await llm.ainvoke([
        SystemMessage(content=TECH_SYSTEM_PROMPT),
        HumanMessage(content=f"Project Idea: {idea}\n\nRequirements Answers:\n{ans_str}"),
    ])

    return _parse_tech_categories(response.content, idea, answers)


async def _call_gemini_tech(idea: str, answers: list[Answer]) -> list[TechCategory]:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage, SystemMessage

    ans_str = "\n".join([f"- {a.question_id}: {a.label} ({a.value})" for a in answers])
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=settings.gemini_api_key, temperature=0.2, max_retries=0)

    response = await llm.ainvoke([
        SystemMessage(content=TECH_SYSTEM_PROMPT),
        HumanMessage(content=f"Project Idea: {idea}\n\nRequirements Answers:\n{ans_str}"),
    ])

    return _parse_tech_categories(response.content, idea, answers)


def _parse_tech_categories(raw: str, idea: str, answers: list[Answer]) -> list[TechCategory]:
    clean = raw.strip()
    if clean.startswith("```"):
        clean = re.sub(r"^```(?:json)?\n?", "", clean)
        clean = re.sub(r"\n?```$", "", clean)

    data = json.loads(clean)
    categories = []
    for cat in data.get("categories", []):
        items = [TechItem(**item) for item in cat.get("items", [])]
        categories.append(TechCategory(id=cat["id"], name=cat["name"], icon=cat.get("icon", "📦"), items=items))

    if len(categories) < 5:
        return get_default_tech_categories(idea, answers)

    return categories
