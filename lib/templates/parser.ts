// Template parsing system for official Meerzorg DOCX templates
// Extracts field definitions, requirements, and validation rules from templates

import mammoth from 'mammoth';
import type { FrameworkVersion } from '../data/types';

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  helpText?: string;
  section: string;
  order: number;
  conditionalOn?: {
    field: string;
    value: any;
  };
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: TemplateField[];
}

export interface ParsedTemplate {
  version: string;
  frameworkType: 'meerzorg' | 'vv8' | 'toetsingskader';
  title: string;
  effectiveFrom?: string;
  sections: TemplateSection[];
  metadata: {
    totalFields: number;
    requiredFields: number;
    optionalFields: number;
    parsedAt: string;
  };
}

/**
 * Parse a Meerzorg template DOCX file
 */
export async function parseMeerzorgTemplate(
  filePath: string,
  version: string
): Promise<ParsedTemplate> {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;

  const sections = extractSections(text);
  const fields = extractFields(text, sections);

  // Assign fields to sections
  const sectionsWithFields = sections.map(section => ({
    ...section,
    fields: fields.filter(f => f.section === section.id),
  }));

  // Calculate metadata
  const totalFields = fields.length;
  const requiredFields = fields.filter(f => f.required).length;
  const optionalFields = totalFields - requiredFields;

  return {
    version,
    frameworkType: 'meerzorg',
    title: extractTitle(text),
    effectiveFrom: extractEffectiveDate(text),
    sections: sectionsWithFields,
    metadata: {
      totalFields,
      requiredFields,
      optionalFields,
      parsedAt: new Date().toISOString(),
    },
  };
}

/**
 * Parse VV8 criteria template
 */
export async function parseVV8Template(
  filePath: string,
  version: string
): Promise<ParsedTemplate> {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;

  // VV8 has fixed 8 criteria
  const vv8Criteria = [
    'ADL',
    'NACHT_TOEZICHT',
    'GEDRAG',
    'COMMUNICATIE',
    'MOBILITEIT',
    'PSYCHOSOCIAAL',
    'SOCIALE_REDZAAMHEID',
    'ZELFSTANDIGHEID',
  ];

  const fields: TemplateField[] = vv8Criteria.map((criterion, index) => ({
    id: criterion,
    label: formatVV8Label(criterion),
    type: 'select' as const,
    required: true,
    options: ['voldoet', 'niet_voldoet', 'onvoldoende_bewijs', 'toegenomen_behoefte'],
    section: 'vv8_criteria',
    order: index + 1,
    helpText: extractVV8Help(text, criterion),
  }));

  const sections: TemplateSection[] = [
    {
      id: 'vv8_criteria',
      title: 'VV8 Criteria',
      description: 'Beoordeling van alle 8 VV8 criteria',
      order: 1,
      fields,
    },
  ];

  return {
    version,
    frameworkType: 'vv8',
    title: 'VV8 Herindicatie',
    sections,
    metadata: {
      totalFields: 8,
      requiredFields: 8,
      optionalFields: 0,
      parsedAt: new Date().toISOString(),
    },
  };
}

/**
 * Extract sections from template text
 */
function extractSections(text: string): Omit<TemplateSection, 'fields'>[] {
  const sections: Omit<TemplateSection, 'fields'>[] = [];
  let order = 1;

  // Common section patterns in Dutch administrative documents
  const sectionPatterns = [
    /^(\d+)\.\s*([A-Z][^\n]{5,60})$/gm,
    /^([A-Z][A-Z\s]{5,60}):?\s*$/gm,
    /^(?:DEEL|SECTIE|HOOFDSTUK)\s+(\d+)[:\s]+([^\n]{5,60})$/gim,
  ];

  for (const pattern of sectionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const sectionTitle = match[2] || match[1];
      if (sectionTitle && sectionTitle.length > 5) {
        const id = sectionTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');

        // Avoid duplicates
        if (!sections.find(s => s.id === id)) {
          sections.push({
            id,
            title: sectionTitle.trim(),
            order: order++,
          });
        }
      }
    }
  }

  // If no sections found, create a default section
  if (sections.length === 0) {
    sections.push({
      id: 'algemeen',
      title: 'Algemene gegevens',
      order: 1,
    });
  }

  return sections;
}

/**
 * Extract field definitions from text
 */
