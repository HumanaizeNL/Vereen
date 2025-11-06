'use client';

import { useState, useEffect } from 'react';
import { FileText, ExternalLink, CheckCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface EvidencePanelProps {
  applicationId: string;
}

interface Evidence {
  id: string;
  field_name: string;
  field_label: string;
  source_type: string;
  source_id: string;
  source_reference: string;
  evidence_text: string;
  confidence_score: number;
  created_at: string;
  metadata?: Record<string, any>;
}

interface GroupedEvidence {
  field_name: string;
  field_label: string;
  items: Evidence[];
}

export function EvidencePanel({ applicationId }: EvidencePanelProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedView, setGroupedView] = useState(true);

  useEffect(() => {
    fetchEvidence();
  }, [applicationId]);

  const fetchEvidence = async () => {
    try {
      const response = await fetch(`/api/evidence?application_id=${applicationId}`);
      if (!response.ok) throw new Error('Failed to fetch evidence');
      const data = await response.json();
      setEvidence(data.evidence || []);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.8) {
      return (
        <Badge className="bg-green-600">
          Hoog ({(score * 100).toFixed(0)}%)
        </Badge>
      );
    } else if (score >= 0.5) {
      return (
        <Badge className="bg-yellow-600">
          Gemiddeld ({(score * 100).toFixed(0)}%)
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          Laag ({(score * 100).toFixed(0)}%)
        </Badge>
      );
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'dossier_note':
        return <FileText className="h-4 w-4" />;
      case 'measure':
        return <CheckCircle className="h-4 w-4" />;
      case 'incident':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (sourceType: string) => {
    const labels = {
      dossier_note: 'Dossier Notitie',
      measure: 'Meetinstrument',
      incident: 'Incident',
      document: 'Document',
    } as const;
    return labels[sourceType as keyof typeof labels] || sourceType;
  };

  const groupEvidence = (): GroupedEvidence[] => {
    const grouped = new Map<string, GroupedEvidence>();

    evidence.forEach((item) => {
      const key = item.field_name;
      if (!grouped.has(key)) {
        grouped.set(key, {
          field_name: item.field_name,
          field_label: item.field_label,
          items: [],
        });
      }
      grouped.get(key)!.items.push(item);
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.field_label.localeCompare(b.field_label)
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Bewijs laden...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (evidence.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Bewijsmateriaal
          </CardTitle>
          <CardDescription>
            Gekoppelde bronnen en onderbouwing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Geen bewijs beschikbaar</p>
            <p className="text-muted-foreground mt-1">
              Er zijn nog geen bewijslinks gekoppeld aan deze aanvraag
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderEvidenceItem = (item: Evidence) => (
    <Card key={item.id} className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getSourceIcon(item.source_type)}
            <div>
              <Badge variant="outline" className="mb-1">
                {getSourceLabel(item.source_type)}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {item.source_reference}
              </p>
            </div>
          </div>
          {getConfidenceBadge(item.confidence_score)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm">{item.evidence_text}</p>
        </div>

        <div className="pt-2 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Gekoppeld op: {new Date(item.created_at).toLocaleDateString('nl-NL')}
          </span>
          <Button variant="ghost" size="sm" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            Bekijk bron
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!groupedView) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Bewijsmateriaal
                </CardTitle>
                <CardDescription>
                  {evidence.length} gekoppelde bron{evidence.length !== 1 ? 'nen' : ''}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGroupedView(true)}
              >
                Groepeer per veld
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {evidence.map(renderEvidenceItem)}
        </div>
      </div>
    );
  }

  const groupedData = groupEvidence();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Bewijsmateriaal
              </CardTitle>
              <CardDescription>
                {evidence.length} gekoppelde bron{evidence.length !== 1 ? 'nen' : ''} over{' '}
                {groupedData.length} veld{groupedData.length !== 1 ? 'en' : ''}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGroupedView(false)}
            >
              Toon alles
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {groupedData.map((group, idx) => (
          <Card key={idx}>
            <AccordionItem value={`field-${idx}`} className="border-none">
              <CardHeader className="pb-3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="text-left">
                      <CardTitle className="text-base">{group.field_label}</CardTitle>
                      <CardDescription className="mt-1">
                        {group.items.length} bron{group.items.length !== 1 ? 'nen' : ''}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      Avg. {(
                        (group.items.reduce((sum, item) => sum + item.confidence_score, 0) /
                          group.items.length) *
                        100
                      ).toFixed(0)}%
                    </Badge>
                  </div>
                </AccordionTrigger>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-3 pt-0">
                  {group.items.map(renderEvidenceItem)}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </div>
  );
}
