import { createInitialContext, createWelcomeMessage } from '@/lib/ai/onboarding-services';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create new session
    const sessionId = nanoid();
    const context = createInitialContext();
    const welcomeMessage = createWelcomeMessage();

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        context,
        message: {
          id: nanoid(),
          ...welcomeMessage,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error starting onboarding session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start onboarding session' },
      { status: 500 }
    );
  }
}
