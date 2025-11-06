// Normative check engine for validating against Toetsingskader and regulatory rules
// Executes validation rules and returns structured check results

import type {
  NormativeCheck,
  MeerzorgApplication,
  Client,
  Note,
  Measure,
  Incident,
} from '../data/types';
import { nanoid } from 'nanoid';

export interface CheckRule {
  id: string;
  name: string;
  description: string;
  category: 'required_field' | 'toetsingskader_rule' | 'completeness' | 'consistency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  check: (context: CheckContext) => CheckResult;
}

export interface CheckContext {
  client: Client;
  application?: MeerzorgApplication;
  notes: Note[];
  measures: Measure[];
  incidents: Incident[];
  formData: Record<string, any>;
}

export interface CheckResult {
  passed: boolean;
  message: string;
  details?: string;
}

export interface NormativeCheckResult extends Omit<NormativeCheck, 'id'> {
  rule: CheckRule;
}

/**
 * Execute normative checks against a client or application
 */
export async function executeNormativeChecks(
  context: CheckContext,
  framework: {
    type: 'toetsingskader' | 'vv8' | 'meerzorg';
    version: string;
    rules?: CheckRule[];
  }
): Promise<NormativeCheckResult[]> {
  const rules = framework.rules || getDefaultRules(framework.type, framework.version);
  const results: NormativeCheckResult[] = [];

  for (const rule of rules) {
    try {
      const result = rule.check(context);

      results.push({
        application_id: context.application?.id,
        client_id: context.client.client_id,
        check_type: rule.category,
        rule_id: rule.id,
        status: result.passed ? 'pass' : 'fail',
        message: result.message,
        severity: rule.severity,
        checked_at: new Date().toISOString(),
        rule,
      });
    } catch (error) {
      results.push({
        application_id: context.application?.id,
        client_id: context.client.client_id,
        check_type: 'consistency',
        rule_id: rule.id,
        status: 'fail',
        message: `Check execution error: ${(error as Error).message}`,
        severity: 'medium',
        checked_at: new Date().toISOString(),
        rule,
      });
    }
  }

  return results;
}

/**
 * Get default rules for a framework type and version
 */
function getDefaultRules(
  frameworkType: string,
  version: string
): CheckRule[] {
  if (frameworkType === 'meerzorg') {
    return getMeerzorgRules(version);
  } else if (frameworkType === 'vv8') {
    return getVV8Rules(version);
  } else if (frameworkType === 'toetsingskader') {
    return getToetsingskaderRules(version);
  }
  return [];
}

/**
 * Meerzorg validation rules (2025/2026)
 */
