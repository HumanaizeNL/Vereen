// Meerzorg-specific field extraction from dossier data
// Identifies and extracts fields needed for Meerzorg applications

import type { Note, Measure, Incident } from '../data/types';

export interface MeerzorgFieldExtraction {
  fieldName: string;
  fieldValue: string;
  sourceType: 'note' | 'measure' | 'incident' | 'document';
  sourceId: string;
  confidence: number; // 0.0 to 1.0
  snippet: string;
}

export interface MeerzorgDossierAnalysis {
  client_id: string;
  extracted_fields: MeerzorgFieldExtraction[];
  care_hours: {
    day: number | null;
    night: number | null;
    one_on_one: number | null;
  };
  adl_dependency: {
    score: number | null;
    category: string | null; // 'zelfstandig', 'beperkt', 'volledig afhankelijk'
    details: string[];
  };
  bpsd_indicators: {
    present: boolean;
    severity: string | null; // 'mild', 'moderate', 'severe'
    types: string[]; // 'agitation', 'aggression', 'wandering', etc.
    frequency: string | null;
  };
  night_care_needs: {
    required: boolean;
    frequency: string | null; // 'incidental', 'regular', 'continuous'
    reasons: string[];
  };
  incident_pattern: {
    count: number;
    high_severity_count: number;
    types: Record<string, number>;
    trend: string | null; // 'increasing', 'stable', 'decreasing'
  };
  specialist_reports: {
    present: boolean;
    types: string[]; // 'psychiater', 'geriatrician', 'neurologist', etc.
    dates: string[];
  };
  interventions: {
    current: string[];
    planned: string[];
  };
}

// Keywords and patterns for Meerzorg field detection
const MEERZORG_PATTERNS = {
  care_hours: {
    day: [
      /dagzorg.*?(\d+)\s*(uur|uren|hours?)/i,
      /overdag.*?(\d+)\s*(uur|uren)/i,
      /dagbesteding.*?(\d+)\s*(uur|uren)/i,
    ],
    night: [
      /nachtzorg.*?(\d+)\s*(uur|uren|hours?)/i,
      /nacht.*?(\d+)\s*(uur|uren)/i,
      /'s nachts.*?(\d+)\s*(uur|uren)/i,
    ],
    one_on_one: [
      /1[-\s]*op[-\s]*1.*?(\d+)\s*(uur|uren)/i,
      /één op één.*?(\d+)\s*(uur|uren)/i,
      /individuele.*?begeleiding.*?(\d+)\s*(uur|uren)/i,
    ],
  },
  adl: {
    keywords: ['adl', 'katz', 'barthel', 'dagelijkse.*leven', 'zelfzorg'],
    categories: {
      zelfstandig: ['zelfstandig', 'independent', 'onafhankelijk'],
      beperkt: ['beperkt', 'gedeeltelijk', 'hulp.*nodig', 'ondersteuning'],
      volledig_afhankelijk: [
        'afhankelijk',
        'volledig.*hulp',
        'totale.*zorg',
        'dependent',
      ],
    },
  },
  bpsd: {
    indicators: [
      'bpsd',
      'gedragsproblematiek',
      'probleemgedrag',
      'agitatie',
      'agressie',
      'dwalen',
      'onrust',
      'apathie',
      'delusions',
      'hallucinaties',
    ],
    severity: {
      mild: ['licht', 'mild', 'beperkt'],
      moderate: ['matig', 'moderate', 'regelmatig'],
      severe: ['ernstig', 'severe', 'frequent', 'voortdurend'],
    },
  },
  night_care: {
    keywords: [
      'nacht.*toezicht',
      'nacht.*zorg',
      'nachtelijke.*hulp',
      'nachtzorg',
      "'s nachts",
    ],
    frequency: {
      incidental: ['incidenteel', 'soms', 'af en toe', 'occasional'],
      regular: ['regelmatig', 'frequent', 'meerdere', 'regular'],
      continuous: [
        'doorlopend',
        'voortdurend',
        'continu',
        'permanent',
        'continuous',
      ],
    },
  },
  incidents: {
    high_severity: ['ernstig', 'hoog', 'critical', 'acute'],
    types: [
      'val',
      'agressie',
      'dwaling',
      'medicatie',
      'onrust',
      'fall',
      'aggression',
      'medication',
    ],
  },
  specialist_reports: {
    types: [
      'psychiater',
      'geriater',
      'neuroloog',
      'specialist.*ouderengeneeskunde',
      'psycholoog',
      'psychiatrist',
      'geriatrician',
      'neurologist',
    ],
  },
  interventions: {
    keywords: [
      'interventie',
      'behandeling',
      'therapie',
      'medicatie',
      'begeleiding',
      'intervention',
      'treatment',
    ],
  },
};

