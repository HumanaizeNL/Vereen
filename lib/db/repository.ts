// Repository layer - Replaces in-memory stores with Prisma database queries
// Provides the same interface as stores.ts for backward compatibility

import prisma from './prisma';
import type {
  Client,
  Note,
  Measure,
  Incident,
  EvidenceLink,
  AuditEvent,
} from '../data/types';

// ===============================================
// CLIENT OPERATIONS
// ===============================================

export async function getClient(client_id: string): Promise<Client | null> {
  const client = await prisma.client.findUnique({
    where: { id: client_id },
  });

  if (!client) return null;

  return {
    client_id: client.id,
    name: client.name,
    dob: client.dob,
    bsn_encrypted: client.bsnEncrypted || undefined,
    wlz_profile: client.wlzProfile,
    provider: client.provider,
    created_at: client.createdAt.toISOString(),
  };
}

export async function setClient(client: Client): Promise<void> {
  await prisma.client.upsert({
    where: { id: client.client_id },
    update: {
      name: client.name,
      dob: client.dob,
      bsnEncrypted: client.bsn_encrypted,
      wlzProfile: client.wlz_profile,
      provider: client.provider,
    },
    create: {
      id: client.client_id,
      name: client.name,
      dob: client.dob,
      bsnEncrypted: client.bsn_encrypted,
      wlzProfile: client.wlz_profile,
      provider: client.provider,
      createdAt: new Date(client.created_at),
    },
  });
}

export async function getAllClients(): Promise<Client[]> {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return clients.map((client) => ({
    client_id: client.id,
    name: client.name,
    dob: client.dob,
    bsn_encrypted: client.bsnEncrypted || undefined,
    wlz_profile: client.wlzProfile,
    provider: client.provider,
    created_at: client.createdAt.toISOString(),
  }));
}

// ===============================================
// NOTE OPERATIONS
// ===============================================

export async function getClientNotes(client_id: string): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { clientId: client_id },
    orderBy: { date: 'desc' },
  });

  return notes.map((note) => ({
    id: note.id,
    client_id: note.clientId,
    date: note.date,
    author: note.author,
    section: note.section,
    text: note.text,
  }));
}

export async function addNote(note: Note): Promise<void> {
  await prisma.note.create({
    data: {
      id: note.id,
      clientId: note.client_id,
      date: note.date,
      author: note.author,
      section: note.section,
      text: note.text,
    },
  });
}

export async function addNotes(notes: Note[]): Promise<void> {
  await prisma.note.createMany({
    data: notes.map((note) => ({
      id: note.id,
      clientId: note.client_id,
      date: note.date,
      author: note.author,
      section: note.section,
      text: note.text,
    })),
  });
}

// ===============================================
// MEASURE OPERATIONS
// ===============================================

export async function getClientMeasures(client_id: string): Promise<Measure[]> {
  const measures = await prisma.measure.findMany({
    where: { clientId: client_id },
    orderBy: { date: 'desc' },
  });

  return measures.map((measure) => ({
    id: measure.id,
    client_id: measure.clientId,
    date: measure.date,
    type: measure.type,
    score: measure.score,
    comment: measure.comment || undefined,
  }));
}

export async function addMeasure(measure: Measure): Promise<void> {
  await prisma.measure.create({
    data: {
      id: measure.id,
      clientId: measure.client_id,
      date: measure.date,
      type: measure.type,
      score: String(measure.score),
      comment: measure.comment,
    },
  });
}

export async function addMeasures(measures: Measure[]): Promise<void> {
  await prisma.measure.createMany({
    data: measures.map((measure) => ({
      id: measure.id,
      clientId: measure.client_id,
      date: measure.date,
      type: measure.type,
      score: String(measure.score),
      comment: measure.comment,
    })),
  });
}

// ===============================================
// INCIDENT OPERATIONS
// ===============================================

