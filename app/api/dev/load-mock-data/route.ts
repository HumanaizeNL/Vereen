import { NextRequest, NextResponse } from 'next/server';
import {
  setClient,
  addNotes,
  addMeasures,
  addIncidents,
  clearAllData,
} from '@/lib/data/stores';
import { loadMockData } from '@/lib/data/mock-data';

export const dynamic = 'force-dynamic';

/**
 * POST /api/dev/load-mock-data
 * Loads realistic mock data based on casus 3 and casus 4
 *
 * This endpoint is for development/testing purposes only
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clear_existing = true } = body;

    // Clear existing data if requested
    if (clear_existing) {
      clearAllData();
    }

    // Load mock data
    const mockData = loadMockData();

    // Load clients
    mockData.clients.forEach((client) => {
      setClient(client);
    });

    // Load notes
    addNotes(mockData.notes);

    // Load measures
    addMeasures(mockData.measures);

    // Load incidents
    addIncidents(mockData.incidents);

    return NextResponse.json({
      success: true,
      loaded: {
        clients: mockData.clients.length,
        notes: mockData.notes.length,
        measures: mockData.measures.length,
        incidents: mockData.incidents.length,
      },
      client_ids: mockData.clients.map((c) => c.client_id),
      message: 'Mock data loaded successfully',
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
      },
      description:
        'Realistic mock data based on casus 3 (psychiatric problems, anxiety) and casus 4 (cognitive decline after CVA)',
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
