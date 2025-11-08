// API endpoint for managing herindicatie evaluation context
// GET /api/herindicatie/context - Get context statistics and test extraction
// POST /api/herindicatie/context/search - Search context for specific keywords

import { NextRequest, NextResponse } from 'next/server';
import {
  extractAllContextDocuments,
  getCachedContextChunks,
  clearContextCache,
  searchContextChunks,
  getRelevantContext,
} from '@/lib/ai/context-extractor';

/**
 * GET - Load and return context statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'reload') {
      // Clear cache and reload
      clearContextCache();
      console.log('🔄 Context cache cleared, reloading...');
    }

    const chunks = await getCachedContextChunks();

    // Group by filename
    const fileStats = chunks.reduce((acc, chunk) => {
      if (!acc[chunk.filename]) {
        acc[chunk.filename] = {
          filename: chunk.filename,
          type: chunk.metadata.type,
          chunks: 0,
          totalChars: 0,
        };
      }
      acc[chunk.filename].chunks++;
      acc[chunk.filename].totalChars += chunk.content.length;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      statistics: {
        total_documents: Object.keys(fileStats).length,
        total_chunks: chunks.length,
        total_characters: chunks.reduce((sum, c) => sum + c.content.length, 0),
      },
      documents: Object.values(fileStats),
    });
  } catch (error) {
    console.error('Error loading context:', error);
    return NextResponse.json(
      {
        error: 'Failed to load context',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Search context with keywords
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, criterion, maxResults = 5 } = body;

    if (!keywords && !criterion) {
      return NextResponse.json(
        { error: 'Either keywords array or criterion object is required' },
        { status: 400 }
      );
    }

    const chunks = await getCachedContextChunks();

    let results;

    if (criterion) {
      // Search using criterion
      const relevantContext = getRelevantContext(chunks, criterion, maxResults);
      results = {
        type: 'criterion_search',
        criterion,
        context: relevantContext,
      };
    } else {
      // Search using keywords
      const matchedChunks = searchContextChunks(chunks, keywords, maxResults);
      results = {
        type: 'keyword_search',
        keywords,
        matched_chunks: matchedChunks.map(chunk => ({
          filename: chunk.filename,
          content_preview: chunk.content.substring(0, 200) + '...',
          chunk_index: chunk.chunkIndex,
          total_chunks: chunk.totalChunks,
        })),
        total_matches: matchedChunks.length,
      };
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Error searching context:', error);
    return NextResponse.json(
      {
        error: 'Failed to search context',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
