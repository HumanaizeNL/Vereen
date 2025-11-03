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
  target_path: string; // e.g., 'uc2.criteria.ADL'
  source: string; // e.g., 'notes.csv#201'
  snippet: string;
  created_by: string;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  ts: string;
  actor: string; // 'ai' | 'user@email.com'
  client_id: string;
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