/**
 * Analyze dossier data for Meerzorg-relevant information
 */
export function analyzeDossierForMeerzorg(data: {
  client_id: string;
  notes: Note[];
  measures: Measure[];
  incidents: Incident[];
}): MeerzorgDossierAnalysis {
  const analysis: MeerzorgDossierAnalysis = {
    client_id: data.client_id,
    extracted_fields: [],
    care_hours: {
      day: null,
      night: null,
      one_on_one: null,
    },
    adl_dependency: {
      score: null,
      category: null,
      details: [],
    },
    bpsd_indicators: {
      present: false,
      severity: null,
      types: [],
      frequency: null,
    },
    night_care_needs: {
      required: false,
      frequency: null,
      reasons: [],
    },
    incident_pattern: {
      count: data.incidents.length,
      high_severity_count: 0,
      types: {},
      trend: null,
    },
    specialist_reports: {
      present: false,
      types: [],
      dates: [],
    },
    interventions: {
      current: [],
      planned: [],
    },
  };

  // Extract from measures
  extractFromMeasures(data.measures, analysis);

  // Extract from notes
  extractFromNotes(data.notes, analysis);

  // Analyze incidents
  analyzeIncidents(data.incidents, analysis);

  return analysis;
}

function extractFromMeasures(
  measures: Measure[],
  analysis: MeerzorgDossierAnalysis
): void {
  for (const measure of measures) {
    const typeL = measure.type.toLowerCase();
    const scoreStr = String(measure.score);

    // ADL/Katz scores
    if (typeL.includes('adl') || typeL.includes('katz')) {
      const score = parseFloat(scoreStr);
      if (!isNaN(score)) {
        analysis.adl_dependency.score = score;

        // Categorize based on score (Katz: 0-6, higher = more dependent)
        if (score <= 2) {
          analysis.adl_dependency.category = 'zelfstandig';
        } else if (score <= 4) {
          analysis.adl_dependency.category = 'beperkt';
        } else {
          analysis.adl_dependency.category = 'volledig afhankelijk';
        }

        analysis.extracted_fields.push({
          fieldName: 'adl_score',
          fieldValue: scoreStr,
          sourceType: 'measure',
          sourceId: measure.id,
          confidence: 0.95,
          snippet: `${measure.type}: ${measure.score}`,
        });
      }
    }

    // BPSD/NPI scores
    if (typeL.includes('bpsd') || typeL.includes('npi')) {
      analysis.bpsd_indicators.present = true;
      const score = parseFloat(scoreStr);
      if (!isNaN(score)) {
        analysis.bpsd_indicators.severity =
          score < 10 ? 'mild' : score < 30 ? 'moderate' : 'severe';

        analysis.extracted_fields.push({
          fieldName: 'bpsd_score',
          fieldValue: scoreStr,
          sourceType: 'measure',
          sourceId: measure.id,
          confidence: 0.9,
          snippet: `${measure.type}: ${measure.score}`,
        });
      }
    }
  }
}

function extractFromNotes(
  notes: Note[],
  analysis: MeerzorgDossierAnalysis
): void {
  for (const note of notes) {
    const text = note.text.toLowerCase();

    // Extract care hours
    extractCareHours(note, text, analysis);

    // Detect BPSD indicators
    detectBPSD(note, text, analysis);

    // Detect night care needs
    detectNightCare(note, text, analysis);

    // Detect specialist reports
    detectSpecialistReports(note, text, analysis);

    // Extract interventions
    extractInterventions(note, text, analysis);

    // Extract ADL details
    extractADLDetails(note, text, analysis);
  }
}

