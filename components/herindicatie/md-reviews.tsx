'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MdReviewsProps {
  clientId: string;
}

interface MdReview {
  id: string;
  reviewer_name: string;
  reviewer_role: string;
  clinical_notes: string;
  decision: 'approve' | 'observe' | 'reject';
  observation_period_days?: number;
  reviewed_at: string;
}

interface ReviewData {
  reviews: MdReview[];
  statistics: {
    total: number;
    by_decision: {
      approve: number;
      observe: number;
      reject: number;
    };
    by_role: Record<string, number>;
    latest_review: MdReview | null;
  };
}

export function MdReviews({ clientId }: MdReviewsProps) {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [decision, setDecision] = useState('');
  const [observationPeriod, setObservationPeriod] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [clientId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/md-review?client_id=${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviewData(data);
    } catch (error) {
      console.error('Error fetching MD reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewerName || !reviewerRole || !clinicalNotes || !decision) {
      alert('Vul alle verplichte velden in');
      return;
    }

    if (decision === 'observe' && !observationPeriod) {
      alert('Observatie periode is verplicht bij besluit "Observeren"');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/md-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          reviewer_name: reviewerName,
          reviewer_role: reviewerRole,
          clinical_notes: clinicalNotes,
          decision,
          observation_period_days: observationPeriod ? parseInt(observationPeriod) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create review');
      }

      // Reset form and refresh
      setReviewerName('');
      setReviewerRole('');
      setClinicalNotes('');
      setDecision('');
      setObservationPeriod('');
      setDialogOpen(false);
      await fetchReviews();
    } catch (error) {
      console.error('Error creating review:', error);
      alert('Fout bij aanmaken review');
    } finally {
      setSubmitting(false);
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'observe':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'reject':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getDecisionBadge = (decision: string) => {
    const variants = {
      approve: { variant: 'default' as const, className: 'bg-green-600', label: 'Goedgekeurd' },
      observe: { variant: 'default' as const, className: 'bg-yellow-600', label: 'Observeren' },
      reject: { variant: 'destructive' as const, className: '', label: 'Afgewezen' },
    };

    const config = variants[decision as keyof typeof variants];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      physician: 'Arts',
      psychologist: 'Psycholoog',
      ergo: 'Ergotherapeut',
      physio: 'Fysiotherapeut',
      nurse: 'Verpleegkundige',
    } as const;

    return labels[role as keyof typeof labels] || role;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">MD reviews laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Medisch Specialist Reviews
              </CardTitle>
              <CardDescription>
                Specialistische beoordelingen en klinische evaluaties
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nieuwe Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nieuwe MD Review</DialogTitle>
                  <DialogDescription>
                    Voeg een nieuwe medisch specialistische beoordeling toe
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reviewer_name">Naam Beoordelaar *</Label>
                      <Input
                        id="reviewer_name"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Dr. A. Jansen"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviewer_role">Rol *</Label>
                      <Select value={reviewerRole} onValueChange={setReviewerRole}>
                        <SelectTrigger id="reviewer_role">
                          <SelectValue placeholder="Selecteer rol..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physician">Arts</SelectItem>
                          <SelectItem value="psychologist">Psycholoog</SelectItem>
                          <SelectItem value="ergo">Ergotherapeut</SelectItem>
                          <SelectItem value="physio">Fysiotherapeut</SelectItem>
                          <SelectItem value="nurse">Verpleegkundige</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinical_notes">Klinische Notities *</Label>
                    <Textarea
                      id="clinical_notes"
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      rows={6}
                      placeholder="Beschrijf de klinische bevindingen, overwegingen en onderbouwing..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="decision">Besluit *</Label>
                      <Select value={decision} onValueChange={setDecision}>
                        <SelectTrigger id="decision">
                          <SelectValue placeholder="Selecteer besluit..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Goedkeuren</SelectItem>
                          <SelectItem value="observe">Observeren</SelectItem>
                          <SelectItem value="reject">Afwijzen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {decision === 'observe' && (
                      <div className="space-y-2">
                        <Label htmlFor="observation_period">Observatie Periode (dagen) *</Label>
                        <Input
                          id="observation_period"
                          type="number"
                          value={observationPeriod}
                          onChange={(e) => setObservationPeriod(e.target.value)}
                          placeholder="30"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Annuleren
                    </Button>
                    <Button onClick={handleSubmitReview} disabled={submitting}>
                      {submitting ? 'Opslaan...' : 'Review Opslaan'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {reviewData && reviewData.statistics.total > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {reviewData.statistics.by_decision.approve}
                </div>
                <div className="text-xs text-muted-foreground">Goedgekeurd</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {reviewData.statistics.by_decision.observe}
                </div>
                <div className="text-xs text-muted-foreground">Observeren</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {reviewData.statistics.by_decision.reject}
                </div>
                <div className="text-xs text-muted-foreground">Afgewezen</div>
              </div>
            </div>
          )}

          {!reviewData || reviewData.reviews.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Geen MD reviews</p>
              <p className="text-muted-foreground mt-1">
                Klik op "Nieuwe Review" om een beoordeling toe te voegen
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewData.reviews.map((review) => (
                <Card key={review.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getDecisionIcon(review.decision)}
                        <div>
                          <CardTitle className="text-base">{review.reviewer_name}</CardTitle>
                          <CardDescription>{getRoleLabel(review.reviewer_role)}</CardDescription>
                        </div>
                      </div>
                      {getDecisionBadge(review.decision)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Klinische Notities:</p>
                      <p className="text-sm text-muted-foreground">{review.clinical_notes}</p>
                    </div>

                    {review.observation_period_days && (
                      <div className="pt-2 border-t">
                        <p className="text-sm">
                          <span className="font-medium">Observatie periode: </span>
                          {review.observation_period_days} dagen
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      Beoordeeld op: {new Date(review.reviewed_at).toLocaleString('nl-NL')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