function extractFields(
  text: string,
  sections: Omit<TemplateSection, 'fields'>[]
): TemplateField[] {
  const fields: TemplateField[] = [];
  let order = 1;
  let currentSection = sections[0]?.id || 'algemeen';

  // Track which section we're in
  const lines = text.split('\n');
  let sectionIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if we've entered a new section
    if (sections[sectionIndex + 1]) {
      const nextSection = sections[sectionIndex + 1];
      if (line.includes(nextSection.title)) {
        sectionIndex++;
        currentSection = nextSection.id;
      }
    }

    // Field patterns with labels and possible field types
    const fieldPatterns = [
      // "Naam: _______" or "Naam: [ ]"
      /^([A-Z][a-zëéèêï\s]{2,40}):\s*[_\[\]\.]{3,}$/i,
      // "1. Dagzorg uren:" or "a) Gedragsproblematiek:"
      /^(?:\d+\.|[a-z]\))\s*([A-Z][a-zëéèêï\s]{2,40}):\s*[_\[\]\.]{0,}$/i,
      // "☐ Ja ☐ Nee" (checkbox patterns)
      /^(?:☐|☑|\[ \]|\[x\])\s*([A-Z][a-zëéèêï\s]{2,40})/i,
    ];

    for (const pattern of fieldPatterns) {
      const match = line.match(pattern);
      if (match) {
        const label = match[1].trim();
        const field = createFieldFromLabel(label, currentSection, order++);

        // Extract validation from surrounding context
        const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(' ');
        enrichFieldFromContext(field, context);

        fields.push(field);
        break;
      }
    }

    // Check for required field indicators
    if (line.includes('*') || line.toLowerCase().includes('verplicht')) {
      // Mark previous field as required
      if (fields.length > 0) {
        fields[fields.length - 1].required = true;
      }
    }
  }

  return fields;
}

/**
 * Create field definition from label
 */
function createFieldFromLabel(
  label: string,
  section: string,
  order: number
): TemplateField {
  const labelLower = label.toLowerCase();

  // Determine field type from label
  let type: TemplateField['type'] = 'text';
  let options: string[] | undefined;

  if (labelLower.includes('datum') || labelLower.includes('date')) {
    type = 'date';
  } else if (
    labelLower.includes('uren') ||
    labelLower.includes('aantal') ||
    labelLower.includes('score')
  ) {
    type = 'number';
  } else if (
    labelLower.includes('toelichting') ||
    labelLower.includes('beschrijving') ||
    labelLower.includes('motivering')
  ) {
    type = 'textarea';
  } else if (labelLower.includes('ja/nee') || labelLower.includes('ja / nee')) {
    type = 'radio';
    options = ['Ja', 'Nee'];
  }

  // Generate field ID
  const id = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  return {
    id,
    label,
    type,
    required: false,
    options,
    section,
    order,
  };
}

/**
 * Enrich field with validation rules from context
 */
function enrichFieldFromContext(field: TemplateField, context: string): void {
  const contextLower = context.toLowerCase();

  // Check for required indicators
  if (
    contextLower.includes('verplicht') ||
    contextLower.includes('*') ||
    contextLower.includes('required')
  ) {
    field.required = true;
  }

  // Extract numeric ranges
  const rangeMatch = context.match(/(\d+)\s*(?:tot|t\/m|-)\s*(\d+)/i);
  if (rangeMatch && field.type === 'number') {
    field.validation = {
      min: parseInt(rangeMatch[1]),
      max: parseInt(rangeMatch[2]),
      message: `Waarde moet tussen ${rangeMatch[1]} en ${rangeMatch[2]} liggen`,
    };
  }

  // Extract help text
  const helpPatterns = [
    /(?:toelichting|uitleg|opmerking):\s*([^\n]{10,150})/i,
    /\(([^\)]{10,100})\)/,
  ];

  for (const pattern of helpPatterns) {
    const match = context.match(pattern);
    if (match) {
      field.helpText = match[1].trim();
      break;
    }
  }

  // Detect conditional fields
  const conditionalMatch = context.match(/indien\s+([a-zëéèêï\s]+)\s*=\s*['"']?([^'"'\n]+)['"']?/i);
  if (conditionalMatch) {
    const condField = conditionalMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
    const condValue = conditionalMatch[2].trim();
    field.conditionalOn = {
      field: condField,
      value: condValue,
    };
  }
}

/**
 * Extract title from document
 */
function extractTitle(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Title is usually in first few lines and all caps or title case
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    if (
      line.length > 10 &&
      line.length < 100 &&
      (line === line.toUpperCase() || /^[A-Z][a-z]/.test(line))
    ) {
      return line;
    }
  }

  return 'Meerzorg Aanvraag';
}

/**
 * Extract effective date from document
 */
function extractEffectiveDate(text: string): string | undefined {
  const datePatterns = [
    /(?:geldig vanaf|ingangsdatum|effectief per):\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
    /(?:versie|datum):\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i,
    /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return normalizeDate(match[1]);
    }
  }

  return undefined;
}

