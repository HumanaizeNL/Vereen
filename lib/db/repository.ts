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
    skipDuplicates: true,
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
    skipDuplicates: true,
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
    skipDuplicates: true,
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
    source: ev.source,
    snippet: ev.snippet,
    created_by: ev.createdBy,
    created_at: ev.createdAt.toISOString(),
  }));
}

export async function addEvidence(evidence: EvidenceLink): Promise<void> {
  await prisma.evidenceLink.create({
    data: {
      id: evidence.id,
      clientId: evidence.client_id,
      targetPath: evidence.target_path,
      source: evidence.source,
      snippet: evidence.snippet,
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
    source: ev.source,
    snippet: ev.snippet,
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

export async function clearAllData(): Promise<void> {
  // Delete in order to respect foreign key constraints
  await prisma.auditEvent.deleteMany();
  await prisma.evidenceLink.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.measure.deleteMany();
  await prisma.note.deleteMany();
  await prisma.client.deleteMany();
}
