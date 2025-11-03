import { z } from 'zod';

// Common schemas
export const ClientIdSchema = z.object({
  client_id: z.string().min(1),
});

// Search endpoint
export const SearchRequestSchema = z.object({
  client_id: z.string().min(1),
  query: z.string().min(1),
  k: z.number().int().positive().default(10),
  filters: z
    .object({
      date_from: z.string().optional(),
      date_to: z.string().optional(),
      section: z.string().optional(),
      author: z.string().optional(),
    })
    .optional(),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// UC2 Evaluate Criteria endpoint
export const EvaluateCriteriaRequestSchema = z.object({
  client_id: z.string().min(1),
  period: z.object({
    from: z.string(),
    to: z.string(),
  }),
  criteria_set: z
    .enum(['herindicatie.vv7.2026', 'herindicatie.vv8.2026'])
    .default('herindicatie.vv8.2026'),
  max_evidence: z.number().int().positive().default(3),
});

export type EvaluateCriteriaRequest = z.infer<
  typeof EvaluateCriteriaRequestSchema
>;

// UC2 Compose Report endpoint
export const ComposeReportRequestSchema = z.object({
  client_id: z.string().min(1),
  criteria_payload: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      argument: z.string(),
      evidence: z.array(z.any()),
    })
  ),
  sections: z
    .array(z.enum(['aanleiding', 'ontwikkelingen', 'criteria', 'conclusie']))
    .default(['aanleiding', 'ontwikkelingen', 'criteria', 'conclusie']),
  tone: z
    .enum(['zakelijk-beknopt', 'formeel', 'uitgebreid'])
    .default('zakelijk-beknopt'),
});

export type ComposeReportRequest = z.infer<typeof ComposeReportRequestSchema>;

// UC2 Export endpoint
export const ExportRequestSchema = z.object({
  client_id: z.string().min(1),
  format: z.enum(['docx', 'pdf']).default('docx'),
  template_id: z.string().default('herindicatie_2026_v1'),
  anonymize: z.boolean().default(false),
  report_payload: z.object({
    sections: z.record(z.string()),
  }),
});

export type ExportRequest = z.infer<typeof ExportRequestSchema>;

// Voice Command endpoint
export const VoiceCommandRequestSchema = z.object({
  client_id: z.string().min(1),
  command_text: z.string().min(1),
  target: z.enum(['uc1.form', 'uc2.criteria']),
  actor: z.string().email(),
});

export type VoiceCommandRequest = z.infer<typeof VoiceCommandRequestSchema>;

// Ingest endpoint
export const IngestRequestSchema = z.object({
  client_id: z.string().min(1),
  dataset_label: z.string().optional(),
});

export type IngestRequest = z.infer<typeof IngestRequestSchema>;
