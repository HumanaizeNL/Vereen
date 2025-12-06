// AI services for the Onboarding Assistant
import type { Algorithm } from '@/lib/data/algoritmes-data';
import { SAMPLE_ALGORITHMS, searchAlgorithms } from '@/lib/data/algoritmes-data';
import { generateImplementationPlan, getComplianceByRiskLevel, getRolesByRiskLevel } from '@/lib/data/vng-governance';

// Types for the onboarding flow
export interface OnboardingContext {
  organizationType?: string;
  organizationName?: string;
  problemDescription?: string;
  domain?: string;
  dataAvailability?: string[];
  priorities?: string[];
  constraints?: string[];
  currentPhase: 'problem_analysis' | 'solutions' | 'implementation';
  questionIndex: number;
}

export interface MatchedSolution {
  algorithm: Algorithm;
  matchScore: number;
  matchReason: string;
  rank: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: 'text' | 'question' | 'solution_list' | 'implementation_plan';
  metadata?: Record<string, unknown>;
}

// Predefined questions for problem analysis
const ANALYSIS_QUESTIONS = [
  {
    id: 'welcome',
    question: 'Welkom bij de AI Onboarding Assistent! Ik help u bij het vinden van een passende AI-oplossing voor uw organisatie. Wat is het hoofdprobleem of de uitdaging waar u een AI-oplossing voor zoekt?',
    extractField: 'problemDescription',
  },
  {
    id: 'organization',
    question: 'Bij wat voor type organisatie werkt u? (bijv. gemeente, zorginstelling, onderwijsinstelling, ministerie)',
    extractField: 'organizationType',
  },
  {
    id: 'domain',
    question: 'In welk domein valt uw vraagstuk? Kies uit:\n\n1. Zorg en Welzijn\n2. Onderwijs\n3. Veiligheid en Handhaving\n4. Ruimtelijke Ordening\n5. Financiën en Belastingen\n6. Werk en Inkomen\n7. Milieu en Duurzaamheid\n8. Burgerzaken\n9. Communicatie en Dienstverlening\n10. Bedrijfsvoering',
    extractField: 'domain',
    options: [
      'Zorg en Welzijn',
      'Onderwijs',
      'Veiligheid en Handhaving',
      'Ruimtelijke Ordening',
      'Financiën en Belastingen',
      'Werk en Inkomen',
      'Milieu en Duurzaamheid',
      'Burgerzaken',
      'Communicatie en Dienstverlening',
      'Bedrijfsvoering',
    ],
  },
  {
    id: 'data',
    question: 'Welke data heeft u beschikbaar voor een AI-oplossing? (bijv. persoonsgegevens, documenten, sensordata, historische gegevens)',
    extractField: 'dataAvailability',
  },
  {
    id: 'priorities',
    question: 'Wat zijn uw belangrijkste prioriteiten bij de keuze voor een AI-oplossing? (bijv. privacy, snelheid, kosten, gebruiksgemak, compliance)',
    extractField: 'priorities',
  },
];

// Get the next question based on context
export function getNextQuestion(context: OnboardingContext): ConversationMessage | null {
  if (context.currentPhase !== 'problem_analysis') {
    return null;
  }

  const question = ANALYSIS_QUESTIONS[context.questionIndex];
  if (!question) {
    return null;
  }

  return {
    role: 'assistant',
    content: question.question,
    messageType: 'question',
    metadata: {
      questionId: question.id,
      extractField: question.extractField,
      options: question.options,
    },
  };
}

