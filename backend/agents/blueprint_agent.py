"""
Blueprint Agent — Generates project-specific React Flow diagrams:
  1. Architecture Diagram (System Components, Microservices, DB, Models)
  2. System / Agent Workflow (Step-by-step logic, pipeline execution, decision points)
  3. Data Flow (Data inputs, transformations, vectors, payloads, persistence)

All nodes strictly represent the user's project — NO generic platform nodes.
"""

import json
import re
from typing import Any

from config import settings
from models.project import Answer, DiagramData


def generate_domain_diagrams(idea: str, answers: list[Answer], selected_techs: list[str] | None = None) -> dict[str, DiagramData]:
    """Generates authentic domain-specific diagrams matching the project."""
    idea_lower = idea.lower()
    selected_set = set(t.lower() for t in (selected_techs or []))

    # Check if Image Captioning / Vision-Language project
    is_captioning = "caption" in idea_lower or ("cnn" in idea_lower and "rnn" in idea_lower)
    is_cv = is_captioning or any(kw in idea_lower for kw in ["vision", "detection", "yolo", "resnet", "image", "opencv", "segmentation"])
    is_nlp = any(kw in idea_lower for kw in ["nlp", "text", "translation", "sentiment", "bert", "gpt", "rag", "chat", "summariz"])

    if is_captioning:
        return _build_captioning_diagrams(selected_set)
    elif is_cv:
        return _build_computer_vision_diagrams(idea, selected_set)
    elif is_nlp:
        return _build_nlp_diagrams(idea, selected_set)
    else:
        return _build_fullstack_diagrams(idea, selected_set)


