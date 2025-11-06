'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, AlertTriangle, Activity, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { TrendMonitoring } from '@/components/herindicatie/trend-monitoring';
import { RiskFlags } from '@/components/herindicatie/risk-flags';
import { VV8Assessment } from '@/components/herindicatie/vv8-assessment';
import { MdReviews } from '@/components/herindicatie/md-reviews';

interface HerindicatieData {
  client: {
    client_id: string;
    name: string;
    wlz_profile: string;
    provider: string;
  };
  statistics: {
    total_notes: number;
    recent_notes: number;
    total_measures: number;
    total_incidents: number;
    recent_incidents: number;
    active_risk_flags: number;
    md_reviews: number;
  };
}

export default function HerindicatieDetailPage() {
  const params = useParams();
  const [data, setData] = useState<HerindicatieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trends');

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/herindicatie?client_id=${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching herindicatie data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Gegevens laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cliënt niet gevonden</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/herindicatie">
              <Button>Terug naar overzicht</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <Link href="/herindicatie">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.client.name}</h1>
          <p className="text-muted-foreground mt-2">
            {data.client.wlz_profile} • {data.client.provider}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.total_notes}</div>
            <p className="text-xs text-muted-foreground">
              {data.statistics.recent_notes} laatste 6 maanden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Metingen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.total_measures}</div>
            <p className="text-xs text-muted-foreground">Totaal beschikbaar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Incidenten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.total_incidents}</div>
            <p className="text-xs text-muted-foreground">
              {data.statistics.recent_incidents} laatste 3 maanden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Risk Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.statistics.active_risk_flags}
            </div>
            <p className="text-xs text-muted-foreground">Actief</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="vv8" className="gap-2">
            <Activity className="h-4 w-4" />
            VV8
          </TabsTrigger>
          <TabsTrigger value="md-review" className="gap-2">
            <Shield className="h-4 w-4" />
            MD Review
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <TrendMonitoring clientId={params.id as string} />
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <RiskFlags clientId={params.id as string} />
        </TabsContent>

        <TabsContent value="vv8" className="space-y-4">
          <VV8Assessment clientId={params.id as string} />
        </TabsContent>

        <TabsContent value="md-review" className="space-y-4">
          <MdReviews clientId={params.id as string} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
