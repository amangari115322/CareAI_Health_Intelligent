/**
 * CareData AI - Client API Library
 * Fully typed client communicating with FastAPI backend (http://localhost:8000/api)
 */

const rawBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

export interface DashboardStats {
  total_records: number;
  unique_providers: number;
  data_completeness: number;
  potential_duplicates: number;
  ai_classified: number;
  needs_review: number;
}

export interface ChartItem {
  name: string;
  value: number;
}

export interface DashboardCharts {
  specialty_distribution: ChartItem[];
  quality_overview: ChartItem[];
  source_distribution: ChartItem[];
  processing_activity: any[];
}

export interface ActivityItem {
  id: string;
  action_type: string;
  title: string;
  description: string;
  target_id: string;
  created_at: string;
}

export interface ActiveJob {
  id: string;
  file_name: string;
  row_count: number;
  current_stage: string;
  stage_index: number;
  status: string;
  progress: number;
  counts?: {
    total_records: number;
    classified_count: number;
    duplicates_found: number;
    issues_count: number;
    clean_records: number;
  };
  warnings?: string[];
  start_time: string;
  end_time?: string;
}

export interface ProviderRecord {
  id: string;
  project_id: string;
  collected_doctor_name: string;
  accepted_doctor_name: string;
  collected_specialty: string;
  accepted_specialty: string;
  ai_suggested_category: string;
  ai_confidence: number;
  ai_explanation: string;
  ai_status: string;
  collected_practice_name: string;
  accepted_practice_name: string;
  collected_address: string;
  accepted_address: string;
  suburb: string;
  state: string;
  postcode: string;
  collected_phone: string;
  accepted_phone: string;
  collected_website: string;
  accepted_website: string;
  source_name: string;
  source_url: string;
  collected_at: string;
  quality_score: number;
  quality_status: "Clean" | "Minor Issues" | "Action Required";
  verification_status: "Collected" | "Accepted" | "Verified";
  has_duplicate_candidate: number;
  needs_review: number;
  history?: any[];
  issues?: CleaningIssue[];
  duplicates?: DuplicateCandidate[];
}

export interface CleaningIssue {
  id: string;
  provider_id: string;
  provider_name: string;
  field_name: string;
  original_value: string;
  suggested_value: string;
  issue_type: "missing" | "invalid_format" | "duplicate_candidate" | "conflicting_value" | "needs_review";
  issue_description: string;
  suggested_action: string;
  status: "open" | "reviewed" | "corrected" | "dismissed";
  created_at: string;
  evidence?: string;
}

export interface DuplicateCandidate {
  id: string;
  provider_a_id: string;
  provider_b_id: string;
  provider_a_name: string;
  provider_b_name: string;
  similarity_score: number;
  match_reasons: string[];
  status: "pending" | "resolved_distinct" | "merged";
  created_at: string;
  p1_phone?: string;
  p1_clinic?: string;
  p1_suburb?: string;
  p1_specialty?: string;
  p2_phone?: string;
  p2_clinic?: string;
  p2_suburb?: string;
  p2_specialty?: string;
}

export interface UploadPreviewResponse {
  file_name: string;
  file_size_bytes: number;
  file_format: string;
  row_count: number;
  validation_status: string;
  headers: string[];
  preview_rows: Record<string, any>[];
  suggested_mapping: Record<string, string>;
  supported_targets: string[];
}

