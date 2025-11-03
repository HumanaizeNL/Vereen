import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { EvaluateCriteriaRequestSchema } from '@/lib/schemas/requests';
import { VV8_CRITERIA_2026, evaluateCriterion } from '@/lib/ai/criteria';
import { addAuditEvent } from '@/lib/data/stores';
import { MOCK_MODE } from '@/lib/ai/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for AI processing

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validated = EvaluateCriteriaRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { client_id, period, criteria_set, max_evidence } = validated.data;

    // Get criteria definitions
    let criteria = VV8_CRITERIA_2026;

    if (criteria_set === 'herindicatie.vv7.2026') {
      // VV7 would have slightly different criteria
      // For MVP, we use the same
    }

    // Evaluate each criterion
    const results = await Promise.all(
      criteria.map((criterion) =>
        evaluateCriterion(client_id, criterion, period, max_evidence)
      )
    );

    // Add audit event
    addAuditEvent({
      id: nanoid(),
      ts: new Date().toISOString(),
      actor: 'ai',
      client_id,
      action: 'evaluate-criteria',
      meta: {
        criteria_set,
        criteria_count: results.length,
        period,
        mock_mode: MOCK_MODE,
      },
    });

    return NextResponse.json({
      client_id,
      criteria: results,
    });
  } catch (error) {
    console.error('Evaluate criteria error:', error);
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