def _build_captioning_diagrams(techs: set[str]) -> dict[str, DiagramData]:
    """Diagrams for Image Captioning with CNN + RNN."""
    arch = DiagramData(
        nodes=[
            {
                "id": "ui_client",
                "type": "serviceNode",
                "position": {"x": 80, "y": 200},
                "data": {
                    "label": "Streamlit / Web App",
                    "subtitle": "Image Upload & Inference UI",
                    "tech": "Streamlit / React",
                    "icon": "🖼️",
                    "responsibility": "Allows users to drag & drop photos, preview input images, and display generated sentence captions with confidence scores.",
                },
            },
            {
                "id": "api_server",
                "type": "serviceNode",
                "position": {"x": 420, "y": 200},
                "data": {
                    "label": "FastAPI Inference Server",
                    "subtitle": "Async Prediction Endpoint",
                    "tech": "FastAPI + Uvicorn",
                    "icon": "⚡",
                    "responsibility": "Validates incoming multipart/form-data image uploads, manages model lifecycle in GPU/CPU memory, and serializes responses.",
                },
            },
            {
                "id": "preprocessing_pipeline",
                "type": "serviceNode",
                "position": {"x": 760, "y": 100},
                "data": {
                    "label": "Image Preprocessor",
                    "subtitle": "Normalization & Resize",
                    "tech": "TorchVision + PIL",
                    "icon": "✂️",
                    "responsibility": "Resizes input to 224x224, converts color profile to RGB, and normalizes pixel intensities using ImageNet mean & std values.",
                },
            },
            {
                "id": "cnn_encoder",
                "type": "agentNode",
                "position": {"x": 1100, "y": 100},
                "data": {
                    "label": "CNN Feature Encoder",
                    "subtitle": "Pretrained ResNet50 Backbone",
                    "tech": "PyTorch (ResNet50)",
                    "icon": "👁️",
                    "responsibility": "Extracts high-level spatial feature embeddings (2048-dim representation) from the processed image tensor.",
                },
            },
            {
                "id": "rnn_decoder",
                "type": "agentNode",
                "position": {"x": 1100, "y": 320},
                "data": {
                    "label": "LSTM / RNN Caption Decoder",
                    "subtitle": "Autoregressive Sequence Generator",
                    "tech": "PyTorch LSTM / Attention",
                    "icon": "🧠",
                    "responsibility": "Generates word tokens sequentially conditioned on image features and previous tokens until the <end> marker is predicted.",
                },
            },
            {
                "id": "vocab_store",
                "type": "dataNode",
                "position": {"x": 760, "y": 320},
                "data": {
                    "label": "Vocabulary & Tokenizer",
                    "subtitle": "Flickr8k Word-Index Dict",
                    "tech": "Pickle / JSON Vocab",
                    "icon": "📚",
                    "responsibility": "Maps predicted index integers into human-readable English words and removes punctuation and boundary tokens.",
                },
            },
            {
                "id": "dataset_store",
                "type": "dataNode",
                "position": {"x": 420, "y": 340},
                "data": {
                    "label": "Dataset & Model Checkpoints",
                    "subtitle": "Flickr8k / Pretrained Weights",
                    "tech": "data/ Flickr8k & weights.pth",
                    "icon": "🗄️",
                    "responsibility": "Stores the 8,092 benchmark training photos with captions and cached PyTorch model checkpoint weights.",
                },
            },
        ],
        edges=[
            {"id": "e1", "source": "ui_client", "target": "api_server", "label": "POST /predict", "animated": True},
            {"id": "e2", "source": "api_server", "target": "preprocessing_pipeline", "label": "Raw Image Bytes", "animated": True},
            {"id": "e3", "source": "preprocessing_pipeline", "target": "cnn_encoder", "label": "Tensor (3, 224, 224)", "animated": True},
            {"id": "e4", "source": "cnn_encoder", "target": "rnn_decoder", "label": "Feature Vector (2048-d)", "animated": True},
            {"id": "e5", "source": "vocab_store", "target": "rnn_decoder", "label": "Embeddings Lookup", "animated": False},
            {"id": "e6", "source": "dataset_store", "target": "api_server", "label": "Load Checkpoints", "animated": False},
            {"id": "e7", "source": "rnn_decoder", "target": "api_server", "label": "Caption String", "animated": True},
        ],
    )

    workflow = DiagramData(
        nodes=[
            {
                "id": "wf_input",
                "type": "serviceNode",
                "position": {"x": 80, "y": 180},
                "data": {
                    "label": "1. User Photo Upload",
                    "subtitle": "JPEG/PNG Input",
                    "tech": "Browser Input",
                    "icon": "📥",
                    "responsibility": "User provides an image via web upload or CLI path.",
                },
            },
            {
                "id": "wf_preprocess",
                "type": "serviceNode",
                "position": {"x": 420, "y": 180},
                "data": {
                    "label": "2. Preprocessing & Tensor",
                    "subtitle": "Resize (224x224), Normalize",
                    "tech": "TorchVision",
                    "icon": "⚙️",
                    "responsibility": "Converts image into normalized PyTorch float32 tensor matching ImageNet weights.",
                },
            },
            {
                "id": "wf_cnn",
                "type": "agentNode",
                "position": {"x": 760, "y": 100},
                "data": {
                    "label": "3. CNN Feature Extraction",
                    "subtitle": "Linear Projection to Embed Dim",
                    "tech": "ResNet50 Backbone",
                    "icon": "🔍",
                    "responsibility": "Computes latent context vector describing visual objects, colors, and background scenery.",
                },
            },
            {
                "id": "wf_rnn_step",
                "type": "agentNode",
                "position": {"x": 1100, "y": 180},
                "data": {
                    "label": "4. Beam Search / Greedy Decode",
                    "subtitle": "Token by Token Loop",
                    "tech": "LSTM Attention Unit",
                    "icon": "🔁",
                    "responsibility": "Loops through LSTM timesteps, feeding previous word to predict next word until <end> or max_length.",
                },
            },
            {
                "id": "wf_postprocess",
                "type": "serviceNode",
                "position": {"x": 760, "y": 320},
                "data": {
                    "label": "5. Clean & Format Sentence",
                    "subtitle": "Detokenize & Capitalize",
                    "tech": "Vocab Detokenizer",
                    "icon": "✍️",
                    "responsibility": "Strips boundary tokens (<start>, <end>, <pad>) and forms a clean natural language sentence.",
                },
            },
            {
                "id": "wf_output",
                "type": "dataNode",
                "position": {"x": 420, "y": 340},
                "data": {
                    "label": "6. Result Delivery",
                    "subtitle": "JSON + Visual Overlay",
                    "tech": "Client Response",
                    "icon": "✅",
                    "responsibility": "Renders caption alongside image preview and confidence distribution score.",
                },
            },
        ],
        edges=[
            {"id": "we1", "source": "wf_input", "target": "wf_preprocess", "label": "Image file", "animated": True},
            {"id": "we2", "source": "wf_preprocess", "target": "wf_cnn", "label": "Tensor [1, 3, 224, 224]", "animated": True},
            {"id": "we3", "source": "wf_cnn", "target": "wf_rnn_step", "label": "Context Vector [1, 2048]", "animated": True},
            {"id": "we4", "source": "wf_rnn_step", "target": "wf_postprocess", "label": "Token indices", "animated": True},
            {"id": "we5", "source": "wf_postprocess", "target": "wf_output", "label": "Final text caption", "animated": True},
        ],
    )

    dataflow = DiagramData(
        nodes=[
            {
                "id": "df_image_bytes",
                "type": "serviceNode",
                "position": {"x": 80, "y": 180},
                "data": {
                    "label": "Raw Image Upload",
                    "subtitle": "JPEG/PNG Binary",
                    "tech": "HTTP Multipart",
                    "icon": "📦",
                    "responsibility": "User input payload transmitted over HTTP.",
                },
            },
            {
                "id": "df_tensor",
                "type": "serviceNode",
                "position": {"x": 420, "y": 180},
                "data": {
                    "label": "Normalized Tensor",
                    "subtitle": "Float32 Tensor Shape (1, 3, 224, 224)",
                    "tech": "PyTorch Tensor",
                    "icon": "🔢",
                    "responsibility": "Zero-mean unit-variance image representation.",
                },
            },
            {
                "id": "df_feature_vector",
                "type": "agentNode",
                "position": {"x": 760, "y": 100},
                "data": {
                    "label": "Visual Embeddings",
                    "subtitle": "2048-dim Vector",
                    "tech": "ResNet-50 Penultimate Layer",
                    "icon": "📊",
                    "responsibility": "High-density semantic image descriptor vector.",
                },
            },
            {
                "id": "df_word_tokens",
                "type": "agentNode",
                "position": {"x": 1100, "y": 180},
                "data": {
                    "label": "Logits / Probability Matrix",
                    "subtitle": "Vocab Size Probabilities (V,)",
                    "tech": "Softmax Layer",
                    "icon": "📈",
                    "responsibility": "Token probability distribution generated per decoding timestep.",
                },
            },
            {
                "id": "df_json_output",
                "type": "dataNode",
                "position": {"x": 760, "y": 320},
                "data": {
                    "label": "Caption Response Payload",
                    "subtitle": "{\"caption\": \"A dog playing...\"}",
                    "tech": "JSON Payload",
                    "icon": "📄",
                    "responsibility": "Structured output delivered to frontend with prediction latency and confidence.",
                },
            },
        ],
        edges=[
            {"id": "de1", "source": "df_image_bytes", "target": "df_tensor", "label": "transforms.ToTensor()", "animated": True},
            {"id": "de2", "source": "df_tensor", "target": "df_feature_vector", "label": "cnn.forward()", "animated": True},
            {"id": "de3", "source": "df_feature_vector", "target": "df_word_tokens", "label": "lstm.forward()", "animated": True},
            {"id": "de4", "source": "df_word_tokens", "target": "df_json_output", "label": "detokenize()", "animated": True},
        ],
    )

    return {"architecture": arch, "workflow": workflow, "dataflow": dataflow}


