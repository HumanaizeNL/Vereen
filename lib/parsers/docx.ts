import mammoth from 'mammoth';

export interface DOCXParseResult {
  type: 'docx' | 'rtf';
  text: string;
  warnings: string[];
}

export async function parseDOCX(file: File): Promise<DOCXParseResult> {
  const warnings: string[] = [];

  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse DOCX with mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.messages.length > 0) {
      result.messages.forEach((msg) => {
        warnings.push(`${msg.type}: ${msg.message}`);
      });
    }

    return {
      type: file.name.toLowerCase().endsWith('.rtf') ? 'rtf' : 'docx',
      text: result.value,
      warnings,
    };
  } catch (error) {
    warnings.push(`DOCX parsing error: ${(error as Error).message}`);
    return {
      type: 'docx',
      text: '',
      warnings,
    };
  }
}

// Helper to split DOCX text into searchable chunks
export function splitDOCXIntoChunks(
  text: string,
  chunkSize = 500
): Array<{ snippet: string }> {
  const chunks: Array<{ snippet: string }> = [];

  // Split by paragraphs (double newline)
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0);

  let currentChunk = '';

  for (const para of paragraphs) {
    if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        snippet: currentChunk.trim(),
      });
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      snippet: currentChunk.trim(),
    });
  }

  return chunks;
}