export async function getClientIncidents(client_id: string): Promise<Incident[]> {
  const incidents = await prisma.incident.findMany({
    where: { clientId: client_id },
    orderBy: { date: 'desc' },
  });

  return incidents.map((incident) => ({
    id: incident.id,
    client_id: incident.clientId,
    date: incident.date,
    type: incident.type,
    severity: incident.severity,
    description: incident.description,
  }));
}

export async function addIncident(incident: Incident): Promise<void> {
  await prisma.incident.create({
    data: {
      id: incident.id,
      clientId: incident.client_id,
      date: incident.date,
      type: incident.type,
      severity: incident.severity,
      description: incident.description,
    },
  });
}

export async function addIncidents(incidents: Incident[]): Promise<void> {
  await prisma.incident.createMany({
    data: incidents.map((incident) => ({
      id: incident.id,
      clientId: incident.client_id,
      date: incident.date,
      type: incident.type,
      severity: incident.severity,
      description: incident.description,
    })),
  });
}

// ===============================================
// EVIDENCE OPERATIONS
// ===============================================

export async function getClientEvidence(client_id: string): Promise<EvidenceLink[]> {
  const evidence = await prisma.evidenceLink.findMany({
    where: { clientId: client_id },
    orderBy: { createdAt: 'desc' },
  });

  return evidence.map((ev) => ({
    id: ev.id,
    client_id: ev.clientId,
    target_path: ev.targetPath,
    source: ev.sourceType + ':' + ev.sourceId, // Legacy format
    source_type: ev.sourceType,
    source_id: ev.sourceId,
    snippet: ev.snippet,
    relevance: ev.relevance,
    confidence: ev.confidence,
    created_by: ev.createdBy,
    created_at: ev.createdAt.toISOString(),
  }));
}

export async function addEvidence(evidence: EvidenceLink): Promise<void> {
  // Parse legacy source format if present
  let sourceType = evidence.source_type || 'note';
  let sourceId = evidence.source_id || '';

  if (!evidence.source_type && evidence.source) {
    const parts = evidence.source.split(':');
    if (parts.length === 2) {
      sourceType = parts[0];
      sourceId = parts[1];
    }
  }

  await prisma.evidenceLink.create({
    data: {
      id: evidence.id,
      clientId: evidence.client_id,
      targetPath: evidence.target_path,
      sourceType,
      sourceId,
      snippet: evidence.snippet,
      relevance: evidence.relevance || 0.0,
      confidence: evidence.confidence || 0.0,
      createdBy: evidence.created_by,
      createdAt: new Date(evidence.created_at),
    },
  });
}

export async function getEvidenceByTarget(
  client_id: string,
  target_path: string
): Promise<EvidenceLink[]> {
  const evidence = await prisma.evidenceLink.findMany({
    where: {
      clientId: client_id,
      targetPath: target_path,
    },
    orderBy: { createdAt: 'desc' },
  });

  return evidence.map((ev) => ({
    id: ev.id,
    client_id: ev.clientId,
    target_path: ev.targetPath,
    source: ev.sourceType + ':' + ev.sourceId,
    source_type: ev.sourceType,
    source_id: ev.sourceId,
    snippet: ev.snippet,
    relevance: ev.relevance,
    confidence: ev.confidence,
    created_by: ev.createdBy,
    created_at: ev.createdAt.toISOString(),
  }));
}

// ===============================================
// AUDIT OPERATIONS
// ===============================================

export async function addAuditEvent(event: AuditEvent): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      id: event.id,
      ts: new Date(event.ts),
      actor: event.actor,
      clientId: event.client_id,
      action: event.action,
      meta: JSON.stringify(event.meta),
    },
  });
}

export async function getClientAuditLogs(
  client_id: string,
  limit = 100
): Promise<AuditEvent[]> {
  const logs = await prisma.auditEvent.findMany({
    where: { clientId: client_id },
    orderBy: { ts: 'desc' },
    take: limit,
  });

  return logs.map((log) => ({
    id: log.id,
    ts: log.ts.toISOString(),
    actor: log.actor,
    client_id: log.clientId,
    action: log.action,
    meta: JSON.parse(log.meta),
  }));
}

