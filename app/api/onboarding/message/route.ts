import type { OnboardingContext } from '@/lib/ai/onboarding-services';
import {
  getNextQuestion,
  matchAlgorithms,
  processUserResponse,
} from '@/lib/ai/onboarding-services';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

interface MessageRequest {
  sessionId: string;
  message: string;
  context: OnboardingContext;
}

export async function POST(request: NextRequest) {
  try {
    const body: MessageRequest = await request.json();
    const { sessionId, message, context } = body;

    if (!sessionId || !message || !context) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process the user's response
    const { updatedContext, response } = processUserResponse(message, context);

    const messages = [];

    // Add transition response if moving to solutions phase
    if (response) {
      messages.push({
        id: nanoid(),
        ...response,
        timestamp: new Date().toISOString(),
      });
    }

    // Get next question if still in problem analysis
    if (updatedContext.currentPhase === 'problem_analysis') {
      const nextQuestion = getNextQuestion(updatedContext);
      if (nextQuestion) {
        messages.push({
          id: nanoid(),
          ...nextQuestion,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Generate solutions if entering solutions phase
    let solutions = null;
    if (updatedContext.currentPhase === 'solutions') {
      solutions = matchAlgorithms(updatedContext);
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        context: updatedContext,
        messages,
        solutions,
      },
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
