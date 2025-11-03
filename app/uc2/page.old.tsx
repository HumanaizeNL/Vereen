'use client';

import { useState } from 'react';

export default function UC2Page() {
  const [activeTab, setActiveTab] = useState<'criteria' | 'preview'>('criteria');

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Left Panel: Upload & Filters */}
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Dossier Upload</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <div className="text-gray-500 text-sm">
                <div className="mb-2">📁</div>
                <div>Sleep bestanden hier</div>
                <div className="text-xs mt-1">CSV, PDF, DOCX, RTF</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
            <div className="space-y-2 text-sm">
              <div>
                <label className="block text-gray-700 mb-1">Periode</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Sectie</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Alle secties</option>
                  <option>Observaties</option>
                  <option>Interventies</option>
                  <option>Metingen</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">KPI's</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-100 rounded">
                <div className="text-gray-600">Criteria ingevuld</div>
                <div className="text-2xl font-bold text-gray-900">0/12</div>
              </div>
              <div className="p-2 bg-gray-100 rounded">
                <div className="text-gray-600">Evidence</div>
                <div className="text-2xl font-bold text-gray-900">0</div>
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
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'criteria'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Criteria Evaluatie
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
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
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'criteria' && (
            <div className="max-w-4xl space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
                ℹ️ Upload eerst een dossier om criteria te kunnen evalueren.
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mt-6">
                VV8 Criteria (2026)
              </h2>

              {/* Example criteria items */}
              {[
                { id: 'ADL', label: 'ADL-afhankelijkheid', status: 'unknown' },
                { id: 'NACHT', label: 'Nachtelijk toezicht', status: 'unknown' },
                { id: 'GEDRAG', label: 'Gedragsproblematiek', status: 'unknown' },
              ].map((criterion) => (
                <div
                  key={criterion.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {criterion.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          Status: Onbekend • 0 evidence
                        </div>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Evalueer →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="max-w-4xl">
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
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                  >
                    Export naar DOCX
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Panel: Evidence */}
      <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Evidence</h3>
          <div className="text-sm text-gray-500 text-center py-8">
            Selecteer een criterium om evidence te bekijken
          </div>
        </div>
      </aside>
    </div>
  );
}
