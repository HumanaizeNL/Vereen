'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Application {
  id: string;
  client_id: string;
  status: string;
  version: string;
  form_data: Record<string, any>;
  created_at: string;
  submitted_at?: string;
  client?: {
    name: string;
    wlz_profile: string;
  };
}

interface Evidence {
  field_name: string;
  field_label: string;
  evidence_text: string;
  source_type: string;
  source_reference: string;
  confidence_score: number;
}

interface ValidationResult {
  check_type: string;
  status: string;
  message: string;
}

export default function PrintApplicationPage() {
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  useEffect(() => {
    // Auto-trigger print dialog when data is loaded
    if (!loading && application) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, application]);

  const fetchData = async () => {
    try {
      const [appRes, evidenceRes, validationRes] = await Promise.all([
        fetch(`/api/meerzorg/${params.id}`),
        fetch(`/api/evidence?application_id=${params.id}`),
        fetch(`/api/validation/check?application_id=${params.id}`),
      ]);

      if (appRes.ok) {
        setApplication(await appRes.json());
      }
      if (evidenceRes.ok) {
        const evidenceData = await evidenceRes.json();
        setEvidence(evidenceData.evidence || []);
      }
      if (validationRes.ok) {
        const validationData = await validationRes.json();
        setValidations(validationData.results || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Concept',
      submitted: 'Ingediend',
      under_review: 'In review',
      approved: 'Goedgekeurd',
      rejected: 'Afgewezen',
    } as const;
    return labels[status as keyof typeof labels] || status;
  };

  const getFieldLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      dagzorg_uren: 'Dagzorg uren',
      nachtzorg_uren: 'Nachtzorg uren',
      een_op_een_uren: '1-op-1 begeleiding uren',
      adl_score: 'ADL score',
      adl_categorie: 'ADL categorie',
      gedragsproblematiek: 'Gedragsproblematiek',
      gedragsproblematiek_ernst: 'Ernst gedragsproblematiek',
      nachtzorg_nodig: 'Nachtzorg nodig',
      nachtzorg_frequentie: 'Nachtzorg frequentie',
      duurzaamheid_onderbouwing: 'Duurzaamheid onderbouwing',
    };
    return labels[fieldName] || fieldName;
  };

  const groupEvidenceByField = () => {
    const grouped = new Map<string, Evidence[]>();
    evidence.forEach((item) => {
      if (!grouped.has(item.field_name)) {
        grouped.set(item.field_name, []);
      }
      grouped.get(item.field_name)!.push(item);
    });
    return Array.from(grouped.entries());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Aanvraag voorbereiden voor print...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Aanvraag niet gevonden</p>
      </div>
    );
  }

  const groupedEvidence = groupEvidenceByField();

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      <div className="container mx-auto p-8 bg-white">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Meerzorg Aanvraag</h1>
              <p className="text-xl text-muted-foreground">
                {application.client?.name || 'Onbekende cliënt'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {application.client?.wlz_profile}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                {getStatusLabel(application.status)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Versie: {application.version}
              </p>
              <p className="text-sm text-muted-foreground">
                Aangemaakt: {new Date(application.created_at).toLocaleDateString('nl-NL')}
              </p>
              {application.submitted_at && (
                <p className="text-sm text-muted-foreground">
                  Ingediend: {new Date(application.submitted_at).toLocaleDateString('nl-NL')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Data */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aanvraaggegevens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(application.form_data).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-4 border-b pb-2">
                <p className="font-medium">{getFieldLabel(key)}</p>
                <p className="col-span-2 text-muted-foreground">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value || '-')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Validation Results */}
        {validations.length > 0 && (
          <Card className="mb-6 page-break">
            <CardHeader>
              <CardTitle>Validatie Resultaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {validations.map((result, idx) => (
                <div key={idx} className="flex items-start gap-3 border-b pb-2">
                  {result.status === 'passed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{result.check_type}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Evidence */}
        {groupedEvidence.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bewijsmateriaal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupedEvidence.map(([fieldName, items]) => (
                <div key={fieldName} className="border-b pb-4">
                  <h3 className="font-semibold mb-3">{getFieldLabel(fieldName)}</h3>
                  <div className="space-y-2 pl-4">
                    {items.map((item, idx) => (
                      <div key={idx} className="border-l-2 border-gray-300 pl-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.source_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {(item.confidence_score * 100).toFixed(0)}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.source_reference}
                          </span>
                        </div>
                        <p className="text-sm">{item.evidence_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>
            Dit document is gegenereerd op {new Date().toLocaleString('nl-NL')}
          </p>
          <p className="mt-1">Vereen - Meerzorg Aanvraag Systeem</p>
        </div>
      </div>
    </>
  );
}