def _build_computer_vision_diagrams(idea: str, techs: set[str]) -> dict[str, DiagramData]:
    """Diagrams for general Computer Vision applications."""
    arch = DiagramData(
        nodes=[
            {"id": "cv_ui", "type": "serviceNode", "position": {"x": 80, "y": 200}, "data": {"label": "Web Interface", "subtitle": "Live Camera & Upload", "tech": "Streamlit / React", "icon": "👁️", "responsibility": "Renders camera streams, processed bounding boxes, and object counts."}},
            {"id": "cv_api", "type": "serviceNode", "position": {"x": 420, "y": 200}, "data": {"label": "FastAPI Processing Service", "subtitle": "Inference Endpoint", "tech": "FastAPI", "icon": "⚡", "responsibility": "Receives video frames, batches requests, and invokes detection models."}},
            {"id": "cv_preprocess", "type": "serviceNode", "position": {"x": 760, "y": 100}, "data": {"label": "OpenCV Pipeline", "subtitle": "Frame Resize & Color Filter", "tech": "OpenCV Python", "icon": "📷", "responsibility": "Performs letterbox scaling, color conversion, and thresholding."}},
            {"id": "cv_engine", "type": "agentNode", "position": {"x": 1100, "y": 100}, "data": {"label": "Vision Model (YOLO / CNN)", "subtitle": "Detection & Segmentation", "tech": "PyTorch / Ultralytics", "icon": "🎯", "responsibility": "Calculates bounding boxes, confidence values, and class classifications."}},
            {"id": "cv_db", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "Detections & Media Store", "subtitle": "Logged Detections & Frames", "tech": "PostgreSQL + Filesystem", "icon": "🗄️", "responsibility": "Stores audit timestamps, detection events, and annotated snapshots."}},
        ],
        edges=[
            {"id": "e1", "source": "cv_ui", "target": "cv_api", "label": "Video Frames", "animated": True},
            {"id": "e2", "source": "cv_api", "target": "cv_preprocess", "label": "Raw Frames", "animated": True},
            {"id": "e3", "source": "cv_preprocess", "target": "cv_engine", "label": "Normalized Matrix", "animated": True},
            {"id": "e4", "source": "cv_engine", "target": "cv_api", "label": "Bounding Boxes", "animated": True},
            {"id": "e5", "source": "cv_api", "target": "cv_db", "label": "Save Detection Log", "animated": False},
        ],
    )

    workflow = DiagramData(
        nodes=[
            {"id": "cv_wf_capture", "type": "serviceNode", "position": {"x": 80, "y": 180}, "data": {"label": "1. Frame Ingestion", "subtitle": "RTSP Stream / File Upload", "tech": "OpenCV VideoCapture", "icon": "📹", "responsibility": "Buffers real-time video frames or static image payloads into worker memory queue."}},
            {"id": "cv_wf_prep", "type": "serviceNode", "position": {"x": 420, "y": 180}, "data": {"label": "2. Preprocessing & Augment", "subtitle": "Letterbox 640x640 & BGR->RGB", "tech": "NumPy / TorchVision", "icon": "⚙️", "responsibility": "Preserves aspect ratio, applies normalization tensors, and optimizes memory layout."}},
            {"id": "cv_wf_infer", "type": "agentNode", "position": {"x": 760, "y": 100}, "data": {"label": "3. Neural Inference Engine", "subtitle": "FP16 TensorRT / ONNX Runtime", "tech": "CUDA / PyTorch", "icon": "🧠", "responsibility": "Executes model forward pass across spatial anchor grids to predict class confidence."}},
            {"id": "cv_wf_nms", "type": "agentNode", "position": {"x": 1100, "y": 180}, "data": {"label": "4. Non-Max Suppression (NMS)", "subtitle": "IoU Overlap Filtering", "tech": "Torchvision Ops", "icon": "🎯", "responsibility": "Eliminates redundant bounding boxes and keeps predictions above confidence threshold."}},
            {"id": "cv_wf_render", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "5. Annotation & Dispatch", "subtitle": "Overlay Drawing & Alert Trigger", "tech": "WebSocket / REST API", "icon": "📡", "responsibility": "Draws class labels, updates real-time UI dashboard, and logs alert metrics to database."}},
        ],
        edges=[
            {"id": "cv_we1", "source": "cv_wf_capture", "target": "cv_wf_prep", "label": "Raw Frames", "animated": True},
            {"id": "cv_we2", "source": "cv_wf_prep", "target": "cv_wf_infer", "label": "Normalized Batch", "animated": True},
            {"id": "cv_we3", "source": "cv_wf_infer", "target": "cv_wf_nms", "label": "Candidate Boxes", "animated": True},
            {"id": "cv_we4", "source": "cv_wf_nms", "target": "cv_wf_render", "label": "Filtered Detections", "animated": True},
        ],
    )

    dataflow = DiagramData(
        nodes=[
            {"id": "cv_df_stream", "type": "serviceNode", "position": {"x": 80, "y": 180}, "data": {"label": "Video Byte Stream", "subtitle": "H.264 / MJPEG Stream", "tech": "RTSP / WebRTC", "icon": "📦", "responsibility": "Continuous video packets decoded into raw pixel buffers."}},
            {"id": "cv_df_matrix", "type": "serviceNode", "position": {"x": 420, "y": 180}, "data": {"label": "NDArray Matrix", "subtitle": "Shape [Batch, 3, 640, 640]", "tech": "NumPy Array", "icon": "🔢", "responsibility": "Strided contiguous tensor prepared for GPU memory transfer."}},
            {"id": "cv_df_tensors", "type": "agentNode", "position": {"x": 760, "y": 100}, "data": {"label": "Bounding Box Tensors", "subtitle": "Shape [N, 6] (x1, y1, x2, y2, conf, cls)", "tech": "PyTorch Float Tensor", "icon": "📊", "responsibility": "Raw coordinate detections with class probability distribution."}},
            {"id": "cv_df_json", "type": "dataNode", "position": {"x": 1100, "y": 180}, "data": {"label": "Detection Metadata JSON", "subtitle": "Coordinates, Labels & Conf %", "tech": "Pydantic Schema", "icon": "📄", "responsibility": "Structured payload consumed by client overlay canvas."}},
            {"id": "cv_df_audit", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "Incident Log Record", "subtitle": "Event Metadata & Crop Snapshot", "tech": "PostgreSQL Record", "icon": "🗄️", "responsibility": "Persistent audit record stored for historical analytics."}},
        ],
        edges=[
            {"id": "cv_de1", "source": "cv_df_stream", "target": "cv_df_matrix", "label": "cv2.imdecode()", "animated": True},
            {"id": "cv_de2", "source": "cv_df_matrix", "target": "cv_df_tensors", "label": "model(tensor)", "animated": True},
            {"id": "cv_de3", "source": "cv_df_tensors", "target": "cv_df_json", "label": "serialize_detections()", "animated": True},
            {"id": "cv_de4", "source": "cv_df_json", "target": "cv_df_audit", "label": "insert_event()", "animated": False},
        ],
    )

    return {"architecture": arch, "workflow": workflow, "dataflow": dataflow}


