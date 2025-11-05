// UC1-specific AI services for data management
// Provides intelligent features for data extraction, summarization, validation, and search

import { chatCompletion } from './openai-client';
import type { Client, Note, Measure, Incident } from '../data/types';

/**
 * Extract structured client data from unstructured text (PDF/DOCX content)
 * Use case: When user uploads a document, automatically parse and suggest client data
 */
export async function extractClientDataFromText(params: {
  text: string;
  filename?: string;
}): Promise<{
  suggestedClient?: Partial<Client>;
  suggestedNotes?: Array<Partial<Note>>;
  suggestedMeasures?: Array<Partial<Measure>>;
  suggestedIncidents?: Array<Partial<Incident>>;
  confidence: number;
  warnings: string[];
}> {
  const systemPrompt = `Je bent een expert in het extraheren van gestructureerde zorggegevens uit medische documenten.
Extract de volgende informatie uit de tekst:
- Cliënt basisgegevens (naam, geboortedatum, WLZ profiel, zorgaanbieder)
- Zorgnotities (datum, auteur, sectie, tekst)
- Metingen (datum, type zoals Katz-ADL/MMSE/GAF/NPI, score)
- Incidenten (datum, type, ernst, beschrijving)

Sectie types voor notities: "ADL", "Psyche", "Cognitie", "Gedrag", "Medicatie", "Mobiliteit", "Sociaal", "Evaluatie meerzorg"
WLZ profielen: VV1, VV2, VV3, VV4, VV5, VV6, VV7, VV8, VV9, VV10
Incident ernst: "Laag", "Matig", "Hoog"

Geef je antwoord in JSON formaat:
{
  "client": { "name": "...", "dob": "YYYY-MM-DD", "wlz_profile": "VV7", "provider": "..." },
  "notes": [{ "date": "YYYY-MM-DD", "author": "...", "section": "...", "text": "..." }],
  "measures": [{ "date": "YYYY-MM-DD", "type": "Katz-ADL", "score": "F", "comment": "..." }],
  "incidents": [{ "date": "YYYY-MM-DD", "type": "...", "severity": "Hoog", "description": "..." }],
  "confidence": 0.0-1.0,
  "warnings": ["waarschuwing 1", "waarschuwing 2"]
}`;

  const userPrompt = `${params.filename ? `Bestandsnaam: ${params.filename}\n\n` : ''}Extract gestructureerde zorggegevens uit de volgende tekst:\n\n${params.text.substring(0, 8000)}`;

  try {
    const result = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 3000,
      responseFormat: { type: 'json_object' },
    });

    if (!result) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(result);

    return {
      suggestedClient: parsed.client,
      suggestedNotes: parsed.notes || [],
      suggestedMeasures: parsed.measures || [],
      suggestedIncidents: parsed.incidents || [],
      confidence: parsed.confidence || 0.5,
      warnings: parsed.warnings || [],
    };
  } catch (error) {
    console.error('Error extracting client data:', error);
    return {
      confidence: 0,
      warnings: ['Automatische data-extractie mislukt. Handmatige invoer vereist.'],
    };
  }
}

/**
 * Generate a concise summary of multiple notes
 * Use case: Summarize lengthy note history for quick overview
 */
