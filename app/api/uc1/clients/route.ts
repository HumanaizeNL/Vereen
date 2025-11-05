import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import {
  getAllClients,
  getClient,
  setClient,
  addAuditEvent,
} from '@/lib/data/stores';
import { Client } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/uc1/clients
 * List all clients with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get('provider');
    const wlz_profile = searchParams.get('wlz_profile');

    let clients = await getAllClients();

    // Apply filters
    if (provider) {
      clients = clients.filter((c) => c.provider === provider);
    }

    if (wlz_profile) {
      clients = clients.filter((c) => c.wlz_profile === wlz_profile);
    }

    // Sort by created_at desc
    clients.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      clients,
      total: clients.length,
    });
  } catch (error) {
    console.error('List clients error:', error);
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
 * POST /api/uc1/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, name, dob, bsn_encrypted, wlz_profile, provider } = body;

    // Validation
    if (!client_id || !name) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'client_id and name are required',
          },
        },
        { status: 400 }
      );
    }

    // Check if client already exists
    const existing = await getClient(client_id);
    if (existing) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: `Client ${client_id} already exists`,
          },
        },
        { status: 409 }
      );
    }

    // Create client
    const client: Client = {
      client_id,
      name,
      dob: dob || '',
      bsn_encrypted,
      wlz_profile: wlz_profile || '',
      provider: provider || '',
      created_at: new Date().toISOString(),
    };

    await setClient(client);

    // Add audit event
    await addAuditEvent({
      id: nanoid(),
      ts: new Date().toISOString(),
      actor: 'user',
      client_id,
      action: 'create-client',
      meta: { wlz_profile, provider },
    });

    return NextResponse.json(
      {
        client,
        message: 'Client created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create client error:', error);
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
