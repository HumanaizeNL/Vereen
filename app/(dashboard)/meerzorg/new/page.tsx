'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface Client {
  client_id: string;
  name: string;
  dob: string;
  wlz_profile: string;
  provider: string;
}

export default function NewMeerzorgPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [version, setVersion] = useState<string>('2026');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedClientId) {
      setError('Selecteer een cliënt');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/meerzorg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClientId,
          version,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create application');
      }

      const data = await response.json();
      router.push(`/meerzorg/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setCreating(false);
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
    <div className="container mx-auto py-8 max-w-3xl space-y-8">
      <div>
        <Link href="/meerzorg">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          Nieuwe Meerzorg aanvraag
        </h1>
        <p className="text-muted-foreground mt-2">
          Selecteer een cliënt en framework versie om te beginnen
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aanvraag configuratie</CardTitle>
          <CardDescription>
            Kies de cliënt en de juiste framework versie voor deze aanvraag
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="client">Cliënt *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Selecteer een cliënt..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.client_id} value={client.client_id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {client.wlz_profile} • {client.provider}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {clients.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Geen cliënten beschikbaar. Upload eerst een dossier.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Framework versie *</Label>
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger id="version">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">
                  <div className="flex flex-col">
                    <span className="font-medium">2025</span>
                    <span className="text-sm text-muted-foreground">
                      Basis framework (tot 31-12-2025)
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="2026">
                  <div className="flex flex-col">
                    <span className="font-medium">2026</span>
                    <span className="text-sm text-muted-foreground">
                      Nieuw framework (vanaf 01-01-2026)
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {version === '2026' && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-sm">
                  <strong>Let op:</strong> Het 2026 framework heeft strengere eisen:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1 ml-2">
                  <li>Verplichte duurzaamheid onderbouwing</li>
                  <li>Strengere recentheid eisen (3 maanden)</li>
                  <li>Lagere maximale uren (dag: 16u, nacht: 12u)</li>
                  <li>Verplicht specialistisch rapport bij ernstige problematiek</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/meerzorg" className="flex-1">
              <Button variant="outline" className="w-full" disabled={creating}>
                Annuleren
              </Button>
            </Link>
            <Button
              onClick={handleCreate}
              disabled={!selectedClientId || creating}
              className="flex-1 gap-2"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              {creating ? 'Aanmaken...' : 'Aanvraag aanmaken'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Volgende stappen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Na het aanmaken van de aanvraag kunt u:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
            <li>Het dossier automatisch laten analyseren door AI</li>
            <li>Formuliervelden laten invullen op basis van bewijs</li>
            <li>Normative checks uitvoeren om compleetheid te controleren</li>
            <li>De aanvraag indienen voor review en goedkeuring</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
