// API endpoints for Meerzorg applications
// POST /api/meerzorg - Create new application
// GET /api/meerzorg - List applications

import { NextRequest, NextResponse } from 'next/server';
import {
  createMeerzorgApplication,
  getMeerzorgApplicationsByClient,
  getAllMeerzorgApplications,
} from '@/lib/db/repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, version = '2026', form_data = {} } = body;

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    const applicationId = await createMeerzorgApplication({
      clientId: client_id,
      version,
      formData: form_data,
      status: 'draft',
    });

    return NextResponse.json({
      id: applicationId,
      client_id,
      status: 'draft',
      version,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating Meerzorg application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');

    if (clientId) {
      const applications = await getMeerzorgApplicationsByClient(clientId);
      return NextResponse.json(applications);
    }

    // Get all applications
    const applications = await getAllMeerzorgApplications();
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching Meerzorg applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