/**
 * Normalize date to ISO format
 */
function normalizeDate(dateStr: string): string {
  // Try to parse various date formats
  const parts = dateStr.split(/[-\/]/);

  if (parts.length === 3) {
    // Assume DD-MM-YYYY or YYYY-MM-DD
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else {
      // DD-MM-YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  return dateStr;
}

/**
 * Format VV8 criterion label
 */
function formatVV8Label(criterion: string): string {
  const labels: Record<string, string> = {
    ADL: 'ADL (Algemene Dagelijkse Levensverrichtingen)',
    NACHT_TOEZICHT: 'Nacht toezicht',
    GEDRAG: 'Gedragsproblematiek',
    COMMUNICATIE: 'Communicatie',
    MOBILITEIT: 'Mobiliteit',
    PSYCHOSOCIAAL: 'Psychosociaal functioneren',
    SOCIALE_REDZAAMHEID: 'Sociale redzaamheid',
    ZELFSTANDIGHEID: 'Zelfstandigheid',
  };

  return labels[criterion] || criterion;
}

/**
 * Extract help text for VV8 criterion
 */
function extractVV8Help(text: string, criterion: string): string | undefined {
  // Find section about this criterion
  const criterionLabel = formatVV8Label(criterion);
  const index = text.toLowerCase().indexOf(criterionLabel.toLowerCase());

  if (index === -1) return undefined;

  // Extract next 200 characters as help text
  const helpText = text.substring(index + criterionLabel.length, index + criterionLabel.length + 200);

  // Clean up and return first sentence
  const sentences = helpText.split(/[.!?]/);
  if (sentences.length > 0) {
    return sentences[0].trim();
  }

  return undefined;
}

/**
 * Convert parsed template to framework version record
 */
export function templateToFrameworkVersion(
  template: ParsedTemplate,
  templatePath: string
): Omit<FrameworkVersion, 'id' | 'created_at'> {
  return {
    framework_type: template.frameworkType,
    version: template.version,
    effective_from: template.effectiveFrom || new Date().toISOString(),
    effective_to: undefined,
    rules_json: {
      sections: template.sections,
      metadata: template.metadata,
    },
    template_path: templatePath,
  };
}

/**
 * Validate template structure
 */
export interface TemplateValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTemplate(template: ParsedTemplate): TemplateValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check basic structure
  if (!template.version) {
    errors.push('Template version is missing');
  }

  if (template.sections.length === 0) {
    errors.push('No sections found in template');
  }

  if (template.metadata.totalFields === 0) {
    errors.push('No fields found in template');
  }

  // Check for duplicate field IDs
  const fieldIds = new Set<string>();
  for (const section of template.sections) {
    for (const field of section.fields) {
      if (fieldIds.has(field.id)) {
        errors.push(`Duplicate field ID: ${field.id}`);
      }
      fieldIds.add(field.id);
    }
  }

  // Warnings
  if (template.metadata.requiredFields === 0) {
    warnings.push('No required fields found - all fields are optional');
  }

  if (!template.effectiveFrom) {
    warnings.push('No effective date found in template');
  }

  // Check for orphaned conditional fields
  for (const section of template.sections) {
    for (const field of section.fields) {
      if (field.conditionalOn) {
        const parentExists = Array.from(fieldIds).includes(field.conditionalOn.field);
        if (!parentExists) {
          warnings.push(
            `Field ${field.id} has conditional dependency on non-existent field ${field.conditionalOn.field}`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate field extraction patterns from template
 */
export function generateExtractionPatterns(template: ParsedTemplate): Record<string, RegExp[]> {
  const patterns: Record<string, RegExp[]> = {};

  for (const section of template.sections) {
    for (const field of section.fields) {
      const fieldPatterns: RegExp[] = [];

      // Generate patterns based on field label
      const labelWords = field.label.toLowerCase().split(/\s+/);

      // Pattern 1: Label followed by value
      fieldPatterns.push(
        new RegExp(`${field.label}\\s*:?\\s*([^\\n]+)`, 'i')
      );

      // Pattern 2: Label with variations
      if (labelWords.length > 1) {
        const keyWords = labelWords.filter(w => w.length > 3);
        if (keyWords.length > 0) {
          fieldPatterns.push(
            new RegExp(`${keyWords.join('.*')}\\s*:?\\s*([^\\n]+)`, 'i')
          );
        }
      }

      // Pattern 3: For numeric fields, look for numbers
      if (field.type === 'number') {
        fieldPatterns.push(
          new RegExp(`${labelWords[0]}.*?(\\d+(?:[.,]\\d+)?)`, 'i')
        );
      }

      patterns[field.id] = fieldPatterns;
    }
  }

  return patterns;
}
