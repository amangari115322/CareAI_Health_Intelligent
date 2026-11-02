export type ProjectCategory =
  | "All"
  | "AI/ML"
  | "Generative AI"
  | "Computer Vision"
  | "NLP"
  | "Data Analytics"
  | "SaaS"
  | "Full Stack";

export interface ProjectTemplate {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, "All">;
  icon: string;
  desc: string;
  fullPrompt: string;
  techs: string[];
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "All",
  "AI/ML",
  "Generative AI",
  "Computer Vision",
  "NLP",
  "Data Analytics",
  "SaaS",
  "Full Stack",
];

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // ── Computer Vision ────────────────────────────────────────────────────────
  {
    id: "img-captioning-cnn-rnn",
    title: "Image Captioning using CNN and RNN",
    category: "Computer Vision",
    icon: "🖼️",
    desc: "Extract image features using ResNet-50 and decode natural language sentences with an LSTM network.",
    fullPrompt:
      "Image Captioning using CNN and RNN — deep learning system that takes an input photo and generates descriptive natural language captions using ResNet-50 feature extractor and an LSTM sequence decoder trained on MS COCO dataset, served via FastAPI.",
    techs: ["ResNet-50", "PyTorch", "LSTM", "FastAPI"],
  },
  {
    id: "yolov8-realtime-detection",
    title: "YOLOv8 Real-Time Object Detection Stream",
    category: "Computer Vision",
    icon: "🎯",
    desc: "Process live video frames at 60 FPS, draw bounding boxes, and log object classification metrics.",
    fullPrompt:
      "YOLOv8 Real-Time Object Detection Video Stream — high-throughput computer vision pipeline using Ultralytics YOLOv8, OpenCV video decoding, WebSockets for low-latency bounding box streaming, and a FastAPI inference server.",
    techs: ["YOLOv8", "OpenCV", "FastAPI", "WebSocket"],
  },
  {
    id: "medical-xray-anomaly",
    title: "Medical X-Ray Anomaly Detection",
    category: "Computer Vision",
    icon: "🩺",
    desc: "Detect pulmonary lesions and anomalies from chest X-rays using Vision Transformers (ViT) and Grad-CAM.",
    fullPrompt:
      "Medical X-Ray Anomaly Detection — clinical radiology assistant utilizing Vision Transformer (ViT) architecture, Grad-CAM visual explainability heatmaps, DICOM image parsing, and secure HIPAA-compliant FastAPI endpoints.",
    techs: ["Vision Transformer", "PyTorch", "Grad-CAM", "FastAPI"],
  },
  {
    id: "facial-emotion-recognition",
    title: "Facial Emotion & Expression Recognition",
    category: "Computer Vision",
    icon: "😊",
    desc: "Real-time webcam facial detection and 7-class emotion classification using MobileNetV3.",
    fullPrompt:
      "Facial Emotion Recognition — lightweight edge model using MediaPipe face mesh and MobileNetV3 classifier to detect user emotional states in real-time with sub-15ms latency.",
    techs: ["MobileNetV3", "MediaPipe", "PyTorch", "Next.js"],
  },

  // ── AI/ML ──────────────────────────────────────────────────────────────────
  {
    id: "fraud-detection-xgboost",
    title: "Real-time Fraud Detection with XGBoost",
    category: "AI/ML",
    icon: "🛡️",
    desc: "Stream credit card transactions, score risk probabilities in <20ms, and trigger instant alerts.",
    fullPrompt:
      "Real-time Fraud Detection with XGBoost & FastAPI — stream financial transactions through Apache Kafka, score transaction risk probabilities in <20ms using an optimized XGBoost model, and persist audit logs in PostgreSQL.",
    techs: ["XGBoost", "FastAPI", "Kafka", "PostgreSQL"],
  },
  {
    id: "churn-prediction-engine",
    title: "Customer Churn Prediction Engine",
    category: "AI/ML",
    icon: "📊",
    desc: "Predict subscriber churn probability with LightGBM, SHAP feature attribution, and automated cohorts.",
    fullPrompt:
      "Customer Churn Prediction Pipeline — automated machine learning workflow using LightGBM, SHAP values for feature interpretability, scikit-learn preprocessing pipelines, and periodic batch retraining hooks.",
    techs: ["LightGBM", "SHAP", "Scikit-Learn", "FastAPI"],
  },
  {
    id: "credit-scoring-ml",
    title: "Credit Risk Scoring & Underwriting Engine",
    category: "AI/ML",
    icon: "💳",
    desc: "Assess loan default probabilities with ensemble models, credit bureau ingestion, and explainability.",
    fullPrompt:
      "Credit Risk Scoring & Underwriting Engine — regulatory-compliant credit evaluation system featuring CatBoost tabular models, Fairlearn fairness auditing, and automated PDF credit reports.",
    techs: ["CatBoost", "FastAPI", "PostgreSQL", "Fairlearn"],
  },

  // ── Generative AI ──────────────────────────────────────────────────────────
  {
    id: "rag-document-qa",
    title: "Enterprise Document QA with RAG & ChromaDB",
    category: "Generative AI",
    icon: "📚",
    desc: "Index PDF/DOCX manuals into ChromaDB vector store and answer questions with citation verification.",
    fullPrompt:
      "Enterprise Document QA with RAG — Retrieval-Augmented Generation system using LangChain, ChromaDB vector store, OpenAI/Groq Llama 3 embedding models, and hybrid keyword-vector reranking for enterprise document search.",
    techs: ["LangChain", "ChromaDB", "Llama 3", "FastAPI"],
  },
  {
    id: "multi-agent-researcher",
    title: "Multi-Agent Deep Research System",
    category: "Generative AI",
    icon: "🤖",
    desc: "Autonomous team of LangGraph agents that plan searches, scrape sources, cross-verify, and draft reports.",
    fullPrompt:
      "Multi-Agent Deep Research System — hierarchical multi-agent research workflow powered by LangGraph, DuckDuckGo web search, citation synthesis, and automated Markdown report generation with streaming status pills.",
    techs: ["LangGraph", "LangChain", "Groq", "FastAPI"],
  },
  {
    id: "code-review-agent",
    title: "Autonomous AI Code Reviewer & PR Auditor",
    category: "Generative AI",
    icon: "💻",
    desc: "Analyze GitHub pull requests for security vulnerabilities, bugs, and performance anti-patterns.",
    fullPrompt:
      "Autonomous AI Code Reviewer — webhook-driven GitHub pull request analysis agent using Tree-sitter AST parsing, Gemini 1.5 Pro code reasoning, and inline GitHub PR comment generation for automated quality gates.",
    techs: ["Gemini Pro", "AST", "GitHub API", "FastAPI"],
  },
  {
    id: "voice-ai-assistant",
    title: "Real-time Conversational Voice AI Agent",
    category: "Generative AI",
    icon: "🎙️",
    desc: "Ultra-low latency speech-to-speech voice assistant with Whisper, Llama 3, and ElevenLabs.",
    fullPrompt:
      "Real-time Conversational Voice AI Agent — bidirectional streaming audio pipeline with Whisper STT, Groq Llama 3.1 8B LLM orchestration, and ElevenLabs / Edge-TTS audio synthesis over WebSockets with <400ms turn-around.",
    techs: ["Whisper", "Groq", "WebSockets", "FastAPI"],
  },

  // ── NLP ────────────────────────────────────────────────────────────────────
  {
    id: "fin-sentiment-analysis",
    title: "Financial News Sentiment & Market Signals",
    category: "NLP",
    icon: "📈",
    desc: "Parse Reuters & SEC filings with FinBERT to compute real-time ticker sentiment scores.",
    fullPrompt:
      "Financial News Sentiment Analysis — high-speed NLP pipeline using FinBERT and HuggingFace Transformers to score financial press releases, quarterly earnings transcripts, and Twitter sentiment for equity trading signals.",
    techs: ["FinBERT", "Transformers", "PyTorch", "FastAPI"],
  },
  {
    id: "medical-ner-spacy",
    title: "Clinical Named Entity Recognition (NER)",
    category: "NLP",
    icon: "🔬",
    desc: "Extract dosages, medications, and clinical diagnoses from EHR notes with spaCy and BioBERT.",
    fullPrompt:
      "Clinical Named Entity Recognition — biomedical information extraction engine using BioBERT and spaCy pipelines to identify drug names, dosages, adverse reactions, and ICD-10 medical diagnostic codes from clinical narratives.",
    techs: ["BioBERT", "spaCy", "PyTorch", "FastAPI"],
  },
  {
    id: "multilingual-support-classifier",
    title: "Multilingual Support Ticket Routing",
    category: "NLP",
    icon: "🌐",
    desc: "Classify and route customer inquiries across 40+ languages using XLM-RoBERTa.",
    fullPrompt:
      "Multilingual Support Ticket Routing — cross-lingual text classification model using XLM-RoBERTa to automatically detect language, sentiment urgency, and route incoming helpdesk tickets to specialized regional teams.",
    techs: ["XLM-RoBERTa", "FastAPI", "Redis", "PostgreSQL"],
  },

  // ── Data Analytics ─────────────────────────────────────────────────────────
  {
    id: "clickstream-lakehouse",
    title: "Real-time E-commerce Clickstream Lakehouse",
    category: "Data Analytics",
    icon: "🛒",
    desc: "Stream millions of browsing events via Kafka into ClickHouse with real-time funnel dashboards.",
    fullPrompt:
      "Real-time E-commerce Clickstream Pipeline — high-velocity event ingestion architecture with Apache Kafka, ClickHouse columnar database, Redis caching, and real-time conversion funnel analytics dashboards.",
    techs: ["Kafka", "ClickHouse", "Redis", "FastAPI"],
  },
  {
    id: "iot-telemetry-maintenance",
    title: "IoT Sensor Telemetry & Predictive Maintenance",
    category: "Data Analytics",
    icon: "⚙️",
    desc: "Time-series anomaly detection on manufacturing sensors with InfluxDB and Grafana alerts.",
    fullPrompt:
      "IoT Sensor Telemetry Pipeline — industrial IoT monitoring system collecting 10k sensor metrics/sec, time-series anomaly detection with Isolation Forests, InfluxDB storage, and Grafana webhook alerting.",
    techs: ["InfluxDB", "FastAPI", "MQTT", "Grafana"],
  },
  {
    id: "analytics-duckdb-streamlit",
    title: "Embedded Analytical Engine with DuckDB",
    category: "Data Analytics",
    icon: "🦆",
    desc: "Fast in-process SQL analytics on Parquet files with zero cloud database overhead.",
    fullPrompt:
      "Analytical Data Platform with DuckDB — high-performance embedded analytical backend executing vectorized SQL queries over multi-gigabyte Parquet data lakes with sub-second response times.",
    techs: ["DuckDB", "Parquet", "FastAPI", "Next.js"],
  },

  // ── SaaS ───────────────────────────────────────────────────────────────────
  {
    id: "multitenant-saas-stripe",
    title: "Multi-tenant SaaS with Stripe & PostgreSQL",
    category: "SaaS",
    icon: "⚡",
    desc: "Subscription billing, team workspaces, RBAC authentication, and row-level security.",
    fullPrompt:
      "Multi-tenant SaaS with Next.js, Stripe & PostgreSQL — complete B2B SaaS architecture with Stripe customer portal, tiered subscriptions, team invites with RBAC permissions, and PostgreSQL schema isolation.",
    techs: ["Next.js", "Stripe", "PostgreSQL", "FastAPI"],
  },
  {
    id: "api-usage-metering",
    title: "API Usage Metering & Usage-Based Billing",
    category: "SaaS",
    icon: "📊",
    desc: "High-throughput token & request metering pipeline with Stripe metered billing integration.",
    fullPrompt:
      "API Usage Metering & Billing SaaS — developer platform infrastructure with Redis sliding-window rate limiters, Kafka event metering, Stripe metered billing sync, and developer API key management dashboards.",
    techs: ["FastAPI", "Redis", "Stripe", "PostgreSQL"],
  },
  {
    id: "team-feedback-platform",
    title: "Continuous Team Feedback & 360 Reviews",
    category: "SaaS",
    icon: "🤝",
    desc: "Anonymous peer feedback cycles, 1-on-1 meeting agendas, and automated Slack nudges.",
    fullPrompt:
      "Continuous Team Feedback & 360 Review SaaS — enterprise talent management tool featuring automated quarterly review cycles, Slack bot integrations, anonymous sentiment aggregation, and role-based performance dashboards.",
    techs: ["Next.js", "FastAPI", "PostgreSQL", "Tailwind"],
  },

  // ── Full Stack ─────────────────────────────────────────────────────────────
  {
    id: "collab-whiteboard-canvas",
    title: "Real-time Collaborative Infinite Canvas",
    category: "Full Stack",
    icon: "🎨",
    desc: "Multiplayer whiteboard with CRDT conflict resolution, live cursors, and WebSockets.",
    fullPrompt:
      "Real-time Collaborative Whiteboard — multiplayer drawing and diagramming canvas using HTML5 Canvas / Fabric.js, Yjs CRDT conflict resolution, and high-frequency WebSocket sync for live cursor coordination.",
    techs: ["Next.js", "WebSocket", "Yjs", "Canvas"],
  },
  {
    id: "dev-portfolio-cms",
    title: "Headless CMS & Developer Portfolio Engine",
    category: "Full Stack",
    icon: "🚀",
    desc: "Markdown MDX blog, project showcase with live GitHub stats, and dark-mode design system.",
    fullPrompt:
      "Headless CMS & Developer Portfolio Engine — content management platform with MDX dynamic rendering, GitHub GraphQL API integration for real-time repository statistics, and optimized SEO metadata generation.",
    techs: ["Next.js 14", "Tailwind CSS", "TypeScript", "FastAPI"],
  },
  {
    id: "discord-bot-dashboard",
    title: "Discord Moderation Bot & Web Control Panel",
    category: "Full Stack",
    icon: "🤖",
    desc: "Discord.py bot with web management dashboard, auto-moderation rules, and server analytics.",
    fullPrompt:
      "Discord Moderation Bot with Web Dashboard — asynchronous discord.py bot connected to a Next.js administrative dashboard via WebSockets and REST APIs for custom automations, logging, and guild management.",
    techs: ["Discord.py", "FastAPI", "Next.js", "Redis"],
  },
];
