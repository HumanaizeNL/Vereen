// API endpoint for flagging risks
// POST /api/risks/flag - Create or update risk flags for a client

import { NextRequest, NextResponse } from 'next/server';
import {
  getClient,
  getMeasuresByClient,
  getIncidentsByClient,
  getTrendMonitoringByClient,
  addRiskFlag,
  addAuditEvent,
} from '@/lib/db/repository';

interface RiskDetectionResult {
  flag_type: 'increased_care' | 'high_incidents' | 'deteriorating_adl' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  recommended_actions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, auto_detect = true, manual_flags = [] } = body;

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

    const detectedRisks: RiskDetectionResult[] = [];

    if (auto_detect) {
      // Get data for risk detection
      const [measures, incidents, trends] = await Promise.all([
        getMeasuresByClient(client_id),
        getIncidentsByClient(client_id),
        getTrendMonitoringByClient(client_id),
      ]);

      // Detect high incident rate
      const recentIncidents = incidents.filter(i => {
        const incidentDate = new Date(i.date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return incidentDate >= threeMonthsAgo;
      });

      if (recentIncidents.length >= 10) {
        const highSeverityCount = recentIncidents.filter(
          i => i.severity.toLowerCase() === 'hoog' || i.severity.toLowerCase() === 'ernstig'
        ).length;

        detectedRisks.push({
          flag_type: 'high_incidents',
          severity: highSeverityCount >= 3 ? 'critical' : 'high',
          description: `${recentIncidents.length} incidenten in laatste 3 maanden (${highSeverityCount} ernstig)`,
          evidence: [
            `Totaal: ${recentIncidents.length} incidenten`,
            `Ernstig: ${highSeverityCount} incidenten`,
            `Gemiddeld: ${(recentIncidents.length / 3).toFixed(1)} per maand`,
          ],
          recommended_actions: [
            'Evalueer veiligheidsmaatregelen',
            'Overweeg aanpassing zorgplan',
            'Overleg met multidisciplinair team',
          ],
        });
      }

      // Detect deteriorating ADL
      const adlMeasures = measures
        .filter(m => m.type.toLowerCase().includes('adl') || m.type.toLowerCase().includes('katz'))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (adlMeasures.length >= 2) {
        const latest = adlMeasures[0];
        const previous = adlMeasures[1];
        const latestScore = typeof latest.score === 'number' ? latest.score : parseFloat(latest.score) || 0;
        const previousScore = typeof previous.score === 'number' ? previous.score : parseFloat(previous.score) || 0;

        const decline = previousScore - latestScore;
        const declinePercentage = (decline / (previousScore || 1)) * 100;

        if (declinePercentage > 20) {
          detectedRisks.push({
            flag_type: 'deteriorating_adl',
            severity: declinePercentage > 40 ? 'critical' : declinePercentage > 30 ? 'high' : 'medium',
            description: `ADL achteruitgang van ${decline.toFixed(1)} punten (${declinePercentage.toFixed(0)}%)`,
            evidence: [
              `Vorige score: ${previousScore} (${previous.date})`,
              `Huidige score: ${latestScore} (${latest.date})`,
              `Achteruitgang: ${declinePercentage.toFixed(0)}%`,
            ],
            recommended_actions: [
              'Plan herindicatie in',
              'Overweeg aanpassing zorgintensiteit',
              'Multidisciplinaire evaluatie',
            ],
          });
        }
      }

      // Detect increased care needs from trends
      const careHourTrends = trends.filter(t => t.metric_type === 'care_hours');
      if (careHourTrends.length >= 2) {
        const sorted = careHourTrends.sort(
          (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        );
        const latest = sorted[0];
        const previous = sorted[1];

        const increase = latest.metric_value - previous.metric_value;
        const increasePercentage = (increase / (previous.metric_value || 1)) * 100;

        if (increasePercentage > 25) {
          detectedRisks.push({
            flag_type: 'increased_care',
            severity: increasePercentage > 50 ? 'high' : 'medium',
            description: `Zorguren gestegen met ${increasePercentage.toFixed(0)}%`,
            evidence: [
              `Vorige periode: ${previous.metric_value} uur`,
              `Huidige periode: ${latest.metric_value} uur`,
              `Toename: ${increase.toFixed(1)} uur (${increasePercentage.toFixed(0)}%)`,
            ],
            recommended_actions: [
              'Analyseer oorzaak van toegenomen zorgbehoefte',
              'Overweeg Meerzorg aanvraag',
              'Evalueer zorgplan',
            ],
          });
        }
      }
    }

    // Add manual flags if provided
    for (const manualFlag of manual_flags) {
      detectedRisks.push(manualFlag);
    }

    // Save risk flags to database
    const savedFlags = [];
    for (const risk of detectedRisks) {
      const flagId = await addRiskFlag({
        clientId: client_id,
        flagType: risk.flag_type,
        severity: risk.severity,
        description: risk.description,
      });

      savedFlags.push({
        id: flagId,
        ...risk,
      });

      // Log audit event
      await addAuditEvent({
        actor: 'system',
        clientId: client_id,
        action: 'risk_flag_created',
        meta: {
          flag_id: flagId,
          flag_type: risk.flag_type,
          severity: risk.severity,
          auto_detected: auto_detect,
        },
      });
    }

    return NextResponse.json({
      client_id,
      risks_detected: savedFlags.length,
      flags: savedFlags,
      summary: {
        critical: savedFlags.filter(f => f.severity === 'critical').length,
        high: savedFlags.filter(f => f.severity === 'high').length,
        medium: savedFlags.filter(f => f.severity === 'medium').length,
        low: savedFlags.filter(f => f.severity === 'low').length,
      },
    });
  } catch (error) {
    console.error('Error flagging risks:', error);
    return NextResponse.json(
      { error: 'Failed to flag risks', details: (error as Error).message },
      { status: 500 }
    );
  }
}
