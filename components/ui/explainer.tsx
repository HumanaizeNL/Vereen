// Explainer component for contextual help and tooltips
'use client';

import { useState } from 'react';
import { HelpCircle, X, Info, Lightbulb, AlertCircle } from 'lucide-react';
import { Card } from './card';
import { Button } from './button';

interface ExplainerProps {
  title: string;
  content: string | React.ReactNode;
  icon?: React.ReactNode;
  type?: 'info' | 'tip' | 'warning';
  defaultOpen?: boolean;
  compact?: boolean;
}

export function Explainer({
  title,
  content,
  icon,
  type = 'info',
  defaultOpen = false,
  compact = false,
}: ExplainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const typeConfig = {
    info: {
      icon: <Info className="w-4 h-4" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600',
    },
    tip: {
      icon: <Lightbulb className="w-4 h-4" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      iconColor: 'text-green-600',
    },
    warning: {
      icon: <AlertCircle className="w-4 h-4" />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-600',
    },
  };

  const config = typeConfig[type];
  const displayIcon = icon || config.icon;

  if (compact) {
    return (
      <div className="inline-flex items-center group relative">
        <button
          type="button"
          className={`flex items-center gap-1 text-xs ${config.textColor} hover:underline`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {displayIcon}
          <span>{title}</span>
        </button>
        {isOpen && (
          <div
            className={`absolute top-full left-0 mt-2 w-64 z-50 p-3 rounded-lg shadow-lg ${config.bgColor} ${config.borderColor} border`}
          >
            <div className="text-xs text-gray-700 whitespace-normal">{content}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border`}>
      <div className="p-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <span className={config.iconColor}>{displayIcon}</span>
            <h4 className={`font-semibold ${config.textColor}`}>{title}</h4>
          </div>
          {isOpen ? (
            <X className={`w-4 h-4 ${config.iconColor}`} />
          ) : (
            <HelpCircle className={`w-4 h-4 ${config.iconColor}`} />
          )}
        </button>

        {isOpen && (
          <div className={`mt-3 text-sm ${config.textColor} space-y-2`}>
            {typeof content === 'string' ? (
              <p className="whitespace-pre-line">{content}</p>
            ) : (
              content
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

interface AISummaryCardProps {
  summary: string;
  keyPoints?: string[];
  isLoading?: boolean;
  onRegenerate?: () => void;
}

export function AISummaryCard({ summary, keyPoints, isLoading, onRegenerate }: AISummaryCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">AI Samenvatting</h4>
              <p className="text-xs text-blue-600">Automatisch gegenereerd</p>
            </div>
          </div>
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}
              className="text-blue-700 hover:text-blue-900"
            >
              {isLoading ? 'Genereren...' : 'Hernieuw'}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-blue-200 rounded animate-pulse" />
            <div className="h-4 bg-blue-200 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-blue-200 rounded animate-pulse w-4/6" />
          </div>
        ) : (
          <>
            <p className="text-sm text-blue-900 mb-3">{summary}</p>

            {keyPoints && keyPoints.length > 0 && (
              <div className="border-t border-blue-200 pt-3">
                <p className="text-xs font-semibold text-blue-800 mb-2">Kernpunten:</p>
                <ul className="space-y-1">
                  {keyPoints.map((point, index) => (
                    <li key={index} className="text-xs text-blue-900 flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