export async function getAuditLogs(filters: {
  client_id?: string;
  actor?: string;
  limit?: number;
}): Promise<AuditEvent[]> {
  const logs = await prisma.auditEvent.findMany({
    where: {
      ...(filters.client_id && { clientId: filters.client_id }),
      ...(filters.actor && { actor: filters.actor }),
    },
    orderBy: { ts: 'desc' },
    take: filters.limit || 100,
  });

  return logs.map((log) => ({
    id: log.id,
    ts: log.ts.toISOString(),
    actor: log.actor,
    client_id: log.clientId,
    action: log.action,
    meta: JSON.parse(log.meta),
  }));
}

// ===============================================
// UTILITY OPERATIONS
// ===============================================

export async function deleteClient(client_id: string): Promise<void> {
  // Prisma will cascade delete all related records due to onDelete: Cascade in schema
  await prisma.client.delete({
    where: { id: client_id },
  });
}

export async function clearAllData(): Promise<void> {
  // Delete in order to respect foreign key constraints
  // Sprint 1 tables
  await prisma.reviewWorkflow.deleteMany();
  await prisma.meerzorgFormData.deleteMany();
  await prisma.normativeCheck.deleteMany();
  await prisma.meerzorgApplication.deleteMany();
  await prisma.mdReview.deleteMany();
  await prisma.riskFlag.deleteMany();
  await prisma.trendMonitoring.deleteMany();

  // Original tables
  await prisma.auditEvent.deleteMany();
  await prisma.evidenceLink.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.measure.deleteMany();
  await prisma.note.deleteMany();
  await prisma.client.deleteMany();

  // Framework versions (optional - usually keep these)
  // await prisma.frameworkVersion.deleteMany();
}

// ===============================================
// UC1 - MEERZORG APPLICATION OPERATIONS
// ===============================================

export async function createMeerzorgApplication(data: {
  clientId: string;
  status?: string;
  formData?: Record<string, any>;
  version?: string;
}): Promise<string> {
  const app = await prisma.meerzorgApplication.create({
    data: {
      clientId: data.clientId,
      status: data.status || 'draft',
      formData: JSON.stringify(data.formData || {}),
      version: data.version || '2026',
    },
  });
  return app.id;
}

export async function getMeerzorgApplication(id: string) {
  const app = await prisma.meerzorgApplication.findUnique({
    where: { id },
    include: {
      client: true,
      formFields: true,
      normativeChecks: true,
      reviewWorkflows: { orderBy: { reviewedAt: 'desc' } },
    },
  });

  if (!app) return null;

  return {
    ...app,
    formData: JSON.parse(app.formData),
  };
}

export async function getClientMeerzorgApplications(clientId: string) {
  const apps = await prisma.meerzorgApplication.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  });

  return apps.map(app => ({
    ...app,
    formData: JSON.parse(app.formData),
  }));
}

export async function updateMeerzorgApplication(
  id: string,
  data: {
    status?: string;
    formData?: Record<string, any>;
    submittedBy?: string;
  }
) {
  return await prisma.meerzorgApplication.update({
    where: { id },
    data: {
      status: data.status,
      formData: data.formData ? JSON.stringify(data.formData) : undefined,
      submittedAt: data.status === 'submitted' ? new Date() : undefined,
      submittedBy: data.submittedBy,
    },
  });
}

// ===============================================
// NORMATIVE CHECK OPERATIONS
// ===============================================

export async function addNormativeCheck(check: {
  applicationId?: string;
  clientId: string;
  checkType: string;
  ruleId: string;
  status: string;
  message: string;
  severity?: string;
}) {
  return await prisma.normativeCheck.create({
    data: {
      applicationId: check.applicationId,
      clientId: check.clientId,
      checkType: check.checkType,
      ruleId: check.ruleId,
      status: check.status,
      message: check.message,
      severity: check.severity || 'medium',
    },
  });
}

