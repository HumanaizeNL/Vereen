import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import {
  getClient,
  setClient,
  deleteClient,
  getClientNotes,
  getClientMeasures,
  getClientIncidents,
  addAuditEvent,
} from '@/lib/data/stores';
import { clearClientIndex } from '@/lib/search/flexsearch';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    client_id: string;
  }>;
}

/**
 * GET /api/uc1/clients/[client_id]
 * Get a specific client with optional data summary
 */
export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const { client_id } = params;
    const searchParams = request.nextUrl.searchParams;
    const include_summary = searchParams.get('include_summary') === 'true';

    const client = getClient(client_id);

    if (!client) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Client ${client_id} not found`,
          },
        },
        { status: 404 }
      );
    }

    const response: any = { client };

    if (include_summary) {
      const notes = await getClientNotes(client_id);
      const measures = await getClientMeasures(client_id);
      const incidents = await getClientIncidents(client_id);

      response.summary = {
        notes_count: notes.length,
        measures_count: measures.length,
        incidents_count: incidents.length,
        latest_note_date: notes.length > 0 ? notes[notes.length - 1].date : null,
        latest_measure_date:
          measures.length > 0 ? measures[measures.length - 1].date : null,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get client error:', error);
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
 * PUT /api/uc1/clients/[client_id]
 * Update a client
 */
export async function PUT(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const { client_id } = params;
    const body = await request.json();

    const existing = await getClient(client_id);
    if (!existing) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Client ${client_id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Update client (keep created_at)
    const updated = {
      ...existing,
      ...body,
      client_id, // Don't allow changing the ID
      created_at: existing.created_at, // Keep original creation date
    };

    await setClient(updated);

    // Add audit event
    await addAuditEvent({
      id: nanoid(),
      ts: new Date().toISOString(),
      actor: 'user',
      client_id,
      action: 'update-client',
      meta: { fields_updated: Object.keys(body) },
    });

    return NextResponse.json({
      client: updated,
      message: 'Client updated successfully',
    });
  } catch (error) {
    console.error('Update client error:', error);
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
 * DELETE /api/uc1/clients/[client_id]
 * Delete a client and all associated data
 */
export async function DELETE(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const { client_id } = params;

    const client = await getClient(client_id);
    if (!client) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Client ${client_id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Count associated data before deletion (for audit log)
    const notes = await getClientNotes(client_id);
    const measures = await getClientMeasures(client_id);
    const incidents = await getClientIncidents(client_id);

    // Delete client (Prisma will cascade delete all related data)
    await deleteClient(client_id);

    // Clear search index
    clearClientIndex(client_id);

    // Add audit event
    await addAuditEvent({
      id: nanoid(),
      ts: new Date().toISOString(),
      actor: 'user',
      client_id,
      action: 'delete-client',
      meta: {
        notes_deleted: notes.length,
        measures_deleted: measures.length,
        incidents_deleted: incidents.length,
      },
    });

    return NextResponse.json({
      message: 'Client and all associated data deleted successfully',
      deleted: {
        client_id,
        notes: notes.length,
        measures: measures.length,
        incidents: incidents.length,
      },
    });
  } catch (error) {
    console.error('Delete client error:', error);
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
