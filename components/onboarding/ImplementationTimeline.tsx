'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ComplianceItem, GovernanceRole, GovernanceStep } from '@/lib/data/vng-governance';
import { GOVERNANCE_PHASES } from '@/lib/data/vng-governance';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface ImplementationTimelineProps {
  steps: GovernanceStep[];
  roles: GovernanceRole[];
  compliance: ComplianceItem[];
  algorithmName?: string;
  riskLevel: 'hoog' | 'beperkt' | 'minimaal';
}

export function ImplementationTimeline({
  steps,
  roles,
  compliance,
  algorithmName,
  riskLevel,
}: ImplementationTimelineProps) {
  const [expandedPhases, setExpandedPhases] = useState<string[]>([GOVERNANCE_PHASES[0]]);

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev =>
      prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
    );
  };

  const stepsByPhase = GOVERNANCE_PHASES.reduce(
    (acc, phase) => {
      acc[phase] = steps.filter(step => step.phase === phase);
      return acc;
    },
    {} as Record<string, GovernanceStep[]>
  );

  const riskColors = {
    hoog: 'destructive',
    beperkt: 'warning',
    minimaal: 'success',
  } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Implementatieplan</CardTitle>
              <CardDescription>
                {algorithmName
                  ? `Plan voor implementatie van "${algorithmName}"`
                  : 'VNG AI Governance stappenplan'}
              </CardDescription>
            </div>
            <Badge variant={riskColors[riskLevel]}>
              {riskLevel === 'hoog'
                ? 'Hoog Risico'
                : riskLevel === 'beperkt'
                  ? 'Beperkt Risico'
                  : 'Minimaal Risico'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{steps.length}</div>
              <div className="text-sm text-muted-foreground">Stappen</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{roles.length}</div>
              <div className="text-sm text-muted-foreground">Rollen</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{compliance.length}</div>
              <div className="text-sm text-muted-foreground">Compliance items</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {GOVERNANCE_PHASES.map((phase, phaseIndex) => {
          const phaseSteps = stepsByPhase[phase];
          const isExpanded = expandedPhases.includes(phase);

          return (
            <Card key={phase}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => togglePhase(phase)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {phaseIndex + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{phase}</CardTitle>
                      <CardDescription>{phaseSteps.length} stappen</CardDescription>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-4 ml-4 border-l-2 border-muted pl-6">
                    {phaseSteps.map((step, stepIndex) => (
                      <div key={step.id} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-[29px] w-3 h-3 rounded-full bg-primary" />

                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                          <h4 className="font-semibold">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>

                          {/* Activities */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Activiteiten:
                            </p>
                            <ul className="text-sm space-y-1">
                              {step.activities.map((activity, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Deliverables */}
                          <div className="flex flex-wrap gap-2">
                            {step.deliverables.map((deliverable, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                {deliverable}
                              </Badge>
                            ))}
                          </div>

                          {/* Roles */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>Betrokken: {step.roles.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Required Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Benodigde Rollen
          </CardTitle>
          <CardDescription>
            Deze rollen zijn vereist voor een {riskLevel} risico AI-implementatie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map(role => (
              <div key={role.id} className="p-4 border rounded-lg">
                <h4 className="font-semibold">{role.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                <ul className="text-sm mt-2 space-y-1">
                  {role.responsibilities.slice(0, 3).map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Compliance Checklist
          </CardTitle>
          <CardDescription>
            Verplichtingen vanuit AI-verordening en AVG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {compliance.map(item => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.applicableTo.includes('hoog') &&
                  !item.applicableTo.includes('minimaal') ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Regelgeving: {item.regulation}</span>
                    {item.deadline && <span>Deadline: {item.deadline}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
