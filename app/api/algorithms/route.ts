import {
  DOMAINS,
  getAlgorithmById,
  getAlgorithmsByDomain,
  SAMPLE_ALGORITHMS,
  searchAlgorithms,
} from '@/lib/data/algoritmes-data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const domain = searchParams.get('domain');
    const riskLevel = searchParams.get('riskLevel');
    const id = searchParams.get('id');

    // Get single algorithm by ID
    if (id) {
      const algorithm = getAlgorithmById(id);
      if (!algorithm) {
        return NextResponse.json(
          { success: false, error: 'Algorithm not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: algorithm,
      });
    }

    // Get algorithms by domain
    if (domain && !query) {
      const algorithms = getAlgorithmsByDomain(domain);
      return NextResponse.json({
        success: true,
        data: {
          algorithms,
          total: algorithms.length,
        },
      });
    }

    // Search algorithms
    if (query) {
      const filters: { domain?: string; riskLevel?: string } = {};
      if (domain) filters.domain = domain;
      if (riskLevel) filters.riskLevel = riskLevel;

      const algorithms = searchAlgorithms(query, filters);
      return NextResponse.json({
        success: true,
        data: {
          algorithms,
          total: algorithms.length,
          query,
          filters,
        },
      });
    }

    // Return all algorithms and domains
    return NextResponse.json({
      success: true,
      data: {
        algorithms: SAMPLE_ALGORITHMS,
        domains: DOMAINS,
        total: SAMPLE_ALGORITHMS.length,
      },
    });
  } catch (error) {
    console.error('Error fetching algorithms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch algorithms' },
      { status: 500 }
    );
  }
}
