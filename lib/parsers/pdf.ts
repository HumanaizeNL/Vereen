import pdf from 'pdf-parse-new';

export interface PDFParseResult {
  pages: number;
  type: 'pdf';
  text: string;
  warnings: string[];
}

export async function parsePDF(file: File): Promise<PDFParseResult> {
  const warnings: string[] = [];

  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF
    const data = await pdf(buffer);

    return {
      pages: data.numpages,
      type: 'pdf',
      text: data.text,
      warnings,
    };
  } catch (error) {
    warnings.push(`PDF parsing error: ${(error as Error).message}`);
    return {
      pages: 0,
      type: 'pdf',
      text: '',
      warnings,
    };
  }
}

// Helper to split PDF text into searchable chunks
export function splitPDFIntoChunks(
  text: string,
  chunkSize = 500
): Array<{ page: number; snippet: string }> {
  const chunks: Array<{ page: number; snippet: string }> = [];

  // Simple chunking by paragraph
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        page: Math.floor(chunkIndex / 2) + 1, // Rough page estimation
        snippet: currentChunk.trim(),
      });
      currentChunk = para;
      chunkIndex++;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      page: Math.floor(chunkIndex / 2) + 1,
      snippet: currentChunk.trim(),
    });
  }

  return chunks;
}
