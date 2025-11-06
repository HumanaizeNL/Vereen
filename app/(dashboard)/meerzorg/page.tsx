'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
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

interface MeerzorgApplication {
  id: string;
  client_id: string;
  status: 'draft' | 'in_review' | 'submitted' | 'approved' | 'rejected';
  version: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  client?: {
    client_id: string;
    name: string;
    wlz_profile: string;
  };
}

export default function MeerzorgPage() {
  const [applications, setApplications] = useState<MeerzorgApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/meerzorg');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any; icon: any }> = {
      draft: { label: 'Concept', variant: 'secondary', icon: FileText },
      in_review: { label: 'In beoordeling', variant: 'default', icon: Clock },
      submitted: { label: 'Ingediend', variant: 'default', icon: CheckCircle },
      approved: { label: 'Goedgekeurd', variant: 'default', icon: CheckCircle },
      rejected: { label: 'Afgewezen', variant: 'destructive', icon: AlertCircle },
    };

    const config = variants[status] || variants.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Meerzorg aanvragen laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Fout bij laden
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fetchApplications()}>Opnieuw proberen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meerzorg Aanvragen</h1>
          <p className="text-muted-foreground mt-2">
            Beheer extra zorgfinanciering aanvragen (VV8 2025/2026)
          </p>
        </div>
        <Link href="/meerzorg/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Nieuwe aanvraag
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen aanvragen</h3>
            <p className="text-muted-foreground text-center mb-6">
              Begin met een nieuwe Meerzorg aanvraag voor extra zorgfinanciering.
            </p>
            <Link href="/meerzorg/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nieuwe aanvraag maken
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Link key={app.id} href={`/meerzorg/${app.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">
                        {app.client?.name || `Cliënt ${app.client_id}`}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>WLZ Profiel: {app.client?.wlz_profile || 'Onbekend'}</span>
                        <span>•</span>
                        <span>Versie: {app.version}</span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Aangemaakt:</span>{' '}
                      {formatDate(app.created_at)}
                    </div>
                    {app.submitted_at && (
                      <>
                        <span>•</span>
                        <div>
                          <span className="font-medium">Ingediend:</span>{' '}
                          {formatDate(app.submitted_at)}
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <div>
                      <span className="font-medium">ID:</span> {app.id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Over Meerzorg aanvragen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Meerzorg is extra financiering voor cliënten met WLZ VV8 die meer zorg nodig
            hebben dan standaard wordt vergoed. De aanvraag wordt beoordeeld op basis van:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>ADL beperkingen en zorgbehoefte</li>
            <li>Gedragsproblematiek (BPSD)</li>
            <li>Nachtzorg behoeften</li>
            <li>Incidenten en veiligheid</li>
            <li>Specialistische onderbouwing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
