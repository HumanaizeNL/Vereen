import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import type { Evidence, Criterion, ExportData, ExportOptions } from './types';

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
  } = options;

  const clientId = anonymize ? '[GEANONIMISEERD]' : data.client_id;
  const currentYear = new Date().getFullYear();

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title and Header
          new Paragraph({
            text: `Herindicatie-advies VV8 Criteria ${currentYear}`,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
          }),

          // Introduction
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dit herindicatie-advies is opgesteld op basis van een systematische evaluatie van de VV8 criteria voor langdurige zorg. Het advies is gebaseerd op beschikbare zorgdossiers, observaties en meetinstrumenten over de aangegeven periode.',
                italics: true,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Divider
          new Paragraph({
            text: '',
            border: {
              bottom: {
                color: '000000',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { after: 400 },
          }),

          // Section 1: Algemene Gegevens
          new Paragraph({
            text: '1. Algemene Gegevens',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          ...generateAlgemeneGegevens(data, clientId),

          // Section 2: Samenvatting en Beeldvorming
          new Paragraph({
            text: '2. Samenvatting en Beeldvorming',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Inzicht in de huidige situatie en zorgbehoefte van de cliënt',
                bold: true,
              }),
            ],
            spacing: { after: 150 },
          }),

          ...generateSamenvattingBeeldvorming(data.criteria),

          // Section 3: Criteria-evaluatie
          new Paragraph({
            text: '3. Criteria-evaluatie per Domein',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: 'Hieronder volgt een gedetailleerde evaluatie van elk VV8 criterium, met onderbouwing vanuit het beschikbare bewijsmateriaal.',
                italics: true,
              }),
            ],
            spacing: { after: 300 },
          }),

          ...generateDetailedCriteriaSection(data.criteria),

          // Section 4: Analyse en Bevindingen
          new Paragraph({
            text: '4. Analyse en Bevindingen',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          ...generateAnalyseEnBevindingen(data.criteria),

          // Section 5: Advies en Aanbevelingen
          new Paragraph({
            text: '5. Advies en Aanbevelingen',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          ...generateAdvisEnAanbevelingen(data.criteria, data.period),

          // Evidence Appendix
          ...(include_evidence_appendix
            ? generateProfessionalEvidenceAppendix(data.criteria, anonymize)
            : []),

          // Footer
          new Paragraph({
            text: '',
            spacing: { before: 600 },
          }),
          new Paragraph({
            text: '─'.repeat(80),
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Gegenereerd op: ${new Date(data.generated_at).toLocaleString('nl-NL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`,
                italics: true,
                size: 18,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Dit rapport is automatisch gegenereerd door Vereen AI op basis van beschikbare zorggegevens.',
                italics: true,
                size: 18,
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

function generateAlgemeneGegevens(data: ExportData, clientId: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: 'Cliënt ID: ', bold: true }),
        new TextRun({ text: clientId }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Evaluatieperiode: ', bold: true }),
        new TextRun({
          text: `${new Date(data.period.from).toLocaleDateString('nl-NL')} t/m ${new Date(data.period.to).toLocaleDateString('nl-NL')}`
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Criteria set: ', bold: true }),
        new TextRun({ text: 'VV8 Herindicatie 2026' }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Aantal geëvalueerde criteria: ', bold: true }),
        new TextRun({ text: `${data.criteria.length}` }),
      ],
      spacing: { after: 200 },
    }),
  ];
}

function generateSamenvattingBeeldvorming(criteria: Criterion[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const changedCriteria = criteria.filter(
    (c) => c.status === 'verslechterd' || c.status === 'toegenomen_behoefte'
  );
  const stableCriteria = criteria.filter((c) => c.status === 'voldoet');
  const insufficientCriteria = criteria.filter((c) => c.status === 'onvoldoende_bewijs');

  // Narrative summary
  paragraphs.push(
    new Paragraph({
      text: `Over de periode ${criteria[0]?.evidence?.[0]?.date || 'recent'} is een uitgebreide evaluatie uitgevoerd van de zorgbehoefte op basis van de VV8 criteria. ` +
            `Van de ${criteria.length} geëvalueerde criteria zijn er ${changedCriteria.length} waarin significante veranderingen zijn waargenomen.`,
      spacing: { after: 200 },
    })
  );

  if (changedCriteria.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Belangrijkste bevindingen:',
            bold: true,
          }),
        ],
        spacing: { before: 150, after: 100 },
      })
    );

    changedCriteria.forEach((c) => {
      const evidenceCount = c.evidence.length;
      const avgConfidence = c.confidence ? Math.round(c.confidence * 100) : 0;

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${c.label}: `,
              bold: true,
            }),
            new TextRun({
              text: `${STATUS_LABELS[c.status]}. `,
            }),
            new TextRun({
              text: c.argument || 'Zie gedetailleerde evaluatie voor toelichting.',
            }),
            new TextRun({
              text: ` (${evidenceCount} bronnen, betrouwbaarheid: ${avgConfidence}%)`,
              italics: true,
              size: 20,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  if (insufficientCriteria.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '\nOpmerking: ',
            bold: true,
            color: '856404',
          }),
          new TextRun({
            text: `Voor ${insufficientCriteria.length} criteria is onvoldoende recent bewijsmateriaal beschikbaar om een betrouwbare evaluatie te maken. Aanvullende observaties of metingen worden aanbevolen.`,
            color: '856404',
          }),
        ],
        spacing: { before: 200, after: 200 },
      })
    );
  }

  return paragraphs;
}

function generateDetailedCriteriaSection(criteria: Criterion[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  criteria.forEach((criterion, index) => {
    // Criterion heading
    paragraphs.push(
      new Paragraph({
        text: `3.${index + 1} ${criterion.label}`,
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
              color: '666666',
            }),
          ],
          spacing: { after: 150 },
        })
      );
    }

    // Status box
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Beoordeling: ',
            bold: true,
          }),
          new TextRun({
            text: STATUS_LABELS[criterion.status],
            bold: true,
            color: criterion.status === 'verslechterd' ? 'DC3545' :
                   criterion.status === 'toegenomen_behoefte' ? 'FD7E14' :
                   criterion.status === 'voldoet' ? '28A745' : '000000',
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

    // Main argument with context
    if (criterion.argument) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Toelichting:',
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

    // Show concrete evidence excerpts
    if (criterion.evidence.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Ondersteunend bewijs:',
              bold: true,
            }),
          ],
          spacing: { before: 150, after: 100 },
        })
      );

      // Show top 3 most relevant evidence excerpts
      criterion.evidence.slice(0, 3).forEach((ev, idx) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[${index + 1}.${idx + 1}] `,
                bold: true,
                size: 20,
              }),
              new TextRun({
                text: `"${ev.text.substring(0, 200)}${ev.text.length > 200 ? '...' : ''}"`,
                italics: true,
              }),
            ],
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `      Bron: ${ev.source_type} #${ev.source_id}`,
                size: 18,
                color: '666666',
              }),
              ...(ev.date ? [
                new TextRun({
                  text: ` | Datum: ${ev.date}`,
                  size: 18,
                  color: '666666',
                }),
              ] : []),
              new TextRun({
                text: ` | Relevantie: ${Math.round(ev.relevance * 100)}%`,
                size: 18,
                color: '666666',
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });

      if (criterion.evidence.length > 3) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `      (+${criterion.evidence.length - 3} aanvullende bronnen, zie bijlage)`,
                italics: true,
                size: 18,
                color: '666666',
              }),
            ],
            spacing: { after: 150 },
          })
        );
      }
    }

    // Uncertainty warning
    if (criterion.uncertainty) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '⚠ Let op: ',
              bold: true,
              color: '856404',
            }),
            new TextRun({
              text: criterion.uncertainty,
              color: '856404',
            }),
          ],
          spacing: { before: 100, after: 200 },
        })
      );
    }
  });

  return paragraphs;
}

