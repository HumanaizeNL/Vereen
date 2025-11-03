'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { CriteriaCard } from '@/components/criteria-card';
import { EvidenceBrowser } from '@/components/evidence-browser';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Evidence {
  source_type: string;
  source_id: string;
  text: string;
  relevance: number;
  date?: string;
  section?: string;
  author?: string;
}

interface Criterion {
  id: string;
  label: string;
  description: string;
  status: 'unknown' | 'voldoet' | 'niet_voldoet' | 'onvoldoende_bewijs' | 'toegenomen_behoefte' | 'verslechterd';
  argument?: string;
  evidence: Evidence[];
  confidence?: number;
  uncertainty?: string;
}

const VV8_CRITERIA_2026 = [
  {
    id: 'ADL',
    label: 'ADL-afhankelijkheid',
    description: 'Mate van afhankelijkheid bij algemene dagelijkse levensverrichtingen',
  },
  {
    id: 'NACHT_TOEZICHT',
    label: 'Nachtelijk toezicht',
    description: 'Behoefte aan toezicht of zorg tijdens de nacht',
  },
  {
    id: 'GEDRAG',
    label: 'Gedragsproblematiek',
    description: 'Aanwezigheid van probleemgedrag dat zorg vereist',
  },
  {
    id: 'COMMUNICATIE',
    label: 'Communicatie',
    description: 'Mogelijkheden tot communicatie en sociale interactie',
  },
  {
    id: 'MOBILITEIT',
    label: 'Mobiliteit',
    description: 'Verplaatsingsmogelijkheden en loopvermogen',
  },
  {
    id: 'PSYCHOSOCIAAL',
    label: 'Psychosociaal functioneren',
    description: 'Mentaal welbevinden en sociale participatie',
  },
  {
    id: 'SOCIALE_REDZAAMHEID',
    label: 'Sociale redzaamheid',
    description: 'Vermogen om sociale taken uit te voeren',
  },
  {
    id: 'ZELFSTANDIGHEID',
    label: 'Zelfstandigheid',
    description: 'Mate waarin iemand zelfstandig kan functioneren',
  },
];

export default function UC2Page() {
  const [activeTab, setActiveTab] = useState<'criteria' | 'preview'>('criteria');
  const [clientId, setClientId] = useState<string>('C123');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>(
    VV8_CRITERIA_2026.map((c) => ({ ...c, status: 'unknown' as const, evidence: [] }))
  );
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | undefined>();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [periodFrom, setPeriodFrom] = useState('2025-06-01');
  const [periodTo, setPeriodTo] = useState('2025-11-02');

  const handleUploadComplete = (files: string[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleEvaluateCriteria = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch('/api/uc2/evaluate-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          period: { from: periodFrom, to: periodTo },
          criteria_set: 'herindicatie.vv8.2026',
          max_evidence: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate criteria');
      }

      const data = await response.json();
      setCriteria(data.criteria);
    } catch (error) {
      console.error('Error evaluating criteria:', error);
      alert('Er is een fout opgetreden bij het evalueren van de criteria');
    } finally {
      setIsEvaluating(false);
    }
  };

  const allEvidence = criteria.flatMap((c) => c.evidence);
  const evaluatedCount = criteria.filter((c) => c.status !== 'unknown').length;

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Left Panel: Upload & Filters */}
      <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Dossier Upload</h3>
            <FileUpload
              clientId={clientId}
              onUploadComplete={handleUploadComplete}
              maxFiles={20}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Geüploade bestanden
              </h3>
              <div className="space-y-1">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-600 truncate flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    {file}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Periode</h3>
            <div className="space-y-2 text-sm">
              <div>
                <label className="block text-gray-700 mb-1">Van</label>
                <input
                  type="date"
                  value={periodFrom}
                  onChange={(e) => setPeriodFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Tot</label>
                <input
                  type="date"
                  value={periodTo}
                  onChange={(e) => setPeriodTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Acties</h3>
            <Button
              onClick={handleEvaluateCriteria}
              disabled={uploadedFiles.length === 0 || isEvaluating}
              className="w-full"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evalueren...
                </>
              ) : (
                'Evalueer Criteria'
              )}
            </Button>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Voortgang</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-gray-600">Criteria geëvalueerd</div>
                <div className="text-2xl font-bold text-gray-900">
                  {evaluatedCount}/{criteria.length}
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-gray-600">Evidence gevonden</div>
                <div className="text-2xl font-bold text-gray-900">
                  {allEvidence.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('criteria')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'criteria'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Criteria Evaluatie
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview / Export
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'criteria' && (
            <div className="max-w-5xl mx-auto space-y-4">
              {uploadedFiles.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
                  ℹ️ Upload eerst dossierbestanden om criteria te kunnen
                  evalueren.
                </div>
              )}

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  VV8 Criteria (2026)
                </h2>
                <Badge variant="outline">
                  {evaluatedCount} van {criteria.length} geëvalueerd
                </Badge>
              </div>

              <div className="grid gap-4">
                {criteria.map((criterion) => (
                  <CriteriaCard
                    key={criterion.id}
                    {...criterion}
                    onEvidenceClick={(evidence) => setSelectedEvidence(evidence)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Export Opties
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>herindicatie_2026_v1</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm text-gray-700">
                        Anonimiseer NAW/BSN gegevens
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm text-gray-700">
                        Inclusief bronnenbijlage (XLSX)
                      </span>
                    </label>
                  </div>
                  <Button disabled={evaluatedCount === 0} className="w-full">
                    Export naar DOCX
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Panel: Evidence Browser */}
      <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">
            Evidence Browser
          </h3>
          <EvidenceBrowser
            evidence={allEvidence}
            selectedEvidence={selectedEvidence}
            onEvidenceSelect={setSelectedEvidence}
          />
        </div>
      </aside>
    </div>
  );
}
