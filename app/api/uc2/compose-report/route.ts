import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { ComposeReportRequestSchema } from '@/lib/schemas/requests';
import { addAuditEvent, getClient } from '@/lib/data/stores';
import { MOCK_MODE } from '@/lib/ai/client';
import { generateReportSection } from '@/lib/ai/openai-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = ComposeReportRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request parameters',
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { client_id, criteria_payload, sections, tone } = validated.data;

    // Get client info for context
    const client = await getClient(client_id);

    // Compose report sections
    const composedSections: Record<string, string> = {};
    const citations: Array<{ section: string; ref: string }> = [];

    if (sections.includes('aanleiding')) {
      composedSections.aanleiding = await composeAanleiding(
        client_id,
        criteria_payload,
        client
      );
    }

    if (sections.includes('ontwikkelingen')) {
      composedSections.ontwikkelingen = await composeOntwikkelingen(
        criteria_payload,
        citations,
        client
      );
    }

    if (sections.includes('criteria')) {
      composedSections.criteria = composeCriteria(criteria_payload, citations);
    }

    if (sections.includes('conclusie')) {
      composedSections.conclusie = await composeConclusie(criteria_payload, client);
    }

    // Add audit event
    addAuditEvent({
      id: nanoid(),
      ts: new Date().toISOString(),
      actor: 'ai',
      client_id,
      action: 'compose-report',
      meta: {
        sections: sections.length,
        criteria_count: criteria_payload.length,
        tone,
        mock_mode: MOCK_MODE,
      },
    });

    return NextResponse.json({
      sections: composedSections,
      citations,
    });
  } catch (error) {
    console.error('Compose report error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: (error as Error).message,
        },
      },
      { status: 500 }
    );
  }
}

async function composeAanleiding(
  client_id: string,
  criteria: any[],
  client: any
): Promise<string> {
  if (MOCK_MODE || !client) {
    return `Dit advies betreft de herindicatie voor cliënt ${client_id}. Op basis van recente ontwikkelingen in de zorgbehoefte is een heroverweging van de huidige indicatie geïndiceerd.`;
  }

  try {
    const aiGenerated = await generateReportSection({
      sectionType: 'aanleiding',
      context: {
        clientName: client.name,
        wlzProfile: client.wlz_profile,
        period: { from: 'recent', to: 'heden' },
      },
    });
    return aiGenerated;
  } catch (error) {
    console.error('AI generation failed for aanleiding, using template:', error);
    return `Dit advies betreft de herindicatie voor ${client.name || client_id}. Op basis van recente ontwikkelingen in de zorgbehoefte is een heroverweging van de huidige indicatie geïndiceerd.`;
  }
}

async function composeOntwikkelingen(
  criteria: any[],
  citations: Array<{ section: string; ref: string }>,
  client: any
): Promise<string> {
  const changedCriteria = criteria.filter(
    (c) => c.status === 'verslechterd' || c.status === 'toegenomen_behoefte'
  );

  if (changedCriteria.length === 0) {
    return 'Er zijn geen significante veranderingen waargenomen in de zorgbehoefte.';
  }

  // Add citations
  changedCriteria.forEach((c, idx) => {
    const ref = `${c.id}_ev${idx}`;
    citations.push({ section: 'ontwikkelingen', ref });
  });

  if (MOCK_MODE || !client) {
    const developments = changedCriteria
      .map((c) => `- ${c.id}: ${c.argument}`)
      .join('\n');
    return `In de afgelopen periode zijn de volgende ontwikkelingen waargenomen:\n\n${developments}`;
  }

  try {
    const aiGenerated = await generateReportSection({
      sectionType: 'ontwikkelingen',
      context: {
        clientName: client.name,
        changedCriteria: changedCriteria.map((c) => ({
          label: c.id,
          status: c.status,
          argument: c.argument,
        })),
      },
    });
    return aiGenerated;
  } catch (error) {
    console.error('AI generation failed for ontwikkelingen, using template:', error);
    const developments = changedCriteria
      .map((c) => `- ${c.id}: ${c.argument}`)
      .join('\n');
    return `In de afgelopen periode zijn de volgende ontwikkelingen waargenomen:\n\n${developments}`;
  }
}

function composeCriteria(
  criteria: any[],
  citations: Array<{ section: string; ref: string }>
): string {
  const criteriaText = criteria
    .map((c, idx) => {
      const evidenceRefs = c.evidence
        .map((e: any, eidx: number) => {
          const ref = `${c.id}_${eidx}`;
          citations.push({ section: 'criteria', ref });
          return `[${ref}]`;
        })
        .join(', ');

      return `**${c.id}**: ${c.status}\n${c.argument}\nBronnen: ${evidenceRefs}\n`;
    })
    .join('\n\n');

  return `# Criteria-evaluatie\n\n${criteriaText}`;
}

async function composeConclusie(criteria: any[], client: any): Promise<string> {
  const needsUpdate = criteria.filter(
    (c) => c.status === 'verslechterd' || c.status === 'toegenomen_behoefte'
  );

  if (MOCK_MODE || !client) {
    if (needsUpdate.length >= 3) {
      return `Op basis van de criteria-evaluatie wordt geadviseerd om over te gaan tot herindicatie naar een zwaarder zorgprofiel. Er zijn ${needsUpdate.length} criteria waarop een verhoogde zorgbehoefte is vastgesteld.`;
    } else if (needsUpdate.length > 0) {
      return `Er zijn ${needsUpdate.length} criteria waarop veranderingen zijn vastgesteld. Overweeg aanpassing van de zorg binnen het huidige profiel of herindicatie indien de zorglast significant is toegenomen.`;
    }
    return 'De huidige zorgbehoefte lijkt stabiel. Geen directe herindicatie noodzakelijk op dit moment.';
  }

  try {
    const aiGenerated = await generateReportSection({
      sectionType: 'conclusie',
      context: {
        clientName: client.name,
        wlzProfile: client.wlz_profile,
        changedCriteria: needsUpdate.map((c) => ({
          label: c.id,
          status: c.status,
          argument: c.argument,
        })),
      },
    });
    return aiGenerated;
  } catch (error) {
    console.error('AI generation failed for conclusie, using template:', error);
    if (needsUpdate.length >= 3) {
      return `Op basis van de criteria-evaluatie wordt geadviseerd om over te gaan tot herindicatie naar een zwaarder zorgprofiel. Er zijn ${needsUpdate.length} criteria waarop een verhoogde zorgbehoefte is vastgesteld.`;
    } else if (needsUpdate.length > 0) {
      return `Er zijn ${needsUpdate.length} criteria waarop veranderingen zijn vastgesteld. Overweeg aanpassing van de zorg binnen het huidige profiel of herindicatie indien de zorglast significant is toegenomen.`;
    }
    return 'De huidige zorgbehoefte lijkt stabiel. Geen directe herindicatie noodzakelijk op dit moment.';
  }
}
