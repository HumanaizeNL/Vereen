import type { OnboardingContext } from '@/lib/ai/onboarding-services';
import {
  generateImplementationPlanForAlgorithm,
  matchAlgorithms,
} from '@/lib/ai/onboarding-services';
import { getAlgorithmById } from '@/lib/data/algoritmes-data';
import { NextRequest, NextResponse } from 'next/server';

interface SolutionsRequest {
  sessionId: string;
  context: OnboardingContext;
  selectedAlgorithmId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SolutionsRequest = await request.json();
    const { sessionId, context, selectedAlgorithmId } = body;

    if (!sessionId || !context) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If an algorithm is selected, generate implementation plan
    if (selectedAlgorithmId) {
      const algorithm = getAlgorithmById(selectedAlgorithmId);
      if (!algorithm) {
        return NextResponse.json(
          { success: false, error: 'Algorithm not found' },
          { status: 404 }
        );
      }

      const implementationPlan = generateImplementationPlanForAlgorithm(algorithm, context);

      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          selectedAlgorithm: algorithm,
          implementationPlan,
        },
      });
    }

    // Otherwise, return matched solutions
    const solutions = matchAlgorithms(context);

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        solutions,
      },
    });
  } catch (error) {
    console.error('Error processing solutions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process solutions' },
      { status: 500 }
    );
  }
}
