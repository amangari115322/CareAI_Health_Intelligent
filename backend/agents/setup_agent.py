"""
Setup & Blueprint Specification Agent —
Generates detailed technical specifications, dataset placement guides,
API key configurations, folder tree blueprints, and exact step-by-step setup guides.
"""

from typing import Any
from models.project import Answer, ApiKeyInfo, BlueprintSpec, DatasetInfo, SetupStep


def build_blueprint_spec(idea: str, answers: list[Answer], selected_techs: list[str] | None = None) -> BlueprintSpec:
    """Builds a comprehensive technical blueprint and folder tree preview."""
    idea_lower = idea.lower()
    tech_set = set(t.lower() for t in (selected_techs or []))

    is_captioning = "caption" in idea_lower or ("cnn" in idea_lower and "rnn" in idea_lower)
    is_cv = is_captioning or any(kw in idea_lower for kw in ["vision", "detection", "yolo", "image", "opencv"])
    is_nlp = any(kw in idea_lower for kw in ["nlp", "text", "translation", "bert", "gpt", "rag"])

    if is_captioning:
        title = "Image Captioning System using CNN Encoder & RNN Decoder"
        domain = "Computer Vision & Natural Language Processing (Deep Learning)"
        summary = (
            "An end-to-end deep learning image captioning pipeline that extracts spatial visual features "
            "using a convolutional neural network (ResNet50) and generates natural language descriptive captions "
            "using an autoregressive LSTM attention decoder. Includes a FastAPI inference microservice, a Streamlit "
            "interactive web interface, automated dataset loader, and model checkpoint management."
        )
        features = [
            "CNN Image Feature Extraction: 2048-dimensional semantic embeddings from ResNet50",
            "RNN Attention Decoder: Word-by-word sentence prediction with beam search and greedy decoding",
            "Flickr8k Dataset Pipeline: Automated data ingestion, vocabulary creation, and batch tensor collation",
            "FastAPI Microservice: Async multipart/form-data upload endpoint (/predict) returning JSON captions",
            "Interactive Streamlit UI: Drag-and-drop photo tester with live caption overlay and confidence metrics",
            "Docker Ready: Containerized deployment configuration with CPU and CUDA GPU support",
        ]
        dataset = DatasetInfo(
            required=True,
            name="Flickr8k Dataset (8,092 Photos with 5 Captions each)",
            source="Kaggle / University of Illinois Urbana-Champaign",
            download_url="https://www.kaggle.com/datasets/adityajn105/flickr8k",
            target_directory="data/",
            instructions=(
                "Download the Flickr8k dataset archive. Extract 'Images/' (containing 8k .jpg files) "
                "and 'captions.txt' into the 'data/' directory of the project. "
                "Alternatively, run 'python dataset/download.py' to automatically fetch sample benchmark data."
            ),
            sample_files=["data/Images/1000268201_693b08cb0e.jpg", "data/captions.txt", "data/vocab.pkl"],
        )
        api_keys = [
            ApiKeyInfo(
                name="Hugging Face Token (Optional)",
                env_var="HUGGINGFACE_TOKEN",
                portal_url="https://huggingface.co/settings/tokens",
                description="Optional token for downloading pretrained model checkpoints and vocabulary weights",
                is_required=False,
            )
        ]
        folder_tree = [
            {"path": "models/", "name": "models", "type": "folder", "description": "PyTorch model architecture definitions"},
            {"path": "models/encoder_cnn.py", "name": "encoder_cnn.py", "type": "file", "description": "ResNet50 feature extraction network"},
            {"path": "models/decoder_rnn.py", "name": "decoder_rnn.py", "type": "file", "description": "LSTM / Attention word sequence decoder"},
            {"path": "models/captioner.py", "name": "captioner.py", "type": "file", "description": "Unified Encoder-Decoder PyTorch Module"},
            {"path": "dataset/", "name": "dataset", "type": "folder", "description": "Data loading, tokenization, and vocab utilities"},
            {"path": "dataset/vocabulary.py", "name": "vocabulary.py", "type": "file", "description": "Word-to-index mapping and tokenization class"},
            {"path": "dataset/data_loader.py", "name": "data_loader.py", "type": "file", "description": "PyTorch Dataset and DataLoader collate_fn"},
            {"path": "dataset/download.py", "name": "download.py", "type": "file", "description": "Automated dataset download and sample generator script"},
            {"path": "app/", "name": "app", "type": "folder", "description": "FastAPI backend inference application"},
            {"path": "app/main.py", "name": "main.py", "type": "file", "description": "FastAPI app, routes, CORS, and health checks"},
            {"path": "app/inference.py", "name": "inference.py", "type": "file", "description": "Image preprocessing and model inference runner"},
            {"path": "app/streamlit_app.py", "name": "streamlit_app.py", "type": "file", "description": "Streamlit interactive web dashboard"},
            {"path": "data/", "name": "data", "type": "folder", "description": "Local dataset storage directory"},
            {"path": ".env.example", "name": ".env.example", "type": "file", "description": "Environment variables template"},
            {"path": "Dockerfile", "name": "Dockerfile", "type": "file", "description": "Production Docker container build specification"},
            {"path": "docker-compose.yml", "name": "docker-compose.yml", "type": "file", "description": "Container orchestration setup"},
            {"path": "requirements.txt", "name": "requirements.txt", "type": "file", "description": "Python dependencies (torch, torchvision, fastapi, etc.)"},
            {"path": "README.md", "name": "README.md", "type": "file", "description": "Comprehensive setup guide, dataset placement, and execution commands"},
        ]
        commands = [
            "cd project",
            "python -m venv venv",
            "venv\\Scripts\\activate  # On Windows (or 'source venv/bin/activate' on Linux)",
            "pip install -r requirements.txt",
            "python dataset/download.py  # Download sample images or setup Flickr8k",
            "uvicorn app.main:app --reload --port 8000  # Start FastAPI inference server",
            "streamlit run app/streamlit_app.py  # In a new terminal: open web tester",
        ]

    else:
        title = f"Production System: {idea[:60]}"
        domain = "Full Stack Web & API Engineering"
        summary = f"Modular, scalable full-stack system implementing: {idea}. Includes API services, database storage, and container orchestration."
        features = [
            "Modern Async Backend: FastAPI server with Pydantic schema validation",
            "Relational Database Integration: PostgreSQL storage with SQLAlchemy ORM",
            "Container Orchestration: Multi-container Docker Compose configuration",
            "Interactive Documentation: Auto-generated OpenAPI / Swagger UI",
        ]
        dataset = DatasetInfo(
            required=False,
            name="No External Dataset Required",
            source="N/A",
            instructions="This project uses standard relational database models and mock seed fixtures.",
        )
        api_keys = []
        folder_tree = [
            {"path": "app/", "name": "app", "type": "folder", "description": "FastAPI application core"},
            {"path": "app/main.py", "name": "main.py", "type": "file", "description": "FastAPI entry point and route registrations"},
            {"path": "app/routers/", "name": "routers", "type": "folder", "description": "API route handlers"},
            {"path": "app/models/", "name": "models", "type": "folder", "description": "Database and schema definitions"},
            {"path": ".env.example", "name": ".env.example", "type": "file", "description": "Configuration template"},
            {"path": "docker-compose.yml", "name": "docker-compose.yml", "type": "file", "description": "Multi-container compose file"},
            {"path": "requirements.txt", "name": "requirements.txt", "type": "file", "description": "Python dependencies"},
            {"path": "README.md", "name": "README.md", "type": "file", "description": "Execution instructions"},
        ]
        commands = [
            "cd project",
            "python -m venv venv",
            "venv\\Scripts\\activate",
            "pip install -r requirements.txt",
            "uvicorn app.main:app --reload --port 8000",
        ]

    return BlueprintSpec(
        title=title,
        summary=summary,
        domain=domain,
        architecture_overview=summary,
        key_features=features,
        dataset_info=dataset,
        api_keys=api_keys,
        folder_tree=folder_tree,
        setup_commands=commands,
    )


