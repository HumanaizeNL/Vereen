// Enhanced type definitions for professional report generation
// Based on approved Meerzorg application format analysis

export interface Evidence {
  source_type: string;
  source_id: string;
  text: string;
  relevance: number;
  date?: string;
  section?: string;
  author?: string;
}

export interface Criterion {
  id: string;
  label: string;
  description?: string;
  status: 'unknown' | 'voldoet' | 'niet_voldoet' | 'onvoldoende_bewijs' | 'toegenomen_behoefte' | 'verslechterd';
  argument?: string;
  evidence: Evidence[];
  confidence?: number;
  uncertainty?: string;
}

export interface ExportData {
  client_id: string;
  period: {
    from: string;
    to: string;
  };
  criteria: Criterion[];
  generated_at: string;
}

export interface ExportOptions {
  anonymize?: boolean;
  include_evidence_appendix?: boolean;
  template?: string;
}

export interface ReportMetadata {
  title: string;
  document_type: string;
  version: string;
  generated_by: string;
}