function generateAnalyseEnBevindingen(criteria: Criterion[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const changedCriteria = criteria.filter(
    (c) => c.status === 'verslechterd' || c.status === 'toegenomen_behoefte'
  );
  const stableCriteria = criteria.filter((c) => c.status === 'voldoet');

  // Overall analysis
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Algemene analyse:',
          bold: true,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `De evaluatie toont dat ${changedCriteria.length} van de ${criteria.length} criteria een verandering laten zien die mogelijk indicatie voor herindicatie rechtvaardigt. ` +
            `${stableCriteria.length} criteria blijven stabiel binnen het huidige zorgprofiel.`,
      spacing: { after: 200 },
    })
  );

  // Domain patterns
  if (changedCriteria.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Geïdentificeerde patronen:',
            bold: true,
          }),
        ],
        spacing: { before: 150, after: 100 },
      })
    );

    const domains = ['ADL', 'mobiliteit', 'gedrag', 'psychosociaal'];
    const affectedDomains = domains.filter(domain =>
      changedCriteria.some(c => c.label.toLowerCase().includes(domain))
    );

    if (affectedDomains.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: `• De veranderingen concentreren zich voornamelijk in de domeinen: ${affectedDomains.join(', ')}.`,
          spacing: { after: 100 },
        })
      );
    }

    paragraphs.push(
      new Paragraph({
        text: `• De gemiddelde betrouwbaarheid van de evaluaties is ${Math.round(criteria.reduce((acc, c) => acc + (c.confidence || 0), 0) / criteria.length * 100)}%.`,
        spacing: { after: 100 },
      })
    );
  }

  return paragraphs;
}

