import { NextRequest, NextResponse } from 'next/server';
import {
  getAllClients,
  getClientNotes,
  getClientMeasures,
  getClientIncidents,
} from '@/lib/data/stores';

export const dynamic = 'force-dynamic';

/**
 * GET /api/uc1/stats
 * Get statistics about the data store
 *
 * Query params:
 * - client_id: Get stats for a specific client (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const client_id = searchParams.get('client_id');

    if (client_id) {
      // Stats for specific client
      return getClientStats(client_id);
    } else {
      // Global stats
      return getGlobalStats();
    }
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: (error as Error).message,
        },
      },
      { status: 500 }
    );
  }
}

function getGlobalStats() {
  const clients = getAllClients();

  let totalNotes = 0;
  let totalMeasures = 0;
  let totalIncidents = 0;

  const profileCounts: Record<string, number> = {};
  const providerCounts: Record<string, number> = {};

  clients.forEach((client) => {
    totalNotes += getClientNotes(client.client_id).length;
    totalMeasures += getClientMeasures(client.client_id).length;
    totalIncidents += getClientIncidents(client.client_id).length;

    if (client.wlz_profile) {
      profileCounts[client.wlz_profile] =
        (profileCounts[client.wlz_profile] || 0) + 1;
    }

    if (client.provider) {
      providerCounts[client.provider] =
        (providerCounts[client.provider] || 0) + 1;
    }
  });

  return NextResponse.json({
    summary: {
      total_clients: clients.length,
      total_notes: totalNotes,
      total_measures: totalMeasures,
      total_incidents: totalIncidents,
    },
    breakdown: {
      by_profile: profileCounts,
      by_provider: providerCounts,
    },
    averages: {
      notes_per_client: clients.length > 0 ? (totalNotes / clients.length).toFixed(1) : 0,
      measures_per_client:
        clients.length > 0 ? (totalMeasures / clients.length).toFixed(1) : 0,
      incidents_per_client:
        clients.length > 0 ? (totalIncidents / clients.length).toFixed(1) : 0,
    },
  });
}

function getClientStats(client_id: string) {
  const notes = getClientNotes(client_id);
  const measures = getClientMeasures(client_id);
  const incidents = getClientIncidents(client_id);

  // Analyze notes
  const sectionCounts: Record<string, number> = {};
  const authorCounts: Record<string, number> = {};
  const dateRange = {
    earliest: '',
    latest: '',
  };

  notes.forEach((note) => {
    sectionCounts[note.section] = (sectionCounts[note.section] || 0) + 1;
    authorCounts[note.author] = (authorCounts[note.author] || 0) + 1;

    if (!dateRange.earliest || note.date < dateRange.earliest) {
      dateRange.earliest = note.date;
    }
    if (!dateRange.latest || note.date > dateRange.latest) {
      dateRange.latest = note.date;
    }
  });

  // Analyze measures
  const measureTypes: Record<string, number> = {};
  measures.forEach((measure) => {
    measureTypes[measure.type] = (measureTypes[measure.type] || 0) + 1;
  });

  // Analyze incidents
  const incidentTypes: Record<string, number> = {};
  const incidentSeverities: Record<string, number> = {};
  incidents.forEach((incident) => {
    incidentTypes[incident.type] = (incidentTypes[incident.type] || 0) + 1;
    incidentSeverities[incident.severity] =
      (incidentSeverities[incident.severity] || 0) + 1;
  });

  return NextResponse.json({
    client_id,
    summary: {
      notes_count: notes.length,
      measures_count: measures.length,
      incidents_count: incidents.length,
    },
    notes: {
      by_section: sectionCounts,
      by_author: authorCounts,
      date_range: dateRange,
    },
    measures: {
      by_type: measureTypes,
    },
    incidents: {
      by_type: incidentTypes,
      by_severity: incidentSeverities,
    },
  });
}
