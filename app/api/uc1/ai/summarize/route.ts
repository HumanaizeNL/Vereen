// AI-powered note summarization endpoint
// POST /api/uc1/ai/summarize

import { NextRequest, NextResponse } from 'next/server';
import { summarizeNotes } from '@/lib/ai/uc1-services';
import { getClientNotes } from '@/lib/data/stores';
import { addAuditEvent } from '@/lib/data/stores';

export const dynamic = 'force-dynamic';

/**
 * POST /api/uc1/ai/summarize
 * Generate AI summary of client notes
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      clientId,
      focus = 'all', // 'all' | 'recent' | 'behavioral' | 'medical' | 'adl'
      maxLength = 'medium', // 'short' | 'medium' | 'long'
    } = body;

    // Validate required parameters
    if (!clientId) {
      return NextResponse.json({ error: { code: 'MISSING_PARAM', message: 'clientId is required' } }, { status: 400 });
    }

    // Get client notes
    const notes = await getClientNotes(clientId);

    if (!notes || notes.length === 0) {
      return NextResponse.json({
        error: {
          code: 'NO_DATA',
          message: 'No notes found for this client',
        },
      }, { status: 404 });
    }

    // Generate AI summary
    const summary = await summarizeNotes({
      notes,
      focus,
      maxLength,
    });

    // Log audit event
    await addAuditEvent({
      id: `audit_${Date.now()}`,
      ts: new Date().toISOString(),
      actor: 'ai',
      client_id: clientId,
      action: 'summary_generated',
      meta: { focus, maxLength, notes_count: notes.length },
    });

    return NextResponse.json({
      success: true,
      clientId,
      summary: summary.summary,
      keyPoints: summary.keyPoints,
      timeline: summary.timeline,
      metadata: {
        notes_analyzed: notes.length,
        focus,
        maxLength,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('AI summarize error:', error);
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