function extractCareHours(
  note: Note,
  text: string,
  analysis: MeerzorgDossierAnalysis
): void {
  // Day care hours
  for (const pattern of MEERZORG_PATTERNS.care_hours.day) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const hours = parseInt(match[1], 10);
      if (!analysis.care_hours.day || hours > analysis.care_hours.day) {
        analysis.care_hours.day = hours;
        analysis.extracted_fields.push({
          fieldName: 'day_care_hours',
          fieldValue: String(hours),
          sourceType: 'note',
          sourceId: note.id,
          confidence: 0.8,
          snippet: match[0],
        });
      }
    }
  }

  // Night care hours
  for (const pattern of MEERZORG_PATTERNS.care_hours.night) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const hours = parseInt(match[1], 10);
      if (!analysis.care_hours.night || hours > analysis.care_hours.night) {
        analysis.care_hours.night = hours;
        analysis.extracted_fields.push({
          fieldName: 'night_care_hours',
          fieldValue: String(hours),
          sourceType: 'note',
          sourceId: note.id,
          confidence: 0.8,
          snippet: match[0],
        });
      }
    }
  }

  // 1-on-1 care hours
  for (const pattern of MEERZORG_PATTERNS.care_hours.one_on_one) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const hours = parseInt(match[1], 10);
      if (
        !analysis.care_hours.one_on_one ||
        hours > analysis.care_hours.one_on_one
      ) {
        analysis.care_hours.one_on_one = hours;
        analysis.extracted_fields.push({
          fieldName: 'one_on_one_hours',
          fieldValue: String(hours),
          sourceType: 'note',
          sourceId: note.id,
          confidence: 0.75,
          snippet: match[0],
        });
      }
    }
  }
}

function detectBPSD(
  note: Note,
  text: string,
  analysis: MeerzorgDossierAnalysis
): void {
  for (const indicator of MEERZORG_PATTERNS.bpsd.indicators) {
    if (text.includes(indicator.toLowerCase())) {
      analysis.bpsd_indicators.present = true;

      if (!analysis.bpsd_indicators.types.includes(indicator)) {
        analysis.bpsd_indicators.types.push(indicator);
      }

      // Detect severity
      if (!analysis.bpsd_indicators.severity) {
        for (const [severity, keywords] of Object.entries(
          MEERZORG_PATTERNS.bpsd.severity
        )) {
          if (keywords.some((kw) => new RegExp(kw, 'i').test(text))) {
            analysis.bpsd_indicators.severity = severity as
              | 'mild'
              | 'moderate'
              | 'severe';
            break;
          }
        }
      }

      analysis.extracted_fields.push({
        fieldName: 'bpsd_indicator',
        fieldValue: indicator,
        sourceType: 'note',
        sourceId: note.id,
        confidence: 0.7,
        snippet: note.text.substring(0, 100),
      });
    }
  }
}

function detectNightCare(
  note: Note,
  text: string,
  analysis: MeerzorgDossierAnalysis
): void {
  for (const keyword of MEERZORG_PATTERNS.night_care.keywords) {
    const regex = new RegExp(keyword, 'i');
    if (regex.test(text)) {
      analysis.night_care_needs.required = true;

      // Extract reason from surrounding context
      const sentences = note.text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (regex.test(sentence.toLowerCase())) {
          analysis.night_care_needs.reasons.push(sentence.trim());
        }
      }

      // Detect frequency
      if (!analysis.night_care_needs.frequency) {
        for (const [freq, keywords] of Object.entries(
          MEERZORG_PATTERNS.night_care.frequency
        )) {
          if (keywords.some((kw) => new RegExp(kw, 'i').test(text))) {
            analysis.night_care_needs.frequency = freq;
            break;
          }
        }
      }

      analysis.extracted_fields.push({
        fieldName: 'night_care_needs',
        fieldValue: 'required',
        sourceType: 'note',
        sourceId: note.id,
        confidence: 0.75,
        snippet: note.text.substring(0, 100),
      });
      break;
    }
  }
}

