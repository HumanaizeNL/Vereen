'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Shield,
  Send,
  Loader2,
  AlertCircle,
  Printer,
  Download,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MeerzorgForm } from '@/components/meerzorg/meerzorg-form';
import { AnalysisResults } from '@/components/meerzorg/analysis-results';
import { ValidationResults } from '@/components/meerzorg/validation-results';
import { MigrationDialog } from '@/components/meerzorg/migration-dialog';

interface Application {
  id: string;
  client_id: string;
  status: string;
  version: string;
  form_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  client?: {
    client_id: string;
    name: string;
    wlz_profile: string;
  };
}

export default function MeerzorgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('form');

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/meerzorg/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/meerzorg');
          return;
        }
        throw new Error('Failed to fetch application');
      }
      const data = await response.json();
      setApplication(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`/api/meerzorg/${params.id}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze dossier');
      }

      const data = await response.json();
      await fetchApplication(); // Refresh application data
      setActiveTab('analysis');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setError(null);

    try {
      const response = await fetch(`/api/meerzorg/${params.id}/validate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate application');
      }

      const data = await response.json();
      setActiveTab('validation');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Weet u zeker dat u deze aanvraag wilt indienen?')) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/meerzorg/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitted_by: 'current_user', // TODO: Get from auth context
          reviewer_role: 'professional',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      await fetchApplication();
      alert('Aanvraag succesvol ingediend!');
      router.push('/meerzorg');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.open(`/meerzorg/${params.id}/print`, '_blank');
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/meerzorg/${params.id}/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meerzorg-${params.id}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Exporteren mislukt');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Aanvraag laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Aanvraag niet gevonden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/meerzorg">
              <Button>Terug naar overzicht</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isReadOnly = application.status !== 'draft';

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <Link href="/meerzorg">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Terug naar overzicht
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {application.client?.name || `Cliënt ${application.client_id}`}
            </h1>
            <p className="text-muted-foreground mt-2">
              Meerzorg aanvraag • Versie {application.version}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {application.version === '2025' && (
              <MigrationDialog
                applicationId={application.id}
                currentVersion={application.version}
                onMigrationComplete={fetchApplication}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              CSV
            </Button>
            <Badge variant={application.status === 'draft' ? 'secondary' : 'default'}>
              {application.status}
            </Badge>
          </div>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Fout opgetreden</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isReadOnly && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">AI-assistentie</CardTitle>
            <CardDescription>
              Gebruik AI om het dossier te analyseren en formuliervelden automatisch in
              te vullen
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || validating || submitting}
              className="gap-2"
              variant="default"
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {analyzing ? 'Analyseren...' : 'Dossier analyseren'}
            </Button>
            <Button
              onClick={handleValidate}
              disabled={analyzing || validating || submitting}
              className="gap-2"
              variant="outline"
            >
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {validating ? 'Valideren...' : 'Normative checks uitvoeren'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="form">Formulier</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="validation">Validatie</TabsTrigger>
          <TabsTrigger value="submit">Indienen</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <MeerzorgForm
            applicationId={application.id}
            formData={application.form_data}
            version={application.version}
            readOnly={isReadOnly}
            onUpdate={fetchApplication}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <AnalysisResults applicationId={application.id} />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <ValidationResults applicationId={application.id} />
        </TabsContent>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aanvraag indienen</CardTitle>
              <CardDescription>
                Controleer alle gegevens voordat u de aanvraag indient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isReadOnly ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    Deze aanvraag is al ingediend en kan niet meer worden gewijzigd.
                  </p>
                  {application.submitted_at && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Ingediend op:{' '}
                      {new Date(application.submitted_at).toLocaleDateString('nl-NL')}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="font-medium">Voor indienen:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                      <li>Voer normative checks uit om compleetheid te controleren</li>
                      <li>Controleer alle ingevulde velden</li>
                      <li>Zorg dat alle kritieke issues zijn opgelost</li>
                      <li>Controleer de kwaliteit van het bewijs</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={analyzing || validating || submitting}
                    className="gap-2 w-full"
                    size="lg"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {submitting ? 'Indienen...' : 'Aanvraag indienen'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