def generate_setup_steps(idea: str, answers: list[Answer], selected_techs: list[str] | None = None) -> list[SetupStep]:
    """Generates tailored setup steps for the user's project."""
    spec = build_blueprint_spec(idea, answers, selected_techs)
    steps = []
    step_num = 1

    # Step 1: Environment
    steps.append(
        SetupStep(
            step=step_num,
            title="Create Virtual Environment & Install Dependencies",
            body="Set up an isolated Python 3.11+ virtual environment and install the verified packages:",
            code="python -m venv venv\nvenv\\Scripts\\activate\npip install -r requirements.txt",
        )
    )
    step_num += 1

    # Step 2: Dataset (if required)
    if spec.dataset_info and spec.dataset_info.required:
        steps.append(
            SetupStep(
                step=step_num,
                title=f"Setup {spec.dataset_info.name}",
                body=spec.dataset_info.instructions,
                code="python dataset/download.py",
                url=spec.dataset_info.download_url,
                file="data/",
            )
        )
        step_num += 1

    # Step 3: API Keys
    if spec.api_keys:
        for key in spec.api_keys:
            steps.append(
                SetupStep(
                    step=step_num,
                    title=f"Configure {key.name}",
                    body=f"Open `.env` (copied from `.env.example`) and configure your `{key.env_var}`: {key.description}",
                    code=f"{key.env_var}=your_key_here",
                    url=key.portal_url,
                    file=".env",
                )
            )
            step_num += 1

    # Step 4: Docker / DB Services
    steps.append(
        SetupStep(
            step=step_num,
            title="Start Supporting Services (Docker Compose)",
            body="Launch PostgreSQL and containerized services using Docker Compose:",
            code="docker compose up -d",
        )
    )
    step_num += 1

    # Step 5: Start Backend Server
    steps.append(
        SetupStep(
            step=step_num,
            title="Launch FastAPI Inference API Server",
            body="Start the high-performance async prediction backend on port 8000:",
            code="uvicorn app.main:app --reload --port 8000",
        )
    )
    step_num += 1

    # Step 6: Start Frontend / Interactive UI
    steps.append(
        SetupStep(
            step=step_num,
            title="Start Interactive Web Interface",
            body="In a new terminal, launch the interactive UI dashboard to upload and test:",
            code="streamlit run app/streamlit_app.py",
        )
    )
    step_num += 1

    # Step 7: Test Prediction
    steps.append(
        SetupStep(
            step=step_num,
            title="Test Prediction via API or Browser",
            body="Send a sample image through the API or open the Streamlit web dashboard in your browser:",
            code='curl -X POST "http://localhost:8000/predict" -F "file=@data/sample.jpg"',
            url="http://localhost:8501",
        )
    )

    return steps
