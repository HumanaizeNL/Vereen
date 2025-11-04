// AI-powered criteria evaluation for UC2

import { searchClient } from '../search/flexsearch';
import { CriterionResult } from '../schemas/responses';
import { MOCK_MODE } from './client';
import { evaluateCriterionWithAI } from './openai-client';

// VV8 2026 criteria definitions
export const VV8_CRITERIA_2026 = [
  {
    id: 'ADL',
    label: 'ADL-afhankelijkheid',
    description:
      'Beoordeel de mate van ADL-afhankelijkheid op basis van Katz-scores en observaties',
  },
  {
    id: 'NACHT_TOEZICHT',
    label: 'Nachtelijk toezicht',
    description:
      'Beoordeel de behoefte aan nachtz org op basis van nachtelijke onrust, valgevaar en dwalen',
  },
  {
    id: 'GEDRAG',
    label: 'Gedragsproblematiek',
    description:
      'Beoordeel gedragsproblemen zoals agressie, onrust, of onbegrepen gedrag',
  },
  {
    id: 'COMMUNICATIE',
    label: 'Communicatie',
    description: 'Beoordeel communicatieve beperkingen en ondersteuningsbehoefte',
  },
  {
    id: 'MOBILITEIT',
    label: 'Mobiliteit',
    description: 'Beoordeel mobiliteit, valrisico en ondersteuning bij verplaatsing',
  },
  {
    id: 'PSYCHISCH',
    label: 'Psychisch welbevinden',
    description: 'Beoordeel psychische klachten, depressie, angst en welbevinden',
  },
  {
    id: 'SOCIAAL',
    label: 'Sociaal functioneren',
    description: 'Beoordeel sociale contacten, participatie en isolatie',
  },
  {
    id: 'ZELFSTANDIGHEID',
    label: 'Zelfstandigheid',
    description: 'Beoordeel mate van zelfstandigheid in dagelijkse activiteiten',
  },
];

export async function evaluateCriterion(
  client_id: string,
  criterion: { id: string; label: string; description: string },
  period: { from: string; to: string },
  max_evidence: number
): Promise<CriterionResult> {
  if (MOCK_MODE) {
    return evaluateCriterionMock(criterion, max_evidence);
  }

  // Search for relevant evidence using FlexSearch
  const searchQuery = generateSearchQuery(criterion);
  const hits = searchClient(client_id, searchQuery, max_evidence, {
    date_from: period.from,
    date_to: period.to,
  });

  const evidence = hits.map((hit) => ({
    source: hit.source,
    row: hit.row,
    snippet: hit.snippet,
  }));

  // Use AI to evaluate the criterion based on evidence
  try {
    const aiEvaluation = await evaluateCriterionWithAI({
      criterion,
      evidence,
      clientContext: `Client ID: ${client_id}, Period: ${period.from} to ${period.to}`,
    });

    return {
      id: criterion.id,
      status: aiEvaluation.status,
      argument: aiEvaluation.argument,
      evidence,
      confidence: aiEvaluation.confidence,
      uncertainty:
        evidence.length === 0 ? 'Geen evidence gevonden in de periode' : undefined,
    };
  } catch (error) {
    console.error('AI evaluation failed, falling back to heuristics:', error);

    // Fallback to heuristic-based evaluation if AI fails
    const status = determineStatus(criterion.id, hits);
    const argument = generateArgument(criterion, hits);
    const confidence = calculateConfidence(hits);

    return {
      id: criterion.id,
      status,
      argument,
      evidence,
      confidence,
      uncertainty: evidence.length === 0
        ? 'Geen evidence gevonden in de periode'
        : 'AI-evaluatie niet beschikbaar, heuristiek gebruikt',
    };
  }
}

function generateSearchQuery(criterion: { id: string; label: string }): string {
  const queries: Record<string, string> = {
    ADL: 'ADL Katz wassen aankleden eten',
    NACHT_TOEZICHT: 'nacht toezicht slapen dwalen onrust',
    GEDRAG: 'gedrag agressie onrust schreeuwen',
    COMMUNICATIE: 'communicatie praten begrijpen taal',
    MOBILITEIT: 'mobiliteit lopen vallen rollator rolstoel',
    PSYCHISCH: 'depressie angst somber psychisch stemming',
    SOCIAAL: 'sociaal contact bezoek isolatie eenzaam',
    ZELFSTANDIGHEID: 'zelfstandig hulp ondersteuning begeleiding',
  };

  return queries[criterion.id] || criterion.label;
}

function determineStatus(
  criterionId: string,
  hits: any[]
): CriterionResult['status'] {
  if (hits.length === 0) {
    return 'onvoldoende_bewijs';
  }

  // Simple heuristic: if we find evidence, assume increased need
  // In real implementation, this would use AI to analyze the content
  const negativeKeywords = ['afgenomen', 'verbeterd', 'stabie l'];
  const positiveKeywords = ['toegenomen', 'verslechterd', 'meer', 'vaker'];

  const text = hits.map((h) => h.snippet.toLowerCase()).join(' ');

  const hasPositive = positiveKeywords.some((kw) => text.includes(kw));
  const hasNegative = negativeKeywords.some((kw) => text.includes(kw));

  if (hasPositive && !hasNegative) {
    return 'toegenomen_behoefte';
  } else if (hasNegative && !hasPositive) {
    return 'voldoet';
  }

  return 'verslechterd'; // Default for evidence found
}

function generateArgument(criterion: any, hits: any[]): string {
  if (hits.length === 0) {
    return `Geen recente observaties gevonden voor ${criterion.label}.`;
  }

  const snippets = hits.slice(0, 2).map((h) => h.snippet);

  return `Op basis van recente observaties: ${snippets.join('. ')}. Dit wijst op een verhoogde zorgbehoefte op dit gebied.`;
}

function calculateConfidence(hits: any[]): number {
  if (hits.length === 0) return 0.0;
  if (hits.length === 1) return 0.5;
  if (hits.length >= 3) return 0.75;
  return 0.65;
}

// Mock implementation for development
function evaluateCriterionMock(
  criterion: { id: string; label: string },
  max_evidence: number
): CriterionResult {
  const mockEvidence = [
    {
      source: 'notes.csv',
      row: 142,
      snippet: 'Cliënt heeft ondersteuning nodig bij ' + criterion.label.toLowerCase(),
    },
    {
      source: 'measures.csv',
      row: 55,
      snippet: `Metingen tonen afname in ${criterion.label.toLowerCase()}`,
    },
  ].slice(0, max_evidence);

  return {
    id: criterion.id,
    status: 'verslechterd',
    argument: `Mock evaluatie: ${criterion.label} toont een verslechtering op basis van recente observaties en metingen.`,
    evidence: mockEvidence,
    confidence: 0.72,
    uncertainty: '⚠️ MOCK MODE - gebruik echte Azure OpenAI voor productie',
  };
}
