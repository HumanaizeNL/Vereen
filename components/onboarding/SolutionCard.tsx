'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Algorithm } from '@/lib/data/algoritmes-data';
import { RISK_LEVELS } from '@/lib/data/algoritmes-data';
import { Building2, CheckCircle2, ExternalLink, Info, Tag } from 'lucide-react';

interface SolutionCardProps {
  algorithm: Algorithm;
  matchScore: number;
  matchReason: string;
  rank: number;
  isSelected?: boolean;
  onSelect?: (algorithmId: string) => void;
}

export function SolutionCard({
  algorithm,
  matchScore,
  matchReason,
  rank,
  isSelected,
  onSelect,
}: SolutionCardProps) {
  const riskInfo = RISK_LEVELS[algorithm.riskLevel];

  return (
    <Card
      className={`transition-all ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {rank}
            </span>
            <CardTitle className="text-lg">{algorithm.name}</CardTitle>
          </div>
          <Badge variant={riskInfo.color as 'destructive' | 'warning' | 'success'}>
            {riskInfo.label}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 mt-1">
          <Building2 className="w-3 h-3" />
          {algorithm.organization}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match score */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${matchScore * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(matchScore * 100)}% match
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">{algorithm.shortDescription}</p>

        {/* Match reason */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <p className="text-xs font-medium text-primary">Waarom deze match?</p>
              <p className="text-sm mt-1">{matchReason}</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {algorithm.tags.slice(0, 5).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Use cases */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Toepassingen:</p>
          <ul className="text-sm space-y-1">
            {algorithm.useCases.slice(0, 3).map((useCase, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                {useCase}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onSelect?.(algorithm.id)}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Geselecteerd
              </>
            ) : (
              'Selecteer deze oplossing'
            )}
          </Button>
          {algorithm.sourceUrl && (
            <Button variant="ghost" size="icon" asChild>
              <a href={algorithm.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
