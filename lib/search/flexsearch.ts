import FlexSearch from 'flexsearch';
import {
  getClientNotes,
  getClientMeasures,
  getClientIncidents,
} from '../data/stores';

const { Index } = FlexSearch;

// Index store per client (using any for FlexSearch type compatibility)
const searchIndexes = new Map<string, any>();

interface SearchDocument {
  id: string;
  source: string;
  type: 'note' | 'measure' | 'incident';
  text: string;
  date: string;
  author?: string;
  section?: string;
  row?: number;
}

const documentStore = new Map<string, Map<string, SearchDocument>>();

export function initializeClientIndex(client_id: string): void {
  if (searchIndexes.has(client_id)) {
    return; // Already initialized
  }

  const index = new Index({
    preset: 'performance',
    tokenize: 'forward',
    cache: true,
    context: {
      resolution: 9,
      depth: 2,
      bidirectional: true,
    },
  });

  searchIndexes.set(client_id, index);
  documentStore.set(client_id, new Map());
}

export function indexClientData(client_id: string): void {
  initializeClientIndex(client_id);

  const index = searchIndexes.get(client_id)!;
  const docs = documentStore.get(client_id)!;

  // Clear existing documents
  docs.clear();

  // Index notes
  const notes = getClientNotes(client_id);
  notes.forEach((note, idx) => {
    const doc: SearchDocument = {
      id: note.id,
      source: 'notes.csv',
      type: 'note',
      text: note.text,
      date: note.date,
      author: note.author,
      section: note.section,
      row: idx + 1,
    };
    docs.set(doc.id, doc);
    index.add(doc.id, doc.text);
  });

  // Index measures
  const measures = getClientMeasures(client_id);
  measures.forEach((measure, idx) => {
    const text = `${measure.type}: ${measure.score}${
      measure.comment ? ' - ' + measure.comment : ''
    }`;
    const doc: SearchDocument = {
      id: measure.id,
      source: 'measures.csv',
      type: 'measure',
      text,
      date: measure.date,
      row: idx + 1,
    };
    docs.set(doc.id, doc);
    index.add(doc.id, text);
  });

  // Index incidents
  const incidents = getClientIncidents(client_id);
  incidents.forEach((incident, idx) => {
    const text = `${incident.type} (${incident.severity}): ${incident.description}`;
    const doc: SearchDocument = {
      id: incident.id,
      source: 'incidents.csv',
      type: 'incident',
      text,
      date: incident.date,
      row: idx + 1,
    };
    docs.set(doc.id, doc);
    index.add(doc.id, text);
  });
}

export interface SearchFilters {
  date_from?: string;
  date_to?: string;
  section?: string;
  author?: string;
}

export interface SearchHit {
  source: string;
  row: number;
  snippet: string;
  score: number;
}

export function searchClient(
  client_id: string,
  query: string,
  k = 10,
  filters?: SearchFilters
): SearchHit[] {
  const index = searchIndexes.get(client_id);
  const docs = documentStore.get(client_id);

  if (!index || !docs) {
    return [];
  }

  // Execute search
  const results = index.search(query, { limit: k * 3 }) as string[];

  // Get documents and apply filters
  let hits = results
    .map((id) => docs.get(id as string))
    .filter((doc): doc is SearchDocument => doc !== undefined);

  // Apply filters
  if (filters?.date_from) {
    hits = hits.filter((doc) => doc.date >= filters.date_from!);
  }

  if (filters?.date_to) {
    hits = hits.filter((doc) => doc.date <= filters.date_to!);
  }

  if (filters?.section) {
    hits = hits.filter((doc) => doc.section === filters.section);
  }

  if (filters?.author) {
    hits = hits.filter((doc) => doc.author === filters.author);
  }

  // Limit to k results
  hits = hits.slice(0, k);

  // Calculate BM25-like scores (simplified)
  const maxScore = hits.length > 0 ? 100 : 0;
  const scoreDecay = maxScore / (hits.length || 1);

  return hits.map((doc, idx) => ({
    source: doc.source,
    row: doc.row || 0,
    snippet: truncateSnippet(doc.text, query, 150),
    score: Math.round((maxScore - idx * scoreDecay) * 10) / 10,
  }));
}

function truncateSnippet(
  text: string,
  query: string,
  maxLength = 150
): string {
  const queryWords = query.toLowerCase().split(' ');

  // Find the first occurrence of any query word
  let startIndex = -1;
  for (const word of queryWords) {
    const idx = text.toLowerCase().indexOf(word);
    if (idx !== -1) {
      startIndex = Math.max(0, idx - 50);
      break;
    }
  }

  if (startIndex === -1) {
    startIndex = 0;
  }

  let snippet = text.substring(startIndex, startIndex + maxLength);

  if (startIndex > 0) {
    snippet = '...' + snippet;
  }

  if (startIndex + maxLength < text.length) {
    snippet = snippet + '...';
  }

  return snippet.trim();
}

export function clearClientIndex(client_id: string): void {
  searchIndexes.delete(client_id);
  documentStore.delete(client_id);
}
