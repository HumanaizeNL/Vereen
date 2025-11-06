'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  application_id: string;
  reviewer_role: string;
  reviewer_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  comments?: string;
  reviewed_at: string;
  application?: {
    id: string;
    client_id: string;
    version: string;
    submitted_at?: string;
    client?: {
      name: string;
      wlz_profile: string;
    };
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'needs_revision':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'default' as const, className: 'bg-yellow-600', label: 'In afwachting' },
      approved: { variant: 'default' as const, className: 'bg-green-600', label: 'Goedgekeurd' },
      rejected: { variant: 'destructive' as const, className: '', label: 'Afgewezen' },
      needs_revision: { variant: 'default' as const, className: 'bg-orange-600', label: 'Revisie nodig' },
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return null;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filterReviews = (status: string) => {
    if (status === 'all') return reviews;
    return reviews.filter(r => r.status === status);
  };

  const pendingReviews = filterReviews('pending');
  const approvedReviews = filterReviews('approved');
  const rejectedReviews = filterReviews('rejected');
  const needsRevisionReviews = filterReviews('needs_revision');

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Reviews laden...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Werkstroom</h1>
        <p className="text-muted-foreground mt-2">
          Beoordeel en goedkeur Meerzorg aanvragen
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In afwachting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReviews.length}</div>
            <p className="text-xs text-muted-foreground">Vereisen actie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Goedgekeurd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedReviews.length}</div>
            <p className="text-xs text-muted-foreground">Afgerond</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Afgewezen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedReviews.length}</div>
            <p className="text-xs text-muted-foreground">Niet goedgekeurd</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revisie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {needsRevisionReviews.length}
            </div>
            <p className="text-xs text-muted-foreground">Aanpassingen nodig</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pending">
            In afwachting ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="needs_revision">
            Revisie ({needsRevisionReviews.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Goedgekeurd ({approvedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Afgewezen ({rejectedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="all">Alle ({reviews.length})</TabsTrigger>
        </TabsList>

        {['pending', 'needs_revision', 'approved', 'rejected', 'all'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterReviews(tab === 'all' ? 'all' : tab).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Geen reviews</h3>
                  <p className="text-muted-foreground text-center">
                    Er zijn geen reviews met status "{tab === 'all' ? 'alle' : tab}"
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterReviews(tab === 'all' ? 'all' : tab).map((review) => (
                  <Link
                    key={review.id}
                    href={`/reviews/${review.application_id}`}
                  >
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(review.status)}
                            <div>
                              <CardTitle className="text-lg">
                                {review.application?.client?.name || 'Onbekende cliënt'}
                              </CardTitle>
                              <CardDescription>
                                {review.application?.client?.wlz_profile} • Versie{' '}
                                {review.application?.version}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(review.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="font-medium">Reviewer:</span> {review.reviewer_name}
                          </div>
                          <span>•</span>
                          <div>
                            <span className="font-medium">Rol:</span> {review.reviewer_role}
                          </div>
                          <span>•</span>
                          <div>
                            <span className="font-medium">Datum:</span>{' '}
                            {new Date(review.reviewed_at).toLocaleDateString('nl-NL')}
                          </div>
                        </div>
                        {review.comments && (
                          <p className="text-sm text-muted-foreground mt-3">
                            {review.comments}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Review Proces</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Als reviewer heeft u de volgende verantwoordelijkheden:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Controleer compleetheid van cliëntgegevens</li>
            <li>Beoordeel kwaliteit van bewijs en onderbouwing</li>
            <li>Verifieer dat normative checks zijn uitgevoerd</li>
            <li>Evalueer of de aanvraag voldoet aan Toetsingskader eisen</li>
            <li>Geef feedback bij afwijzing of revisie verzoek</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
