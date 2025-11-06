// API endpoint for running normative checks
// POST /api/meerzorg/:id/validate

import { NextRequest, NextResponse } from 'next/server';
import {
  getMeerzorgApplication,
  getClient,
  getClientNotes,
  getClientMeasures,
  getClientIncidents,
  addNormativeCheck,
} from '@/lib/db/repository';
import {
  executeNormativeChecks,
  summarizeCheckResults,
  convertToDbFormat,
} from '@/lib/normative/check-engine';

export async function POST(
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

    // Get client data
    const client = await getClient(application.client_id);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get dossier data
    const notes = await getClientNotes(application.client_id);
    const measures = await getClientMeasures(application.client_id);
    const incidents = await getClientIncidents(application.client_id);

    // Parse form_data
    const formData = typeof application.form_data === 'string'
      ? JSON.parse(application.form_data)
      : application.form_data;

    // Execute normative checks
    const checkResults = await executeNormativeChecks(
      {
        client,
        application,
        notes,
        measures,
        incidents,
        formData,
      },
      {
        type: 'meerzorg',
        version: application.version,
      }
    );

    // Save check results to database
    const dbRecords = convertToDbFormat(checkResults);
    for (const record of dbRecords) {
      await addNormativeCheck({
        applicationId: params.id,
        clientId: application.client_id,
        checkType: record.check_type,
        ruleId: record.rule_id,
        status: record.status,
        message: record.message,
        severity: record.severity,
      });
    }

    // Generate summary
    const summary = summarizeCheckResults(checkResults);

    return NextResponse.json({
      checks: checkResults.map(r => ({
        rule_id: r.rule_id,
        name: r.rule.name,
        description: r.rule.description,
        category: r.check_type,
        status: r.status,
        message: r.message,
        severity: r.severity,
        checked_at: r.checked_at,
      })),
      summary: {
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        warnings: summary.warnings,
        by_severity: summary.bySeverity,
        critical_issues: summary.criticalIssues.map(i => ({
          rule_id: i.rule_id,
          name: i.rule.name,
          message: i.message,
        })),
      },
      recommendation: getRecommendation(summary),
    });
  } catch (error) {
    console.error('Error validating application:', error);
    return NextResponse.json(
      { error: 'Failed to validate application', details: (error as Error).message },
      { status: 500 }
    );
  }
}

function getRecommendation(summary: ReturnType<typeof summarizeCheckResults>): {
  status: 'ready' | 'needs_revision' | 'blocked';
  message: string;
} {
  if (summary.criticalIssues.length > 0) {
    return {
      status: 'blocked',
      message: `${summary.criticalIssues.length} kritieke issue(s) moeten worden opgelost voordat de aanvraag kan worden ingediend.`,
    };
  }

  if (summary.bySeverity.high?.failed > 0) {
    return {
      status: 'needs_revision',
      message: `${summary.bySeverity.high.failed} belangrijke issue(s) vereisen aandacht. Aanvraag kan worden ingediend maar heeft mogelijk minder kans op goedkeuring.`,
    };
  }

  if (summary.failed > 0) {
    return {
      status: 'needs_revision',
      message: `${summary.failed} issue(s) gevonden. Controleer de details en overweeg aanvullingen voordat u de aanvraag indient.`,
    };
  }

  return {
    status: 'ready',
    message: 'Alle checks succesvol. De aanvraag is gereed voor indienen.',
  };
}