def _build_nlp_diagrams(idea: str, techs: set[str]) -> dict[str, DiagramData]:
    """Diagrams for NLP & Text Processing projects."""
    arch = DiagramData(
        nodes=[
            {"id": "nlp_ui", "type": "serviceNode", "position": {"x": 80, "y": 200}, "data": {"label": "Interactive Chat / Text UI", "subtitle": "User Prompt & Results", "tech": "Next.js / Streamlit", "icon": "💬", "responsibility": "Accepts text inputs, displays token generation, and renders formatted responses."}},
            {"id": "nlp_api", "type": "serviceNode", "position": {"x": 420, "y": 200}, "data": {"label": "FastAPI Orchestrator", "subtitle": "Async API Gateway", "tech": "FastAPI + Pydantic", "icon": "⚡", "responsibility": "Validates text schema, handles streaming responses, and manages token limits."}},
            {"id": "nlp_tokenizer", "type": "serviceNode", "position": {"x": 760, "y": 100}, "data": {"label": "Hugging Face Tokenizer", "subtitle": "Subword Tokenization", "tech": "Transformers Tokenizer", "icon": "✂️", "responsibility": "Encodes sentences into subword tokens and attention masks."}},
            {"id": "nlp_model", "type": "agentNode", "position": {"x": 1100, "y": 100}, "data": {"label": "Transformer / Language Model", "subtitle": "Inference Engine", "tech": "PyTorch / Transformers", "icon": "🧠", "responsibility": "Runs transformer attention forward pass and generates completion tokens."}},
            {"id": "nlp_vector_db", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "Vector Embeddings Store", "subtitle": "Document Knowledge Base", "tech": "ChromaDB / FAISS", "icon": "📚", "responsibility": "Indexes text chunks and performs nearest-neighbor semantic search."}},
        ],
        edges=[
            {"id": "e1", "source": "nlp_ui", "target": "nlp_api", "label": "Text Request", "animated": True},
            {"id": "e2", "source": "nlp_api", "target": "nlp_tokenizer", "label": "Raw Text", "animated": True},
            {"id": "e3", "source": "nlp_tokenizer", "target": "nlp_model", "label": "Token IDs [B, S]", "animated": True},
            {"id": "e4", "source": "nlp_vector_db", "target": "nlp_model", "label": "Relevant Context", "animated": False},
            {"id": "e5", "source": "nlp_model", "target": "nlp_api", "label": "Generated Tokens", "animated": True},
        ],
    )

    workflow = DiagramData(
        nodes=[
            {"id": "nlp_wf_query", "type": "serviceNode", "position": {"x": 80, "y": 180}, "data": {"label": "1. Prompt Ingestion", "subtitle": "User Query & Context", "tech": "HTTP POST", "icon": "📝", "responsibility": "Receives user request, sanitizes input strings, and validates length quotas."}},
            {"id": "nlp_wf_retrieval", "type": "agentNode", "position": {"x": 420, "y": 180}, "data": {"label": "2. Semantic Vector Retrieval", "subtitle": "Top-K Similarity Search", "tech": "Dense Retriever / FAISS", "icon": "🔍", "responsibility": "Embeds query and retrieves high-relevance domain chunks from knowledge base."}},
            {"id": "nlp_wf_context", "type": "serviceNode", "position": {"x": 760, "y": 100}, "data": {"label": "3. Prompt Augmentation", "subtitle": "System Instruction + Context", "tech": "Prompt Template Engine", "icon": "🧩", "responsibility": "Assembles structured context-injected prompt according to system schema."}},
            {"id": "nlp_wf_generation", "type": "agentNode", "position": {"x": 1100, "y": 180}, "data": {"label": "4. Autoregressive Inference", "subtitle": "KV-Cached Generation Loop", "tech": "LLM Inference Engine", "icon": "⚡", "responsibility": "Streams completion tokens autoregressively with temperature and repetition penalty."}},
            {"id": "nlp_wf_stream", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "5. SSE Token Streaming", "subtitle": "Server-Sent Events Pipeline", "tech": "FastAPI StreamingResponse", "icon": "📡", "responsibility": "Pushes incremental tokens to client markdown renderer with low time-to-first-token."}},
        ],
        edges=[
            {"id": "nlp_we1", "source": "nlp_wf_query", "target": "nlp_wf_retrieval", "label": "Query String", "animated": True},
            {"id": "nlp_we2", "source": "nlp_wf_retrieval", "target": "nlp_wf_context", "label": "Retrieved Chunks", "animated": True},
            {"id": "nlp_we3", "source": "nlp_wf_context", "target": "nlp_wf_generation", "label": "Full Prompt", "animated": True},
            {"id": "nlp_we4", "source": "nlp_wf_generation", "target": "nlp_wf_stream", "label": "Token Stream", "animated": True},
        ],
    )

    dataflow = DiagramData(
        nodes=[
            {"id": "nlp_df_text", "type": "serviceNode", "position": {"x": 80, "y": 180}, "data": {"label": "UTF-8 String Payload", "subtitle": "Raw Query String", "tech": "HTTP Body", "icon": "📄", "responsibility": "Input payload received via JSON request body."}},
            {"id": "nlp_df_vector", "type": "dataNode", "position": {"x": 420, "y": 180}, "data": {"label": "Dense Embedding Vector", "subtitle": "Shape [1, 768] Float Array", "tech": "Vector Embedding", "icon": "🔢", "responsibility": "Continuous geometric representation of query semantic intent."}},
            {"id": "nlp_df_tokens", "type": "serviceNode", "position": {"x": 760, "y": 100}, "data": {"label": "Token ID Tensors", "subtitle": "Input IDs & Attention Mask", "tech": "PyTorch LongTensor", "icon": "📊", "responsibility": "Subword token integers passed directly into transformer input layers."}},
            {"id": "nlp_df_logits", "type": "agentNode", "position": {"x": 1100, "y": 180}, "data": {"label": "Next-Token Logits", "subtitle": "Probability Distribution [1, V]", "tech": "Softmax Layer", "icon": "📈", "responsibility": "Vocabulary probabilities sampled via nucleus or greedy search."}},
            {"id": "nlp_df_output", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "Parsed Markdown Output", "subtitle": "Final String & Citations", "tech": "JSON Delta Stream", "icon": "✅", "responsibility": "Structured completion delivered to client UI."}},
        ],
        edges=[
            {"id": "nlp_de1", "source": "nlp_df_text", "target": "nlp_df_vector", "label": "embed_text()", "animated": True},
            {"id": "nlp_de2", "source": "nlp_df_vector", "target": "nlp_df_tokens", "label": "tokenizer.encode()", "animated": True},
            {"id": "nlp_de3", "source": "nlp_df_tokens", "target": "nlp_df_logits", "label": "model.generate()", "animated": True},
            {"id": "nlp_de4", "source": "nlp_df_logits", "target": "nlp_df_output", "label": "detokenize()", "animated": True},
        ],
    )

    return {"architecture": arch, "workflow": workflow, "dataflow": dataflow}


