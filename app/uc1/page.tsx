'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  Download,
  Users,
  FileText,
  Activity,
  AlertCircle,
  Search,
  Edit,
  Eye,
  BarChart3
} from 'lucide-react';

interface Client {
  client_id: string;
  name: string;
  dob: string;
  bsn_encrypted?: string;
  wlz_profile: string;
  provider: string;
  created_at: string;
}

interface Note {
  id: string;
  client_id: string;
  date: string;
  author: string;
  section: string;
  text: string;
}

interface Measure {
  id: string;
  client_id: string;
  date: string;
  type: string;
  score: string | number;
  comment?: string;
}

interface Incident {
  id: string;
  client_id: string;
  date: string;
  type: string;
  severity: string;
  description: string;
}

interface Stats {
  total_clients: number;
  total_notes: number;
  total_measures: number;
  total_incidents: number;
  by_profile: Record<string, number>;
  by_provider: Record<string, number>;
}

export default function UC1Page() {
  const [activeTab, setActiveTab] = useState<'clients' | 'details'>('clients');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientNotes, setClientNotes] = useState<Note[]>([]);
  const [clientMeasures, setClientMeasures] = useState<Measure[]>([]);
  const [clientIncidents, setClientIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState<string>('');
  const [filterProfile, setFilterProfile] = useState<string>('');
  const [detailsTab, setDetailsTab] = useState<'notes' | 'measures' | 'incidents'>('notes');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Load clients on mount
  useEffect(() => {
    loadClients();
    loadStats();
  }, [filterProvider, filterProfile]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProvider) params.append('provider', filterProvider);
      if (filterProfile) params.append('wlz_profile', filterProfile);

      const response = await fetch(`/api/uc1/clients?${params}`);
      if (!response.ok) throw new Error('Failed to load clients');

      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Fout bij laden van cliënten');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/uc1/stats');
      if (!response.ok) throw new Error('Failed to load stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadClientDetails = async (clientId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/uc1/clients/${clientId}?include_summary=true`);
      if (!response.ok) throw new Error('Failed to load client details');

      const data = await response.json();
      setSelectedClient(data.client);
      setClientNotes(data.notes || []);
      setClientMeasures(data.measures || []);
      setClientIncidents(data.incidents || []);
      setActiveTab('details');
    } catch (error) {
      console.error('Error loading client details:', error);
      alert('Fout bij laden van cliëntgegevens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (files: string[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    // Reload clients and stats after upload
    loadClients();
    loadStats();
  };

  const downloadTemplate = async (type: string) => {
    try {
      const response = await fetch(`/api/uc1/templates?type=${type}`);
      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Fout bij downloaden van template');
    }
  };

  const loadMockData = async () => {
    try {
      const response = await fetch('/api/dev/load-mock-data', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to load mock data');

      alert('Mock data succesvol geladen!');
      loadClients();
      loadStats();
    } catch (error) {
      console.error('Error loading mock data:', error);
      alert('Fout bij laden van mock data');
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.client_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueProviders = Array.from(new Set(clients.map((c) => c.provider)));
  const uniqueProfiles = Array.from(new Set(clients.map((c) => c.wlz_profile)));

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Left Panel: Upload & Filters */}
      <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Data Upload</h3>
            <FileUpload
              clientId={selectedClient?.client_id || 'new'}
              onUploadComplete={handleUploadComplete}
              maxFiles={20}
            />
            <p className="text-xs text-gray-500 mt-2">
              Upload CSV, PDF of DOCX bestanden
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Recent geüpload
              </h3>
              <div className="space-y-1">
                {uploadedFiles.slice(-5).map((file, idx) => (
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
            <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Zorgaanbieder
                </label>
                <select
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Alle aanbieders</option>
                  {uniqueProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  WLZ Profiel
                </label>
                <select
                  value={filterProfile}
                  onChange={(e) => setFilterProfile(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Alle profielen</option>
                  {uniqueProfiles.map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Templates</h3>
            <div className="space-y-2">
              <Button
                onClick={() => downloadTemplate('clients')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Cliënten template
              </Button>
              <Button
                onClick={() => downloadTemplate('notes')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Notities template
              </Button>
              <Button
                onClick={() => downloadTemplate('measures')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Metingen template
              </Button>
              <Button
                onClick={() => downloadTemplate('incidents')}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Incidenten template
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Development
            </h3>
            <Button
              onClick={loadMockData}
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Activity className="w-4 h-4 mr-2" />
              Laad mock data
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Data Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Beheer cliëntgegevens en upload documenten
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveTab('clients')}
                variant={activeTab === 'clients' ? 'default' : 'outline'}
              >
                <Users className="w-4 h-4 mr-2" />
                Cliënten ({clients.length})
              </Button>
              {selectedClient && (
                <Button
                  onClick={() => setActiveTab('details')}
                  variant={activeTab === 'details' ? 'default' : 'outline'}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'clients' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek op naam of cliënt-ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Client List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredClients.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Geen cliënten gevonden
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload bestanden of laad mock data om te beginnen
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredClients.map((client) => (
                    <Card
                      key={client.client_id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => loadClientDetails(client.client_id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {client.name}
                            </h3>
                            <Badge variant="outline">
                              {client.wlz_profile}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">Cliënt-ID:</span>{' '}
                              {client.client_id}
                            </div>
                            <div className="text-gray-600">
                              <span className="font-medium">Geboortedatum:</span>{' '}
                              {client.dob}
                            </div>
                            <div className="text-gray-600">
                              <span className="font-medium">Aanbieder:</span>{' '}
                              {client.provider}
                            </div>
                            <div className="text-gray-600">
                              <span className="font-medium">Aangemaakt:</span>{' '}
                              {new Date(client.created_at).toLocaleDateString('nl-NL')}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && selectedClient && (
            <div className="space-y-4">
              {/* Client Header */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedClient.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedClient.client_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Bewerken
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTab('clients');
                        setSelectedClient(null);
                      }}
                    >
                      Terug
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">WLZ Profiel</p>
                    <Badge className="mt-1">{selectedClient.wlz_profile}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Zorgaanbieder</p>
                    <p className="text-gray-900 mt-1">{selectedClient.provider}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Geboortedatum</p>
                    <p className="text-gray-900 mt-1">{selectedClient.dob}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Aangemaakt</p>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedClient.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Data Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-6 px-1">
                  <button
                    onClick={() => setDetailsTab('notes')}
                    className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      detailsTab === 'notes'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Notities ({clientNotes.length})
                  </button>
                  <button
                    onClick={() => setDetailsTab('measures')}
                    className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      detailsTab === 'measures'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Metingen ({clientMeasures.length})
                  </button>
                  <button
                    onClick={() => setDetailsTab('incidents')}
                    className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      detailsTab === 'incidents'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Incidenten ({clientIncidents.length})
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {detailsTab === 'notes' && (
                <div className="space-y-3">
                  {clientNotes.length === 0 ? (
                    <Card className="p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">Geen notities beschikbaar</p>
                    </Card>
                  ) : (
                    clientNotes.map((note) => (
                      <Card key={note.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{note.section}</Badge>
                            <span className="text-sm text-gray-600">{note.date}</span>
                          </div>
                          <span className="text-sm text-gray-500">{note.author}</span>
                        </div>
                        <p className="text-sm text-gray-900">{note.text}</p>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {detailsTab === 'measures' && (
                <div className="space-y-3">
                  {clientMeasures.length === 0 ? (
                    <Card className="p-8 text-center">
                      <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">Geen metingen beschikbaar</p>
                    </Card>
                  ) : (
                    <div className="grid gap-3">
                      {clientMeasures.map((measure) => (
                        <Card key={measure.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge>{measure.type}</Badge>
                              <span className="text-sm text-gray-600">{measure.date}</span>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">
                              {measure.score}
                            </span>
                          </div>
                          {measure.comment && (
                            <p className="text-sm text-gray-600">{measure.comment}</p>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailsTab === 'incidents' && (
                <div className="space-y-3">
                  {clientIncidents.length === 0 ? (
                    <Card className="p-8 text-center">
                      <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">Geen incidenten beschikbaar</p>
                    </Card>
                  ) : (
                    clientIncidents.map((incident) => (
                      <Card key={incident.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                incident.severity === 'Hoog'
                                  ? 'destructive'
                                  : incident.severity === 'Matig'
                                  ? 'default'
                                  : 'outline'
                              }
                            >
                              {incident.severity}
                            </Badge>
                            <span className="text-sm font-medium text-gray-900">
                              {incident.type}
                            </span>
                            <span className="text-sm text-gray-600">{incident.date}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{incident.description}</p>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Right Panel: Statistics */}
      <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Statistieken</h3>
            {stats ? (
              <div className="space-y-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Totaal Cliënten</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {stats.total_clients}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Totaal Notities</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {stats.total_notes}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Totaal Metingen</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {stats.total_measures}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Totaal Incidenten</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {stats.total_incidents}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </Card>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Per WLZ Profiel
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(stats.by_profile || {}).map(([profile, count]) => (
                      <div
                        key={profile}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">{profile}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Per Zorgaanbieder
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(stats.by_provider || {}).map(([provider, count]) => (
                      <div
                        key={provider}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">{provider}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
