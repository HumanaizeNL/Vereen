// Evidence linking and tracing system
// Connects extracted fields and normative checks to source evidence
// Calculates relevance and confidence scores for evidence quality assessment

import type {
  Client,
  Note,
  Measure,
  Incident,
  EvidenceLink,
  MeerzorgFormField,
  NormativeCheck,
} from '../data/types';
import { nanoid } from 'nanoid';

export interface EvidenceSource {
  type: 'note' | 'measure' | 'incident' | 'document';
  id: string;
  date: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface EvidenceLinkResult {
  source_type: string;
  source_id: string;
  snippet: string;
  relevance: number;
  confidence: number;
  reason?: string;
}

export interface LinkingContext {
  client: Client;
  notes: Note[];
  measures: Measure[];
  incidents: Incident[];
  field?: string;
  value?: any;
  keywords?: string[];
}

/**
 * Link a field value to supporting evidence in the dossier
 */
export function linkFieldToEvidence(
  context: LinkingContext,
  targetPath: string
): EvidenceLinkResult[] {
  const results: EvidenceLinkResult[] = [];

  // Extract keywords from field and value
  const keywords = context.keywords || extractKeywords(context.field || '', context.value);

  // Search notes for supporting evidence
  for (const note of context.notes) {
    const match = matchTextToKeywords(note.text, keywords);
    if (match.score > 0.3) {
      results.push({
        source_type: 'note',
        source_id: note.id,
        snippet: extractRelevantSnippet(note.text, keywords),
        relevance: match.score,
        confidence: calculateNoteConfidence(note),
        reason: match.reason,
      });
    }
  }

  // Search measures for supporting evidence
  for (const measure of context.measures) {
    const match = matchMeasureToField(measure, context.field || '', context.value);
    if (match.score > 0.3) {
      results.push({
        source_type: 'measure',
        source_id: measure.id,
        snippet: formatMeasureSnippet(measure),
        relevance: match.score,
        confidence: calculateMeasureConfidence(measure),
        reason: match.reason,
      });
    }
  }

  // Search incidents for supporting evidence
  for (const incident of context.incidents) {
    const match = matchTextToKeywords(incident.description, keywords);
    if (match.score > 0.3) {
      results.push({
        source_type: 'incident',
        source_id: incident.id,
        snippet: extractRelevantSnippet(incident.description, keywords),
        relevance: match.score,
        confidence: calculateIncidentConfidence(incident),
        reason: match.reason,
      });
    }
  }

  // Sort by relevance * confidence to prioritize best evidence
  results.sort((a, b) => (b.relevance * b.confidence) - (a.relevance * a.confidence));

  return results;
}

/**
 * Link multiple form fields to evidence simultaneously
 */
export function linkFormFieldsToEvidence(
  formFields: Array<{ field_name: string; field_value: any }>,
  context: Omit<LinkingContext, 'field' | 'value' | 'keywords'>
): Map<string, EvidenceLinkResult[]> {
  const results = new Map<string, EvidenceLinkResult[]>();

  for (const field of formFields) {
    const links = linkFieldToEvidence(
      {
        ...context,
        field: field.field_name,
        value: field.field_value,
      },
      `meerzorg.${field.field_name}`
    );
    results.set(field.field_name, links);
  }

  return results;
}

/**
 * Link normative check results to supporting evidence
 */
export function linkCheckToEvidence(
  check: Pick<NormativeCheck, 'rule_id' | 'message' | 'check_type'>,
  context: Omit<LinkingContext, 'field' | 'value' | 'keywords'>
): EvidenceLinkResult[] {
  // Extract keywords from check message and rule
  const keywords = extractKeywords(check.rule_id, check.message);

  return linkFieldToEvidence(
    {
      ...context,
      keywords,
    },
    `normative_check.${check.rule_id}`
  );
}

/**
 * Calculate evidence chain showing provenance
 */
export interface EvidenceChain {
  target: string;
  claim: string;
  evidence: Array<{
    level: number;
    source: EvidenceSource;
    relevance: number;
    confidence: number;
    snippet: string;
  }>;
  overallConfidence: number;
  gaps: string[];
}

export function buildEvidenceChain(
  target: string,
  claim: string,
  links: EvidenceLinkResult[],
  context: LinkingContext
): EvidenceChain {
  const evidence = links.map((link, index) => {
    let source: EvidenceSource | undefined;

    if (link.source_type === 'note') {
      const note = context.notes.find(n => n.id === link.source_id);
      if (note) {
        source = {
          type: 'note',
          id: note.id,
          date: note.date,
          text: note.text,
          metadata: { author: note.author, section: note.section },
        };
      }
    } else if (link.source_type === 'measure') {
      const measure = context.measures.find(m => m.id === link.source_id);
      if (measure) {
        source = {
          type: 'measure',
          id: measure.id,
          date: measure.date,
          text: `${measure.type}: ${measure.score}`,
          metadata: { type: measure.type, score: measure.score },
        };
      }
    } else if (link.source_type === 'incident') {
      const incident = context.incidents.find(i => i.id === link.source_id);
      if (incident) {
        source = {
          type: 'incident',
          id: incident.id,
          date: incident.date,
          text: incident.description,
          metadata: { type: incident.type, severity: incident.severity },
        };
      }
    }

    return source
      ? {
          level: index + 1,
          source,
          relevance: link.relevance,
          confidence: link.confidence,
          snippet: link.snippet,
        }
      : null;
  }).filter(e => e !== null);

  // Calculate overall confidence based on best evidence
  const overallConfidence = evidence.length > 0
    ? Math.max(...evidence.map(e => e.confidence * e.relevance))
    : 0;

  // Identify gaps in evidence
  const gaps = identifyEvidenceGaps(target, evidence, context);

  return {
    target,
    claim,
    evidence,
    overallConfidence,
    gaps,
  };
}

/**
 * Extract keywords from field name and value
 */
function extractKeywords(field: string, value: any): string[] {
  const keywords: string[] = [];

  // Add field name components
  if (field) {
    keywords.push(...field.toLowerCase().split(/[_\s-]+/));
  }

  // Add value components
  if (typeof value === 'string') {
    keywords.push(...value.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  } else if (typeof value === 'number') {
    keywords.push(value.toString());
  }

  // Add domain-specific keywords based on field
  const domainKeywords = getDomainKeywords(field);
  keywords.push(...domainKeywords);

  // Remove common Dutch stop words
  const stopWords = ['de', 'het', 'een', 'van', 'is', 'in', 'op', 'en', 'met'];
  return keywords.filter(k => !stopWords.includes(k) && k.length > 1);
}

/**
 * Get domain-specific keywords for a field
 */
function getDomainKeywords(field: string): string[] {
  const fieldLower = field.toLowerCase();

  if (fieldLower.includes('adl') || fieldLower.includes('zelfzorg')) {
    return ['adl', 'katz', 'zelfzorg', 'wassen', 'aankleden', 'toiletgang', 'mobiliteit'];
  }
  if (fieldLower.includes('bpsd') || fieldLower.includes('gedrag')) {
    return ['bpsd', 'gedrag', 'agressie', 'dwalen', 'onrust', 'apathie', 'agitatie'];
  }
  if (fieldLower.includes('nacht')) {
    return ['nacht', 'nachtzorg', 'slapen', 'insomnia', 'nachtelijke', 'toezicht'];
  }
  if (fieldLower.includes('zorg') && fieldLower.includes('uren')) {
    return ['zorguren', 'uren', 'dagzorg', 'nachtzorg', 'begeleiding', 'toezicht'];
  }
  if (fieldLower.includes('incident')) {
    return ['incident', 'val', 'medicatie', 'agressie', 'dwaling', 'ongeluk'];
  }

  return [];
}

/**
 * Match text against keywords with scoring
 */
function matchTextToKeywords(
  text: string,
  keywords: string[]
): { score: number; reason?: string } {
  if (keywords.length === 0) {
    return { score: 0 };
  }

  const textLower = text.toLowerCase();
  let matchCount = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    if (textLower.includes(keyword)) {
      matchCount++;
      matchedKeywords.push(keyword);
    }
  }

  const score = matchCount / keywords.length;
  const reason = matchedKeywords.length > 0
    ? `Matched keywords: ${matchedKeywords.slice(0, 3).join(', ')}`
    : undefined;

  return { score, reason };
}

/**
 * Match measure to field and value
 */
function matchMeasureToField(
  measure: Measure,
  field: string,
  value: any
): { score: number; reason?: string } {
  const fieldLower = field.toLowerCase();
  const measureTypeLower = measure.type.toLowerCase();

  // Direct type match
  if (fieldLower.includes(measureTypeLower) || measureTypeLower.includes(fieldLower)) {
    return { score: 1.0, reason: `Direct match: ${measure.type}` };
  }

  // ADL-related matches
  if (fieldLower.includes('adl') && (measureTypeLower.includes('adl') || measureTypeLower.includes('katz'))) {
    return { score: 0.9, reason: 'ADL measurement match' };
  }

  // Score-based matches
  if (value !== undefined && measure.score.toString() === value.toString()) {
    return { score: 0.8, reason: `Score match: ${measure.score}` };
  }

  return { score: 0 };
}

/**
 * Extract relevant snippet from text
 */
function extractRelevantSnippet(text: string, keywords: string[], maxLength: number = 200): string {
  const textLower = text.toLowerCase();

  // Find the first keyword match
  for (const keyword of keywords) {
    const index = textLower.indexOf(keyword);
    if (index !== -1) {
      // Extract context around the keyword
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + maxLength - 50);
      let snippet = text.substring(start, end);

      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';

      return snippet.trim();
    }
  }

