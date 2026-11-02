const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface QuestionOption {
  label: string;
  value: string;
  recommended: boolean;
  description?: string;
}

export interface Question {
  id: string;
  text: string;
  category?: string;
  options: QuestionOption[];
}

export interface AnalyzeResponse {
  project_id: string;
  questions: Question[];
  status: string;
}

export interface Answer {
  question_id: string;
  value: string;
  label: string;
}

export interface AnswerResponse {
  done: boolean;
  status?: string;
  next_question_index?: number;
}

export interface TechItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  recommended?: boolean;
  selected: boolean;
  tag?: string;
}

export interface TechCategory {
  id: string;
  name: string;
  icon: string;
  items: TechItem[];
}

export interface DatasetInfo {
  required: boolean;
  name: string;
  source: string;
  download_url?: string;
  target_directory: string;
  instructions: string;
  sample_files?: string[];
}

export interface ApiKeyInfo {
  name: string;
  env_var: string;
  portal_url?: string;
  description: string;
  is_required: boolean;
}

export interface BlueprintSpec {
  title: string;
  summary: string;
  domain: string;
  architecture_overview: string;
  key_features: string[];
  dataset_info?: DatasetInfo;
  api_keys: ApiKeyInfo[];
  folder_tree: Array<{ path: string; name: string; type: string; description: string }>;
  setup_commands: string[];
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    subtitle?: string;
    tech?: string;
    icon?: string;
    responsibility?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface DiagramData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface SetupStep {
  step: number;
  title: string;
  body?: string;
  code?: string;
  file?: string;
  url?: string;
}

export interface ProjectState {
  id: string;
  idea: string;
  status: string;
  questions: Question[];
  answers: Answer[];
  current_question_index: number;
  stack?: { ui?: string; llm?: string };
  technologies?: TechCategory[];
  blueprint_spec?: BlueprintSpec;
  diagrams?: {
    architecture: DiagramData;
    workflow: DiagramData;
    dataflow: DiagramData;
  };
  setup_steps?: SetupStep[];
  files_zip_path?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TechAnalysisResponse {
  categories: TechCategory[];
  selected_technologies: string[];
  diagrams: {
    architecture: DiagramData;
    workflow: DiagramData;
    dataflow: DiagramData;
  };
  blueprint_spec: BlueprintSpec;
  setup_steps: SetupStep[];
}

// ─── API Client Functions ───────────────────────────────────────────────────

export async function analyzeIdea(idea: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitAnswer(
  project_id: string,
  question_id: string,
  value: string,
  label: string
): Promise<AnswerResponse> {
  const res = await fetch(`${API}/api/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id, question_id, value, label }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function analyzeTechnologies(project_id: string): Promise<TechAnalysisResponse> {
  const res = await fetch(`${API}/api/analyze-tech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateTechnologies(
  project_id: string,
  selected_technologies: string[]
): Promise<{
  diagrams: { architecture: DiagramData; workflow: DiagramData; dataflow: DiagramData };
  blueprint_spec: BlueprintSpec;
  setup_steps: SetupStep[];
}> {
  const res = await fetch(`${API}/api/update-tech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id, selected_technologies }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateProject(project_id: string): Promise<{
  status: string;
  zip_path: string;
  download_url: string;
}> {
  const res = await fetch(`${API}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProject(project_id: string): Promise<ProjectState> {
  const res = await fetch(`${API}/api/project/${project_id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listProjects(): Promise<{ projects: ProjectState[] }> {
  const res = await fetch(`${API}/api/projects`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function getDownloadUrl(project_id: string): string {
  return `${API}/api/project/${project_id}/download`;
}

export async function downloadProjectZip(project_id: string): Promise<void> {
  const downloadUrl = getDownloadUrl(project_id);
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Download failed: ${errorText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `blueprintai-${project_id.slice(0, 8)}.zip`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function deleteProject(project_id: string): Promise<{ success: boolean; deleted_id: string }> {
  const res = await fetch(`${API}/api/project/${project_id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

