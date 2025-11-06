'use client';

import { useState } from 'react';
import { Activity, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface VV8AssessmentProps {
  clientId: string;
}

interface VV8Criterion {
  id: string;
  label: string;
  status: string;
  argument: string;
  evidence: Array<{
    source: string;
    snippet: string;
    date: string;
  }>;
  confidence: number;
  recommendation?: string;
}

interface AssessmentResult {
  criteria: VV8Criterion[];
  summary: {
    total: number;
    voldoet: number;
    niet_voldoet: number;
    onvoldoende_bewijs: number;
    toegenomen_behoefte: number;
    verslechterd: number;
  };
  recommendation: {
    action: string;
    message: string;
  };
}

export function VV8Assessment({ clientId }: VV8AssessmentProps) {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAssess = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/vv8/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          include_ai_assessment: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assess VV8 criteria');
      }

      const data = await response.json();
      setAssessment(data);
    } catch (error) {
      console.error('Error assessing VV8:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'voldoet':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'niet_voldoet':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'toegenomen_behoefte':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'verslechterd':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      voldoet: { variant: 'default' as const, className: 'bg-green-600' },
      niet_voldoet: { variant: 'destructive' as const, className: '' },
      onvoldoende_bewijs: { variant: 'secondary' as const, className: '' },
      toegenomen_behoefte: { variant: 'default' as const, className: 'bg-yellow-600' },
      verslechterd: { variant: 'destructive' as const, className: 'bg-red-600' },
    };

    const config = variants[status as keyof typeof variants] || variants.onvoldoende_bewijs;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getRecommendationCard = () => {
    if (!assessment) return null;

    const { action, message } = assessment.recommendation;

    const config = {
      continue: {
        className: 'border-green-600 bg-green-50',
        title: 'Voortzetten',
      },
      monitor: {
        className: 'border-yellow-600 bg-yellow-50',
        title: 'Monitoring',
      },
      reassess: {
        className: 'border-orange-600 bg-orange-50',
        title: 'Herindicatie Adviseren',
      },
      urgent_reassess: {
        className: 'border-red-600 bg-red-50',
        title: 'Spoedherindicatie',
      },
    }[action] || { className: '', title: 'Aanbeveling' };

    return (
      <Card className={config.className}>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{message}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                VV8 Criteria Assessment
              </CardTitle>
              <CardDescription>
                Beoordeel alle 8 VV8 criteria voor herindicatie
              </CardDescription>
            </div>
            <Button onClick={handleAssess} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              {loading ? 'Beoordelen...' : 'VV8 Beoordelen'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!assessment && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Klik op "VV8 Beoordelen" om automatische assessment uit te voeren</p>
            </div>
          )}
        </CardContent>
      </Card>

      {assessment && (
        <>
          {getRecommendationCard()}

          <Card>
            <CardHeader>
              <CardTitle>Samenvatting</CardTitle>
              <CardDescription>Overzicht van alle VV8 criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {assessment.summary.voldoet}
                  </div>
                  <div className="text-xs text-muted-foreground">Voldoet</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">
                    {assessment.summary.verslechterd}
                  </div>
                  <div className="text-xs text-muted-foreground">Verslechterd</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {assessment.summary.toegenomen_behoefte}
                  </div>
                  <div className="text-xs text-muted-foreground">Toegenomen</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">
                    {assessment.summary.niet_voldoet}
                  </div>
                  <div className="text-xs text-muted-foreground">Niet voldoet</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-600">
                    {assessment.summary.onvoldoende_bewijs}
                  </div>
                  <div className="text-xs text-muted-foreground">Onvold. bewijs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {assessment.summary.total}
                  </div>
                  <div className="text-xs text-muted-foreground">Totaal</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Criteria Details</CardTitle>
              <CardDescription>Gedetailleerde beoordeling per criterium</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {assessment.criteria.map((criterion, i) => (
                  <AccordionItem key={i} value={`criterion-${i}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(criterion.status)}
                          <div className="text-left">
                            <p className="font-medium">{criterion.label}</p>
                          </div>
                        </div>
                        {getStatusBadge(criterion.status)}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-3 pl-11">
                        <div>
                          <p className="text-sm font-medium mb-1">Argumentatie:</p>
                          <p className="text-sm">{criterion.argument}</p>
                        </div>

                        {criterion.evidence.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Bewijs:</p>
                            <div className="space-y-2">
                              {criterion.evidence.map((ev, idx) => (
                                <div key={idx} className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-start justify-between mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      {ev.source}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(ev.date).toLocaleDateString('nl-NL')}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2">{ev.snippet}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {criterion.recommendation && (
                          <div className="pt-2 border-t">
                            <p className="text-sm">
                              <span className="font-medium">Aanbeveling: </span>
                              {criterion.recommendation}
                            </p>
                          </div>
                        )}

                        <div className="pt-2 border-t text-xs text-muted-foreground">
                          Betrouwbaarheid: {(criterion.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
