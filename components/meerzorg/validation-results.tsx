'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ValidationResultsProps {
  applicationId: string;
}

interface ValidationData {
  checks: Array<{
    rule_id: string;
    name: string;
    description: string;
    category: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    checked_at: string;
  }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    by_severity: Record<string, { passed: number; failed: number }>;
    critical_issues: Array<{
      rule_id: string;
      name: string;
      message: string;
    }>;
  };
  recommendation: {
    status: 'ready' | 'needs_revision' | 'blocked';
    message: string;
  };
}

export function ValidationResults({ applicationId }: ValidationResultsProps) {
  const [data, setData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch the latest validation results
    // For now, we'll show a placeholder
    setLoading(false);
  }, [applicationId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<
      string,
      { variant: any; className: string }
    > = {
      critical: { variant: 'destructive', className: 'bg-red-600' },
      high: { variant: 'destructive', className: 'bg-orange-600' },
      medium: { variant: 'default', className: 'bg-yellow-600' },
      low: { variant: 'secondary', className: 'bg-blue-600' },
    };

    const config = variants[severity] || variants.low;

    return (
      <Badge variant={config.variant} className={config.className}>
        {severity}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      required_field: 'Verplicht veld',
      toetsingskader_rule: 'Toetsingskader',
      completeness: 'Compleetheid',
      consistency: 'Consistentie',
    };
    return labels[category] || category;
  };

  const getRecommendationCard = () => {
    if (!data?.recommendation) return null;

    const { status, message } = data.recommendation;
    const config = {
      ready: {
        icon: CheckCircle,
        className: 'border-green-600 bg-green-50',
        iconClassName: 'text-green-600',
        title: 'Gereed voor indienen',
      },
      needs_revision: {
        icon: AlertTriangle,
        className: 'border-yellow-600 bg-yellow-50',
        iconClassName: 'text-yellow-600',
        title: 'Aandacht vereist',
      },
      blocked: {
        icon: AlertCircle,
        className: 'border-red-600 bg-red-50',
        iconClassName: 'text-red-600',
        title: 'Geblokkeerd',
      },
    }[status];

    const Icon = config.icon;

    return (
      <Card className={config.className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.iconClassName}`} />
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{message}</p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validatie resultaten laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Validatie resultaten
          </CardTitle>
          <CardDescription>
            Klik op "Normative checks uitvoeren" om de aanvraag te valideren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nog geen validatie uitgevoerd. Start de normative checks om compleetheid
              en consistentie te controleren.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { checks, summary } = data;
  const passPercentage = (summary.passed / summary.total) * 100;

  return (
    <div className="space-y-6">
      {getRecommendationCard()}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Validatie overzicht
            </span>
            <Badge variant="default">{summary.total} checks uitgevoerd</Badge>
          </CardTitle>
          <CardDescription>
            Toetsingskader compliance en kwaliteitscontroles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Slagingspercentage</span>
              <span className="text-sm text-muted-foreground">
                {passPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={passPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-xs text-muted-foreground">Geslaagd</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-xs text-muted-foreground">Gefaald</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.warnings}
              </div>
              <div className="text-xs text-muted-foreground">Waarschuwingen</div>
            </div>
          </div>

          {summary.by_severity && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Per ernst niveau:</p>
              <div className="space-y-2">
                {['critical', 'high', 'medium', 'low'].map((severity) => {
                  const data = summary.by_severity[severity];
                  if (!data) return null;

                  const total = data.passed + data.failed;
                  if (total === 0) return null;

                  return (
                    <div
                      key={severity}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(severity)}
                        <span className="capitalize">{severity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-green-600">{data.passed}</span>
                        <span>/</span>
                        <span className="text-red-600">{data.failed}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {summary.critical_issues.length > 0 && (
        <Card className="border-red-600 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Kritieke issues ({summary.critical_issues.length})
            </CardTitle>
            <CardDescription>
              Deze issues moeten worden opgelost voordat de aanvraag kan worden
              ingediend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.critical_issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{issue.name}</p>
                    <p className="text-muted-foreground">{issue.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gedetailleerde resultaten</CardTitle>
          <CardDescription>Alle uitgevoerde checks en hun status</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {checks.map((check, i) => (
              <AccordionItem key={i} value={`check-${i}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div className="text-left">
                        <p className="font-medium">{check.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryLabel(check.category)}
                        </p>
                      </div>
                    </div>
                    {getSeverityBadge(check.severity)}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-3 pl-11">
                    <p className="text-sm">{check.description}</p>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Resultaat:</p>
                      <p className="text-sm">{check.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gecontroleerd op:{' '}
                      {new Date(check.checked_at).toLocaleString('nl-NL')}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