def _build_fullstack_diagrams(idea: str, techs: set[str]) -> dict[str, DiagramData]:
    """Diagrams for modern web / SaaS applications."""
    arch = DiagramData(
        nodes=[
            {"id": "fs_fe", "type": "serviceNode", "position": {"x": 80, "y": 200}, "data": {"label": "Frontend Client", "subtitle": "Interactive UI & State", "tech": "Next.js 14 + Tailwind", "icon": "▲", "responsibility": "Delivers dynamic pages, handles client authentication, and manages form states."}},
            {"id": "fs_be", "type": "serviceNode", "position": {"x": 420, "y": 200}, "data": {"label": "Backend API Server", "subtitle": "REST & Business Logic", "tech": "FastAPI (Async Python)", "icon": "⚡", "responsibility": "Authenticates requests, executes business rules, and performs database queries."}},
            {"id": "fs_db", "type": "dataNode", "position": {"x": 760, "y": 100}, "data": {"label": "PostgreSQL Database", "subtitle": "Primary Relational Storage", "tech": "PostgreSQL 16", "icon": "🐘", "responsibility": "Persists users, project records, relationships, and transactional records."}},
            {"id": "fs_cache", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "Redis Cache & Queue", "subtitle": "In-Memory Data Store", "tech": "Redis 7", "icon": "🔴", "responsibility": "Caches session tokens and buffers asynchronous background task queues."}},
            {"id": "fs_worker", "type": "agentNode", "position": {"x": 1100, "y": 200}, "data": {"label": "Background Worker", "subtitle": "Asynchronous Job Execution", "tech": "Celery Worker", "icon": "⚙️", "responsibility": "Executes long-running export tasks, email triggers, and data processing."}},
        ],
        edges=[
            {"id": "e1", "source": "fs_fe", "target": "fs_be", "label": "HTTPS REST Calls", "animated": True},
            {"id": "e2", "source": "fs_be", "target": "fs_db", "label": "SQLAlchemy CRUD", "animated": False},
            {"id": "e3", "source": "fs_be", "target": "fs_cache", "label": "Cache & Task Queue", "animated": True},
            {"id": "e4", "source": "fs_cache", "target": "fs_worker", "label": "Consume Tasks", "animated": True},
        ],
    )

    workflow = DiagramData(
        nodes=[
            {"id": "fs_wf_auth", "type": "serviceNode", "position": {"x": 80, "y": 180}, "data": {"label": "1. JWT Auth Verification", "subtitle": "Bearer Token & Session Check", "tech": "OAuth2 / PyJWT", "icon": "🔒", "responsibility": "Verifies cryptographic signature of incoming Authorization header and extracts user payload."}},
            {"id": "fs_wf_validate", "type": "serviceNode", "position": {"x": 420, "y": 180}, "data": {"label": "2. Request Schema Validation", "subtitle": "Type & Constraint Enforcement", "tech": "Pydantic V2", "icon": "🛡️", "responsibility": "Validates payload types, rejects malformed inputs, and sanitizes dangerous input strings."}},
            {"id": "fs_wf_logic", "type": "agentNode", "position": {"x": 760, "y": 100}, "data": {"label": "3. Domain Business Rules", "subtitle": "Service Layer Processing", "tech": "Domain Services", "icon": "⚙️", "responsibility": "Executes state transitions, permission checks, and transaction boundaries."}},
            {"id": "fs_wf_enqueue", "type": "agentNode", "position": {"x": 1100, "y": 180}, "data": {"label": "4. Task Offloading", "subtitle": "Async Task Dispatch", "tech": "Redis Celery Producer", "icon": "📬", "responsibility": "Dispatches heavy background calculations to asynchronous worker queue."}},
            {"id": "fs_wf_respond", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "5. Response Serialization", "subtitle": "JSON Response with Cache Headers", "tech": "FastAPI Response", "icon": "✅", "responsibility": "Serializes ORM models to response schemas with ETags and status codes."}},
        ],
        edges=[
            {"id": "fs_we1", "source": "fs_wf_auth", "target": "fs_wf_validate", "label": "Authorized User", "animated": True},
            {"id": "fs_we2", "source": "fs_wf_validate", "target": "fs_wf_logic", "label": "Validated Payload", "animated": True},
            {"id": "fs_we3", "source": "fs_wf_logic", "target": "fs_wf_enqueue", "label": "Deferred Work", "animated": True},
            {"id": "fs_we4", "source": "fs_wf_logic", "target": "fs_wf_respond", "label": "Synchronous Data", "animated": True},
        ],
    )

    dataflow = DiagramData(
        nodes=[
            {"id": "fs_df_request", "type": "serviceNode", "position": {"x": 80, "y": 180}, "data": {"label": "Client JSON Request", "subtitle": "HTTP POST /api/v1/resource", "tech": "Fetch API", "icon": "📨", "responsibility": "Client sends mutation command with parameters and authentication."}},
            {"id": "fs_df_dto", "type": "serviceNode", "position": {"x": 420, "y": 180}, "data": {"label": "DTO / Pydantic Model", "subtitle": "Strongly-Typed Python Object", "tech": "Pydantic BaseModel", "icon": "📦", "responsibility": "In-memory typed data transfer object ready for business logic."}},
            {"id": "fs_df_sql", "type": "dataNode", "position": {"x": 760, "y": 100}, "data": {"label": "SQL Queries & Rows", "subtitle": "ACID Relational Operations", "tech": "SQLAlchemy AsyncSession", "icon": "🐘", "responsibility": "Parameterized SQL queries executed within database transaction."}},
            {"id": "fs_df_cache_rec", "type": "dataNode", "position": {"x": 1100, "y": 180}, "data": {"label": "Cached KV Store", "subtitle": "Expiring Key-Value Cache", "tech": "Redis Key-Value", "icon": "🔴", "responsibility": "Hot query results cached with time-to-live to minimize database load."}},
            {"id": "fs_df_response", "type": "dataNode", "position": {"x": 760, "y": 320}, "data": {"label": "Client JSON Response", "subtitle": "HTTP 200 OK + Payload", "tech": "HTTP Response", "icon": "📄", "responsibility": "Formatted JSON payload returned to client browser."}},
        ],
        edges=[
            {"id": "fs_de1", "source": "fs_df_request", "target": "fs_df_dto", "label": "parse_obj()", "animated": True},
            {"id": "fs_de2", "source": "fs_df_dto", "target": "fs_df_sql", "label": "session.commit()", "animated": False},
            {"id": "fs_de3", "source": "fs_df_sql", "target": "fs_df_cache_rec", "label": "redis.setex()", "animated": True},
            {"id": "fs_de4", "source": "fs_df_dto", "target": "fs_df_response", "label": "return model.dict()", "animated": True},
        ],
    )

    return {"architecture": arch, "workflow": workflow, "dataflow": dataflow}