function getMeerzorgRules(version: string): CheckRule[] {
  const rules: CheckRule[] = [
    // Required field checks
    {
      id: 'meerzorg_client_info_complete',
      name: 'Cliëntgegevens compleet',
      description: 'Controleer of basis cliëntgegevens aanwezig zijn',
      category: 'required_field',
      severity: 'critical',
      check: (ctx) => {
        const missing: string[] = [];
        if (!ctx.client.name) missing.push('naam');
        if (!ctx.client.dob) missing.push('geboortedatum');
        if (!ctx.client.wlz_profile) missing.push('WLZ profiel');

        return {
          passed: missing.length === 0,
          message:
            missing.length === 0
              ? 'Cliëntgegevens compleet'
              : `Ontbrekende gegevens: ${missing.join(', ')}`,
        };
      },
    },
    {
      id: 'meerzorg_care_hours_documented',
      name: 'Zorguren gedocumenteerd',
      description: 'Controleer of zorguren zijn vastgelegd',
      category: 'required_field',
      severity: 'high',
      check: (ctx) => {
        const hasDayHours = ctx.formData.dagzorg_uren !== undefined;
        const hasNightHours = ctx.formData.nachtzorg_uren !== undefined;

        return {
          passed: hasDayHours || hasNightHours,
          message:
            hasDayHours || hasNightHours
              ? 'Zorguren gedocumenteerd'
              : 'Geen dag- of nachtzorguren vastgelegd',
        };
      },
    },
    {
      id: 'meerzorg_adl_assessment',
      name: 'ADL beoordeling aanwezig',
      description: 'Controleer of ADL beoordeling is uitgevoerd',
      category: 'toetsingskader_rule',
      severity: 'high',
      check: (ctx) => {
        const hasADLMeasure = ctx.measures.some((m) =>
          m.type.toLowerCase().includes('adl') ||
          m.type.toLowerCase().includes('katz')
        );
        const hasADLInForm = ctx.formData.adl_score !== undefined;

        return {
          passed: hasADLMeasure || hasADLInForm,
          message: hasADLMeasure || hasADLInForm
            ? 'ADL beoordeling aanwezig'
            : 'Geen ADL beoordeling gevonden in metingen of formulier',
        };
      },
    },
    {
      id: 'meerzorg_bpsd_documented',
      name: 'Gedragsproblematiek gedocumenteerd',
      description: 'Bij gedragsproblematiek: documentatie vereist',
      category: 'toetsingskader_rule',
      severity: 'medium',
      check: (ctx) => {
        const hasBPSD = ctx.formData.gedragsproblematiek === 'ja';

        if (!hasBPSD) {
          return { passed: true, message: 'Geen gedragsproblematiek gemeld' };
        }

        const hasBPSDDocs = ctx.notes.some(
          (n) =>
            n.text.toLowerCase().includes('bpsd') ||
            n.text.toLowerCase().includes('gedrag') ||
            n.text.toLowerCase().includes('agressie')
        );

        return {
          passed: hasBPSDDocs,
          message: hasBPSDDocs
            ? 'Gedragsproblematiek gedocumenteerd'
            : 'Gedragsproblematiek gemeld maar onvoldoende gedocumenteerd in notities',
        };
      },
    },
    {
      id: 'meerzorg_night_care_justification',
      name: 'Nachtzorg onderbouwing',
      description: 'Nachtzorg vereist specifieke onderbouwing',
      category: 'toetsingskader_rule',
      severity: 'high',
      check: (ctx) => {
        const nightHours = parseFloat(ctx.formData.nachtzorg_uren || '0');

        if (nightHours === 0) {
          return { passed: true, message: 'Geen nachtzorg aangevraagd' };
        }

        const hasNightDocs = ctx.notes.some(
          (n) =>
            n.text.toLowerCase().includes('nacht') ||
            n.text.toLowerCase().includes('nachtzorg')
        );

        return {
          passed: hasNightDocs,
          message: hasNightDocs
            ? 'Nachtzorg voldoende onderbouwd'
            : 'Nachtzorg aangevraagd maar onvoldoende onderbouwd in notities',
        };
      },
    },
    {
      id: 'meerzorg_incident_threshold',
      name: 'Incident drempelwaarde',
      description: 'Hoog aantal incidenten vereist extra aandacht',
      category: 'consistency',
      severity: 'medium',
      check: (ctx) => {
        const incidentCount = ctx.incidents.length;
        const highSeverityCount = ctx.incidents.filter(
          (i) => i.severity.toLowerCase() === 'hoog' || i.severity.toLowerCase() === 'ernstig'
        ).length;

        if (incidentCount >= 10 || highSeverityCount >= 3) {
          const hasJustification = ctx.formData.incident_onderbouwing !== undefined;

          return {
            passed: hasJustification,
            message: hasJustification
              ? 'Hoog aantal incidenten gedocumenteerd'
              : `Hoog aantal incidenten (${incidentCount} totaal, ${highSeverityCount} ernstig) vereist extra onderbouwing`,
          };
        }

        return { passed: true, message: 'Incidentdruk binnen normale grenzen' };
      },
    },
    {
      id: 'meerzorg_specialist_report',
      name: 'Specialistisch rapport',
      description: 'Bij ernstige problematiek: specialistisch rapport vereist',
      category: 'toetsingskader_rule',
      severity: 'high',
      check: (ctx) => {
        const hasSevereBPSD = ctx.formData.gedragsproblematiek_ernst === 'ernstig' ||
                              ctx.formData.gedragsproblematiek_ernst === 'severe';
        const hasHighCareNeed =
          parseFloat(ctx.formData.een_op_een_uren || '0') > 0 ||
          parseFloat(ctx.formData.nachtzorg_uren || '0') > 8;

        if (!hasSevereBPSD && !hasHighCareNeed) {
          return { passed: true, message: 'Geen specialistisch rapport vereist' };
        }

        const hasSpecialistNote = ctx.notes.some(
          (n) =>
            n.text.toLowerCase().includes('psychiater') ||
            n.text.toLowerCase().includes('geriater') ||
            n.text.toLowerCase().includes('specialist')
        );

        return {
          passed: hasSpecialistNote,
          message: hasSpecialistNote
            ? 'Specialistisch rapport aanwezig'
            : 'Ernstige problematiek of hoge zorgbehoefte vereist specialistisch rapport',
        };
      },
    },
    {
      id: 'meerzorg_recent_assessment',
      name: 'Recente beoordeling',
      description: 'Metingen moeten recent zijn (< 3 maanden)',
      category: 'completeness',
      severity: 'medium',
      check: (ctx) => {
        if (ctx.measures.length === 0) {
          return { passed: false, message: 'Geen metingen beschikbaar' };
        }

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recentMeasures = ctx.measures.filter((m) => {
          const measureDate = new Date(m.date);
          return measureDate >= threeMonthsAgo;
        });

        return {
          passed: recentMeasures.length > 0,
          message:
            recentMeasures.length > 0
              ? `${recentMeasures.length} recente meting(en) gevonden`
              : 'Geen metingen van de laatste 3 maanden',
        };
      },
    },
    {
      id: 'meerzorg_care_plan_present',
      name: 'Zorgplan aanwezig',
      description: 'Zorgplan met doelen en interventies moet aanwezig zijn',
      category: 'completeness',
      severity: 'medium',
      check: (ctx) => {
        const hasCareplanNote = ctx.notes.some(
          (n) =>
            n.section.toLowerCase().includes('zorgplan') ||
            n.section.toLowerCase().includes('plan') ||
            n.text.toLowerCase().includes('doel') ||
            n.text.toLowerCase().includes('interventie')
        );

        return {
          passed: hasCareplanNote,
          message: hasCareplanNote
            ? 'Zorgplan gedocumenteerd'
            : 'Geen zorgplan of doelen/interventies gevonden',
        };
      },
    },
  ];

  // Version-specific rules
  if (version === '2026') {
    rules.push({
      id: 'meerzorg_2026_sustainability',
      name: 'Duurzaamheid aanvraag (2026)',
      description: 'Voor 2026: onderbouwing duurzaamheid zorgbehoefte',
      category: 'toetsingskader_rule',
      severity: 'medium',
      check: (ctx) => {
        const hasSustainabilityNote = ctx.notes.some(
          (n) =>
            n.text.toLowerCase().includes('duurza') ||
            n.text.toLowerCase().includes('blijvend') ||
            n.text.toLowerCase().includes('structureel')
        );

        return {
          passed: hasSustainabilityNote,
          message: hasSustainabilityNote
            ? 'Duurzaamheid onderbouwd'
            : '2026 framework vereist onderbouwing van duurzame zorgbehoefte',
        };
      },
    });
  }

  return rules;
}

