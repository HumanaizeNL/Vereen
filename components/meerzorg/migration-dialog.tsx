'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowRight, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MigrationWarning {
  field: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  action_required: boolean;
}

interface MigrationPreview {
  version_from: string;
  version_to: string;
  warnings: MigrationWarning[];
  changes_applied: Record<string, any>;
}

interface MigrationDialogProps {
  applicationId: string;
  currentVersion: string;
  onMigrationComplete: () => void;
}

export function MigrationDialog({
  applicationId,
  currentVersion,
  onMigrationComplete,
}: MigrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meerzorg/${applicationId}/migrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_version: '2026',
          confirm_changes: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch migration preview');
      }

      const data = await response.json();
      setPreview(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/meerzorg/${applicationId}/migrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_version: '2026',
          confirm_changes: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to migrate application');
      }

      const data = await response.json();
      if (data.success) {
        setOpen(false);
        onMigrationComplete();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      error: { className: 'bg-red-600', label: 'Fout' },
      warning: { className: 'bg-yellow-600', label: 'Waarschuwing' },
      info: { className: 'bg-blue-600', label: 'Info' },
    };

    const config = variants[severity as keyof typeof variants];
    if (!config) return null;

    return (
      <Badge variant="default" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const hasBlockingIssues = () => {
    return preview?.warnings.some(w => w.severity === 'error' && w.action_required) || false;
  };

  if (currentVersion !== '2025') {
    return null; // Only show for 2025 applications
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen && !preview) {
        fetchPreview();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          Migreer naar 2026
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Migreren naar 2026 Framework
          </DialogTitle>
          <DialogDescription>
            Bekijk de wijzigingen en waarschuwingen voordat u de migratie bevestigt
          </DialogDescription>
        </DialogHeader>

        {loading && !preview && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {preview && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Versie transitie</AlertTitle>
              <AlertDescription>
                Deze aanvraag wordt gemigreerd van {preview.version_from} naar {preview.version_to}.
                Controleer alle waarschuwingen hieronder.
              </AlertDescription>
            </Alert>

            {Object.keys(preview.changes_applied).length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="font-semibold mb-3">Automatische aanpassingen:</p>
                  <ul className="space-y-2">
                    {Object.entries(preview.changes_applied).map(([field, value]) => (
                      <li key={field} className="text-sm flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{field}:</span>
                        <span>{String(value)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <p className="font-semibold">
                Waarschuwingen ({preview.warnings.length}):
              </p>
              {preview.warnings.map((warning, idx) => (
                <Card key={idx} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(warning.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-sm">{warning.field}</p>
                          {getSeverityBadge(warning.severity)}
                          {warning.action_required && (
                            <Badge variant="outline">Actie vereist</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {warning.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasBlockingIssues() && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Blokkerende problemen gedetecteerd</AlertTitle>
                <AlertDescription>
                  Los eerst alle foutmeldingen op voordat u kunt migreren.
                  Na migratie moeten de gemarkeerde velden worden ingevuld.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Annuleren
          </Button>
          <Button
            onClick={handleMigrate}
            disabled={loading || !preview}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {loading ? 'Migreren...' : 'Bevestig migratie'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
