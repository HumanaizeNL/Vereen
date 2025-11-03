import Papa from 'papaparse';
import { nanoid } from 'nanoid';
import { Note, Measure, Incident, Client } from '../data/types';

export interface CSVParseResult {
  rows: number;
  type: 'csv';
  warnings: string[];
}

export interface ParsedCSVData {
  clients?: Client[];
  notes?: Note[];
  measures?: Measure[];
  incidents?: Incident[];
}

// Field mapping configurations
const FIELD_MAPPINGS = {
  notes: {
    text: ['text', 'tekst', 'inhoud', 'content'],
    date: ['date', 'datum', 'created_at'],
    author: ['author', 'auteur', 'medewerker', 'user'],
    section: ['section', 'sectie', 'type', 'category'],
  },
  measures: {
    date: ['date', 'datum', 'measurement_date'],
    type: ['type', 'scoretype', 'measurement_type'],
    score: ['score', 'value', 'waarde'],
    comment: ['comment', 'opmerking', 'toelichting'],
  },
  incidents: {
    date: ['date', 'datum', 'incident_date'],
    type: ['type', 'incident_type'],
    severity: ['severity', 'ernst'],
    description: ['description', 'beschrijving', 'details'],
  },
  clients: {
    client_id: ['client_id', 'id', 'clientnummer'],
    name: ['name', 'naam', 'full_name'],
    dob: ['dob', 'geboortedatum', 'date_of_birth'],
    wlz_profile: ['wlz_profile', 'profiel', 'zorgprofiel'],
    provider: ['provider', 'aanbieder', 'zorgaanbieder'],
  },
};

function findColumnName(
  headers: string[],
  possibleNames: string[]
): string | null {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
  for (const name of possibleNames) {
    const index = lowerHeaders.indexOf(name.toLowerCase());
    if (index !== -1) {
      return headers[index];
    }
  }
  return null;
}