  // If no keyword found, return beginning
  return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
}

/**
 * Format measure as snippet
 */
function formatMeasureSnippet(measure: Measure): string {
  const comment = measure.comment ? ` - ${measure.comment}` : '';
  return `${measure.type}: ${measure.score} (${measure.date})${comment}`;
}

/**
 * Calculate confidence score for a note
 */
function calculateNoteConfidence(note: Note): number {
  let confidence = 0.8; // Base confidence for notes

  // Recency bonus
  const noteDate = new Date(note.date);
  const now = new Date();
  const daysOld = (now.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysOld < 30) {
    confidence += 0.15;
  } else if (daysOld < 90) {
    confidence += 0.1;
  } else if (daysOld < 180) {
    confidence += 0.05;
  } else if (daysOld > 365) {
    confidence -= 0.2;
  }

  // Professional author bonus
  const professionalRoles = ['arts', 'verpleegkundige', 'psycholoog', 'specialist'];
  const authorLower = note.author.toLowerCase();
  if (professionalRoles.some(role => authorLower.includes(role))) {
    confidence += 0.1;
  }

  // Section relevance
  const clinicalSections = ['medisch', 'zorgplan', 'beoordeling', 'observatie'];
  const sectionLower = note.section.toLowerCase();
  if (clinicalSections.some(section => sectionLower.includes(section))) {
    confidence += 0.05;
  }

  return Math.min(1.0, Math.max(0.0, confidence));
}

