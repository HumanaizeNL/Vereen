// In-memory data stores (to be replaced with Prisma/PostgreSQL later)

import {
  Client,
  Note,
  Measure,
  Incident,
  EvidenceLink,
  AuditEvent,
} from './types';

// Storage Maps
export const clientsStore = new Map<string, Client>();
export const notesStore = new Map<string, Note>();
export const measuresStore = new Map<string, Measure>();
export const incidentsStore = new Map<string, Incident>();
export const evidenceStore = new Map<string, EvidenceLink>();
export const auditStore = new Map<string, AuditEvent>();

// Helper functions for Client operations
export function getClient(client_id: string): Client | undefined {
  return clientsStore.get(client_id);
}

export function setClient(client: Client): void {
  clientsStore.set(client.client_id, client);
}

export function getAllClients(): Client[] {
  return Array.from(clientsStore.values());
}

// Helper functions for Notes operations
export function getClientNotes(client_id: string): Note[] {
  return Array.from(notesStore.values()).filter(
    (note) => note.client_id === client_id
  );
}

export function addNote(note: Note): void {
  notesStore.set(note.id, note);
}

export function addNotes(notes: Note[]): void {
  notes.forEach((note) => notesStore.set(note.id, note));
}

// Helper functions for Measures operations
export function getClientMeasures(client_id: string): Measure[] {
  return Array.from(measuresStore.values()).filter(
    (measure) => measure.client_id === client_id
  );
}

export function addMeasure(measure: Measure): void {
  measuresStore.set(measure.id, measure);
}

export function addMeasures(measures: Measure[]): void {
  measures.forEach((measure) => measuresStore.set(measure.id, measure));
}

// Helper functions for Incidents operations
export function getClientIncidents(client_id: string): Incident[] {
  return Array.from(incidentsStore.values()).filter(
    (incident) => incident.client_id === client_id
  );
}

export function addIncident(incident: Incident): void {
  incidentsStore.set(incident.id, incident);
}

export function addIncidents(incidents: Incident[]): void {
  incidents.forEach((incident) => incidentsStore.set(incident.id, incident));
}

// Helper functions for Evidence operations
export function getClientEvidence(client_id: string): EvidenceLink[] {
  return Array.from(evidenceStore.values()).filter(
    (evidence) => evidence.client_id === client_id
  );
}

export function addEvidence(evidence: EvidenceLink): void {
  evidenceStore.set(evidence.id, evidence);
}

export function getEvidenceByTarget(
  client_id: string,
  target_path: string
): EvidenceLink[] {
  return Array.from(evidenceStore.values()).filter(
    (evidence) =>
      evidence.client_id === client_id && evidence.target_path === target_path
  );
}

// Helper functions for Audit operations
export function addAuditEvent(event: AuditEvent): void {
  auditStore.set(event.id, event);
}

export function getClientAuditLogs(
  client_id: string,
  limit = 100
): AuditEvent[] {
  return Array.from(auditStore.values())
    .filter((event) => event.client_id === client_id)
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, limit);
}

export function getAuditLogs(filters: {
  client_id?: string;
  actor?: string;
  limit?: number;
}): AuditEvent[] {
  let logs = Array.from(auditStore.values());

  if (filters.client_id) {
    logs = logs.filter((log) => log.client_id === filters.client_id);
  }

  if (filters.actor) {
    logs = logs.filter((log) => log.actor === filters.actor);
  }

  return logs
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, filters.limit || 100);
}

// Clear functions (for testing)
export function clearAllData(): void {
  clientsStore.clear();
  notesStore.clear();
  measuresStore.clear();
  incidentsStore.clear();
  evidenceStore.clear();
  auditStore.clear();
}
