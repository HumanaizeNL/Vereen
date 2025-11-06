// API endpoint for analyzing dossier and extracting fields
// POST /api/meerzorg/:id/analyze

import { NextRequest, NextResponse } from 'next/server';
import {
  getMeerzorgApplication,
  getClient,
  getNotesByClient,
  getMeasuresByClient,
  getIncidentsByClient,
  addMeerzorgFormData,
  updateMeerzorgApplication,
} from '@/lib/db/repository';
import { analyzeDossierForMeerzorg } from '@/lib/extraction/meerzorg-fields';
import { linkFormFieldsToEvidence } from '@/lib/evidence/linking';

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
    const notes = await getNotesByClient(application.client_id);
    const measures = await getMeasuresByClient(application.client_id);
    const incidents = await getIncidentsByClient(application.client_id);

    // Analyze dossier
    const analysis = analyzeDossierForMeerzorg({
      client_id: application.client_id,
      notes,
      measures,
      incidents,
    });

    // Convert analysis to form fields
    const formFields: Array<{ field_name: string; field_value: any }> = [];

    // Care hours
    if (analysis.care_hours.day !== null) {
      formFields.push({
        field_name: 'dagzorg_uren',
        field_value: analysis.care_hours.day.toString(),
      });
    }
    if (analysis.care_hours.night !== null) {
      formFields.push({
        field_name: 'nachtzorg_uren',
        field_value: analysis.care_hours.night.toString(),
      });
    }
    if (analysis.care_hours.one_on_one !== null) {
      formFields.push({
        field_name: 'een_op_een_uren',
        field_value: analysis.care_hours.one_on_one.toString(),
      });
    }

    // ADL
    if (analysis.adl_dependency.score !== null) {
      formFields.push({
        field_name: 'adl_score',
        field_value: analysis.adl_dependency.score.toString(),
      });
    }
    if (analysis.adl_dependency.category) {
      formFields.push({
        field_name: 'adl_categorie',
        field_value: analysis.adl_dependency.category,
      });
    }

    // BPSD
    formFields.push({
      field_name: 'gedragsproblematiek',
      field_value: analysis.bpsd_indicators.present ? 'ja' : 'nee',
    });
    if (analysis.bpsd_indicators.severity) {
      formFields.push({
        field_name: 'gedragsproblematiek_ernst',
        field_value: analysis.bpsd_indicators.severity,
      });
    }

    // Night care
    formFields.push({
      field_name: 'nachtzorg_nodig',
      field_value: analysis.night_care_needs.required ? 'ja' : 'nee',
    });
    if (analysis.night_care_needs.frequency) {
      formFields.push({
        field_name: 'nachtzorg_frequentie',
        field_value: analysis.night_care_needs.frequency,
      });
    }

    // Link fields to evidence
    const evidenceMap = linkFormFieldsToEvidence(formFields, {
      client,
      notes,
      measures,
      incidents,
    });

    // Save form data with evidence
    const savedFields = [];
    for (const field of formFields) {
      const evidence = evidenceMap.get(field.field_name) || [];
      const bestEvidence = evidence[0];

      const fieldId = await addMeerzorgFormData({
        applicationId: params.id,
        fieldName: field.field_name,
        fieldValue: field.field_value,
        sourceType: bestEvidence?.source_type || 'unknown',
        sourceId: bestEvidence?.source_id || '',
        confidence: bestEvidence?.confidence || 0.5,
      });

      savedFields.push({
        id: fieldId,
        field_name: field.field_name,
        field_value: field.field_value,
        confidence: bestEvidence?.confidence || 0.5,
        evidence: evidence.slice(0, 3), // Top 3 evidence items
      });
    }

    // Update application form_data
    const formDataObj = formFields.reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    await updateMeerzorgApplication(params.id, {
      formData: formDataObj,
    });

    return NextResponse.json({
      analysis: {
        care_hours: analysis.care_hours,
        adl_dependency: analysis.adl_dependency,
        bpsd_indicators: analysis.bpsd_indicators,
        night_care_needs: analysis.night_care_needs,
        incident_pattern: analysis.incident_pattern,
        specialist_reports: analysis.specialist_reports,
        interventions: analysis.interventions,
      },
      extracted_fields: savedFields,
      summary: {
        total_fields: savedFields.length,
        high_confidence: savedFields.filter(f => f.confidence > 0.7).length,
        medium_confidence: savedFields.filter(f => f.confidence >= 0.5 && f.confidence <= 0.7).length,
        low_confidence: savedFields.filter(f => f.confidence < 0.5).length,
      },
    });
  } catch (error) {
    console.error('Error analyzing dossier:', error);
    return NextResponse.json(
      { error: 'Failed to analyze dossier', details: (error as Error).message },
      { status: 500 }
    );
  }
}
