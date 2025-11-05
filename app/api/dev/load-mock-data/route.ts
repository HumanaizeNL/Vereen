import { NextRequest, NextResponse } from 'next/server';
import {
  setClient,
  addNotes,
  addMeasures,
  addIncidents,
  addEvidence,
  addAuditEvent,
  clearAllData,
} from '@/lib/data/stores';
import { loadMockData } from '@/lib/data/mock-data-enhanced';

export const dynamic = 'force-dynamic';

/**
 * POST /api/dev/load-mock-data
 * Loads realistic mock data based on casus 3 and casus 4
 *
 * This endpoint is for development/testing purposes only
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body, default to empty object if no body provided
    let body: { clear_existing?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // No body provided, use defaults
    }
    const { clear_existing = true } = body;

    // Clear existing data if requested
    if (clear_existing) {
      await clearAllData();
    }

    // Load mock data
    const mockData = loadMockData();

    // Load clients - await each async operation
    for (const client of mockData.clients) {
      await setClient(client);
    }

    // Load notes
    await addNotes(mockData.notes);

    // Load measures
    await addMeasures(mockData.measures);

    // Load incidents
    await addIncidents(mockData.incidents);

    // Load evidence links
    if (mockData.evidenceLinks) {
      for (const evidence of mockData.evidenceLinks) {
        await addEvidence(evidence);
      }
    }

    // Load audit events
    if (mockData.auditEvents) {
      for (const event of mockData.auditEvents) {
        await addAuditEvent(event);
      }
    }

    return NextResponse.json({
      success: true,
      loaded: {
        clients: mockData.clients.length,
        notes: mockData.notes.length,
        measures: mockData.measures.length,
        incidents: mockData.incidents.length,
        evidenceLinks: mockData.evidenceLinks?.length || 0,
        auditEvents: mockData.auditEvents?.length || 0,
      },
      client_ids: mockData.clients.map((c) => c.client_id),
      message: 'Enhanced mock data loaded successfully',
    });
  } catch (error) {
    console.error('Load mock data error:', error);
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

/**
 * GET /api/dev/load-mock-data
 * Get information about available mock data
 */
export async function GET() {
  try {
    const mockData = loadMockData();

    return NextResponse.json({
      available_data: {
        clients: mockData.clients.map((c) => ({
          id: c.client_id,
          name: c.name,
          profile: c.wlz_profile,
          provider: c.provider,
        })),
        notes_count: mockData.notes.length,
        measures_count: mockData.measures.length,
        incidents_count: mockData.incidents.length,
        evidence_links_count: mockData.evidenceLinks?.length || 0,
        audit_events_count: mockData.auditEvents?.length || 0,
      },
      description:
        'Enhanced mock data with 7 diverse client scenarios (VV2-VV9), evidence links, and audit trail',
      scenarios: [
        'CL-2023-001: VV7 Psychiatric/Anxiety (meerzorg justified)',
        'CL-2023-002: VV7 Post-CVA Cognitive Decline (meerzorg justified)',
        'CL-2024-003: VV2 Physical Disability (stable, no meerzorg)',
        'CL-2024-004: VV5 Early Dementia + Caregiver Burnout (respite care)',
        'CL-2024-005: VV9 Severe ID + Autism (24/7 safety critical)',
        'CL-2024-006: VV7 Stabilized (recommend phase-out)',
        'CL-2024-007: VV6 Aggressive Behavior (medication trial)',
      ],
    });
  } catch (error) {
    console.error('Get mock data info error:', error);
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
