// API endpoints for individual Meerzorg application
// GET /api/meerzorg/:id - Get application details
// PUT /api/meerzorg/:id - Update application
// DELETE /api/meerzorg/:id - Delete application

import { NextRequest, NextResponse } from 'next/server';
import {
  getMeerzorgApplication,
  updateMeerzorgApplication,
  deleteMeerzorgApplication,
  getMeerzorgFormDataByApplication,
} from '@/lib/db/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const application = await getMeerzorgApplication(params.id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get associated form data
    const formFields = await getMeerzorgFormDataByApplication(params.id);

    return NextResponse.json({
      ...application,
      form_fields: formFields,
    });
  } catch (error) {
    console.error('Error fetching Meerzorg application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, form_data, submitted_by } = body;

    const updates: any = {};
    if (status) updates.status = status;
    if (form_data) updates.formData = form_data;
    if (submitted_by) updates.submittedBy = submitted_by;

    // If status is being set to 'submitted', set submitted_at
    if (status === 'submitted') {
      updates.submittedAt = new Date().toISOString();
    }

    await updateMeerzorgApplication(params.id, updates);

    const updated = await getMeerzorgApplication(params.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating Meerzorg application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteMeerzorgApplication(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Meerzorg application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
