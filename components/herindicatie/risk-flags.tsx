'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RiskFlagsProps {
  clientId: string;
}

interface RiskFlag {
  id: string;
  flag_type: string;
  severity: string;
  description: string;
  evidence?: string[];
  recommended_actions?: string[];
  flagged_at: string;
  resolved_at?: string;
}

interface FlagResult {
  risks_detected: number;
  flags: RiskFlag[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function RiskFlags({ clientId }: RiskFlagsProps) {
  const [flags, setFlags] = useState<RiskFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, [clientId]);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      // In a real app, this would be GET /api/risks?client_id=...
      // For now, we'll just show empty state
      setFlags([]);
    } catch (error) {
      console.error('Error fetching risk flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectRisks = async () => {
    setDetecting(true);

    try {
      const response = await fetch('/api/risks/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          auto_detect: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to detect risks');
      }

      const data: FlagResult = await response.json();
      setFlags(data.flags);
    } catch (error) {
      console.error('Error detecting risks:', error);
    } finally {
      setDetecting(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: { variant: 'destructive' as const, className: 'bg-red-600' },
      high: { variant: 'destructive' as const, className: 'bg-orange-600' },
      medium: { variant: 'default' as const, className: 'bg-yellow-600' },
      low: { variant: 'secondary' as const, className: 'bg-blue-600' },
    };

    const config = variants[severity as keyof typeof variants] || variants.low;

    return (
      <Badge variant={config.variant} className={config.className}>
        {severity}
      </Badge>
    );
  };

  const getTypeLabel = (flagType: string) => {
    const labels = {
      increased_care: 'Toegenomen Zorgbehoefte',
      high_incidents: 'Hoog Aantal Incidenten',
      deteriorating_adl: 'Achteruitgang ADL',
      other: 'Overig',
    } as const;

    return labels[flagType as keyof typeof labels] || flagType;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Risk flags laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeFlags = flags.filter(f => !f.resolved_at);
  const resolvedFlags = flags.filter(f => f.resolved_at);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Flagging
              </CardTitle>
              <CardDescription>
                Automatische detectie van risico's en zorgelijke trends
              </CardDescription>
            </div>
            <Button
              onClick={handleDetectRisks}
              disabled={detecting}
              className="gap-2"
            >
              {detecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flag className="h-4 w-4" />
              )}
              {detecting ? 'Detecteren...' : 'Risks Detecteren'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeFlags.length === 0 && !detecting && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium">Geen actieve risk flags</p>
              <p className="text-muted-foreground mt-1">
                Klik op "Risks Detecteren" om automatische detectie uit te voeren
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {activeFlags.length > 0 && (
        <Card className="border-red-600">
          <CardHeader>
            <CardTitle className="text-red-600">
              Actieve Waarschuwingen ({activeFlags.length})
            </CardTitle>
            <CardDescription>
              Deze risks vereisen aandacht en mogelijk actie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeFlags.map((flag) => (
              <Card key={flag.id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">
                          {getTypeLabel(flag.flag_type)}
                        </CardTitle>
                        {getSeverityBadge(flag.severity)}
                      </div>
                      <CardDescription>{flag.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {flag.evidence && flag.evidence.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Bewijs:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {flag.evidence.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {flag.recommended_actions && flag.recommended_actions.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Aanbevolen Acties:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {flag.recommended_actions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Gemeld op: {new Date(flag.flagged_at).toLocaleDateString('nl-NL')}
                    </span>
                    <Button variant="outline" size="sm">
                      Markeer als opgelost
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {resolvedFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              Opgeloste Waarschuwingen ({resolvedFlags.length})
            </CardTitle>
            <CardDescription>Eerder gedetecteerde risks die zijn opgelost</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {resolvedFlags.map((flag) => (
              <div
                key={flag.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{getTypeLabel(flag.flag_type)}</p>
                  <p className="text-xs text-muted-foreground">{flag.description}</p>
                </div>
                <div className="text-right">
                  <CheckCircle className="h-5 w-5 text-green-600 inline mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Opgelost: {flag.resolved_at && new Date(flag.resolved_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