/**
 * Calculate confidence score for a measure
 */
function calculateMeasureConfidence(measure: Measure): number {
  let confidence = 0.9; // Base confidence for measures (more objective)

  // Recency bonus
  const measureDate = new Date(measure.date);
  const now = new Date();
  const daysOld = (now.getTime() - measureDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysOld < 30) {
    confidence += 0.1;
  } else if (daysOld < 90) {
    confidence += 0.05;
  } else if (daysOld > 180) {
    confidence -= 0.1;
  } else if (daysOld > 365) {
    confidence -= 0.3;
  }

  // Standardized measure types get bonus
  const standardizedTypes = ['katz', 'adl', 'barthel', 'mmse', 'npi', 'cmai'];
  if (standardizedTypes.some(type => measure.type.toLowerCase().includes(type))) {
    confidence += 0.05;
  }

  return Math.min(1.0, Math.max(0.0, confidence));
}

/**
 * Calculate confidence score for an incident
 */
function calculateIncidentConfidence(incident: Incident): number {
  let confidence = 0.85; // Base confidence for incidents

  // Recency bonus
  const incidentDate = new Date(incident.date);
  const now = new Date();
  const daysOld = (now.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysOld < 30) {
    confidence += 0.1;
  } else if (daysOld < 90) {
    confidence += 0.05;
  } else if (daysOld > 365) {
    confidence -= 0.2;
  }

  // Severity relevance
  const severityLower = incident.severity.toLowerCase();
  if (severityLower === 'hoog' || severityLower === 'ernstig') {
    confidence += 0.05;
  }

  return Math.min(1.0, Math.max(0.0, confidence));
}

