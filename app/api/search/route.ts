import { NextRequest, NextResponse } from 'next/server';
import { SearchRequestSchema } from '@/lib/schemas/requests';
import { searchClient } from '@/lib/search/flexsearch';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validated = SearchRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { client_id, query, k, filters } = validated.data;

    // Execute search
    const hits = searchClient(client_id, query, k, filters);

    return NextResponse.json({
      hits,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: (error as Error).message,
        },
      },
      { status: 500 }
    );
  }
}