export async function parseCSV(
  file: File,
  client_id: string,
  datasetType?: 'notes' | 'measures' | 'incidents' | 'clients'
): Promise<{ result: CSVParseResult; data: ParsedCSVData }> {
  return new Promise((resolve, reject) => {
    const warnings: string[] = [];

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          const rows = results.data as any[];

          // Auto-detect data type based on filename or headers
          const detectedType =
            datasetType || detectDataType(file.name, headers);

          if (!detectedType) {
            warnings.push(
              'Could not auto-detect CSV type; assuming notes format'
            );
          }

          let parsedData: ParsedCSVData = {};

          switch (detectedType) {
            case 'notes':
              parsedData.notes = parseNotesCSV(
                rows,
                headers,
                client_id,
                warnings
              );
              break;
            case 'measures':
              parsedData.measures = parseMeasuresCSV(
                rows,
                headers,
                client_id,
                warnings
              );
              break;
            case 'incidents':
              parsedData.incidents = parseIncidentsCSV(
                rows,
                headers,
                client_id,
                warnings
              );
              break;
            case 'clients':
              parsedData.clients = parseClientsCSV(rows, headers, warnings);
              break;
            default:
              parsedData.notes = parseNotesCSV(
                rows,
                headers,
                client_id,
                warnings
              );
          }

          resolve({
            result: {
              rows: rows.length,
              type: 'csv',
              warnings,
            },
            data: parsedData,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

function detectDataType(
  filename: string,
  headers: string[]
): 'notes' | 'measures' | 'incidents' | 'clients' | null {
  const lower = filename.toLowerCase();
  const headerSet = headers.map((h) => h.toLowerCase());

  if (
    lower.includes('note') ||
    lower.includes('observ') ||
    headerSet.some((h) => h.includes('text') || h.includes('tekst'))
  ) {
    return 'notes';
  }

  if (
    lower.includes('measure') ||
    lower.includes('metin') ||
    lower.includes('score') ||
    headerSet.some((h) => h.includes('score') || h.includes('katz'))
  ) {
    return 'measures';
  }

  if (
    lower.includes('incident') ||
    headerSet.some((h) => h.includes('severity') || h.includes('ernst'))
  ) {
    return 'incidents';
  }

  if (
    lower.includes('client') ||
    headerSet.some((h) => h.includes('dob') || h.includes('geboortedatum'))
  ) {
    return 'clients';
  }

  return null;
}

function parseNotesCSV(
  rows: any[],
  headers: string[],
  client_id: string,
  warnings: string[]
): Note[] {
  const textCol = findColumnName(headers, FIELD_MAPPINGS.notes.text);
  const dateCol = findColumnName(headers, FIELD_MAPPINGS.notes.date);
  const authorCol = findColumnName(headers, FIELD_MAPPINGS.notes.author);
  const sectionCol = findColumnName(headers, FIELD_MAPPINGS.notes.section);

  if (!textCol) {
    warnings.push("Column 'text' missing; using first text column");
  }

  return rows
    .filter((row) => row[textCol || headers[0]])
    .map((row) => ({
      id: nanoid(),
      client_id,
      date: row[dateCol || 'date'] || new Date().toISOString().split('T')[0],
      author: row[authorCol || 'author'] || 'Unknown',
      section: row[sectionCol || 'section'] || 'General',
      text: row[textCol || headers[0]],
    }));
}

function parseMeasuresCSV(
  rows: any[],
  headers: string[],
  client_id: string,
  warnings: string[]
): Measure[] {
  const typeCol = findColumnName(headers, FIELD_MAPPINGS.measures.type);
  const dateCol = findColumnName(headers, FIELD_MAPPINGS.measures.date);
  const scoreCol = findColumnName(headers, FIELD_MAPPINGS.measures.score);
  const commentCol = findColumnName(headers, FIELD_MAPPINGS.measures.comment);

  if (!typeCol) {
    warnings.push("Column 'type' missing; using default 'Unknown'");
  }

  return rows
    .filter((row) => row[scoreCol || 'score'])
    .map((row) => ({
      id: nanoid(),
      client_id,
      date: row[dateCol || 'date'] || new Date().toISOString().split('T')[0],
      type: row[typeCol || 'type'] || 'Unknown',
      score: row[scoreCol || 'score'],
      comment: row[commentCol || 'comment'],
    }));
}

function parseIncidentsCSV(
  rows: any[],
  headers: string[],
  client_id: string,
  warnings: string[]
): Incident[] {
  const typeCol = findColumnName(headers, FIELD_MAPPINGS.incidents.type);
  const dateCol = findColumnName(headers, FIELD_MAPPINGS.incidents.date);
  const severityCol = findColumnName(
    headers,
    FIELD_MAPPINGS.incidents.severity
  );
  const descCol = findColumnName(
    headers,
    FIELD_MAPPINGS.incidents.description
  );

  if (!descCol) {
    warnings.push("Column 'description' missing; using first text column");
  }

  return rows
    .filter((row) => row[descCol || headers[0]])
    .map((row) => ({
      id: nanoid(),
      client_id,
      date: row[dateCol || 'date'] || new Date().toISOString().split('T')[0],
      type: row[typeCol || 'type'] || 'Unknown',
      severity: row[severityCol || 'severity'] || 'Medium',
      description: row[descCol || headers[0]],
    }));
}

function parseClientsCSV(
  rows: any[],
  headers: string[],
  warnings: string[]
): Client[] {
  const idCol = findColumnName(headers, FIELD_MAPPINGS.clients.client_id);
  const nameCol = findColumnName(headers, FIELD_MAPPINGS.clients.name);
  const dobCol = findColumnName(headers, FIELD_MAPPINGS.clients.dob);
  const profileCol = findColumnName(
    headers,
    FIELD_MAPPINGS.clients.wlz_profile
  );
  const providerCol = findColumnName(headers, FIELD_MAPPINGS.clients.provider);

  if (!idCol) {
    warnings.push("Column 'client_id' missing; cannot parse clients");
    return [];
  }

  return rows
    .filter((row) => row[idCol])
    .map((row) => ({
      client_id: row[idCol],
      name: row[nameCol || 'name'] || 'Unknown',
      dob: row[dobCol || 'dob'] || '',
      wlz_profile: row[profileCol || 'wlz_profile'] || '',
      provider: row[providerCol || 'provider'] || '',
      created_at: new Date().toISOString(),
    }));
}