// Parse domain from user input
function parseDomain(input: string): string | undefined {
  const domainMap: Record<string, string> = {
    '1': 'Zorg en Welzijn',
    '2': 'Onderwijs',
    '3': 'Veiligheid en Handhaving',
    '4': 'Ruimtelijke Ordening',
    '5': 'Financiën en Belastingen',
    '6': 'Werk en Inkomen',
    '7': 'Milieu en Duurzaamheid',
    '8': 'Burgerzaken',
    '9': 'Communicatie en Dienstverlening',
    '10': 'Bedrijfsvoering',
    'zorg': 'Zorg en Welzijn',
    'welzijn': 'Zorg en Welzijn',
    'onderwijs': 'Onderwijs',
    'veiligheid': 'Veiligheid en Handhaving',
    'handhaving': 'Veiligheid en Handhaving',
    'ruimte': 'Ruimtelijke Ordening',
    'financien': 'Financiën en Belastingen',
    'belasting': 'Financiën en Belastingen',
    'werk': 'Werk en Inkomen',
    'inkomen': 'Werk en Inkomen',
    'milieu': 'Milieu en Duurzaamheid',
    'duurzaamheid': 'Milieu en Duurzaamheid',
    'burger': 'Burgerzaken',
    'communicatie': 'Communicatie en Dienstverlening',
    'dienstverlening': 'Communicatie en Dienstverlening',
    'bedrijf': 'Bedrijfsvoering',
    'bedrijfsvoering': 'Bedrijfsvoering',
  };

  const inputLower = input.toLowerCase().trim();
  return domainMap[inputLower] || ANALYSIS_QUESTIONS[2].options?.find(d =>
    d.toLowerCase().includes(inputLower) || inputLower.includes(d.toLowerCase())
  );
}

// Process user response and update context
export function processUserResponse(
  userMessage: string,
  context: OnboardingContext
): { updatedContext: OnboardingContext; response?: ConversationMessage } {
  const currentQuestion = ANALYSIS_QUESTIONS[context.questionIndex];
  const updatedContext = { ...context };

  if (currentQuestion) {
    // Extract the relevant field from user response
    switch (currentQuestion.extractField) {
      case 'problemDescription':
        updatedContext.problemDescription = userMessage;
        break;
      case 'organizationType':
        updatedContext.organizationType = userMessage;
        break;
      case 'domain':
        updatedContext.domain = parseDomain(userMessage);
        break;
      case 'dataAvailability':
        updatedContext.dataAvailability = userMessage.split(',').map(s => s.trim());
        break;
      case 'priorities':
        updatedContext.priorities = userMessage.split(',').map(s => s.trim());
        break;
    }

    updatedContext.questionIndex += 1;
  }

  // Check if we've completed all questions
  if (updatedContext.questionIndex >= ANALYSIS_QUESTIONS.length) {
    updatedContext.currentPhase = 'solutions';
    return {
      updatedContext,
      response: {
        role: 'assistant',
        content: 'Bedankt voor uw antwoorden! Op basis van uw situatie heb ik enkele AI-oplossingen gevonden die mogelijk passen bij uw vraagstuk. Hieronder vindt u de voorgestelde oplossingen uit het Algoritmeregister.',
        messageType: 'text',
      },
    };
  }

  return { updatedContext };
}

// Match algorithms to user context
export function matchAlgorithms(context: OnboardingContext): MatchedSolution[] {
  const matchedSolutions: MatchedSolution[] = [];

  // Search based on problem description
  const problemKeywords = context.problemDescription?.toLowerCase().split(' ') || [];

  for (const algorithm of SAMPLE_ALGORITHMS) {
    let score = 0;
    const reasons: string[] = [];

    // Domain match (high weight)
    if (context.domain && algorithm.domain === context.domain) {
      score += 0.4;
      reasons.push(`Past binnen het domein "${context.domain}"`);
    } else if (context.domain && algorithm.domain.toLowerCase().includes(context.domain.toLowerCase())) {
      score += 0.2;
      reasons.push(`Gerelateerd aan het domein "${context.domain}"`);
    }

    // Problem description match
    const searchText = [
      algorithm.name,
      algorithm.description,
      algorithm.shortDescription,
      ...algorithm.tags,
      ...algorithm.useCases,
    ].join(' ').toLowerCase();

    let keywordMatches = 0;
    for (const keyword of problemKeywords) {
      if (keyword.length > 3 && searchText.includes(keyword)) {
        keywordMatches++;
      }
    }
    if (keywordMatches > 0) {
      const keywordScore = Math.min(keywordMatches * 0.1, 0.3);
      score += keywordScore;
      reasons.push(`${keywordMatches} relevante zoektermen gevonden in beschrijving`);
    }

    // Organization type match
    if (context.organizationType) {
      const orgLower = context.organizationType.toLowerCase();
      if (
        (orgLower.includes('gemeente') && algorithm.organization.toLowerCase().includes('gemeente')) ||
        (orgLower.includes('zorg') && algorithm.domain === 'Zorg en Welzijn') ||
        (orgLower.includes('onderwijs') && algorithm.domain === 'Onderwijs')
      ) {
        score += 0.15;
        reasons.push(`Geschikt voor ${context.organizationType}`);
      }
    }

    // Priorities match
    if (context.priorities) {
      for (const priority of context.priorities) {
        const prioLower = priority.toLowerCase();
        if (prioLower.includes('privacy') && algorithm.riskLevel === 'minimaal') {
          score += 0.1;
          reasons.push('Laag privacyrisico');
        }
        if (prioLower.includes('compliance') && algorithm.aiActCategory) {
          score += 0.05;
          reasons.push('AI-verordening classificatie beschikbaar');
        }
      }
    }

    // Only include if there's a reasonable match
    if (score >= 0.2 || (context.domain && algorithm.domain === context.domain)) {
      matchedSolutions.push({
        algorithm,
        matchScore: Math.min(score, 1.0),
        matchReason: reasons.length > 0 ? reasons.join('. ') : 'Algemene match op basis van domein en functionaliteit',
        rank: 0,
      });
    }
  }

  // Sort by score and assign ranks
  matchedSolutions.sort((a, b) => b.matchScore - a.matchScore);
  matchedSolutions.forEach((solution, index) => {
    solution.rank = index + 1;
  });

  // Return top 5
  return matchedSolutions.slice(0, 5);
}

