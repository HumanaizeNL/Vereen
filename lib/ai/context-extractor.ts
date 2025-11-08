// Context extractor for herindicatie evaluation
// Extracts and processes PDF and DOCX files for AI context

import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse-new';
import mammoth from 'mammoth';

export interface DocumentChunk {
  filename: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
  metadata: {
    source: string;
    type: 'pdf' | 'docx';
    pageRange?: string;
  };
}

const CONTEXT_DIR = path.join(process.cwd(), 'herindicatie_context');
const CHUNK_SIZE = 2000; // Characters per chunk for better context retrieval

/**
 * Extract text from PDF file
 */
async function extractPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error extracting PDF ${filePath}:`, error);
    return '';
  }
}

/**
 * Extract text from DOCX file
 */
async function extractDOCX(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    console.error(`Error extracting DOCX ${filePath}:`, error);
    return '';
  }
}

/**
 * Split text into chunks for better retrieval
 */
function chunkText(text: string, chunkSize: number = CHUNK_SIZE): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    currentChunk += paragraph + '\n\n';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Extract and process a single document
 */
async function processDocument(filename: string): Promise<DocumentChunk[]> {
  const filePath = path.join(CONTEXT_DIR, filename);
  const ext = path.extname(filename).toLowerCase();

  let text = '';
  let type: 'pdf' | 'docx';

  if (ext === '.pdf') {
    text = await extractPDF(filePath);
    type = 'pdf';
  } else if (ext === '.docx') {
    text = await extractDOCX(filePath);
    type = 'docx';
  } else {
    console.warn(`Unsupported file type: ${filename}`);
    return [];
  }

  if (!text || text.trim().length === 0) {
    console.warn(`No text extracted from ${filename}`);
    return [];
  }

  const chunks = chunkText(text);

  return chunks.map((content, index) => ({
    filename,
    content,
    chunkIndex: index,
    totalChunks: chunks.length,
    metadata: {
      source: filename,
      type,
    },
  }));
}

/**
 * Extract all documents from herindicatie_context directory
 */
export async function extractAllContextDocuments(): Promise<DocumentChunk[]> {
  console.log('🔍 Extracting context documents from:', CONTEXT_DIR);

  if (!fs.existsSync(CONTEXT_DIR)) {
    console.error(`Context directory not found: ${CONTEXT_DIR}`);
    return [];
  }

  const files = fs.readdirSync(CONTEXT_DIR);
  const documentFiles = files.filter(f =>
    f.endsWith('.pdf') || f.endsWith('.docx')
  );

  console.log(`📄 Found ${documentFiles.length} documents to process`);

  const allChunks: DocumentChunk[] = [];

  for (const file of documentFiles) {
    console.log(`   Processing: ${file}`);
    const chunks = await processDocument(file);
    allChunks.push(...chunks);
    console.log(`   ✓ Extracted ${chunks.length} chunks`);
  }

  console.log(`✅ Total chunks extracted: ${allChunks.length}`);

  return allChunks;
}

/**
 * Simple keyword-based search through context chunks
 * Returns most relevant chunks based on keyword matches
 */
export function searchContextChunks(
  chunks: DocumentChunk[],
  keywords: string[],
  maxResults: number = 5
): DocumentChunk[] {
  if (chunks.length === 0) return [];

  const scoredChunks = chunks.map(chunk => {
    const lowerContent = chunk.content.toLowerCase();
    const lowerKeywords = keywords.map(k => k.toLowerCase());

    // Calculate relevance score based on keyword frequency
    let score = 0;
    for (const keyword of lowerKeywords) {
      const matches = (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
      score += matches;
    }

    return { chunk, score };
  });

  // Sort by score and return top results
  return scoredChunks
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.chunk);
}

/**
 * Get relevant context for a specific criterion
 * Uses simple keyword matching to find relevant chunks
 */
export function getRelevantContext(
  chunks: DocumentChunk[],
  criterion: { label: string; description: string },
  maxChunks: number = 3
): string {
  // Extract keywords from criterion label and description
  const keywords = [
    ...criterion.label.toLowerCase().split(/\s+/),
    ...criterion.description.toLowerCase().split(/\s+/),
  ].filter(word => word.length > 3); // Filter out short words

  const relevantChunks = searchContextChunks(chunks, keywords, maxChunks);

  if (relevantChunks.length === 0) {
    return '';
  }

  return relevantChunks
    .map(chunk => `[${chunk.filename}]\n${chunk.content}`)
    .join('\n\n---\n\n');
}

/**
 * Cache for extracted context to avoid re-processing
 */
let cachedContextChunks: DocumentChunk[] | null = null;

/**
 * Get cached context chunks or extract them if not cached
 */
export async function getCachedContextChunks(): Promise<DocumentChunk[]> {
  if (cachedContextChunks === null) {
    console.log('📚 Loading herindicatie context (first time)...');
    cachedContextChunks = await extractAllContextDocuments();
  }
  return cachedContextChunks;
}

/**
 * Clear the context cache (useful for testing or if documents are updated)
 */
export function clearContextCache(): void {
  cachedContextChunks = null;
}
