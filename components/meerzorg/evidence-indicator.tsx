'use client';

import { Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';

interface Evidence {
  id: string;
  source_type: string;
  source_reference: string;
  evidence_text: string;
  confidence_score: number;
  created_at: string;
}

interface EvidenceIndicatorProps {
  fieldName: string;
  evidence: Evidence[];
}

export function EvidenceIndicator({ fieldName, evidence }: EvidenceIndicatorProps) {
  if (!evidence || evidence.length === 0) {
    return null;
  }

  const avgConfidence =
    evidence.reduce((sum, e) => sum + e.confidence_score, 0) / evidence.length;

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-600';
    if (score >= 0.5) return 'bg-yellow-600';
    return 'bg-gray-500';
  };

  const getSourceLabel = (sourceType: string) => {
    const labels = {
      dossier_note: 'Notitie',
      measure: 'Meting',
      incident: 'Incident',
      document: 'Document',
    } as const;
    return labels[sourceType as keyof typeof labels] || sourceType;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1 hover:bg-accent"
        >
          <LinkIcon className="h-3 w-3" />
          <Badge
            variant="secondary"
            className={`h-5 px-1.5 text-xs ${getConfidenceBadgeColor(avgConfidence)}`}
          >
            {evidence.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <p className="font-semibold text-sm">
                {evidence.length} Bewijs{evidence.length !== 1 ? 'bronnen' : 'bron'}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Avg. {(avgConfidence * 100).toFixed(0)}%
            </Badge>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {evidence.map((item) => (
              <Card key={item.id} className="border">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getSourceLabel(item.source_type)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getConfidenceBadgeColor(item.confidence_score)}`}
                    >
                      {(item.confidence_score * 100).toFixed(0)}%
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {item.evidence_text}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {item.source_reference}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Bekijk
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
