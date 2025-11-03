'use client';

import * as React from 'react';
import { Search, FileText, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface Evidence {
  source_type: string;
  source_id: string;
  text: string;
  relevance: number;
  date?: string;
  section?: string;
  author?: string;
}

interface EvidenceBrowserProps {
  evidence: Evidence[];
  selectedEvidence?: Evidence;
  onEvidenceSelect?: (evidence: Evidence) => void;
}

export function EvidenceBrowser({
  evidence,
  selectedEvidence,
  onEvidenceSelect,
}: EvidenceBrowserProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');

  const filteredEvidence = React.useMemo(() => {
    let filtered = evidence;

    if (filterType !== 'all') {
      filtered = filtered.filter((ev) => ev.source_type === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ev) =>
        ev.text.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.relevance - a.relevance);
  }, [evidence, filterType, searchQuery]);

  const sourceTypes = React.useMemo(() => {
    const types = new Set(evidence.map((ev) => ev.source_type));
    return Array.from(types);
  }, [evidence]);

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Zoek in bewijs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Alle ({evidence.length})
          </button>
          {sourceTypes.map((type) => {
            const count = evidence.filter((ev) => ev.source_type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filterType === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredEvidence.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {searchQuery
                ? 'Geen resultaten gevonden'
                : 'Geen bewijs beschikbaar'}
            </p>
          </div>
        ) : (
          filteredEvidence.map((ev, idx) => (
            <Card
              key={idx}
              className={`cursor-pointer transition-all ${
                selectedEvidence === ev
                  ? 'ring-2 ring-primary shadow-md'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onEvidenceSelect?.(ev)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">
                      {ev.source_type} #{ev.source_id}
                    </span>
                  </div>
                  <Badge
                    variant={
                      ev.relevance >= 0.8
                        ? 'success'
                        : ev.relevance >= 0.6
                          ? 'warning'
                          : 'outline'
                    }
                    className="flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {Math.round(ev.relevance * 100)}%
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {searchQuery ? (
                    <HighlightedText text={ev.text} query={searchQuery} />
                  ) : (
                    ev.text
                  )}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {ev.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{ev.date}</span>
                    </div>
                  )}
                  {ev.section && <span>Sectie: {ev.section}</span>}
                  {ev.author && <span>Door: {ev.author}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 font-medium">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
