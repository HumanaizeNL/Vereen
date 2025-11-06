import { NextRequest, NextResponse } from 'next/server';
import {
  getMeerzorgApplicationById,
  getAllEvidenceByApplication,
  getValidationResultsByApplication,
  addAuditEvent,
} from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const [application, evidence, validations] = await Promise.all([
      getMeerzorgApplicationById(params.id),
      getAllEvidenceByApplication(params.id),
      getValidationResultsByApplication(params.id),
    ]);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Audit log
    await addAuditEvent({
      actor: 'system', // TODO: Get from auth
      action: 'application_exported',
      details: `Application exported as ${format}`,
      meta: {
        application_id: params.id,
        format,
      },
    });

    if (format === 'json') {
      return NextResponse.json(
        {
          application,
          evidence,
          validations,
          exported_at: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Disposition': `attachment; filename="meerzorg-${params.id}-${Date.now()}.json"`,
          },
        }
      );
    }

    if (format === 'csv') {
      // Generate CSV format
      const csvLines = [
        // Header
        'Field,Value',
        // Application metadata
        `Status,${application.status}`,
        `Version,${application.version}`,
        `Created At,${application.created_at}`,
        `Submitted At,${application.submitted_at || 'N/A'}`,
        // Form data
        ...Object.entries(application.form_data || {}).map(
          ([key, value]) => `${key},"${String(value).replace(/"/g, '""')}"`
        ),
      ];

      // Add evidence
      if (evidence.length > 0) {
        csvLines.push('');
        csvLines.push('Evidence');
        csvLines.push('Field,Source Type,Evidence Text,Confidence');
        evidence.forEach((e: any) => {
          csvLines.push(
            `${e.field_name},${e.source_type},"${e.evidence_text.replace(/"/g, '""')}",${e.confidence_score}`
          );
        });
      }

      // Add validations
      if (validations.length > 0) {
        csvLines.push('');
        csvLines.push('Validations');
        csvLines.push('Check Type,Status,Message');
        validations.forEach((v: any) => {
          csvLines.push(
            `${v.check_type},${v.status},"${v.message.replace(/"/g, '""')}"`
          );
        });
      }

      const csvContent = csvLines.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="meerzorg-${params.id}-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Unsupported format. Use json or csv' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error exporting application:', error);
    return NextResponse.json(
      { error: 'Failed to export application' },
      { status: 500 }
    );
  }
}
