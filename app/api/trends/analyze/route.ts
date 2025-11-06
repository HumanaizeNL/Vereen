// API endpoint for analyzing trends
// POST /api/trends/analyze - Analyze trends for a client

import { NextRequest, NextResponse } from 'next/server';
import {
  getClient,
  getMeasuresByClient,
  getIncidentsByClient,
  addTrendMonitoring,
} from '@/lib/db/repository';

interface TrendPoint {
  date: string;
  value: number;
}

interface TrendAnalysis {
  metric_type: string;
  data_points: TrendPoint[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  change_percentage: number;
  significance: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, metric_types, period_months = 6 } = body;

    if (!client_id) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    const client = await getClient(client_id);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get historical data
    const measures = await getMeasuresByClient(client_id);
    const incidents = await getIncidentsByClient(client_id);

    // Define period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - period_months);

    // Analyze each metric type
    const analyses: TrendAnalysis[] = [];
    const metricsToAnalyze = metric_types || [
      'care_hours',
      'incident_count',
      'adl_score',
      'bpsd_score',
    ];

    for (const metricType of metricsToAnalyze) {
      let analysis: TrendAnalysis;

      if (metricType === 'incident_count') {
        analysis = analyzeIncidentTrend(incidents, startDate, endDate);
      } else if (metricType === 'adl_score') {
        analysis = analyzeAdlTrend(measures, startDate, endDate);
      } else if (metricType === 'care_hours') {
        analysis = analyzeCareHoursTrend(measures, startDate, endDate);
      } else if (metricType === 'bpsd_score') {
        analysis = analyzeBpsdTrend(measures, startDate, endDate);
      } else {
        continue;
      }

      analyses.push(analysis);

      // Save trend monitoring record
      if (analysis.data_points.length > 0) {
        const latestPoint = analysis.data_points[analysis.data_points.length - 1];
        await addTrendMonitoring({
          clientId: client_id,
          metricType: analysis.metric_type,
          metricValue: latestPoint.value,
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
        });
      }
    }

    // Generate overall assessment
    const assessment = generateOverallAssessment(analyses);

    return NextResponse.json({
      client_id,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        months: period_months,
      },
      trends: analyses,
      assessment,
    });
  } catch (error) {
    console.error('Error analyzing trends:', error);
    return NextResponse.json(
      { error: 'Failed to analyze trends', details: (error as Error).message },
      { status: 500 }
    );
  }
}