export async function summarizeNotes(params: {
  notes: Note[];
  focus?: 'all' | 'recent' | 'behavioral' | 'medical' | 'adl';
  maxLength?: 'short' | 'medium' | 'long';
}): Promise<{
  summary: string;
  keyPoints: string[];
  timeline: Array<{ date: string; event: string }>;
}> {
  const focusDescriptions = {
    all: 'algemene ontwikkeling',
    recent: 'recente ontwikkelingen (laatste 3 maanden)',
    behavioral: 'gedrag en psyche',
    medical: 'medische/medicatie ontwikkelingen',
    adl: 'ADL en zelfredzaamheid',
  };

  const lengthGuidelines = {
    short: '3-4 zinnen',
    medium: '1 paragraaf (6-8 zinnen)',
    long: '2-3 paragrafen',
  };

  const systemPrompt = `Je bent een expert in het samenv atten van zorgnota's.
Maak een duidelijke samenvatting gefocust op: ${focusDescriptions[params.focus || 'all']}.
Lengte: ${lengthGuidelines[params.maxLength || 'medium']}.

Geef je antwoord in JSON formaat:
{
  "summary": "Samenvatting in vloeiende tekst",
  "keyPoints": ["kernpunt 1", "kernpunt 2", "kernpunt 3"],
  "timeline": [{ "date": "YYYY-MM-DD", "event": "belangrijke gebeurtenis" }]
}`;

  const notesText = params.notes
    .slice(0, 30) // Limit to most recent 30 notes
    .map((n) => `${n.date} [${n.section}] door ${n.author}:\n${n.text}`)
    .join('\n\n');

  try {
    const result = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Vat de volgende notities samen:\n\n${notesText}` },
      ],
      temperature: 0.5,
      maxTokens: 1500,
      responseFormat: { type: 'json_object' },
    });

    if (!result) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(result);
    return {
      summary: parsed.summary || 'Geen samenvatting beschikbaar',
      keyPoints: parsed.keyPoints || [],
      timeline: parsed.timeline || [],
    };
  } catch (error) {
    console.error('Error summarizing notes:', error);
    return {
      summary: 'Automatische samenvatting niet beschikbaar',
      keyPoints: [],
      timeline: [],
    };
  }
}

/**
 * Extract evidence snippets for UC2 herindicatie criteria
 * Use case: Automatically suggest evidence links from notes for UC2 analysis
 */
export async function extractEvidenceForCriteria(params: {
  clientId: string;
  notes: Note[];
  measures: Measure[];
  incidents: Incident[];
  targetCriteria: string[]; // e.g., ['ADL_dependency', 'behavioral_problems', 'medication_stability']
}): Promise<
  Array<{
    criterionId: string;
    suggestions: Array<{
      source: string; // e.g., 'note:abc123' or 'measure:def456'
      snippet: string;
      relevance: number; // 0-1
      reasoning: string;
    }>;
  }>
> {
  const systemPrompt = `Je bent een expert in het identificeren van evidence voor WLZ herindicatie criteria.
Voor elk gegeven criterium, identificeer de meest relevante evidence snippets uit notities, metingen en incidenten.

Geef je antwoord in JSON formaat:
{
  "evidence": [
    {
      "criterionId": "ADL_dependency",
      "suggestions": [
        {
          "source": "note:ID of measure:ID of incident:ID",
          "snippet": "relevant text fragment (max 200 karakters)",
          "relevance": 0.0-1.0,
          "reasoning": "waarom dit relevant is"
        }
      ]
    }
  ]
}`;

  const contextText = `
NOTITIES (${params.notes.length} items):
${params.notes.slice(0, 20).map((n) => `[${n.id}] ${n.date} [${n.section}]: ${n.text.substring(0, 150)}...`).join('\n')}

METINGEN (${params.measures.length} items):
${params.measures.slice(0, 20).map((m) => `[${m.id}] ${m.date}: ${m.type} = ${m.score}${m.comment ? ` (${m.comment})` : ''}`).join('\n')}

INCIDENTEN (${params.incidents.length} items):
${params.incidents.slice(0, 20).map((i) => `[${i.id}] ${i.date} [${i.severity}] ${i.type}: ${i.description.substring(0, 100)}...`).join('\n')}
`;

  try {
    const result = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Identificeer evidence voor criteria: ${params.targetCriteria.join(', ')}\n\n${contextText}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2500,
      responseFormat: { type: 'json_object' },
    });

    if (!result) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(result);
    return parsed.evidence || [];
  } catch (error) {
    console.error('Error extracting evidence:', error);
    return [];
  }
}

/**
 * Validate data quality and completeness
 * Use case: Check uploaded/imported data for issues before saving
 */
export async function validateDataQuality(params: {
  client?: Partial<Client>;
  notes?: Note[];
  measures?: Measure[];
  incidents?: Incident[];
}): Promise<{
  isValid: boolean;
  score: number; // 0-100
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    field: string;
    message: string;
    suggestion?: string;
  }>;
  recommendations: string[];
}> {
  const systemPrompt = `Je bent een expert in data kwaliteit validatie voor zorgsystemen.
Controleer de data op:
1. Verplichte velden (naam, geboortedatum, WLZ profiel voor cliënt)
2. Data consistentie (datum formaten, geldige WLZ profielen)
3. Volledigheid (zijn er genoeg notities/metingen voor een goede analyse?)
4. Logische checks (bijv. zijn ADL scores consistent met beschrijvingen?)

Geef je antwoord in JSON formaat:
{
  "isValid": true/false,
  "score": 0-100,
  "issues": [
    {
      "severity": "critical|warning|info",
      "field": "veldnaam",
      "message": "beschrijving van probleem",
      "suggestion": "hoe op te lossen"
    }
  ],
  "recommendations": ["aanbeveling 1", "aanbeveling 2"]
}`;

  const dataDescription = `
CLIËNT DATA:
${JSON.stringify(params.client, null, 2)}

AANTAL NOTITIES: ${params.notes?.length || 0}
AANTAL METINGEN: ${params.measures?.length || 0}
AANTAL INCIDENTEN: ${params.incidents?.length || 0}

${params.notes && params.notes.length > 0 ? `VOORBEELD NOTITIE:\n${JSON.stringify(params.notes[0], null, 2)}` : ''}
${params.measures && params.measures.length > 0 ? `VOORBEELD METING:\n${JSON.stringify(params.measures[0], null, 2)}` : ''}
`;

  try {
    const result = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Valideer de volgende zorgdata:\n\n${dataDescription}` },
      ],
      temperature: 0.2,
      maxTokens: 1500,
      responseFormat: { type: 'json_object' },
    });

    if (!result) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(result);
    return {
      isValid: parsed.isValid ?? true,
      score: parsed.score ?? 75,
      issues: parsed.issues || [],
      recommendations: parsed.recommendations || [],
    };
  } catch (error) {
    console.error('Error validating data quality:', error);
    return {
      isValid: true,
      score: 50,
      issues: [
        {
          severity: 'warning',
          field: 'general',
          message: 'Automatische validatie niet beschikbaar. Controleer data handmatig.',
        },
      ],
      recommendations: [],
    };
  }
}