export const api = {
  // Project & Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
  async getProject() {
    const res = await fetch(`${API_BASE}/project`);
    return res.json();
  },
  async resetDemoProject() {
    const res = await fetch(`${API_BASE}/project/reset-demo`, { method: "POST" });
    return res.json();
  },

  // Dashboard Stats & Charts
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },
  async getCharts(): Promise<DashboardCharts> {
    const res = await fetch(`${API_BASE}/charts`);
    return res.json();
  },
  async getActivities(): Promise<ActivityItem[]> {
    const res = await fetch(`${API_BASE}/activities`);
    return res.json();
  },
  async getActiveJob(): Promise<ActiveJob | null> {
    const res = await fetch(`${API_BASE}/jobs/active`);
    return res.json();
  },

  // Upload Workflow
  async previewUpload(formData: FormData): Promise<UploadPreviewResponse> {
    const res = await fetch(`${API_BASE}/upload/preview`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to preview file");
    }
    return res.json();
  },
  async processUpload(payload: {
    file_name: string;
    column_mapping: Record<string, string>;
    use_sample?: boolean;
    raw_data?: Record<string, any>[];
  }) {
    const res = await fetch(`${API_BASE}/upload/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to process upload");
    }
    return res.json();
  },

  // Data Cleaning & Validation
  async getCleaningSummary() {
    const res = await fetch(`${API_BASE}/cleaning/summary`);
    return res.json();
  },
  async getCleaningIssues(tab: string = "all", search: string = ""): Promise<CleaningIssue[]> {
    const res = await fetch(`${API_BASE}/cleaning/issues?tab=${tab}&search=${encodeURIComponent(search)}`);
    return res.json();
  },
  async saveIssueCorrection(issueId: string, correctedValue: string, reason: string) {
    const res = await fetch(`${API_BASE}/cleaning/issues/${issueId}/correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ corrected_value: correctedValue, reason }),
    });
    return res.json();
  },
  async markIssueReviewed(issueId: string) {
    const res = await fetch(`${API_BASE}/cleaning/issues/${issueId}/review`, { method: "POST" });
    return res.json();
  },
  async resetIssue(issueId: string) {
    const res = await fetch(`${API_BASE}/cleaning/issues/${issueId}/reset`, { method: "POST" });
    return res.json();
  },

  // AI Classification
  async getClassificationSummary() {
    const res = await fetch(`${API_BASE}/classification/summary`);
    return res.json();
  },
  async getClassificationRecords(status: string = "all", search: string = "") {
    const res = await fetch(`${API_BASE}/classification/records?status=${status}&search=${encodeURIComponent(search)}`);
    return res.json();
  },
  async getClassificationTaxonomy(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/classification/taxonomy`);
    return res.json();
  },
  async approveClassification(providerId: string) {
    const res = await fetch(`${API_BASE}/classification/${providerId}/approve`, { method: "POST" });
    return res.json();
  },
  async updateClassificationCategory(providerId: string, category: string, notes?: string) {
    const res = await fetch(`${API_BASE}/classification/${providerId}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, notes }),
    });
    return res.json();
  },
  async retryPendingClassifications() {
    const res = await fetch(`${API_BASE}/classification/retry-pending`, { method: "POST" });
    return res.json();
  },

  // Data Explorer
  async getExplorer(params: {
    search?: string;
    specialty?: string;
    suburb?: string;
    quality?: string;
    status?: string;
    source?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    page_size?: number;
  }) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/explorer?${query.toString()}`);
    return res.json();
  },
  async getProviderDetail(providerId: string): Promise<ProviderRecord> {
    const res = await fetch(`${API_BASE}/explorer/${providerId}`);
    return res.json();
  },
  async updateProviderFields(providerId: string, fields: Partial<ProviderRecord> & { analyst_notes?: string }) {
    const res = await fetch(`${API_BASE}/explorer/${providerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    return res.json();
  },

  // Duplicate Candidates
  async getDuplicates(): Promise<DuplicateCandidate[]> {
    const res = await fetch(`${API_BASE}/duplicates`);
    return res.json();
  },
  async resolveDuplicate(pairId: string, action: "distinct" | "merge", notes?: string) {
    const res = await fetch(`${API_BASE}/duplicates/${pairId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    });
    return res.json();
  },

  // Reports & Analytics
  async getReportsList() {
    const res = await fetch(`${API_BASE}/reports/list`);
    return res.json();
  },
  getExportUrl(reportType: string, format: "xlsx" | "csv" = "xlsx") {
    return `${API_BASE}/export/${reportType}?format=${format}`;
  },
  async downloadReport(reportType: string, filename?: string) {
    const mapping: Record<string, string> = {
      cleaned: "cleaned",
      quality: "quality_issues",
      quality_issues: "quality_issues",
      duplicates: "duplicate_candidates",
      duplicate_candidates: "duplicate_candidates",
      specialties: "ai_classifications",
      ai_classifications: "ai_classifications",
      source_evidence: "source_evidence",
    };
    const mappedType = mapping[reportType] || reportType;
    const format = filename?.endsWith(".csv") ? "csv" : "xlsx";
    const url = `${API_BASE}/export/${mappedType}?format=${format}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download report (${res.status} ${res.statusText})`);
    }
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || `caredata_${mappedType}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Collection
  async getCollectionSources() {
    const res = await fetch(`${API_BASE}/collection/sources`);
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },
  async saveSettings(settings: any) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return res.json();
  },
  async resetSettings() {
    const res = await fetch(`${API_BASE}/settings/reset`, { method: "POST" });
    return res.json();
  },
};