function analyzeIncidentTrend(
  incidents: any[],
  startDate: Date,
  endDate: Date
): TrendAnalysis {
  // Group incidents by month
  const monthlyData = new Map<string, number>();

  for (const incident of incidents) {
    const incidentDate = new Date(incident.date);
    if (incidentDate >= startDate && incidentDate <= endDate) {
      const monthKey = `${incidentDate.getFullYear()}-${String(incidentDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
    }
  }

  // Convert to sorted data points
  const dataPoints: TrendPoint[] = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      date: month,
      value: count,
    }));

  if (dataPoints.length < 2) {
    return {
      metric_type: 'incident_count',
      data_points: dataPoints,
      trend: 'insufficient_data',
      change_percentage: 0,
      significance: 'low',
    };
  }

  // Calculate trend
  const firstValue = dataPoints[0].value;
  const lastValue = dataPoints[dataPoints.length - 1].value;
  const changePercentage = ((lastValue - firstValue) / (firstValue || 1)) * 100;

  let trend: TrendAnalysis['trend'] = 'stable';
  if (changePercentage > 20) trend = 'increasing';
  else if (changePercentage < -20) trend = 'decreasing';

  let significance: TrendAnalysis['significance'] = 'low';
  if (Math.abs(changePercentage) > 50) significance = 'high';
  else if (Math.abs(changePercentage) > 30) significance = 'medium';

  let recommendation: string | undefined;
  if (trend === 'increasing' && significance !== 'low') {
    recommendation = 'Stijgend aantal incidenten vereist aandacht. Overweeg aanvullende maatregelen of observatie.';
  }

  return {
    metric_type: 'incident_count',
    data_points: dataPoints,
    trend,
    change_percentage: Math.round(changePercentage),
    significance,
    recommendation,
  };
}

function analyzeAdlTrend(
  measures: any[],
  startDate: Date,
  endDate: Date
): TrendAnalysis {
  // Filter ADL measurements
  const adlMeasures = measures.filter(
    m => m.type.toLowerCase().includes('adl') || m.type.toLowerCase().includes('katz')
  );

  const dataPoints: TrendPoint[] = adlMeasures
    .filter(m => {
      const measureDate = new Date(m.date);
      return measureDate >= startDate && measureDate <= endDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: m.date,
      value: typeof m.score === 'number' ? m.score : parseFloat(m.score) || 0,
    }));

  if (dataPoints.length < 2) {
    return {
      metric_type: 'adl_score',
      data_points: dataPoints,
      trend: 'insufficient_data',
      change_percentage: 0,
      significance: 'low',
    };
  }

  const firstValue = dataPoints[0].value;
  const lastValue = dataPoints[dataPoints.length - 1].value;
  const changePercentage = ((lastValue - firstValue) / (firstValue || 1)) * 100;

  let trend: TrendAnalysis['trend'] = 'stable';
  if (changePercentage > 15) trend = 'increasing';
  else if (changePercentage < -15) trend = 'decreasing';

  let significance: TrendAnalysis['significance'] = 'low';
  if (Math.abs(changePercentage) > 30) significance = 'high';
  else if (Math.abs(changePercentage) > 20) significance = 'medium';

  let recommendation: string | undefined;
  if (trend === 'decreasing' && significance !== 'low') {
    recommendation = 'Dalende ADL score duidt op achteruitgang. Overweeg aanpassing zorgplan of herindicatie.';
  }

  return {
    metric_type: 'adl_score',
    data_points: dataPoints,
    trend,
    change_percentage: Math.round(changePercentage),
    significance,
    recommendation,
  };
}

function analyzeCareHoursTrend(
  measures: any[],
  startDate: Date,
  endDate: Date
): TrendAnalysis {
  // This would ideally come from actual care hour logs
  // For now, we'll return insufficient data
  return {
    metric_type: 'care_hours',
    data_points: [],
    trend: 'insufficient_data',
    change_percentage: 0,
    significance: 'low',
    recommendation: 'Registreer zorguren consistent voor trend analyse.',
  };
}

function analyzeBpsdTrend(
  measures: any[],
  startDate: Date,
  endDate: Date
): TrendAnalysis {
  // Filter BPSD measurements (NPI, CMAI, etc.)
  const bpsdMeasures = measures.filter(
    m =>
      m.type.toLowerCase().includes('npi') ||
      m.type.toLowerCase().includes('cmai') ||
      m.type.toLowerCase().includes('bpsd')
  );

  const dataPoints: TrendPoint[] = bpsdMeasures
    .filter(m => {
      const measureDate = new Date(m.date);
      return measureDate >= startDate && measureDate <= endDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: m.date,
      value: typeof m.score === 'number' ? m.score : parseFloat(m.score) || 0,
    }));

  if (dataPoints.length < 2) {
    return {
      metric_type: 'bpsd_score',
      data_points: dataPoints,
      trend: 'insufficient_data',
      change_percentage: 0,
      significance: 'low',
    };
  }

  const firstValue = dataPoints[0].value;
  const lastValue = dataPoints[dataPoints.length - 1].value;
  const changePercentage = ((lastValue - firstValue) / (firstValue || 1)) * 100;

  let trend: TrendAnalysis['trend'] = 'stable';
  if (changePercentage > 15) trend = 'increasing';
  else if (changePercentage < -15) trend = 'decreasing';

  let significance: TrendAnalysis['significance'] = 'low';
  if (Math.abs(changePercentage) > 30) significance = 'high';
  else if (Math.abs(changePercentage) > 20) significance = 'medium';

  let recommendation: string | undefined;
  if (trend === 'increasing' && significance !== 'low') {
    recommendation = 'Stijgende BPSD scores vereisen heroverweging van behandelplan en mogelijk specialistische consultatie.';
  }

  return {
    metric_type: 'bpsd_score',
    data_points: dataPoints,
    trend,
    change_percentage: Math.round(changePercentage),
    significance,
    recommendation,
  };
}

function generateOverallAssessment(analyses: TrendAnalysis[]): {
  status: 'stable' | 'needs_attention' | 'urgent';
  summary: string;
  recommendations: string[];
} {
  const highSignificance = analyses.filter(a => a.significance === 'high').length;
  const mediumSignificance = analyses.filter(a => a.significance === 'medium').length;
  const negativeAlerts = analyses.filter(
    a =>
      (a.metric_type === 'adl_score' && a.trend === 'decreasing') ||
      (a.metric_type === 'incident_count' && a.trend === 'increasing') ||
      (a.metric_type === 'bpsd_score' && a.trend === 'increasing')
  ).length;

  let status: 'stable' | 'needs_attention' | 'urgent' = 'stable';
  let summary = 'Situatie is stabiel. Blijf monitoring voortzetten.';

  if (highSignificance > 0 || negativeAlerts >= 2) {
    status = 'urgent';
    summary = 'Meerdere zorgelijke trends gedetecteerd. Directe actie vereist.';
  } else if (mediumSignificance > 0 || negativeAlerts >= 1) {
    status = 'needs_attention';
    summary = 'Enkele trends vereisen aandacht. Plan evaluatie in.';
  }

  const recommendations = analyses
    .filter(a => a.recommendation)
    .map(a => a.recommendation!);

  if (status === 'urgent' && recommendations.length === 0) {
    recommendations.push('Overleg met behandelend team om multidisciplinaire evaluatie in te plannen.');
  }

  return {
    status,
    summary,
    recommendations,
  };
}
