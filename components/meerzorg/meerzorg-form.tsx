'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EvidenceIndicator } from './evidence-indicator';

interface Evidence {
  id: string;
  field_name: string;
  source_type: string;
  source_reference: string;
  evidence_text: string;
  confidence_score: number;
  created_at: string;
}

interface MeerzorgFormProps {
  applicationId: string;
  formData: Record<string, any>;
  version: string;
  readOnly?: boolean;
  onUpdate?: () => void;
}

export function MeerzorgForm({
  applicationId,
  formData: initialFormData,
  version,
  readOnly = false,
  onUpdate,
}: MeerzorgFormProps) {
  const [formData, setFormData] = useState(initialFormData || {});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evidenceByField, setEvidenceByField] = useState<Record<string, Evidence[]>>({});

  useEffect(() => {
    fetchEvidence();
  }, [applicationId]);

  const fetchEvidence = async () => {
    try {
      const response = await fetch(`/api/evidence?application_id=${applicationId}`);
      if (!response.ok) throw new Error('Failed to fetch evidence');
      const data = await response.json();
      const evidenceData = data.evidence || [];
      setEvidence(evidenceData);

      // Group evidence by field_name
      const grouped = evidenceData.reduce((acc: Record<string, Evidence[]>, item: Evidence) => {
        if (!acc[item.field_name]) {
          acc[item.field_name] = [];
        }
        acc[item.field_name].push(item);
        return acc;
      }, {});
      setEvidenceByField(grouped);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    }
  };

  const getFieldEvidence = (fieldName: string) => {
    return evidenceByField[fieldName] || [];
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/meerzorg/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_data: formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save form data');
      }

      setSaveMessage('Opgeslagen');
      if (onUpdate) onUpdate();

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Fout bij opslaan');
      console.error('Error saving form:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Opslaan...' : saveMessage || 'Opslaan'}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cliëntgegevens</CardTitle>
          <CardDescription>
            Basis informatie over de cliënt en zorgbehoefte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="dagzorg_uren">Dagzorg uren</Label>
                <EvidenceIndicator
                  fieldName="dagzorg_uren"
                  evidence={getFieldEvidence('dagzorg_uren')}
                />
              </div>
              <Input
                id="dagzorg_uren"
                type="number"
                value={formData.dagzorg_uren || ''}
                onChange={(e) => handleChange('dagzorg_uren', e.target.value)}
                disabled={readOnly}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {version === '2026' ? '16' : '18'} uur per dag
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="nachtzorg_uren">Nachtzorg uren</Label>
                <EvidenceIndicator
                  fieldName="nachtzorg_uren"
                  evidence={getFieldEvidence('nachtzorg_uren')}
                />
              </div>
              <Input
                id="nachtzorg_uren"
                type="number"
                value={formData.nachtzorg_uren || ''}
                onChange={(e) => handleChange('nachtzorg_uren', e.target.value)}
                disabled={readOnly}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {version === '2026' ? '12' : '14'} uur per nacht
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="een_op_een_uren">1-op-1 begeleiding uren</Label>
              <EvidenceIndicator
                fieldName="een_op_een_uren"
                evidence={getFieldEvidence('een_op_een_uren')}
              />
            </div>
            <Input
              id="een_op_een_uren"
              type="number"
              value={formData.een_op_een_uren || ''}
              onChange={(e) => handleChange('een_op_een_uren', e.target.value)}
              disabled={readOnly}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Maximum: {version === '2026' ? '8' : '10'} uur
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ADL en zelfredzaamheid</CardTitle>
          <CardDescription>
            Beperkingen in algemene dagelijkse levensverrichtingen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="adl_score">ADL score</Label>
                <EvidenceIndicator
                  fieldName="adl_score"
                  evidence={getFieldEvidence('adl_score')}
                />
              </div>
              <Input
                id="adl_score"
                type="number"
                value={formData.adl_score || ''}
                onChange={(e) => handleChange('adl_score', e.target.value)}
                disabled={readOnly}
                placeholder="0-6"
              />
              <p className="text-xs text-muted-foreground">Katz ADL index (0-6)</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="adl_categorie">ADL categorie</Label>
                <EvidenceIndicator
                  fieldName="adl_categorie"
                  evidence={getFieldEvidence('adl_categorie')}
                />
              </div>
              <Select
                value={formData.adl_categorie || ''}
                onValueChange={(value) => handleChange('adl_categorie', value)}
                disabled={readOnly}
              >
                <SelectTrigger id="adl_categorie">
                  <SelectValue placeholder="Selecteer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zelfstandig">Zelfstandig (A)</SelectItem>
                  <SelectItem value="licht_afhankelijk">
                    Licht afhankelijk (B-C)
                  </SelectItem>
                  <SelectItem value="matig_afhankelijk">
                    Matig afhankelijk (D-E)
                  </SelectItem>
                  <SelectItem value="volledig_afhankelijk">
                    Volledig afhankelijk (F-G)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gedragsproblematiek (BPSD)</CardTitle>
          <CardDescription>
            Gedragsstoornissen en psychische symptomen bij dementie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="gedragsproblematiek">Gedragsproblematiek aanwezig?</Label>
              <EvidenceIndicator
                fieldName="gedragsproblematiek"
                evidence={getFieldEvidence('gedragsproblematiek')}
              />
            </div>
            <Select
              value={formData.gedragsproblematiek || ''}
              onValueChange={(value) => handleChange('gedragsproblematiek', value)}
              disabled={readOnly}
            >
              <SelectTrigger id="gedragsproblematiek">
                <SelectValue placeholder="Selecteer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nee">Nee</SelectItem>
                <SelectItem value="ja">Ja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.gedragsproblematiek === 'ja' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="gedragsproblematiek_ernst">Ernst</Label>
                  <EvidenceIndicator
                    fieldName="gedragsproblematiek_ernst"
                    evidence={getFieldEvidence('gedragsproblematiek_ernst')}
                  />
                </div>
                <Select
                  value={formData.gedragsproblematiek_ernst || ''}
                  onValueChange={(value) =>
                    handleChange('gedragsproblematiek_ernst', value)
                  }
                  disabled={readOnly}
                >
                  <SelectTrigger id="gedragsproblematiek_ernst">
                    <SelectValue placeholder="Selecteer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licht">Licht</SelectItem>
                    <SelectItem value="matig">Matig</SelectItem>
                    <SelectItem value="ernstig">Ernstig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gedragsproblematiek_toelichting">
                  Toelichting gedragsproblematiek
                </Label>
                <Textarea
                  id="gedragsproblematiek_toelichting"
                  value={formData.gedragsproblematiek_toelichting || ''}
                  onChange={(e) =>
                    handleChange('gedragsproblematiek_toelichting', e.target.value)
                  }
                  disabled={readOnly}
                  rows={4}
                  placeholder="Beschrijf de aard en frequentie van de gedragsproblematiek..."
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nachtzorg</CardTitle>
          <CardDescription>Zorgbehoefte tijdens de nacht</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nachtzorg_nodig">Nachtzorg nodig?</Label>
            <Select
              value={formData.nachtzorg_nodig || ''}
              onValueChange={(value) => handleChange('nachtzorg_nodig', value)}
              disabled={readOnly}
            >
              <SelectTrigger id="nachtzorg_nodig">
                <SelectValue placeholder="Selecteer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nee">Nee</SelectItem>
                <SelectItem value="ja">Ja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.nachtzorg_nodig === 'ja' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nachtzorg_frequentie">Frequentie</Label>
                <Select
                  value={formData.nachtzorg_frequentie || ''}
                  onValueChange={(value) => handleChange('nachtzorg_frequentie', value)}
                  disabled={readOnly}
                >
                  <SelectTrigger id="nachtzorg_frequentie">
                    <SelectValue placeholder="Selecteer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incidenteel">Incidenteel (1-2x/week)</SelectItem>
                    <SelectItem value="regelmatig">Regelmatig (3-5x/week)</SelectItem>
                    <SelectItem value="dagelijks">Dagelijks (6-7x/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nachtzorg_onderbouwing">
                  Onderbouwing nachtzorg behoefte
                </Label>
                <Textarea
                  id="nachtzorg_onderbouwing"
                  value={formData.nachtzorg_onderbouwing || ''}
                  onChange={(e) =>
                    handleChange('nachtzorg_onderbouwing', e.target.value)
                  }
                  disabled={readOnly}
                  rows={4}
                  placeholder="Beschrijf waarom nachtzorg noodzakelijk is..."
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {version === '2026' && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Duurzaamheid (2026 vereist)</CardTitle>
            <CardDescription>
              Onderbouwing van de blijvende zorgbehoefte (2026 framework)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duurzaamheid_onderbouwing">
                Duurzaamheid onderbouwing *
              </Label>
              <Textarea
                id="duurzaamheid_onderbouwing"
                value={formData.duurzaamheid_onderbouwing || ''}
                onChange={(e) =>
                  handleChange('duurzaamheid_onderbouwing', e.target.value)
                }
                disabled={readOnly}
                rows={4}
                placeholder="Beschrijf waarom de zorgbehoefte blijvend/structureel is..."
              />
              <p className="text-xs text-muted-foreground">
                Dit veld is verplicht voor het 2026 framework
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2" size="lg">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Opslaan...' : saveMessage || 'Wijzigingen opslaan'}
          </Button>
        </div>
      )}
    </div>
  );
}
