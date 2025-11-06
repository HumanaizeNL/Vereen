'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { MeerzorgForm } from '@/components/meerzorg/meerzorg-form';
import { ValidationResults } from '@/components/meerzorg/validation-results';
import { EvidencePanel } from '@/components/meerzorg/evidence-panel';

interface Application {
  id: string;
  client_id: string;
  status: string;
  version: string;
  form_data: Record<string, any>;
  created_at: string;
  submitted_at?: string;
  client?: {
    name: string;
    wlz_profile: string;
  };
}

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/meerzorg/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch application');
      const data = await response.json();
      setApplication(data);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!decision) {
      alert('Selecteer een beslissing');
      return;
    }

    if (decision !== 'approved' && !comments) {
      alert('Geef feedback bij afwijzing of revisie verzoek');
      return;
    }

    if (!confirm(`Weet u zeker dat u deze aanvraag wilt ${decision === 'approved' ? 'goedkeuren' : decision === 'rejected' ? 'afwijzen' : 'terugsturen voor revisie'}?`)) {
      return;
    }

    setSubmitting(true);

    try {
      // Create review workflow entry
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: params.id,
          reviewer_role: 'professional', // TODO: Get from auth
          reviewer_name: 'Current User', // TODO: Get from auth
          status: decision,
          comments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Update application status
      const newStatus = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'draft';
      await fetch(`/api/meerzorg/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      alert('Review succesvol ingediend!');
      router.push('/reviews');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Fout bij indienen review');
    } finally {
      setSubmitting(false);
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
            <CardTitle>Aanvraag niet gevonden</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/reviews">
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
        <Link href="/reviews">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Terug naar reviews
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {application.client?.name || 'Onbekende cliënt'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Meerzorg aanvraag review • Versie {application.version}
          </p>
        </div>
      </div>

      <Card className="border-yellow-600 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">Review Beslissing</CardTitle>
          <CardDescription>Beoordeel de aanvraag en geef uw beslissing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decision">Beslissing *</Label>
            <Select value={decision} onValueChange={setDecision}>
              <SelectTrigger id="decision">
                <SelectValue placeholder="Selecteer beslissing..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Goedkeuren</span>
                  </div>
                </SelectItem>
                <SelectItem value="needs_revision">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span>Revisie nodig</span>
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Afwijzen</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">
              Commentaar {decision !== 'approved' && '*'}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder={
                decision === 'approved'
                  ? 'Optioneel: aanvullende opmerkingen...'
                  : 'Beschrijf waarom u de aanvraag afwijst of wat er moet worden aangepast...'
              }
            />
          </div>

          <Button
            onClick={handleSubmitReview}
            disabled={!decision || submitting}
            className="w-full gap-2"
            size="lg"
          >
            {submitting ? (
              'Indienen...'
            ) : (
              <>
                <Send className="h-4 w-4" />
                Review Indienen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="form">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Formulier</TabsTrigger>
          <TabsTrigger value="validation">Validatie</TabsTrigger>
          <TabsTrigger value="evidence">Bewijs</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <MeerzorgForm
            applicationId={application.id}
            formData={application.form_data}
            version={application.version}
            readOnly={true}
          />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <ValidationResults applicationId={application.id} />
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <EvidencePanel applicationId={application.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
