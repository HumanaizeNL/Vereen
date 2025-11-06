// API endpoints for MD (Medical Doctor) reviews
// POST /api/md-review - Create MD review
// GET /api/md-review - Get MD reviews for client

import { NextRequest, NextResponse } from 'next/server';
import {
  addMdReview,
  getMdReviewsByClient,
  addAuditEvent,
} from '@/lib/db/repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      client_id,
      reviewer_name,
      reviewer_role,
      clinical_notes,
      decision,
      observation_period_days,
    } = body;

    // Validation
    if (!client_id || !reviewer_name || !reviewer_role || !clinical_notes || !decision) {
      return NextResponse.json(
        {
          error: 'Required fields: client_id, reviewer_name, reviewer_role, clinical_notes, decision',
        },
        { status: 400 }
      );
    }

    const validRoles = ['physician', 'psychologist', 'ergo', 'physio', 'nurse'];
    if (!validRoles.includes(reviewer_role)) {
      return NextResponse.json(
        { error: `Invalid reviewer_role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const validDecisions = ['approve', 'observe', 'reject'];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json(
        { error: `Invalid decision. Must be one of: ${validDecisions.join(', ')}` },
        { status: 400 }
      );
    }

    if (decision === 'observe' && !observation_period_days) {
      return NextResponse.json(
        { error: 'observation_period_days is required when decision is "observe"' },
        { status: 400 }
      );
    }

    // Create MD review
    const reviewId = await addMdReview({
      clientId: client_id,
      reviewerName: reviewer_name,
      reviewerRole: reviewer_role,
      clinicalNotes: clinical_notes,
      decision,
      observationPeriodDays: observation_period_days,
    });

    // Log audit event
    await addAuditEvent({
      actor: reviewer_name,
      clientId: client_id,
      action: 'md_review_created',
      meta: {
        review_id: reviewId,
        reviewer_role,
        decision,
        observation_period_days,
      },
    });

    return NextResponse.json({
      id: reviewId,
      client_id,
      reviewer_name,
      reviewer_role,
      decision,
      observation_period_days,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating MD review:', error);
    return NextResponse.json(
      { error: 'Failed to create MD review', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');

    if (!clientId) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    const reviews = await getMdReviewsByClient(clientId);

    // Calculate statistics
    const statistics = {
      total: reviews.length,
      by_decision: {
        approve: reviews.filter(r => r.decision === 'approve').length,
        observe: reviews.filter(r => r.decision === 'observe').length,
        reject: reviews.filter(r => r.decision === 'reject').length,
      },
      by_role: reviews.reduce((acc, review) => {
        acc[review.reviewer_role] = (acc[review.reviewer_role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      latest_review: reviews.length > 0 ? reviews[0] : null,
    };

    return NextResponse.json({
      client_id: clientId,
      reviews,
      statistics,
    });
  } catch (error) {
    console.error('Error fetching MD reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MD reviews' },
      { status: 500 }
    );
  }
}