function detectSpecialistReports(
  note: Note,
  text: string,
  analysis: MeerzorgDossierAnalysis
): void {
  for (const type of MEERZORG_PATTERNS.specialist_reports.types) {
    const regex = new RegExp(type, 'i');
    if (regex.test(text)) {
      analysis.specialist_reports.present = true;

      if (!analysis.specialist_reports.types.includes(type)) {
        analysis.specialist_reports.types.push(type);
      }

      if (note.date && !analysis.specialist_reports.dates.includes(note.date)) {
        analysis.specialist_reports.dates.push(note.date);
      }

      analysis.extracted_fields.push({
        fieldName: 'specialist_report',
        fieldValue: type,
        sourceType: 'note',
        sourceId: note.id,
        confidence: 0.8,
        snippet: note.text.substring(0, 150),
      });
    }
  }
}

function extractInterventions(
  note: Note,
  text: string,
  analysis: MeerzorgDossierAnalysis
): void {
  for (const keyword of MEERZORG_PATTERNS.interventions.keywords) {
    const regex = new RegExp(keyword, 'i');
    if (regex.test(text)) {
      // Extract sentences containing intervention keywords
      const sentences = note.text.split(/[.!?]+/);
      for (const sentence of sentences) {
        const sentenceL = sentence.toLowerCase();
        if (regex.test(sentenceL)) {
          // Determine if current or planned
          if (
            sentenceL.includes('gepland') ||
            sentenceL.includes('voorstel') ||
            sentenceL.includes('planned')
          ) {
            analysis.interventions.planned.push(sentence.trim());
          } else {
            analysis.interventions.current.push(sentence.trim());
          }
        }
      }
    }
  }
}

function extractADLDetails(
  note: Note,
  text: string,
  analysis: MeerzorgDossierAnalysis
): void {
  for (const keyword of MEERZORG_PATTERNS.adl.keywords) {
    const regex = new RegExp(keyword, 'i');
    if (regex.test(text)) {
      // Extract ADL-related sentences
      const sentences = note.text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (regex.test(sentence.toLowerCase())) {
          const detail = sentence.trim();
          if (!analysis.adl_dependency.details.includes(detail)) {
            analysis.adl_dependency.details.push(detail);

            // Determine category from text if not set
            if (!analysis.adl_dependency.category) {
              for (const [category, keywords] of Object.entries(
                MEERZORG_PATTERNS.adl.categories
              )) {
                if (
                  keywords.some((kw) => new RegExp(kw, 'i').test(sentence))
                ) {
                  analysis.adl_dependency.category = category.replace(
                    '_',
                    ' '
                  ) as any;
                  break;
                }
              }
            }
          }
        }
      }

      analysis.extracted_fields.push({
        fieldName: 'adl_details',
        fieldValue: note.text.substring(0, 150),
        sourceType: 'note',
        sourceId: note.id,
        confidence: 0.65,
        snippet: note.text.substring(0, 150),
      });
      break;
    }
  }
}

function analyzeIncidents(
  incidents: Incident[],
  analysis: MeerzorgDossierAnalysis
): void {
  // Count by type
  for (const incident of incidents) {
    const type = incident.type.toLowerCase();
    analysis.incident_pattern.types[type] =
      (analysis.incident_pattern.types[type] || 0) + 1;

    // Count high severity
    if (
      MEERZORG_PATTERNS.incidents.high_severity.some((kw) =>
        incident.severity.toLowerCase().includes(kw)
      )
    ) {
      analysis.incident_pattern.high_severity_count++;
    }
  }

  // Detect trend (simple: compare first vs second half)
  if (incidents.length >= 4) {
    const mid = Math.floor(incidents.length / 2);
    const firstHalf = incidents.slice(0, mid);
    const secondHalf = incidents.slice(mid);

    if (secondHalf.length > firstHalf.length * 1.2) {
      analysis.incident_pattern.trend = 'increasing';
    } else if (secondHalf.length < firstHalf.length * 0.8) {
      analysis.incident_pattern.trend = 'decreasing';
    } else {
      analysis.incident_pattern.trend = 'stable';
    }
  }
}