async def run_blueprint_agent(
    idea: str,
    answers: list[Answer],
    selected_techs: list[str] | None = None
) -> dict[str, DiagramData]:
    """Generate dynamic diagrams using LLM or domain fallback."""
    if settings.groq_api_key:
        try:
            return await _call_llm_for_blueprint("groq", idea, answers, selected_techs)
        except Exception as e:
            print(f"Groq blueprint generation failed: {e}")

    if settings.gemini_api_key:
        try:
            return await _call_llm_for_blueprint("gemini", idea, answers, selected_techs)
        except Exception as e:
            print(f"Gemini blueprint generation failed: {e}")

    return generate_domain_diagrams(idea, answers, selected_techs)


BLUEPRINT_PROMPT = """You are a senior enterprise software architect.
Given a project idea, clarifying answers, and the user's selected technology stack, generate THREE complete, professional React Flow diagrams:
1. "architecture": The real system architecture diagram (Frontend, Backend, ML Models, Database, Storage, APIs)
2. "workflow": The step-by-step pipeline or execution lifecycle of the core feature
3. "dataflow": How data payloads, tensors, or records flow from input to output

CRITICAL RULES:
- ONLY include components that genuinely belong to THIS project (e.g. for Image Captioning with CNN and RNN, include CNN Feature Extractor, LSTM Decoder, Vocabulary Tokenizer, Preprocessing, Dataset Store).
- NEVER include meta-agent nodes like "Question Agent", "Answer Collection", or "Blueprint Agent".
- Every node MUST have logical spread-out x and y coordinates. Use x: 80, 340, 600, 860, 1120 and y: 80, 200, 340.
- Node types: "serviceNode", "agentNode", "dataNode".
- Each diagram must have 5-8 nodes and 4-8 edges with meaningful labels.

Return ONLY valid JSON without markdown code blocks:
{
  "architecture": {
    "nodes": [{"id": "id", "type": "serviceNode", "position": {"x": 80, "y": 200}, "data": {"label": "Name", "subtitle": "Role", "tech": "Tech", "icon": "emoji", "responsibility": "Description"}}],
    "edges": [{"id": "e1", "source": "src", "target": "dst", "label": "label", "animated": true}]
  },
  "workflow": {"nodes": [...], "edges": [...]},
  "dataflow": {"nodes": [...], "edges": [...]}
}"""


