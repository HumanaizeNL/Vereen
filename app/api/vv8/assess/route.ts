// API endpoint for VV8 criteria assessment
// POST /api/vv8/assess - Assess VV8 criteria for herindicatie

import { NextRequest, NextResponse } from 'next/server';
import {
  getClient,
  getClientNotes,
  getClientMeasures,
  getClientIncidents,
} from '@/lib/db/repository';
import {
  executeNormativeChecks,
  summarizeCheckResults,
} from '@/lib/normative/check-engine';

interface VV8Criterion {
  id: string;
  label: string;
  status: 'voldoet' | 'niet_voldoet' | 'onvoldoende_bewijs' | 'toegenomen_behoefte' | 'verslechterd';
  argument: string;
  evidence: Array<{
    source: string;
    snippet: string;
    date: string;
  }>;
  confidence: number;
  recommendation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, include_ai_assessment = true } = body;

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    // Get client data
    const client = await getClient(client_id);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get dossier data
    const [notes, measures, incidents] = await Promise.all([
      getClientNotes(client_id),
      getClientMeasures(client_id),
      getClientIncidents(client_id),
    ]);

    // Initialize VV8 criteria
    const criteria: VV8Criterion[] = [];

    // 1. ADL (Algemene Dagelijkse Levensverrichtingen)
    const adlCriterion = await assessAdlCriterion(notes, measures, incidents);
    criteria.push(adlCriterion);

    // 2. Nacht toezicht
    const nightCriterion = await assessNightSupervisionCriterion(notes, measures, incidents);
    criteria.push(nightCriterion);

    // 3. Gedragsproblematiek
    const behaviorCriterion = await assessBehaviorCriterion(notes, measures, incidents);
    criteria.push(behaviorCriterion);

    // 4. Communicatie
    const communicationCriterion = await assessCommunicationCriterion(notes, measures);
    criteria.push(communicationCriterion);

    // 5. Mobiliteit
    const mobilityCriterion = await assessMobilityCriterion(notes, measures, incidents);
    criteria.push(mobilityCriterion);

    // 6. Psychosociaal functioneren
    const psychosocialCriterion = await assessPsychosocialCriterion(notes, measures);
    criteria.push(psychosocialCriterion);

    // 7. Sociale redzaamheid
    const socialCriterion = await assessSocialCriterion(notes, measures);
    criteria.push(socialCriterion);

    // 8. Zelfstandigheid
    const independenceCriterion = await assessIndependenceCriterion(notes, measures);
    criteria.push(independenceCriterion);

    // Run VV8 validation checks if requested
    let validationResults = null;
    if (include_ai_assessment) {
      const formData = criteria.reduce((acc, criterion) => {
        acc[criterion.id] = criterion.status;
        return acc;
      }, {} as Record<string, string>);

      const checkResults = await executeNormativeChecks(
        {
          client,
          notes,
          measures,
          incidents,
          formData,
        },
        {
          type: 'vv8',
          version: '2026',
        }
      );

      validationResults = summarizeCheckResults(checkResults);
    }

    // Calculate overall score
    const totalCriteria = criteria.length;
    const metCriteria = criteria.filter(c => c.status === 'voldoet').length;
    const increasedNeed = criteria.filter(c => c.status === 'toegenomen_behoefte').length;
    const deteriorated = criteria.filter(c => c.status === 'verslechterd').length;

    const recommendation = determineRecommendation(
      metCriteria,
      increasedNeed,
      deteriorated,
      totalCriteria
    );

    return NextResponse.json({
      client_id,
      criteria,
      summary: {
        total: totalCriteria,
        voldoet: metCriteria,
        niet_voldoet: criteria.filter(c => c.status === 'niet_voldoet').length,
        onvoldoende_bewijs: criteria.filter(c => c.status === 'onvoldoende_bewijs').length,
        toegenomen_behoefte: increasedNeed,
        verslechterd: deteriorated,
      },
      recommendation,
      validation: validationResults,
    });
  } catch (error) {
    console.error('Error assessing VV8 criteria:', error);
    return NextResponse.json(
      { error: 'Failed to assess VV8 criteria', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function assessAdlCriterion(
  notes: any[],
  measures: any[],
  incidents: any[]
): Promise<VV8Criterion> {
  const adlMeasures = measures.filter(
    m => m.type.toLowerCase().includes('adl') || m.type.toLowerCase().includes('katz')
  );

  const evidence = adlMeasures.slice(0, 3).map(m => ({
    source: `${m.type} meting`,
    snippet: `Score: ${m.score}${m.comment ? ` - ${m.comment}` : ''}`,
    date: m.date,
  }));

  if (adlMeasures.length === 0) {
    return {
      id: 'ADL',
      label: 'ADL (Algemene Dagelijkse Levensverrichtingen)',
      status: 'onvoldoende_bewijs',
      argument: 'Geen ADL metingen gevonden in dossier',
      evidence: [],
      confidence: 0,
      recommendation: 'Voer ADL/Katz assessment uit',
    };
  }

  // Compare most recent measurements
  const sorted = adlMeasures.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latest = sorted[0];
  const latestScore = typeof latest.score === 'number' ? latest.score : parseFloat(latest.score) || 0;

  let status: VV8Criterion['status'] = 'voldoet';
  let argument = `Huidige ADL score: ${latestScore}`;

  if (sorted.length >= 2) {
    const previous = sorted[1];
    const previousScore = typeof previous.score === 'number' ? previous.score : parseFloat(previous.score) || 0;

    if (latestScore < previousScore - 1) {
      status = 'verslechterd';
      argument = `ADL score gedaald van ${previousScore} naar ${latestScore}. Achteruitgang in zelfredzaamheid.`;
    } else if (latestScore < previousScore - 0.5) {
      status = 'toegenomen_behoefte';
      argument = `Lichte achteruitgang in ADL score (van ${previousScore} naar ${latestScore}).`;
    }
  }

  return {
    id: 'ADL',
    label: 'ADL (Algemene Dagelijkse Levensverrichtingen)',
    status,
    argument,
    evidence,
    confidence: 0.9,
  };
}

async function assessNightSupervisionCriterion(
  notes: any[],
  measures: any[],
  incidents: any[]
): Promise<VV8Criterion> {
  const nightNotes = notes.filter(n =>
    n.text.toLowerCase().includes('nacht') ||
    n.text.toLowerCase().includes('slapen') ||
    n.text.toLowerCase().includes('nachtzorg')
  );

  const nightIncidents = incidents.filter(i =>
    i.description.toLowerCase().includes('nacht') ||
    i.type.toLowerCase().includes('nacht')
  );

  const evidence = [
    ...nightNotes.slice(0, 2).map(n => ({
      source: 'Notitie',
      snippet: n.text.substring(0, 150),
      date: n.date,
    })),
    ...nightIncidents.slice(0, 2).map(i => ({
      source: 'Incident',
      snippet: i.description.substring(0, 150),
      date: i.date,
    })),
  ];

  let status: VV8Criterion['status'] = 'voldoet';
  let argument = 'Geen bijzonderheden nachtelijk toezicht';

  if (nightIncidents.length >= 3) {
    status = 'toegenomen_behoefte';
    argument = `${nightIncidents.length} nachtelijke incidenten. Verhoogde toezichtsbehoefte.`;
  } else if (nightNotes.length >= 5) {
    status = 'toegenomen_behoefte';
    argument = 'Frequente documentatie nachtelijke problematiek. Mogelijk verhoogde behoefte.';
  }

  return {
    id: 'NACHT_TOEZICHT',
    label: 'Nacht toezicht',
    status,
    argument,
    evidence,
    confidence: evidence.length > 0 ? 0.7 : 0.3,
  };
}

async function assessBehaviorCriterion(
  notes: any[],
  measures: any[],
  incidents: any[]
): Promise<VV8Criterion> {
  const bpsdMeasures = measures.filter(
    m =>
      m.type.toLowerCase().includes('npi') ||
      m.type.toLowerCase().includes('cmai') ||
      m.type.toLowerCase().includes('bpsd')
  );

  const behaviorIncidents = incidents.filter(
    i =>
      i.type.toLowerCase().includes('agressie') ||
      i.type.toLowerCase().includes('onrust') ||
      i.type.toLowerCase().includes('dwaal')
  );

  const evidence = [
    ...bpsdMeasures.slice(0, 2).map(m => ({
      source: `${m.type} meting`,
      snippet: `Score: ${m.score}`,
      date: m.date,
    })),
    ...behaviorIncidents.slice(0, 2).map(i => ({
      source: 'Incident',
      snippet: i.description.substring(0, 150),
      date: i.date,
    })),
  ];

  let status: VV8Criterion['status'] = 'voldoet';
  let argument = 'Geen significante gedragsproblematiek';

  if (behaviorIncidents.length >= 5) {
    status = 'verslechterd';
    argument = `${behaviorIncidents.length} gedragsincidenten. Significante problematiek.`;
  } else if (behaviorIncidents.length >= 3 || bpsdMeasures.some(m => parseFloat(m.score) > 20)) {
    status = 'toegenomen_behoefte';
    argument = 'Verhoogde gedragsproblematiek vereist extra aandacht.';
  }

  return {
    id: 'GEDRAG',
    label: 'Gedragsproblematiek',
    status,
    argument,
    evidence,
    confidence: evidence.length > 0 ? 0.8 : 0.4,
  };
}

// Simplified assessments for remaining criteria
async function assessCommunicationCriterion(notes: any[], measures: any[]): Promise<VV8Criterion> {
  return {
    id: 'COMMUNICATIE',
    label: 'Communicatie',
    status: 'onvoldoende_bewijs',
    argument: 'Beoordeling communicatieve vaardigheden vereist nadere evaluatie',
    evidence: [],
    confidence: 0.3,
    recommendation: 'Voeg specifieke communicatie assessment toe',
  };
}

async function assessMobilityCriterion(
  notes: any[],
  measures: any[],
  incidents: any[]
): Promise<VV8Criterion> {
  const fallIncidents = incidents.filter(i =>
    i.type.toLowerCase().includes('val') || i.description.toLowerCase().includes('val')
  );

  return {
    id: 'MOBILITEIT',
    label: 'Mobiliteit',
    status: fallIncidents.length >= 3 ? 'verslechterd' : 'voldoet',
    argument:
      fallIncidents.length >= 3
        ? `${fallIncidents.length} valincidenten. Verminderde mobiliteit.`
        : 'Mobiliteit stabiel',
    evidence: fallIncidents.slice(0, 3).map(i => ({
      source: 'Incident',
      snippet: i.description,
      date: i.date,
    })),
    confidence: 0.7,
  };
}

async function assessPsychosocialCriterion(notes: any[], measures: any[]): Promise<VV8Criterion> {
  return {
    id: 'PSYCHOSOCIAAL',
    label: 'Psychosociaal functioneren',
    status: 'onvoldoende_bewijs',
    argument: 'Psychosociaal functioneren vereist nadere evaluatie',
    evidence: [],
    confidence: 0.3,
    recommendation: 'Voeg psychosociale assessment toe',
  };
}

async function assessSocialCriterion(notes: any[], measures: any[]): Promise<VV8Criterion> {
  return {
    id: 'SOCIALE_REDZAAMHEID',
    label: 'Sociale redzaamheid',
    status: 'onvoldoende_bewijs',
    argument: 'Sociale redzaamheid vereist nadere evaluatie',
    evidence: [],
    confidence: 0.3,
    recommendation: 'Voeg sociale redzaamheid assessment toe',
  };
}

async function assessIndependenceCriterion(notes: any[], measures: any[]): Promise<VV8Criterion> {
  return {
    id: 'ZELFSTANDIGHEID',
    label: 'Zelfstandigheid',
    status: 'onvoldoende_bewijs',
    argument: 'Zelfstandigheid vereist nadere evaluatie',
    evidence: [],
    confidence: 0.3,
    recommendation: 'Voeg zelfstandigheid assessment toe',
  };
}

function determineRecommendation(
  met: number,
  increased: number,
  deteriorated: number,
  total: number
): {
  action: 'continue' | 'monitor' | 'reassess' | 'urgent_reassess';
  message: string;
} {
  if (deteriorated >= 2) {
    return {
      action: 'urgent_reassess',
      message: 'Significante achteruitgang op meerdere criteria. Spoedeisende herindicatie geadviseerd.',
    };
  }

  if (deteriorated >= 1 || increased >= 3) {
    return {
      action: 'reassess',
      message: 'Achteruitgang of toegenomen behoefte gedetecteerd. Plan herindicatie binnen 3 maanden.',
    };
  }

  if (increased >= 1) {
    return {
      action: 'monitor',
      message: 'Enkele criteria tonen toegenomen behoefte. Verhoogde monitoring geadviseerd.',
    };
  }

  return {
    action: 'continue',
    message: 'Situatie stabiel. Routinematige monitoring voortzetten.',
  };
}
