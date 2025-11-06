// API endpoints for herindicatie (re-assessment)
// GET /api/herindicatie - Get herindicatie analysis for client

import { NextRequest, NextResponse } from 'next/server';
import {
  getClient,
  getNotesByClient,
  getMeasuresByClient,
  getIncidentsByClient,
  getTrendMonitoringByClient,
  getRiskFlagsByClient,
  getMdReviewsByClient,
} from '@/lib/db/repository';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');

    if (!clientId) {
      return NextResponse.json(
        { error: 'client_id is required' },
        { status: 400 }
      );
    }

    // Get client data
    const client = await getClient(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get all relevant data
    const [notes, measures, incidents, trends, riskFlags, mdReviews] = await Promise.all([
      getNotesByClient(clientId),
      getMeasuresByClient(clientId),
      getIncidentsByClient(clientId),
      getTrendMonitoringByClient(clientId),
      getRiskFlagsByClient(clientId),
      getMdReviewsByClient(clientId),
    ]);

    // Calculate basic statistics
    const recentNotes = notes.filter(n => {
      const noteDate = new Date(n.date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return noteDate >= sixMonthsAgo;
    });

    const recentIncidents = incidents.filter(i => {
      const incidentDate = new Date(i.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return incidentDate >= threeMonthsAgo;
    });

    const activeRiskFlags = riskFlags.filter(r => !r.resolved_at);

    return NextResponse.json({
      client,
      statistics: {
        total_notes: notes.length,
        recent_notes: recentNotes.length,
        total_measures: measures.length,
        total_incidents: incidents.length,
        recent_incidents: recentIncidents.length,
        active_risk_flags: activeRiskFlags.length,
        md_reviews: mdReviews.length,
      },
      trends: trends,
      risk_flags: riskFlags,
      md_reviews: mdReviews,
      latest_data: {
        latest_note: notes.length > 0 ? notes[0] : null,
        latest_measure: measures.length > 0 ? measures[0] : null,
        latest_incident: incidents.length > 0 ? incidents[0] : null,
      },
    });
  } catch (error) {
    console.error('Error fetching herindicatie data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch herindicatie data' },
      { status: 500 }
    );
  }
}