/**
 * Identify gaps in evidence
 */
function identifyEvidenceGaps(
  target: string,
  evidence: Array<{ source: EvidenceSource; confidence: number }>,
  context: LinkingContext
): string[] {
  const gaps: string[] = [];

  // No evidence at all
  if (evidence.length === 0) {
    gaps.push('Geen ondersteunend bewijs gevonden');
    return gaps;
  }

  // Low confidence evidence
  const maxConfidence = Math.max(...evidence.map(e => e.confidence));
  if (maxConfidence < 0.5) {
    gaps.push('Bewijs heeft lage betrouwbaarheid');
  }

  // Old evidence
  const dates = evidence.map(e => new Date(e.source.date));
  const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
  const now = new Date();
  const daysOld = (now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24);

  if (daysOld > 180) {
    gaps.push('Recentste bewijs is ouder dan 6 maanden');
  }

  // Single source
  if (evidence.length === 1) {
    gaps.push('Slechts één bron van bewijs gevonden');
  }

  // Missing professional assessment for clinical claims
  const hasProfessionalSource = evidence.some(e => {
    if (e.source.type === 'measure') return true;
    if (e.source.type === 'note') {
      const author = e.source.metadata?.author?.toLowerCase() || '';
      return ['arts', 'specialist', 'psycholoog'].some(role => author.includes(role));
    }
    return false;
  });

  const clinicalTargets = ['adl', 'bpsd', 'medisch', 'diagnose', 'specialist'];
  if (clinicalTargets.some(t => target.toLowerCase().includes(t)) && !hasProfessionalSource) {
    gaps.push('Geen professionele beoordeling gevonden voor klinische claim');
  }

  return gaps;
}

/**
 * Validate evidence quality for a set of links
 */
export interface EvidenceQuality {
  sufficient: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export function validateEvidenceQuality(
  links: EvidenceLinkResult[],
  requiredConfidence: number = 0.7,
  requiredRelevance: number = 0.6
): EvidenceQuality {
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (links.length === 0) {
    return {
      sufficient: false,
      score: 0,
      issues: ['Geen bewijs gevonden'],
      recommendations: ['Voeg notities, metingen of incidentmeldingen toe die deze claim ondersteunen'],
    };
  }

  // Check best evidence
  const bestLink = links[0];
  const bestQuality = bestLink.relevance * bestLink.confidence;

  if (bestLink.confidence < requiredConfidence) {
    issues.push(`Betrouwbaarheid van beste bewijs is te laag (${(bestLink.confidence * 100).toFixed(0)}%)`);
    recommendations.push('Voeg recentere of meer gedetailleerde documentatie toe');
  }

  if (bestLink.relevance < requiredRelevance) {
    issues.push(`Relevantie van beste bewijs is te laag (${(bestLink.relevance * 100).toFixed(0)}%)`);
    recommendations.push('Zorg dat documentatie specifiek ingaat op deze claim');
  }

  // Check diversity of sources
  const sourceTypes = new Set(links.map(l => l.source_type));
  if (sourceTypes.size === 1 && links.length < 3) {
    recommendations.push('Overweeg meerdere soorten bronnen toe te voegen (notities + metingen + incidenten)');
  }

  const sufficient = bestQuality >= (requiredConfidence * requiredRelevance) && issues.length === 0;

  return {
    sufficient,
    score: bestQuality,
    issues,
    recommendations,
  };
}
