// API endpoint for submitting Meerzorg application
// POST /api/meerzorg/:id/submit

import { NextRequest, NextResponse } from 'next/server';
import {
  getMeerzorgApplication,
  updateMeerzorgApplication,
  getNormativeChecksByApplication,
  addReviewWorkflow,
  addAuditEvent,
} from '@/lib/db/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { submitted_by, reviewer_role = 'professional' } = body;

    if (!submitted_by) {
      return NextResponse.json(
        { error: 'submitted_by is required' },
        { status: 400 }
      );
    }

    const application = await getMeerzorgApplication(params.id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (application.status === 'submitted' || application.status === 'approved') {
      return NextResponse.json(
        { error: `Application is already ${application.status}` },
        { status: 400 }
      );
    }

    // Check for critical issues
    const checks = await getNormativeChecksByApplication(params.id);
    const criticalIssues = checks.filter(
      c => c.severity === 'critical' && c.status === 'fail'
    );

    if (criticalIssues.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot submit application with critical issues',
          critical_issues: criticalIssues.map(c => ({
            rule_id: c.rule_id,
            message: c.message,
          })),
        },
        { status: 400 }
      );
    }

    // Update application status
    await updateMeerzorgApplication(params.id, {
      status: 'submitted',
      submittedBy: submitted_by,
      submittedAt: new Date().toISOString(),
    });

    // Create review workflow entry
    await addReviewWorkflow({
      applicationId: params.id,
      reviewerRole: reviewer_role,
      reviewerName: submitted_by,
      status: 'pending',
    });

    // Log audit event
    await addAuditEvent({
      actor: submitted_by,
      clientId: application.client_id,
      action: 'meerzorg_application_submitted',
      meta: {
        application_id: params.id,
        version: application.version,
        submitted_at: new Date().toISOString(),
      },
    });

    const updated = await getMeerzorgApplication(params.id);

    return NextResponse.json({
      ...updated,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Failed to submit application', details: (error as Error).message },
      { status: 500 }
    );
  }
}