// Generate implementation plan for selected algorithm
export function generateImplementationPlanForAlgorithm(algorithm: Algorithm, context: OnboardingContext) {
  const { steps, roles, compliance, summary } = generateImplementationPlan(
    algorithm.riskLevel,
    { name: algorithm.name, domain: algorithm.domain }
  );

  // Add context-specific recommendations
  const customRecommendations: string[] = [];

  if (context.organizationType?.toLowerCase().includes('gemeente')) {
    customRecommendations.push(
      'Als gemeente bent u verplicht om impactvolle algoritmen te registreren in het Algoritmeregister van de overheid.'
    );
  }

  if (algorithm.riskLevel === 'hoog') {
    customRecommendations.push(
      'Dit is een hoog-risico AI-systeem. U moet vóór 2 augustus 2026 voldoen aan de conformiteitseisen uit de AI-verordening.'
    );
  }

  if (context.priorities?.some(p => p.toLowerCase().includes('privacy'))) {
    customRecommendations.push(
      'Gezien uw prioriteit voor privacy adviseren wij om vroeg in het traject een DPIA uit te voeren.'
    );
  }

  return {
    steps,
    roles,
    compliance,
    summary,
    customRecommendations,
    estimatedDuration: algorithm.riskLevel === 'hoog' ? '6-12 maanden' :
                       algorithm.riskLevel === 'beperkt' ? '3-6 maanden' : '1-3 maanden',
  };
}

// Create initial context
export function createInitialContext(): OnboardingContext {
  return {
    currentPhase: 'problem_analysis',
    questionIndex: 0,
  };
}

// Create welcome message
export function createWelcomeMessage(): ConversationMessage {
  return {
    role: 'assistant',
    content: ANALYSIS_QUESTIONS[0].question,
    messageType: 'question',
    metadata: {
      questionId: ANALYSIS_QUESTIONS[0].id,
      extractField: ANALYSIS_QUESTIONS[0].extractField,
    },
  };
}

// Generate summary of collected information
export function generateContextSummary(context: OnboardingContext): string {
  const parts: string[] = [];

  if (context.problemDescription) {
    parts.push(`**Probleem:** ${context.problemDescription}`);
  }
  if (context.organizationType) {
    parts.push(`**Organisatie:** ${context.organizationType}`);
  }
  if (context.domain) {
    parts.push(`**Domein:** ${context.domain}`);
  }
  if (context.dataAvailability?.length) {
    parts.push(`**Beschikbare data:** ${context.dataAvailability.join(', ')}`);
  }
  if (context.priorities?.length) {
    parts.push(`**Prioriteiten:** ${context.priorities.join(', ')}`);
  }

  return parts.join('\n');
}
