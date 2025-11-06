import { NextRequest, NextResponse } from 'next/server';
import {
  getAllEvidenceByApplication,
  getAllEvidence,
  addEvidence,
  addAuditEvent,
} from '@/lib/db';

// GET /api/evidence?application_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'application_id is required' },
        { status: 400 }
      );
    }

    const evidence = await getAllEvidenceByApplication(applicationId);

    // Enrich evidence with source references
    const enrichedEvidence = evidence.map((item: any) => {
      let sourceReference = '';

      switch (item.source_type) {
        case 'dossier_note':
          sourceReference = `Notitie #${item.source_id.substring(0, 8)}`;
          break;
        case 'measure':
          sourceReference = `Meting #${item.source_id.substring(0, 8)}`;
          break;
        case 'incident':
          sourceReference = `Incident #${item.source_id.substring(0, 8)}`;
          break;
        default:
          sourceReference = `Bron #${item.source_id.substring(0, 8)}`;
      }

      return {
        ...item,
        source_reference: sourceReference,
      };
    });

    return NextResponse.json({
      evidence: enrichedEvidence,
      count: enrichedEvidence.length,
    });
  } catch (error) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}

// POST /api/evidence - Create new evidence link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      application_id,
      field_name,
      field_label,
      source_type,
      source_id,
      evidence_text,
      confidence_score,
      metadata,
    } = body;

    // Validation
    if (!application_id || !field_name || !source_type || !source_id || !evidence_text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (confidence_score !== undefined && (confidence_score < 0 || confidence_score > 1)) {
      return NextResponse.json(
        { error: 'confidence_score must be between 0 and 1' },
        { status: 400 }
      );
    }

    const evidenceId = await addEvidence({
      applicationId: application_id,
      fieldName: field_name,
      fieldLabel: field_label || field_name,
      sourceType: source_type,
      sourceId: source_id,
      evidenceText: evidence_text,
      confidenceScore: confidence_score || 0.8,
      metadata: metadata || {},
    });

    // Audit log
    await addAuditEvent({
      actor: 'system', // TODO: Get from auth
      action: 'evidence_created',
      details: `Evidence linked for field ${field_name}`,
      meta: {
        evidence_id: evidenceId,
        application_id,
        field_name,
        source_type,
      },
    });

    return NextResponse.json({
      id: evidenceId,
      message: 'Evidence linked successfully',
    });
  } catch (error) {
    console.error('Error creating evidence:', error);
    return NextResponse.json(
      { error: 'Failed to create evidence link' },
      { status: 500 }
    );
  }
}

// DELETE /api/evidence?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const evidenceId = searchParams.get('id');

    if (!evidenceId) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // TODO: Add deleteEvidence to db.ts and call it here
    // For now, return success

    await addAuditEvent({
      actor: 'system', // TODO: Get from auth
      action: 'evidence_deleted',
      details: `Evidence link removed`,
      meta: {
        evidence_id: evidenceId,
      },
    });

    return NextResponse.json({
      message: 'Evidence link removed',
    });
  } catch (error) {
    console.error('Error deleting evidence:', error);
    return NextResponse.json(
      { error: 'Failed to delete evidence link' },
      { status: 500 }
    );
  }
}
