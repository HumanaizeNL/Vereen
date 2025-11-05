'use client';

import * as React from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

type CriterionStatus =
  | 'unknown'
  | 'voldoet'
  | 'niet_voldoet'
  | 'onvoldoende_bewijs'
  | 'toegenomen_behoefte'
  | 'verslechterd';

interface Evidence {
  source_type: string;
  source_id: string;
  text: string;
  relevance: number;
  date?: string;
}

interface CriteriaCardProps {
  id: string;
  label: string;
  description?: string;
  status: CriterionStatus;
  argument?: string;
  evidence?: Evidence[];
  confidence?: number;
  uncertainty?: string;
  onEvidenceClick?: (evidence: Evidence) => void;
}

const statusConfig: Record<
  CriterionStatus,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    variant: 'default' | 'success' | 'destructive' | 'warning' | 'outline';
    color: string;
  }
> = {
  unknown: {
    icon: HelpCircle,
    label: 'Onbekend',
    variant: 'outline',
    color: 'text-gray-500',
  },
  voldoet: {
    icon: CheckCircle2,
    label: 'Voldoet',
    variant: 'success',
    color: 'text-green-600',
  },
  niet_voldoet: {
    icon: XCircle,
    label: 'Voldoet niet',
    variant: 'destructive',
    color: 'text-red-600',
  },
  onvoldoende_bewijs: {
    icon: HelpCircle,
    label: 'Onvoldoende bewijs',
    variant: 'warning',
    color: 'text-yellow-600',
  },
  toegenomen_behoefte: {
    icon: TrendingUp,
    label: 'Toegenomen behoefte',
    variant: 'warning',
    color: 'text-orange-600',
  },
  verslechterd: {
    icon: TrendingDown,
    label: 'Verslechterd',
    variant: 'destructive',
    color: 'text-red-600',
  },
};

export function CriteriaCard({
  id: _id,
  label,
  description,
  status,
  argument,
  evidence = [],
  confidence,
  uncertainty,
  onEvidenceClick,
}: CriteriaCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {label}
              <Icon className={cn('w-5 h-5', config.color)} />
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {argument && (
          <div>
            <h4 className="text-sm font-medium mb-2">Onderbouwing</h4>
            <p className="text-sm text-gray-700">{argument}</p>
          </div>
        )}

        {confidence !== undefined && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">
                Betrouwbaarheid
              </span>
              <span className="text-xs font-medium text-gray-900">
                {Math.round(confidence * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  confidence >= 0.8
                    ? 'bg-green-500'
                    : confidence >= 0.6
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        )}

        {uncertainty && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Let op:</strong> {uncertainty}
            </p>
          </div>
        )}

        {evidence.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Bewijs ({evidence.length})
            </h4>
            <div className="space-y-2">
              {evidence.slice(0, 3).map((ev, idx) => (
                <button
                  key={idx}
                  onClick={() => onEvidenceClick?.(ev)}
                  className="w-full text-left p-3 border rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-gray-700 line-clamp-2 flex-1">
                      {ev.text}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(ev.relevance * 100)}%
                    </Badge>
                  </div>
                  {ev.date && (
                    <p className="text-xs text-gray-500 mt-1">{ev.date}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {ev.source_type} #{ev.source_id}
                  </p>
                </button>
              ))}
              {evidence.length > 3 && (
                <p className="text-xs text-gray-500 text-center py-1">
                  +{evidence.length - 3} meer bewijs
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
