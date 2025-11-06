import { NextRequest, NextResponse } from 'next/server';
import {
  addReviewWorkflow,
  getAllReviewWorkflows,
  getReviewWorkflowsByApplication,
  addAuditEvent,
} from '@/lib/db';

// GET /api/reviews?application_id=xxx (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');

    let reviews;
    if (applicationId) {
      reviews = await getReviewWorkflowsByApplication(applicationId);
    } else {
      reviews = await getAllReviewWorkflows();
    }

    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create review workflow entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      application_id,
      reviewer_role,
      reviewer_name,
      status,
      comments,
    } = body;

    // Validation
    if (!application_id || !reviewer_role || !reviewer_name || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: application_id, reviewer_role, reviewer_name, status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'needs_revision'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate that comments are provided for non-approved statuses
    if ((status === 'rejected' || status === 'needs_revision') && !comments) {
      return NextResponse.json(
        { error: 'Comments are required for rejected or needs_revision status' },
        { status: 400 }
      );
    }

    const reviewId = await addReviewWorkflow({
      applicationId: application_id,
      reviewerRole: reviewer_role,
      reviewerName: reviewer_name,
      status,
      comments: comments || null,
    });

    // Audit log
    await addAuditEvent({
      actor: reviewer_name,
      action: 'review_submitted',
      details: `Review ${status} by ${reviewer_name} (${reviewer_role})`,
      meta: {
        review_id: reviewId,
        application_id,
        status,
        has_comments: !!comments,
      },
    });

    return NextResponse.json({
      id: reviewId,
      message: 'Review submitted successfully',
      status,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
