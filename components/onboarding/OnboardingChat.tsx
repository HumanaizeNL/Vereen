'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MatchedSolution, OnboardingContext } from '@/lib/ai/onboarding-services';
import {
  createInitialContext,
  createWelcomeMessage,
  generateContextSummary,
  generateImplementationPlanForAlgorithm,
  getNextQuestion,
  matchAlgorithms,
  processUserResponse,
} from '@/lib/ai/onboarding-services';
import { getAlgorithmById } from '@/lib/data/algoritmes-data';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  Lightbulb,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage, type ChatMessageProps } from './ChatMessage';
import { ImplementationTimeline } from './ImplementationTimeline';
import { SolutionCard } from './SolutionCard';

interface Message extends ChatMessageProps {
  id: string;
  messageType?: 'text' | 'question' | 'solution_list' | 'implementation_plan';
  metadata?: Record<string, unknown>;
}

export function OnboardingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<OnboardingContext>(createInitialContext());
  const [solutions, setSolutions] = useState<MatchedSolution[]>([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [implementationPlan, setImplementationPlan] = useState<ReturnType<typeof generateImplementationPlanForAlgorithm> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, solutions, implementationPlan, scrollToBottom]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMsg = createWelcomeMessage();
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMsg.content,
        timestamp: new Date(),
        messageType: welcomeMsg.messageType,
        metadata: welcomeMsg.metadata,
      },
    ]);
  }, []);

  // Handle user message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      messageType: 'text',
    };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Process response based on current phase
    if (context.currentPhase === 'problem_analysis') {
      const { updatedContext, response } = processUserResponse(userMessage, context);
      setContext(updatedContext);

      if (response) {
        // Transitioning to solutions phase
        setMessages(prev => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.content,
            timestamp: new Date(),
            messageType: response.messageType,
          },
        ]);

        // Generate solutions
        const matched = matchAlgorithms(updatedContext);
        setSolutions(matched);
      } else {
        // Get next question
        const nextQuestion = getNextQuestion(updatedContext);
        if (nextQuestion) {
          setMessages(prev => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: nextQuestion.content,
              timestamp: new Date(),
              messageType: nextQuestion.messageType,
              metadata: nextQuestion.metadata,
            },
          ]);
        }
      }
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  // Handle solution selection
  const handleSelectSolution = (algorithmId: string) => {
    setSelectedSolutionId(algorithmId);

    const algorithm = getAlgorithmById(algorithmId);
    if (algorithm) {
      const plan = generateImplementationPlanForAlgorithm(algorithm, context);
      setImplementationPlan(plan);
      setContext(prev => ({ ...prev, currentPhase: 'implementation' }));

      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          role: 'system',
          content: `U heeft "${algorithm.name}" geselecteerd`,
          timestamp: new Date(),
          messageType: 'text',
        },
      ]);
    }
  };

  // Reset conversation
  const handleReset = () => {
    setMessages([]);
    setContext(createInitialContext());
    setSolutions([]);
    setSelectedSolutionId(null);
    setImplementationPlan(null);

    // Re-initialize with welcome message
    const welcomeMsg = createWelcomeMessage();
    setMessages([
      {
        id: 'welcome-new',
        role: 'assistant',
        content: welcomeMsg.content,
        timestamp: new Date(),
        messageType: welcomeMsg.messageType,
        metadata: welcomeMsg.metadata,
      },
    ]);
  };

  // Get phase indicator
  const getPhaseInfo = () => {
    switch (context.currentPhase) {
      case 'problem_analysis':
        return { label: 'Fase 1: Probleemanalyse', icon: Lightbulb, progress: 33 };
      case 'solutions':
        return { label: 'Fase 2: Oplossingsvoorstellen', icon: FileText, progress: 66 };
      case 'implementation':
        return { label: 'Fase 3: Implementatieplan', icon: CheckCircle2, progress: 100 };
    }
  };

  const phaseInfo = getPhaseInfo();
  const selectedAlgorithm = selectedSolutionId ? getAlgorithmById(selectedSolutionId) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header with phase indicator */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">AI Onboarding Assistent</h2>
              <p className="text-sm text-muted-foreground">{phaseInfo.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress bar */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${phaseInfo.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{phaseInfo.progress}%</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Opnieuw
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* Messages */}
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <ChatMessage role="assistant" content="" isLoading />
          )}

          {/* Solutions display */}
          {context.currentPhase === 'solutions' && solutions.length > 0 && !selectedSolutionId && (
            <div className="space-y-4">
              {/* Context summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Uw situatie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm whitespace-pre-line">
                    {generateContextSummary(context)}
                  </div>
                </CardContent>
              </Card>

              {/* Solutions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Aanbevolen AI-oplossingen ({solutions.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {solutions.map(solution => (
                    <SolutionCard
                      key={solution.algorithm.id}
                      algorithm={solution.algorithm}
                      matchScore={solution.matchScore}
                      matchReason={solution.matchReason}
                      rank={solution.rank}
                      isSelected={selectedSolutionId === solution.algorithm.id}
                      onSelect={handleSelectSolution}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Implementation plan display */}
          {context.currentPhase === 'implementation' && implementationPlan && selectedAlgorithm && (
            <div className="space-y-4">
              {/* Selected solution summary */}
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Geselecteerde oplossing
                      </CardTitle>
                      <CardDescription>{selectedAlgorithm.name}</CardDescription>
                    </div>
                    <Badge variant={selectedAlgorithm.riskLevel === 'hoog' ? 'destructive' : selectedAlgorithm.riskLevel === 'beperkt' ? 'warning' : 'success'}>
                      {selectedAlgorithm.riskLevel === 'hoog' ? 'Hoog Risico' : selectedAlgorithm.riskLevel === 'beperkt' ? 'Beperkt Risico' : 'Minimaal Risico'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{selectedAlgorithm.description}</p>

                  {implementationPlan.customRecommendations.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-medium text-amber-800 mb-2">Specifieke aanbevelingen voor uw situatie:</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {implementationPlan.customRecommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Geschatte doorlooptijd:</span>
                      <Badge variant="outline">{implementationPlan.estimatedDuration}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Implementation timeline */}
              <ImplementationTimeline
                steps={implementationPlan.steps}
                roles={implementationPlan.roles}
                compliance={implementationPlan.compliance}
                algorithmName={selectedAlgorithm.name}
                riskLevel={selectedAlgorithm.riskLevel}
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - only show during problem analysis */}
      {context.currentPhase === 'problem_analysis' && (
        <div className="border-t bg-background p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Typ uw antwoord..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <Button type="submit" disabled={!inputValue.trim() || isLoading}>
                <Send className="w-4 h-4 mr-2" />
                Verstuur
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Action buttons for solutions phase */}
      {context.currentPhase === 'solutions' && !selectedSolutionId && (
        <div className="border-t bg-background p-4">
          <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
            Selecteer een oplossing hierboven om het implementatieplan te bekijken
          </div>
        </div>
      )}
    </div>
  );
}
