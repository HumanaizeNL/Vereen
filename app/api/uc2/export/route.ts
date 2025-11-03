import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { generateHerindicatieReport } from '@/lib/export/docx-generator-enhanced';
import { addAuditEvent } from '@/lib/data/stores';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ExportRequestBody {
  client_id: string;
  period: {
    from: string;
    to: string;
  };
  criteria: any[];
  options?: {
    anonymize?: boolean;
    include_evidence_appendix?: boolean;
    template?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequestBody = await request.json();

    const { client_id, period, criteria, options = {} } = body;

    // Validate required fields
    if (!client_id || !period || !criteria) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: client_id, period, criteria',
          },
        },
        { status: 400 }
      );
    }

    // Generate the DOCX report
    const exportData = {
      client_id,
      period,
      criteria,
      generated_at: new Date().toISOString(),
    };

    const docxBuffer = await generateHerindicatieReport(exportData, options);

    // Add audit event
    addAuditEvent({
      id: nanoid(),
      ts: new Date().toISOString(),
      actor: 'user',
      client_id,
      action: 'export-report',
      meta: {
        format: 'docx',
        criteria_count: criteria.length,
        anonymize: options.anonymize || false,
        include_evidence: options.include_evidence_appendix !== false,
      },
    });

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const clientLabel = options.anonymize ? 'CLIENT' : client_id.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Herindicatie_${clientLabel}_${timestamp}.docx`;

    // Return the DOCX file
    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'EXPORT_ERROR',
          message: (error as Error).message,
        },
      },
      { status: 500 }
    );
  }
}