function generateAdvisEnAanbevelingen(criteria: Criterion[], period: { from: string; to: string }): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const changedCriteria = criteria.filter(
    (c) => c.status === 'verslechterd' || c.status === 'toegenomen_behoefte'
  );
  const lowConfidenceCriteria = criteria.filter((c) => (c.confidence || 0) < 0.6);

  // Main recommendation
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Primair advies:',
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 150 },
    })
  );

  let recommendation = '';
  if (changedCriteria.length >= 3) {
    recommendation = `Op basis van de criteria-evaluatie wordt geadviseerd om over te gaan tot herindicatie naar een zwaarder zorgprofiel. ` +
                    `Er zijn ${changedCriteria.length} criteria waarop een verhoogde of verslechterde zorgbehoefte is vastgesteld, ` +
                    `wat duidt op een structurele verandering in de zorgbehoefte.`;
  } else if (changedCriteria.length > 0) {
    recommendation = `Er zijn ${changedCriteria.length} criteria waarop veranderingen zijn vastgesteld. ` +
                    `Het advies is om de zorg binnen het huidige profiel aan te passen en de situatie nauwlettend te monitoren. ` +
                    `Overweeg herindicatie indien de zorglast in de komende periode verder toeneemt.`;
  } else {
    recommendation = 'De huidige zorgbehoefte lijkt stabiel binnen het toegewezen zorgprofiel. ' +
                    'Geen directe herindicatie noodzakelijk op dit moment. ' +
                    'Reguliere evaluatie volgens standaard planning voortzetten.';
  }

  paragraphs.push(
    new Paragraph({
      text: recommendation,
      spacing: { after: 300 },
    })
  );

  // Specific recommendations
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Specifieke aanbevelingen:',
          bold: true,
        }),
      ],
      spacing: { before: 200, after: 100 },
    })
  );

  if (changedCriteria.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: `1. Bespreek de bevindingen met het multidisciplinaire team, met specifieke aandacht voor: ${changedCriteria.map(c => c.label).join(', ')}.`,
        spacing: { after: 100 },
      })
    );
  }

  if (lowConfidenceCriteria.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: `2. Voor ${lowConfidenceCriteria.length} criteria is aanvullende observatie of meting gewenst om de betrouwbaarheid te verhogen.`,
        spacing: { after: 100 },
      })
    );
  }

  paragraphs.push(
    new Paragraph({
      text: `3. Plan een vervolgeva luatie over 3 maanden om trends te monitoren en het effect van eventuele interventies te evalueren.`,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `4. Documenteer alle relevante veranderingen en interventies systematisch voor toekomstige evaluaties.`,
      spacing: { after: 200 },
    })
  );

  // Timeline
  const nextEvalDate = new Date(period.to);
  nextEvalDate.setMonth(nextEvalDate.getMonth() + 3);

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Voorgestelde tijdlijn:',
          bold: true,
        }),
      ],
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: `• Vervolgmeting: ${nextEvalDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `• Tussentijdse monitoring: Maandelijks via bestaande observatie-instrumenten`,
      spacing: { after: 50 },
    }),
    new Paragraph({
      text: `• Multidisciplinair overleg: Binnen 2 weken na dit advies`,
      spacing: { after: 200 },
    })
  );

  return paragraphs;
}

function generateProfessionalEvidenceAppendix(criteria: Criterion[], anonymize: boolean): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Bijlage: Overzicht Bronverwijzingen',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 },
      pageBreakBefore: true,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Dit overzicht bevat alle bronnen die zijn gebruikt voor de criteria-evaluatie, gegroepeerd per criterium.',
          italics: true,
        }),
      ],
      spacing: { after: 300 },
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

      // Metadata table-like format
      const metadataItems: string[] = [];
      if (ev.date) metadataItems.push(`Datum: ${ev.date}`);
      if (ev.author && !anonymize) metadataItems.push(`Auteur: ${ev.author}`);
      if (ev.section) metadataItems.push(`Sectie: ${ev.section}`);
      metadataItems.push(`Relevantie: ${Math.round(ev.relevance * 100)}%`);

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: metadataItems.join(' | '),
              italics: true,
              size: 18,
              color: '666666',
            }),
          ],
          spacing: { after: 75 },
        }),
        new Paragraph({
          text: ev.text,
          spacing: { after: 150 },
        })
      );
    });
  });

  return paragraphs;
}
