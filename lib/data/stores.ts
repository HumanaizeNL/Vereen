// Database operations - Now using Prisma for persistent storage
// This file re-exports Prisma repository functions for backward compatibility

export {
  getClient,
  setClient,
  getAllClients,
  deleteClient,
  getClientNotes,
  addNote,
  addNotes,
  getClientMeasures,
  addMeasure,
  addMeasures,
  getClientIncidents,
  addIncident,
  addIncidents,
  getClientEvidence,
  addEvidence,
  getEvidenceByTarget,
  addAuditEvent,
  getClientAuditLogs,
  getAuditLogs,
  clearAllData,
} from '../db/repository';

// Note: In-memory stores have been replaced with Prisma database.
// All data is now persistent and survives server restarts.
// The API remains the same for backward compatibility.
