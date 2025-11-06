'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, TrendingUp, FileText, Activity } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AnalysisResultsProps {
  applicationId: string;
}

interface AnalysisData {
  analysis: {
    care_hours: {
      day: number | null;
      night: number | null;
      one_on_one: number | null;
    };
    adl_dependency: {
      score: number | null;
      category: string | null;
      details: string[];
    };
    bpsd_indicators: {
      present: boolean;
      severity: string | null;
      types: string[];
      frequency: string | null;
    };
    night_care_needs: {
      required: boolean;
      frequency: string | null;
      reasons: string[];
    };
    incident_pattern: {
      count: number;
      high_severity_count: number;
      types: Record<string, number>;
      trend: string | null;
    };
    specialist_reports: {
      present: boolean;
      types: string[];
      dates: string[];
    };
    interventions: {
      current: string[];
      planned: string[];
    };
  };
  extracted_fields: Array<{
    field_name: string;
    field_value: string;
    confidence: number;
    evidence: any[];
  }>;
  summary: {
    total_fields: number;
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
  };
}

export function AnalysisResults({ applicationId }: AnalysisResultsProps) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch the latest analysis results
    // For now, we'll show a placeholder
    setLoading(false);
  }, [applicationId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyse resultaten laden...</p>
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
            <FileText className="h-5 w-5" />
            Analyse resultaten
          </CardTitle>
          <CardDescription>
            Klik op "Dossier analyseren" om AI-extractie uit te voeren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nog geen analyse uitgevoerd. Start de dossier analyse om automatisch velden
              te extraheren.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { analysis, extracted_fields, summary } = data;
  const confidencePercentage =
    ((summary.high_confidence + summary.medium_confidence * 0.5) / summary.total_fields) *
    100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Analyse samenvatting
            </span>
            <Badge variant="default">
              {summary.total_fields} velden geëxtraheerd
            </Badge>
          </CardTitle>
          <CardDescription>AI-gebaseerde extractie uit dossier gegevens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Betrouwbaarheid</span>
              <span className="text-sm text-muted-foreground">
                {confidencePercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={confidencePercentage} />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.high_confidence}
              </div>
              <div className="text-xs text-muted-foreground">Hoge zekerheid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.medium_confidence}
              </div>
              <div className="text-xs text-muted-foreground">Gemiddelde zekerheid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {summary.low_confidence}
              </div>
              <div className="text-xs text-muted-foreground">Lage zekerheid</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zorguren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.care_hours.day !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Dagzorg</span>
              <Badge variant="outline">{analysis.care_hours.day} uur</Badge>
            </div>
          )}
          {analysis.care_hours.night !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Nachtzorg</span>
              <Badge variant="outline">{analysis.care_hours.night} uur</Badge>
            </div>
          )}
          {analysis.care_hours.one_on_one !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm">1-op-1 begeleiding</span>
              <Badge variant="outline">{analysis.care_hours.one_on_one} uur</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ADL beperkingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.adl_dependency.score !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Katz score</span>
              <Badge variant="outline">{analysis.adl_dependency.score}</Badge>
            </div>
          )}
          {analysis.adl_dependency.category && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Categorie</span>
              <Badge variant="secondary">{analysis.adl_dependency.category}</Badge>
            </div>
          )}
          {analysis.adl_dependency.details.length > 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Beperkingen:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {analysis.adl_dependency.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gedragsproblematiek (BPSD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={analysis.bpsd_indicators.present ? 'default' : 'secondary'}>
              {analysis.bpsd_indicators.present ? 'Aanwezig' : 'Niet aanwezig'}
            </Badge>
          </div>

          {analysis.bpsd_indicators.present && (
            <>
              {analysis.bpsd_indicators.severity && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ernst</span>
                  <Badge variant="outline">{analysis.bpsd_indicators.severity}</Badge>
                </div>
              )}

              {analysis.bpsd_indicators.types.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Typen:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.bpsd_indicators.types.map((type, i) => (
                      <Badge key={i} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incidenten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{analysis.incident_pattern.count}</div>
              <div className="text-xs text-muted-foreground">Totaal incidenten</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {analysis.incident_pattern.high_severity_count}
              </div>
              <div className="text-xs text-muted-foreground">Ernstige incidenten</div>
            </div>
          </div>

          {Object.keys(analysis.incident_pattern.types).length > 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium mb-2">Per type:</p>
              <div className="space-y-2">
                {Object.entries(analysis.incident_pattern.types).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span>{type}</span>
                    <Badge variant="outline">{count}x</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.incident_pattern.trend && (
            <div className="flex items-center gap-2 pt-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Trend: {analysis.incident_pattern.trend}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis.specialist_reports.present && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Specialistische rapporten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.specialist_reports.types.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Gevonden rapporten:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.specialist_reports.types.map((type, i) => (
                    <Badge key={i} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.specialist_reports.dates.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Datums:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.specialist_reports.dates.map((date, i) => (
                    <Badge key={i} variant="outline">
                      {new Date(date).toLocaleDateString('nl-NL')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
