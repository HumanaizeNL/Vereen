'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Client {
  client_id: string;
  name: string;
  wlz_profile: string;
  provider: string;
}

export default function HerindicatiePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
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
            <p className="text-muted-foreground">Cliënten laden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Herindicatie & Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Trend analyse, risk flagging en VV8 criteria beoordeling
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Cliënten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Actieve dossiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend Monitoring</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Actieve analyses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Flags</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Actieve waarschuwingen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VV8 Assessments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Afgelopen maand</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cliënt Selectie</CardTitle>
          <CardDescription>
            Selecteer een cliënt voor herindicatie analyse
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Geen cliënten beschikbaar. Upload eerst een dossier.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {clients.map((client) => (
                <Link key={client.client_id} href={`/herindicatie/${client.client_id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span>WLZ: {client.wlz_profile}</span>
                            <span>•</span>
                            <span>{client.provider}</span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline">VV8</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => e.preventDefault()}>
                          Trends
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => e.preventDefault()}>
                          Risks
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => e.preventDefault()}>
                          VV8
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Over Herindicatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Het herindicatie systeem ondersteunt continue monitoring en herbeoor deling van
            cliënten met WLZ VV8 indicatie. Belangrijke features:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Trend monitoring van zorgbehoefte over tijd</li>
            <li>Automatische risk flagging bij achteruitgang</li>
            <li>VV8 criteria assessment met evidence linking</li>
            <li>MD review workflow voor specialistische beoordeling</li>
            <li>Historische data analyse voor trenddetectie</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