/**
 * Natural language search across client data
 * Use case: User asks "find clients with anxiety and ADL score F"
 */
export async function naturalLanguageSearch(params: {
  query: string;
  availableClients: Client[];
  includeDetails?: boolean;
}): Promise<{
  matchedClientIds: string[];
  explanation: string;
  searchCriteria: {
    conditions?: string[];
    wlzProfiles?: string[];
    providers?: string[];
    ageRange?: { min?: number; max?: number };
  };
}> {
  const systemPrompt = `Je bent een expert in het interpreteren van natuurlijke taal queries voor zorgdata.
Vertaal de gebruikersvraag naar gestructureerde zoek criteria.

Beschikbare cliënten:
${params.availableClients.map((c) => `- ${c.client_id}: ${c.name}, ${c.wlz_profile}, ${c.provider}, geboren ${c.dob}`).join('\n')}

Geef je antwoord in JSON formaat:
{
  "matchedClientIds": ["CL-2023-001", "CL-2023-002"],
  "explanation": "Uitleg waarom deze cliënten matchen",
  "searchCriteria": {
    "conditions": ["angst", "gedragsproblemen"],
    "wlzProfiles": ["VV7"],
    "providers": ["Driezorg"],
    "ageRange": { "min": 65, "max": 95 }
  }
}`;

  try {
    const result = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Zoek cliënten op basis van: "${params.query}"` },
      ],
      temperature: 0.3,
      maxTokens: 1000,
      responseFormat: { type: 'json_object' },
    });

    if (!result) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(result);
    return {
      matchedClientIds: parsed.matchedClientIds || [],
      explanation: parsed.explanation || 'Geen matches gevonden',
      searchCriteria: parsed.searchCriteria || {},
    };
  } catch (error) {
    console.error('Error in natural language search:', error);
    return {
      matchedClientIds: [],
      explanation: 'Zoekfunctie niet beschikbaar',
      searchCriteria: {},
    };
  }
}