async def _call_llm_for_blueprint(
    provider: str,
    idea: str,
    answers: list[Answer],
    selected_techs: list[str] | None = None
) -> dict[str, DiagramData]:
    ans_text = "\n".join([f"- {a.question_id}: {a.label} ({a.value})" for a in answers])
    tech_text = ", ".join(selected_techs or [])

    prompt = (
        f"PROJECT IDEA:\n{idea}\n\n"
        f"USER REQUIREMENTS:\n{ans_text}\n\n"
        f"SELECTED TECHNOLOGIES:\n{tech_text}\n\n"
        "Generate the three professional React Flow diagrams for this exact project."
    )

    if provider == "groq":
        from langchain_groq import ChatGroq
        from langchain_core.messages import HumanMessage, SystemMessage
        llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=settings.groq_api_key, temperature=0.2, max_retries=0)
    else:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage, SystemMessage
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=settings.gemini_api_key, temperature=0.2, max_retries=0)

    response = await llm.ainvoke([
        SystemMessage(content=BLUEPRINT_PROMPT),
        HumanMessage(content=prompt),
    ])

    return _parse_diagrams(response.content, idea, answers, selected_techs)


def _parse_diagrams(raw: str, idea: str, answers: list[Answer], selected_techs: list[str] | None = None) -> dict[str, DiagramData]:
    clean = raw.strip()
    if clean.startswith("```"):
        clean = re.sub(r"^```(?:json)?\n?", "", clean)
        clean = re.sub(r"\n?```$", "", clean)

    data = json.loads(clean)
    arch = DiagramData(**data.get("architecture", {}))
    wf = DiagramData(**data.get("workflow", {}))
    df = DiagramData(**data.get("dataflow", {}))

    if len(arch.nodes) < 3:
        return generate_domain_diagrams(idea, answers, selected_techs)

    return {"architecture": arch, "workflow": wf, "dataflow": df}
