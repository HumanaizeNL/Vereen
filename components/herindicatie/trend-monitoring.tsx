'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2, RefreshCw } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrendMonitoringProps {
  clientId: string;
}

interface TrendAnalysis {
  metric_type: string;
  data_points: Array<{ date: string; value: number }>;
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  change_percentage: number;
  significance: 'low' | 'medium' | 'high';
  recommendation?: string;
}

interface AnalysisResult {
  period: {
    start: string;
    end: string;
    months: number;
  };
  trends: TrendAnalysis[];
  assessment: {
    status: 'stable' | 'needs_attention' | 'urgent';
    summary: string;
    recommendations: string[];
  };
}

export function TrendMonitoring({ clientId }: TrendMonitoringProps) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [periodMonths, setPeriodMonths] = useState('6');

  const handleAnalyze = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          period_months: parseInt(periodMonths),
          metric_types: ['care_hours', 'incident_count', 'adl_score', 'bpsd_score'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze trends');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Error analyzing trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'decreasing':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'stable':
        return <Minus className="h-5 w-5 text-green-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSignificanceBadge = (significance: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    } as const;

    return (
      <Badge variant={variants[significance as keyof typeof variants] || 'secondary'}>
        {significance}
      </Badge>
    );
  };

  const getMetricLabel = (metricType: string) => {
    const labels = {
      care_hours: 'Zorguren',
      incident_count: 'Incidenten',
      adl_score: 'ADL Score',
      bpsd_score: 'BPSD Score',
    } as const;

    return labels[metricType as keyof typeof labels] || metricType;
  };

  const getAssessmentCard = () => {
    if (!analysisResult) return null;

    const { status, summary, recommendations } = analysisResult.assessment;

    const config = {
      stable: {
        className: 'border-green-600 bg-green-50',
        title: 'Situatie Stabiel',
      },
      needs_attention: {
        className: 'border-yellow-600 bg-yellow-50',
        title: 'Aandacht Vereist',
      },
      urgent: {
        className: 'border-red-600 bg-red-50',
        title: 'Urgent',
      },
    }[status];

    return (
      <Card className={config.className}>
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{summary}</p>
          {recommendations.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Aanbevelingen:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analyse
          </CardTitle>
          <CardDescription>
            Analyseer trends in zorgbehoefte en incidenten over tijd
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Analyse Periode</label>
              <Select value={periodMonths} onValueChange={setPeriodMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 maanden</SelectItem>
                  <SelectItem value="6">6 maanden</SelectItem>
                  <SelectItem value="12">12 maanden</SelectItem>
                  <SelectItem value="24">24 maanden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {loading ? 'Analyseren...' : 'Trends Analyseren'}
            </Button>
          </div>

          {!analysisResult && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Klik op "Trends Analyseren" om te beginnen</p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          {getAssessmentCard()}

          <Card>
            <CardHeader>
              <CardTitle>Gedetailleerde Trend Analyse</CardTitle>
              <CardDescription>
                Periode: {new Date(analysisResult.period.start).toLocaleDateString('nl-NL')} -{' '}
                {new Date(analysisResult.period.end).toLocaleDateString('nl-NL')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisResult.trends.map((trend, i) => (
                <Card key={i} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTrendIcon(trend.trend)}
                        <div>
                          <CardTitle className="text-base">
                            {getMetricLabel(trend.metric_type)}
                          </CardTitle>
                          <CardDescription>
                            {trend.data_points.length} datapunten
                          </CardDescription>
                        </div>
                      </div>
                      {getSignificanceBadge(trend.significance)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trend.trend !== 'insufficient_data' ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Trend:</span>
                          <span className="font-medium capitalize">{trend.trend}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Verandering:</span>
                          <span
                            className={`font-medium ${
                              trend.change_percentage > 0
                                ? 'text-blue-600'
                                : trend.change_percentage < 0
                                  ? 'text-red-600'
                                  : ''
                            }`}
                          >
                            {trend.change_percentage > 0 ? '+' : ''}
                            {trend.change_percentage}%
                          </span>
                        </div>
                        {trend.recommendation && (
                          <div className="pt-2 border-t">
                            <p className="text-sm">
                              <span className="font-medium">Aanbeveling: </span>
                              {trend.recommendation}
                            </p>
                          </div>
                        )}
                        {trend.data_points.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-2">Data punten:</p>
                            <div className="space-y-1">
                              {trend.data_points.slice(-5).map((point, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs text-muted-foreground"
                                >
                                  <span>{point.date}</span>
                                  <span className="font-mono">{point.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Onvoldoende data voor trend analyse. Meer datapunten nodig.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
