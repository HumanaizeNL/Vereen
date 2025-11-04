import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import {
  getClient,
  getClientNotes,
  getClientMeasures,
  getClientIncidents,
  addAuditEvent,
} from '@/lib/data/stores';
import { MOCK_MODE } from '@/lib/ai/client';
import { analyzeClientTrendsWithAI } from '@/lib/ai/openai-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/uc2/analyze-client
 * Analyzes client data to support herindicatie decisions
 *
 * Request body:
 * {
 *   client_id: string,
 *   period?: { from: string, to: string },
 *   include_trends?: boolean,
 *   include_patterns?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, period, include_trends = true, include_patterns = true } = body;

    if (!client_id) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'client_id is required',
          },
        },
        { status: 400 }
      );
    }

    // Get client data
    const client = await getClient(client_id);
    if (!client) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Client ${client_id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Get all client data
    const notes = await getClientNotes(client_id);
    const measures = await getClientMeasures(client_id);
    const incidents = await getClientIncidents(client_id);

    // Filter by period if specified
    const filteredNotes = period
      ? notes.filter(
          (n) => n.date >= period.from && n.date <= period.to
        )
      : notes;

    const filteredMeasures = period
      ? measures.filter(
          (m) => m.date >= period.from && m.date <= period.to
        )
      : measures;

    const filteredIncidents = period
      ? incidents.filter(
          (i) => i.date >= period.from && i.date <= period.to
        )
      : incidents;

    // Perform analysis
    const analysis: any = {
      client_id,
      client_name: client.name,
      current_profile: client.wlz_profile,
      provider: client.provider,
      data_summary: {
        notes_count: filteredNotes.length,
        measures_count: filteredMeasures.length,
        incidents_count: filteredIncidents.length,
        period: period || { from: 'all_time', to: 'present' },
      },
    };

    // Try AI-powered analysis first
    if (!MOCK_MODE && filteredNotes.length > 0) {
      try {
        const aiAnalysis = await analyzeClientTrendsWithAI({
          clientName: client.name,
          notes: filteredNotes.map((n) => ({ date: n.date, section: n.section, text: n.text })),
          measures: filteredMeasures.map((m) => ({ date: m.date, type: m.type, score: String(m.score) })),
          incidents: filteredIncidents.map((i) => ({ date: i.date, type: i.type, severity: i.severity, description: i.description })),
        });

        analysis.ai_analysis = {
          summary: aiAnalysis.summary,
          trends: aiAnalysis.trends,
          recommendation: aiAnalysis.recommendation,
          complexity_level: aiAnalysis.complexity,
        };

        // Still generate the heuristic analysis for comparison
        if (include_trends && filteredMeasures.length > 0) {
          analysis.trends_heuristic = analyzeTrends(filteredMeasures);
        }

        if (include_patterns) {
          analysis.patterns_heuristic = analyzePatterns(filteredNotes, filteredIncidents);
        }
      } catch (error) {
        console.error('AI analysis failed, using heuristics:', error);
        // Fall through to heuristic analysis
      }
    }

    // Fallback to or supplement with heuristic analysis
    if (!analysis.ai_analysis) {
      // Analyze trends
      if (include_trends && filteredMeasures.length > 0) {
        analysis.trends = analyzeTrends(filteredMeasures);
      }

      // Analyze patterns
      if (include_patterns) {
        analysis.patterns = analyzePatterns(filteredNotes, filteredIncidents);
      }

      // Generate care complexity assessment
      analysis.complexity_assessment = assessCareComplexity(
        filteredNotes,
        filteredMeasures,
        filteredIncidents
      );

      // Generate herindicatie recommendation
      analysis.herindicatie_recommendation = generateRecommendation(
        client,
        analysis.trends,
        analysis.patterns,
        analysis.complexity_assessment
      );
    }

    // Add audit event
    addAuditEvent({
      id: nanoid(),
      ts: new Date().toISOString(),
      actor: 'ai',
      client_id,
      action: 'analyze-client',
      meta: {
        notes_analyzed: filteredNotes.length,
        measures_analyzed: filteredMeasures.length,
        incidents_analyzed: filteredIncidents.length,
        period,
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analyze client error:', error);
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

/**
 * Analyze trends in measures over time
 */
function analyzeTrends(measures: any[]) {
  const trends: any = {
    katz_adl: null,
    cognitive: null,
    behavioral: null,
  };

  // Group measures by type
  const katzMeasures = measures.filter((m) => m.type === 'Katz-ADL').sort((a, b) => a.date.localeCompare(b.date));
  const mmseMeasures = measures.filter((m) => m.type === 'MMSE').sort((a, b) => a.date.localeCompare(b.date));
  const npiMeasures = measures.filter((m) => m.type === 'NPI').sort((a, b) => a.date.localeCompare(b.date));

  // Analyze Katz-ADL trend
  if (katzMeasures.length >= 2) {
    const first = katzMeasures[0];
    const last = katzMeasures[katzMeasures.length - 1];
    const scoreMap: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };

    const firstScore = scoreMap[String(first.score)] || 0;
    const lastScore = scoreMap[String(last.score)] || 0;

    trends.katz_adl = {
      direction: lastScore > firstScore ? 'verslechterd' : lastScore < firstScore ? 'verbeterd' : 'stabiel',
      first_value: first.score,
      last_value: last.score,
      first_date: first.date,
      last_date: last.date,
      change_magnitude: lastScore - firstScore,
    };
  }

  // Analyze cognitive trend (MMSE)
  if (mmseMeasures.length >= 2) {
    const first = mmseMeasures[0];
    const last = mmseMeasures[mmseMeasures.length - 1];
    const change = Number(last.score) - Number(first.score);

    trends.cognitive = {
      direction: change < 0 ? 'verslechterd' : change > 0 ? 'verbeterd' : 'stabiel',
      first_value: first.score,
      last_value: last.score,
      first_date: first.date,
      last_date: last.date,
      change_points: change,
    };
  }

  // Analyze behavioral trend (NPI)
  if (npiMeasures.length >= 2) {
    const first = npiMeasures[0];
    const last = npiMeasures[npiMeasures.length - 1];
    const change = Number(last.score) - Number(first.score);

    trends.behavioral = {
      direction: change > 0 ? 'verslechterd' : change < 0 ? 'verbeterd' : 'stabiel',
      first_value: first.score,
      last_value: last.score,
      first_date: first.date,
      last_date: last.date,
      change_points: change,
    };
  }

  return trends;
}

/**
 * Analyze patterns in notes and incidents
 */
function analyzePatterns(notes: any[], incidents: any[]) {
  const patterns: any = {
    key_themes: [],
    incident_frequency: null,
    critical_issues: [],
  };

  // Analyze note themes
  const themes: Record<string, number> = {};
  notes.forEach((note) => {
    const section = note.section.toLowerCase();
    themes[section] = (themes[section] || 0) + 1;
  });

  patterns.key_themes = Object.entries(themes)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Analyze incident frequency
  if (incidents.length > 0) {
    const incidentsByType: Record<string, number> = {};
    const incidentsBySeverity: Record<string, number> = {};

    incidents.forEach((incident) => {
      incidentsByType[incident.type] = (incidentsByType[incident.type] || 0) + 1;
      incidentsBySeverity[incident.severity] = (incidentsBySeverity[incident.severity] || 0) + 1;
    });

    patterns.incident_frequency = {
      total_count: incidents.length,
      by_type: incidentsByType,
      by_severity: incidentsBySeverity,
    };

    // Identify critical issues (high severity incidents)
    const criticalIncidents = incidents.filter((i) => i.severity === 'Hoog');
    patterns.critical_issues = criticalIncidents.map((i) => ({
      date: i.date,
      type: i.type,
      description: i.description,
    }));
  }

  return patterns;
}

/**
 * Assess overall care complexity
 */
function assessCareComplexity(notes: any[], measures: any[], incidents: any[]) {
  const assessment: any = {
    complexity_level: 'onbekend',
    factors: [],
    meerzorg_indicators: [],
  };

  // Check for ADL dependency
  const latestKatz = measures
    .filter((m) => m.type === 'Katz-ADL')
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  if (latestKatz && ['E', 'F'].includes(String(latestKatz.score))) {
    assessment.factors.push('Hoge ADL-afhankelijkheid');
    assessment.meerzorg_indicators.push('Volledig afhankelijk van zorg bij ADL taken');
  }

  // Check for cognitive decline
  const mmseScores = measures.filter((m) => m.type === 'MMSE');
  if (mmseScores.length > 0) {
    const latestMMSE = mmseScores.sort((a, b) => b.date.localeCompare(a.date))[0];
    if (Number(latestMMSE.score) < 20) {
      assessment.factors.push('Matige tot ernstige cognitieve achteruitgang');
      assessment.meerzorg_indicators.push('Cognitieve achteruitgang beïnvloedt zorgbehoefte');
    }
  }

  // Check for behavioral problems
  const behaviorNotes = notes.filter((n) =>
    n.section.toLowerCase().includes('gedrag') ||
    n.section.toLowerCase().includes('psyche')
  );

  if (behaviorNotes.length > 3) {
    assessment.factors.push('Significante gedragsproblematiek');
    assessment.meerzorg_indicators.push('Frequent gedocumenteerde gedragsproblemen');
  }

  // Check for high severity incidents
  const highSeverityIncidents = incidents.filter((i) => i.severity === 'Hoog');
  if (highSeverityIncidents.length > 0) {
    assessment.factors.push('Meerdere ernstige incidenten');
    assessment.meerzorg_indicators.push(`${highSeverityIncidents.length} incident(en) met hoge ernst`);
  }

  // Check for frequent interventions
  const medicationNotes = notes.filter((n) =>
    n.section.toLowerCase().includes('medicatie') ||
    n.text.toLowerCase().includes('medicatie')
  );

  if (medicationNotes.length > 2) {
    assessment.factors.push('Frequente medicatie aanpassingen');
    assessment.meerzorg_indicators.push('Meerdere medicatie wijzigingen noodzakelijk');
  }

  // Determine complexity level
  const factorCount = assessment.factors.length;
  if (factorCount >= 4) {
    assessment.complexity_level = 'zeer_hoog';
  } else if (factorCount >= 3) {
    assessment.complexity_level = 'hoog';
  } else if (factorCount >= 2) {
    assessment.complexity_level = 'matig';
  } else if (factorCount >= 1) {
    assessment.complexity_level = 'laag';
  }

  return assessment;
}

/**
 * Generate herindicatie recommendation
 */
function generateRecommendation(
  client: any,
  trends: any,
  patterns: any,
  complexity: any
) {
  const recommendation: any = {
    advised_action: 'behouden',
    confidence: 0.5,
    rationale: [],
    suggested_profile: client.wlz_profile,
  };

  let pointsForUpgrade = 0;
  let pointsForDowngrade = 0;

  // Check trends
  if (trends?.katz_adl?.direction === 'verslechterd') {
    pointsForUpgrade += 2;
    recommendation.rationale.push('ADL-afhankelijkheid is verslechterd');
  } else if (trends?.katz_adl?.direction === 'verbeterd') {
    pointsForDowngrade += 1;
  }

  if (trends?.cognitive?.direction === 'verslechterd') {
    pointsForUpgrade += 2;
    recommendation.rationale.push('Cognitieve functie is achteruitgegaan');
  }

  if (trends?.behavioral?.direction === 'verslechterd') {
    pointsForUpgrade += 2;
    recommendation.rationale.push('Gedragsproblemen zijn toegenomen');
  }

  // Check complexity
  if (complexity.complexity_level === 'zeer_hoog') {
    pointsForUpgrade += 3;
    recommendation.rationale.push('Zeer hoge zorgcomplexiteit geconstateerd');
  } else if (complexity.complexity_level === 'hoog') {
    pointsForUpgrade += 2;
    recommendation.rationale.push('Hoge zorgcomplexiteit geconstateerd');
  }

  // Check critical incidents
  if (patterns?.critical_issues?.length > 0) {
    pointsForUpgrade += patterns.critical_issues.length;
    recommendation.rationale.push(
      `${patterns.critical_issues.length} incident(en) met hoge ernst`
    );
  }

  // Determine recommendation
  if (pointsForUpgrade >= 5) {
    recommendation.advised_action = 'herindicatie_naar_zwaarder_profiel';
    recommendation.confidence = Math.min(0.85, 0.6 + pointsForUpgrade * 0.05);

    if (client.wlz_profile === 'VV7') {
      recommendation.suggested_profile = 'VV8';
      recommendation.rationale.push('Overweeg herindicatie naar VV8 gezien toegenomen zorgbehoefte');
    } else if (client.wlz_profile === 'VV6') {
      recommendation.suggested_profile = 'VV7';
      recommendation.rationale.push('Overweeg herindicatie naar VV7 gezien toegenomen zorgbehoefte');
    }
  } else if (pointsForUpgrade >= 3) {
    recommendation.advised_action = 'meerzorg_aanvragen';
    recommendation.confidence = 0.7;
    recommendation.rationale.push('Overweeg aanvraag meerzorg binnen huidig profiel');
  } else if (pointsForDowngrade >= 3) {
    recommendation.advised_action = 'herindicatie_naar_lichter_profiel';
    recommendation.confidence = 0.65;
    recommendation.rationale.push('Mogelijk kan afbouw naar lichter profiel worden overwogen');
  } else {
    recommendation.advised_action = 'behouden';
    recommendation.confidence = 0.6;
    recommendation.rationale.push('Huidige profiel lijkt passend bij de zorgbehoefte');
  }

  return recommendation;
}