/**
 * Generate field suggestions for form auto-fill
 */
export function generateMeerzorgFormSuggestions(
  analysis: MeerzorgDossierAnalysis
): Record<string, { value: string; confidence: number; sources: string[] }> {
  const suggestions: Record<
    string,
    { value: string; confidence: number; sources: string[] }
  > = {};

  // Care intensity
  if (analysis.care_hours.day !== null) {
    suggestions['dagzorg_uren'] = {
      value: String(analysis.care_hours.day),
      confidence: 0.8,
      sources: analysis.extracted_fields
        .filter((f) => f.fieldName === 'day_care_hours')
        .map((f) => f.sourceId),
    };
  }

  if (analysis.care_hours.night !== null) {
    suggestions['nachtzorg_uren'] = {
      value: String(analysis.care_hours.night),
      confidence: 0.8,
      sources: analysis.extracted_fields
        .filter((f) => f.fieldName === 'night_care_hours')
        .map((f) => f.sourceId),
    };
  }

  if (analysis.care_hours.one_on_one !== null) {
    suggestions['een_op_een_uren'] = {
      value: String(analysis.care_hours.one_on_one),
      confidence: 0.75,
      sources: analysis.extracted_fields
        .filter((f) => f.fieldName === 'one_on_one_hours')
        .map((f) => f.sourceId),
    };
  }

  // ADL dependency
  if (analysis.adl_dependency.score !== null) {
    suggestions['adl_score'] = {
      value: String(analysis.adl_dependency.score),
      confidence: 0.9,
      sources: analysis.extracted_fields
        .filter((f) => f.fieldName === 'adl_score')
        .map((f) => f.sourceId),
    };
  }

  if (analysis.adl_dependency.category) {
    suggestions['adl_categorie'] = {
      value: analysis.adl_dependency.category,
      confidence: 0.85,
      sources: ['calculated'],
    };
  }

  // BPSD
  if (analysis.bpsd_indicators.present) {
    suggestions['gedragsproblematiek'] = {
      value: 'ja',
      confidence: 0.8,
      sources: analysis.extracted_fields
        .filter((f) => f.fieldName === 'bpsd_indicator')
        .map((f) => f.sourceId),
    };

    if (analysis.bpsd_indicators.severity) {
      suggestions['gedragsproblematiek_ernst'] = {
        value: analysis.bpsd_indicators.severity,
        confidence: 0.75,
        sources: ['analyzed'],
      };
    }
  }

  // Night care
  if (analysis.night_care_needs.required) {
    suggestions['nachtelijke_zorg'] = {
      value: 'ja',
      confidence: 0.8,
      sources: analysis.extracted_fields
        .filter((f) => f.fieldName === 'night_care_needs')
        .map((f) => f.sourceId),
    };

    if (analysis.night_care_needs.frequency) {
      suggestions['nachtelijke_zorg_frequentie'] = {
        value: analysis.night_care_needs.frequency,
        confidence: 0.7,
        sources: ['analyzed'],
      };
    }
  }

  // Incident pattern
  if (analysis.incident_pattern.count > 0) {
    suggestions['aantal_incidenten'] = {
      value: String(analysis.incident_pattern.count),
      confidence: 1.0,
      sources: ['counted'],
    };
  }

  if (analysis.incident_pattern.high_severity_count > 0) {
    suggestions['ernstige_incidenten'] = {
      value: String(analysis.incident_pattern.high_severity_count),
      confidence: 1.0,
      sources: ['counted'],
    };
  }

  // Specialist reports
  if (analysis.specialist_reports.present) {
    suggestions['specialist_rapportage'] = {
      value: 'ja',
      confidence: 0.85,
      sources: analysis.extracted_fields
        .filter((f) => f.fieldName === 'specialist_report')
        .map((f) => f.sourceId),
    };

    suggestions['specialist_types'] = {
      value: analysis.specialist_reports.types.join(', '),
      confidence: 0.8,
      sources: ['aggregated'],
    };
  }

  return suggestions;
}
