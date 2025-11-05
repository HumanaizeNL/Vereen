import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

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
  description?: string;
  status: string;
  argument?: string;
  evidence: Evidence[];
  confidence?: number;
  uncertainty?: string;
}

interface ExportData {
  client_id: string;
  period: {
    from: string;
    to: string;
  };
  criteria: Criterion[];
  generated_at: string;
}

interface ExportOptions {
  anonymize?: boolean;
  include_evidence_appendix?: boolean;
  template?: string;
}

const STATUS_LABELS: Record<string, string> = {
  unknown: 'Onbekend',
  voldoet: 'Voldoet',
  niet_voldoet: 'Voldoet niet',
  onvoldoende_bewijs: 'Onvoldoende bewijs',
  toegenomen_behoefte: 'Toegenomen behoefte',
  verslechterd: 'Verslechterd',
};

export async function generateHerindicatieReport(
  data: ExportData,
  options: ExportOptions = {}
): Promise<Buffer> {
  const {
    anonymize = false,
    include_evidence_appendix = true,
    template = 'herindicatie_2026_v1',
  } = options;

  const clientId = anonymize ? '[GEANONIMISEERD]' : data.client_id;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: 'Herindicatie Adviesrapport',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // Metadata
          new Paragraph({
            children: [
              new TextRun({
                text: `Cliënt ID: ${clientId}`,
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Periode: ${data.period.from} t/m ${data.period.to}`,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Gegenereerd op: ${new Date(data.generated_at).toLocaleString('nl-NL')}`,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Samenvatting
          new Paragraph({
            text: '1. Samenvatting',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          ...generateSummary(data.criteria),

          // Criteria Evaluatie
          new Paragraph({
            text: '2. Criteria Evaluatie',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          ...generateCriteriaSection(data.criteria),

          // Evidence Appendix
          ...(include_evidence_appendix
            ? generateEvidenceAppendix(data.criteria, anonymize)
            : []),

          // Footer
          new Paragraph({
            text: '',
            spacing: { before: 400 },
          }),
          new Paragraph({
            text: '---',
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dit rapport is automatisch gegenereerd door Vereen AI',
                italics: true,
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

function generateSummary(criteria: Criterion[]): Paragraph[] {
  const changedCriteria = criteria.filter(
    (c) => c.status === 'verslechterd' || c.status === 'toegenomen_behoefte'
  );
  const evaluatedCount = criteria.filter((c) => c.status !== 'unknown').length;

  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: `Van de ${criteria.length} geëvalueerde VV8 criteria zijn er ${changedCriteria.length} waarin een significante verandering is waargenomen.`,
        }),
      ],
      spacing: { after: 200 },
    }),
  ];

  if (changedCriteria.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: 'Veranderingen:',
        spacing: { before: 200, after: 100 },
      })
    );

    changedCriteria.forEach((c) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${c.label}: `,
              bold: true,
            }),
            new TextRun({
              text: STATUS_LABELS[c.status] || c.status,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  // Recommendation
  paragraphs.push(
    new Paragraph({
      text: '',
      spacing: { before: 200 },
    })
  );

  let recommendation = '';
  if (changedCriteria.length >= 3) {
    recommendation = `Op basis van de criteria-evaluatie wordt geadviseerd om over te gaan tot herindicatie naar een zwaarder zorgprofiel. Er zijn ${changedCriteria.length} criteria waarop een verhoogde zorgbehoefte is vastgesteld.`;
  } else if (changedCriteria.length > 0) {
    recommendation = `Er zijn ${changedCriteria.length} criteria waarop veranderingen zijn vastgesteld. Overweeg aanpassing van de zorg binnen het huidige profiel of herindicatie indien de zorglast significant is toegenomen.`;
  } else {
    recommendation =
      'De huidige zorgbehoefte lijkt stabiel. Geen directe herindicatie noodzakelijk op dit moment.';
  }

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Advies: ',
          bold: true,
        }),
        new TextRun({
          text: recommendation,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  return paragraphs;
}

function generateCriteriaSection(criteria: Criterion[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  criteria.forEach((criterion, index) => {
    // Criterion heading
    paragraphs.push(
      new Paragraph({
        text: `2.${index + 1} ${criterion.label}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );

    // Description
    if (criterion.description) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: criterion.description,
              italics: true,
            }),
          ],
          spacing: { after: 150 },
        })
      );
    }

    // Status
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Status: ',
            bold: true,
          }),
          new TextRun({
            text: STATUS_LABELS[criterion.status] || criterion.status,
          }),
        ],
        spacing: { after: 100 },
      })
    );

    // Confidence
    if (criterion.confidence !== undefined) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Betrouwbaarheid: ',
              bold: true,
            }),
            new TextRun({
              text: `${Math.round(criterion.confidence * 100)}%`,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    // Argument
    if (criterion.argument) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Onderbouwing:',
              bold: true,
            }),
          ],
          spacing: { before: 150, after: 100 },
        }),
        new Paragraph({
          text: criterion.argument,
          spacing: { after: 150 },
        })
      );
    }

    // Uncertainty warning
    if (criterion.uncertainty) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Let op: ',
              bold: true,
              color: '856404',
            }),
            new TextRun({
              text: criterion.uncertainty,
              color: '856404',
            }),
          ],
          spacing: { after: 150 },
        })
      );
    }

    // Evidence count
    if (criterion.evidence.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Bewijs: ${criterion.evidence.length} bronnen gevonden `,
            }),
            new TextRun({
              text: `(zie Bijlage ${index + 1})`,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }
  });

  return paragraphs;
}

function generateEvidenceAppendix(
  criteria: Criterion[],
  anonymize: boolean
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: '3. Bijlage: Bronverwijzingen',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
  ];

  criteria.forEach((criterion, criterionIndex) => {
    if (criterion.evidence.length === 0) return;

    paragraphs.push(
      new Paragraph({
        text: `Bijlage ${criterionIndex + 1}: ${criterion.label}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );

    criterion.evidence.forEach((ev, evIndex) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${criterionIndex + 1}.${evIndex + 1}] `,
              bold: true,
            }),
            new TextRun({
              text: `${ev.source_type} #${ev.source_id}`,
              bold: true,
            }),
          ],
          spacing: { before: 150, after: 50 },
        })
      );

      if (ev.date) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Datum: ${ev.date}`,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      if (ev.author && !anonymize) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Auteur: ${ev.author}`,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      if (ev.section) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Sectie: ${ev.section}`,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 50 },
          })
        );
      }

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Relevantie: ${Math.round(ev.relevance * 100)}%`,
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: ev.text,
          spacing: { after: 200 },
        })
      );
    });
  });

  return paragraphs;
}
