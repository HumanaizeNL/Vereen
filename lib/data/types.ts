// Core data types for in-memory storage

export interface Client {
  client_id: string;
  name: string;
  dob: string;
  bsn_encrypted?: string;
  wlz_profile: string;
  provider: string;
  created_at: string;
}

export interface Note {
  id: string;
  client_id: string;
  date: string;
  author: string;
  section: string;
  text: string;
}

export interface Measure {
  id: string;
  client_id: string;
  date: string;
  type: string; // 'Katz' | 'ADL' | etc.
  score: string | number;
  comment?: string;
}

export interface Incident {
  id: string;
  client_id: string;
  date: string;
  type: string;
  severity: string;
  description: string;
}

export interface EvidenceLink {
  id: string;
  client_id: string;
  target_path: string; // e.g., 'uc2.criteria.ADL', 'uc1.meerzorg.form_field'
  source: string; // e.g., 'notes.csv#201' (legacy format)
  source_type?: string; // 'note', 'measure', 'incident', 'document'
  source_id?: string;
  snippet: string;
  relevance?: number; // 0.0 to 1.0
  confidence?: number; // 0.0 to 1.0
  created_by: string;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  ts: string;
  actor: string; // 'ai' | 'user@email.com'
  client_id?: string;
  action: string;
  meta: Record<string, any>;
}

// UC2 specific types
export interface Criterion {
  id: string;
  label: string;
  status: 'unknown' | 'voldoet' | 'niet_voldoet' | 'onvoldoende_bewijs' | 'toegenomen_behoefte' | 'verslechterd';
  argument: string;
  evidence: EvidenceItem[];
  confidence: number;
  uncertainty?: string;
}

export interface EvidenceItem {
  source: string;
  row?: number;
  page?: number;
  snippet: string;
}

// ===============================================
// UC1 - Meerzorg Application Types
// ===============================================

export interface MeerzorgApplication {
  id: string;
  client_id: string;
  status: 'draft' | 'in_review' | 'submitted' | 'approved' | 'rejected';
  form_data: Record<string, any>;
  version: string; // '2025' | '2026'
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  submitted_by?: string;
}

export interface MeerzorgFormField {
  id: string;
  application_id: string;
  field_name: string;
  field_value: string;
  source_type: string; // 'note' | 'measure' | 'incident' | 'document'
  source_id: string;
  confidence: number; // 0.0 to 1.0
  created_at: string;
}

export interface NormativeCheck {
  id: string;
  application_id?: string;
  client_id: string;
  check_type: string; // 'required_field', 'toetsingskader_rule', 'completeness'
  rule_id: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  checked_at: string;
}

export interface ReviewWorkflow {
  id: string;
  application_id: string;
  reviewer_role: 'professional' | 'backoffice' | 'admin';
  reviewer_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  comments?: string;
  reviewed_at: string;
}

// ===============================================
// UC2 - Herindicatie Enhancement Types
// ===============================================

export interface TrendMonitoring {
  id: string;
  client_id: string;
  metric_type: 'care_hours' | 'incident_count' | 'bpsd_score' | 'adl_score';
  metric_value: number;
  period_start: string;
  period_end: string;
  recorded_at: string;
}

export interface RiskFlag {
  id: string;
  client_id: string;
  flag_type: 'increased_care' | 'high_incidents' | 'deteriorating_adl' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  flagged_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface MdReview {
  id: string;
  client_id: string;
  reviewer_name: string;
  reviewer_role: 'physician' | 'psychologist' | 'ergo' | 'physio' | 'nurse';
  clinical_notes: string;
  decision: 'approve' | 'observe' | 'reject';
  observation_period_days?: number;
  reviewed_at: string;
}

// ===============================================
// Shared Infrastructure Types
// ===============================================

export interface FrameworkVersion {
  id: string;
  framework_type: 'toetsingskader' | 'vv8' | 'meerzorg';
  version: string; // '2025' | '2026'
  effective_from: string;
  effective_to?: string;
  rules_json: Record<string, any>;
  template_path?: string;
  created_at: string;
}