/**
 * VV8 validation rules (herindicatie)
 */
function getVV8Rules(version: string): CheckRule[] {
  return [
    {
      id: 'vv8_criteria_complete',
      name: 'VV8 criteria compleet',
      description: 'Alle 8 VV8 criteria moeten beoordeeld zijn',
      category: 'completeness',
      severity: 'critical',
      check: (ctx) => {
        const requiredCriteria = [
          'ADL',
          'NACHT_TOEZICHT',
          'GEDRAG',
          'COMMUNICATIE',
          'MOBILITEIT',
          'PSYCHOSOCIAAL',
          'SOCIALE_REDZAAMHEID',
          'ZELFSTANDIGHEID',
        ];

        // Check if all criteria are present in form data
        const missingCriteria = requiredCriteria.filter(
          (c) => ctx.formData[c] === undefined
        );

        return {
          passed: missingCriteria.length === 0,
          message:
            missingCriteria.length === 0
              ? 'Alle VV8 criteria beoordeeld'
              : `Ontbrekende criteria: ${missingCriteria.join(', ')}`,
        };
      },
    },
    {
      id: 'vv8_evidence_present',
      name: 'Bewijs aanwezig',
      description: 'Elke criterium moet onderbouwd zijn met bewijs',
      category: 'toetsingskader_rule',
      severity: 'high',
      check: (ctx) => {
        const hasNotes = ctx.notes.length > 0;
        const hasMeasures = ctx.measures.length > 0;

        return {
          passed: hasNotes || hasMeasures,
          message:
            hasNotes || hasMeasures
              ? 'Bewijs aanwezig in notities en/of metingen'
              : 'Geen bewijs (notities of metingen) gevonden',
        };
      },
    },
  ];
}

/**
 * Toetsingskader general rules
 */
function getToetsingskaderRules(version: string): CheckRule[] {
  return [
    {
      id: 'toets_data_quality',
      name: 'Data kwaliteit',
      description: 'Basiscontrole op data kwaliteit en consistentie',
      category: 'consistency',
      severity: 'low',
      check: (ctx) => {
        const issues: string[] = [];

        // Check for very old dates
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const oldNotes = ctx.notes.filter((n) => {
          const noteDate = new Date(n.date);
          return noteDate < oneYearAgo;
        });

        if (oldNotes.length === ctx.notes.length && ctx.notes.length > 0) {
          issues.push('alle notities zijn ouder dan 1 jaar');
        }

        return {
          passed: issues.length === 0,
          message:
            issues.length === 0
              ? 'Data kwaliteit OK'
              : `Kwaliteitsissues: ${issues.join('; ')}`,
        };
      },
    },
  ];
}

/**
 * Generate user-friendly check summary
 */
export function summarizeCheckResults(
  results: NormativeCheckResult[]
): {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  bySeverity: Record<string, { passed: number; failed: number }>;
  criticalIssues: NormativeCheckResult[];
} {
  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === 'pass').length,
    failed: results.filter((r) => r.status === 'fail').length,
    warnings: results.filter((r) => r.status === 'warning').length,
    bySeverity: {} as Record<string, { passed: number; failed: number }>,
    criticalIssues: results.filter(
      (r) => r.severity === 'critical' && r.status === 'fail'
    ),
  };

  for (const severity of ['low', 'medium', 'high', 'critical']) {
    const severityResults = results.filter((r) => r.severity === severity);
    summary.bySeverity[severity] = {
      passed: severityResults.filter((r) => r.status === 'pass').length,
      failed: severityResults.filter((r) => r.status === 'fail').length,
    };
  }

  return summary;
}

/**
 * Convert check results to database format
 */
export function convertToDbFormat(
  results: NormativeCheckResult[]
): Omit<NormativeCheck, 'id'>[] {
  return results.map((r) => ({
    application_id: r.application_id,
    client_id: r.client_id,
    check_type: r.check_type,
    rule_id: r.rule_id,
    status: r.status,
    message: r.message,
    severity: r.severity,
    checked_at: r.checked_at,
  }));
}
