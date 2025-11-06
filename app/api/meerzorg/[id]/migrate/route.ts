import { NextRequest, NextResponse } from 'next/server';
import {
  getMeerzorgApplicationById,
  updateMeerzorgApplication,
  addAuditEvent,
} from '@/lib/db';

interface MigrationWarning {
  field: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  action_required: boolean;
}

interface MigrationResult {
  success: boolean;
  version_from: string;
  version_to: string;
  warnings: MigrationWarning[];
  changes_applied: Record<string, any>;
}

// POST /api/meerzorg/[id]/migrate - Migrate application from 2025 to 2026
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { target_version, confirm_changes } = body;

    if (!target_version) {
      return NextResponse.json(
        { error: 'target_version is required' },
        { status: 400 }
      );
    }

    const application = await getMeerzorgApplicationById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Only allow migration from 2025 to 2026
    if (application.version !== '2025' || target_version !== '2026') {
      return NextResponse.json(
        { error: 'Migration only supported from version 2025 to 2026' },
        { status: 400 }
      );
    }

    // Analyze migration requirements and generate warnings
    const warnings: MigrationWarning[] = [];
    const changes: Record<string, any> = {};

    // Check dagzorg_uren (max changed from 18 to 16)
    if (application.form_data.dagzorg_uren) {
      const currentValue = parseInt(application.form_data.dagzorg_uren);
      if (currentValue > 16) {
        warnings.push({
          field: 'dagzorg_uren',
          message: `Dagzorg uren (${currentValue}) overschrijdt 2026 maximum van 16. Waarde wordt verlaagd naar 16.`,
          severity: 'warning',
          action_required: true,
        });
        changes.dagzorg_uren = 16;
      }
    }

    // Check nachtzorg_uren (max changed from 14 to 12)
    if (application.form_data.nachtzorg_uren) {
      const currentValue = parseInt(application.form_data.nachtzorg_uren);
      if (currentValue > 12) {
        warnings.push({
          field: 'nachtzorg_uren',
          message: `Nachtzorg uren (${currentValue}) overschrijdt 2026 maximum van 12. Waarde wordt verlaagd naar 12.`,
          severity: 'warning',
          action_required: true,
        });
        changes.nachtzorg_uren = 12;
      }
    }

    // Check een_op_een_uren (max changed from 10 to 8)
    if (application.form_data.een_op_een_uren) {
      const currentValue = parseInt(application.form_data.een_op_een_uren);
      if (currentValue > 8) {
        warnings.push({
          field: 'een_op_een_uren',
          message: `1-op-1 begeleiding uren (${currentValue}) overschrijdt 2026 maximum van 8. Waarde wordt verlaagd naar 8.`,
          severity: 'warning',
          action_required: true,
        });
        changes.een_op_een_uren = 8;
      }
    }

    // Check duurzaamheid_onderbouwing (required in 2026)
    if (!application.form_data.duurzaamheid_onderbouwing) {
      warnings.push({
        field: 'duurzaamheid_onderbouwing',
        message: 'Duurzaamheid onderbouwing is verplicht in 2026 framework. Dit veld moet worden ingevuld na migratie.',
        severity: 'error',
        action_required: true,
      });
    } else {
      warnings.push({
        field: 'duurzaamheid_onderbouwing',
        message: 'Duurzaamheid onderbouwing aanwezig. Controleer of deze voldoet aan 2026 vereisten.',
        severity: 'info',
        action_required: false,
      });
    }

    // Add general info warnings
    warnings.push({
      field: 'algemeen',
      message: 'Het 2026 framework hanteert strengere eisen voor onderbouwing en duurzaamheid.',
      severity: 'info',
      action_required: false,
    });

    // If not confirming, return preview
    if (!confirm_changes) {
      return NextResponse.json({
        success: false,
        version_from: '2025',
        version_to: '2026',
        warnings,
        changes_applied: changes,
        preview: true,
        message: 'Preview mode: geen wijzigingen toegepast. Stel confirm_changes in op true om te migreren.',
      });
    }

    // Apply migration
    const updatedFormData = {
      ...application.form_data,
      ...changes,
    };

    await updateMeerzorgApplication(params.id, {
      version: '2026',
      form_data: updatedFormData,
    });

    // Audit log
    await addAuditEvent({
      actor: 'system', // TODO: Get from auth
      action: 'application_migrated',
      details: `Application migrated from 2025 to 2026`,
      meta: {
        application_id: params.id,
        version_from: '2025',
        version_to: '2026',
        changes,
        warnings_count: warnings.length,
      },
    });

    return NextResponse.json({
      success: true,
      version_from: '2025',
      version_to: '2026',
      warnings,
      changes_applied: changes,
      message: 'Migratie succesvol voltooid',
    });
  } catch (error) {
    console.error('Error migrating application:', error);
    return NextResponse.json(
      { error: 'Failed to migrate application' },
      { status: 500 }
    );
  }
}