export async function getNormativeChecks(filters: {
  applicationId?: string;
  clientId?: string;
  status?: string;
}) {
  return await prisma.normativeCheck.findMany({
    where: {
      applicationId: filters.applicationId,
      clientId: filters.clientId,
      status: filters.status,
    },
    orderBy: { checkedAt: 'desc' },
  });
}

// ===============================================
// REVIEW WORKFLOW OPERATIONS
// ===============================================

export async function addReviewWorkflow(review: {
  applicationId: string;
  reviewerRole: string;
  reviewerName: string;
  status: string;
  comments?: string;
}) {
  return await prisma.reviewWorkflow.create({
    data: review,
  });
}

export async function getApplicationReviews(applicationId: string) {
  return await prisma.reviewWorkflow.findMany({
    where: { applicationId },
    orderBy: { reviewedAt: 'desc' },
  });
}

// ===============================================
// UC2 - TREND MONITORING OPERATIONS
// ===============================================

export async function addTrendMonitoring(trend: {
  clientId: string;
  metricType: string;
  metricValue: number;
  periodStart: string;
  periodEnd: string;
}) {
  return await prisma.trendMonitoring.create({
    data: trend,
  });
}

export async function getClientTrends(
  clientId: string,
  metricType?: string,
  limit = 100
) {
  return await prisma.trendMonitoring.findMany({
    where: {
      clientId,
      ...(metricType && { metricType }),
    },
    orderBy: { recordedAt: 'desc' },
    take: limit,
  });
}

// ===============================================
// RISK FLAG OPERATIONS
// ===============================================

export async function addRiskFlag(flag: {
  clientId: string;
  flagType: string;
  severity: string;
  description: string;
}) {
  return await prisma.riskFlag.create({
    data: flag,
  });
}

export async function getClientRiskFlags(clientId: string, includeResolved = false) {
  return await prisma.riskFlag.findMany({
    where: {
      clientId,
      ...(includeResolved ? {} : { resolvedAt: null }),
    },
    orderBy: { flaggedAt: 'desc' },
  });
}

export async function resolveRiskFlag(id: string, resolvedBy: string) {
  return await prisma.riskFlag.update({
    where: { id },
    data: {
      resolvedAt: new Date(),
      resolvedBy,
    },
  });
}

// ===============================================
// MD REVIEW OPERATIONS
// ===============================================

export async function addMdReview(review: {
  clientId: string;
  reviewerName: string;
  reviewerRole: string;
  clinicalNotes: string;
  decision: string;
  observationPeriodDays?: number;
}) {
  return await prisma.mdReview.create({
    data: review,
  });
}

export async function getClientMdReviews(clientId: string) {
  return await prisma.mdReview.findMany({
    where: { clientId },
    orderBy: { reviewedAt: 'desc' },
  });
}

// ===============================================
// FRAMEWORK VERSION OPERATIONS
// ===============================================

export async function addFrameworkVersion(framework: {
  frameworkType: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  rulesJson: Record<string, any>;
  templatePath?: string;
}) {
  return await prisma.frameworkVersion.create({
    data: {
      frameworkType: framework.frameworkType,
      version: framework.version,
      effectiveFrom: framework.effectiveFrom,
      effectiveTo: framework.effectiveTo,
      rulesJson: JSON.stringify(framework.rulesJson),
      templatePath: framework.templatePath,
    },
  });
}

export async function getFrameworkVersion(frameworkType: string, version: string) {
  const framework = await prisma.frameworkVersion.findUnique({
    where: {
      frameworkType_version: {
        frameworkType,
        version,
      },
    },
  });

  if (!framework) return null;

  return {
    ...framework,
    rulesJson: JSON.parse(framework.rulesJson),
  };
}

export async function getCurrentFrameworkVersion(frameworkType: string) {
  const framework = await prisma.frameworkVersion.findFirst({
    where: {
      frameworkType,
      effectiveTo: null, // Current version has no end date
    },
    orderBy: { effectiveFrom: 'desc' },
  });

  if (!framework) return null;

  return {
    ...framework,
    rulesJson: JSON.parse(framework.rulesJson),
  };
}
