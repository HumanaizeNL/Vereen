import { z } from 'zod';

// Common evidence schema
export const EvidenceSchema = z.object({
  source: z.string(),
  row: z.number().optional(),
  page: z.number().optional(),
  snippet: z.string(),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// Search response
export const SearchHitSchema = z.object({
  source: z.string(),
  row: z.number().optional(),
  page: z.number().optional(),
  snippet: z.string(),
  score: z.number(),
});

export const SearchResponseSchema = z.object({
  hits: z.array(SearchHitSchema),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type SearchHit = z.infer<typeof SearchHitSchema>;

// Ingest response
export const IngestFileResultSchema = z.object({
  filename: z.string(),
  rows: z.number().optional(),
  pages: z.number().optional(),
  type: z.enum(['csv', 'pdf', 'docx', 'rtf']),
});

export const IngestWarningSchema = z.object({
  filename: z.string(),
  message: z.string(),
});

export const IngestResponseSchema = z.object({
  client_id: z.string(),
  ingested: z.array(IngestFileResultSchema),
  warnings: z.array(IngestWarningSchema),
});

export type IngestResponse = z.infer<typeof IngestResponseSchema>;

// UC2 Evaluate Criteria response
export const CriterionResultSchema = z.object({
  id: z.string(),
  status: z.enum([
    'onbekend',
    'voldoet',
    'niet_voldoet',
    'onvoldoende_bewijs',
    'toegenomen_behoefte',
    'verslechterd',
  ]),
  argument: z.string(),
  evidence: z.array(EvidenceSchema),
  confidence: z.number(),
  uncertainty: z.string().optional(),
});

export const EvaluateCriteriaResponseSchema = z.object({
  client_id: z.string(),
  criteria: z.array(CriterionResultSchema),
});

export type EvaluateCriteriaResponse = z.infer<
  typeof EvaluateCriteriaResponseSchema
>;
export type CriterionResult = z.infer<typeof CriterionResultSchema>;

// UC2 Compose Report response
export const ComposeReportResponseSchema = z.object({
  sections: z.record(z.string()),
  citations: z.array(
    z.object({
      section: z.string(),
      ref: z.string(),
    })
  ),
});

export type ComposeReportResponse = z.infer<
  typeof ComposeReportResponseSchema
>;

// UC2 Export response
export const ExportResponseSchema = z.object({
  url_doc: z.string(),
  url_sources: z.string().optional(),
});

export type ExportResponse = z.infer<typeof ExportResponseSchema>;

// Voice Command response
export const VoiceCommandChangeSchema = z.object({
  path: z.string(),
  old: z.any(),
  new: z.any(),
  note: z.string().optional(),
});

export const VoiceCommandResponseSchema = z.object({
  applied: z.array(VoiceCommandChangeSchema),
  revalidation: z
    .object({
      issues: z.array(
        z.object({
          type: z.string(),
          path: z.string(),
          message: z.string(),
        })
      ),
    })
    .optional(),
});

export type VoiceCommandResponse = z.infer<typeof VoiceCommandResponseSchema>;

// Audit Logs response
export const AuditEventSchema = z.object({
  id: z.string(),
  ts: z.string(),
  actor: z.string(),
  client_id: z.string(),
  action: z.string(),
  meta: z.record(z.any()),
});

export const AuditLogsResponseSchema = z.object({
  events: z.array(AuditEventSchema),
});

export type AuditLogsResponse = z.infer<typeof AuditLogsResponseSchema>;

// Error response
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.any()).optional(),
    trace_id: z.string().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
