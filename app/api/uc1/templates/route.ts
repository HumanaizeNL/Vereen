import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/uc1/templates?type=notes|measures|incidents|clients
 * Generate CSV template files for data import
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'notes';

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'notes':
        csvContent = generateNotesTemplate();
        filename = 'notes_template.csv';
        break;
      case 'measures':
        csvContent = generateMeasuresTemplate();
        filename = 'measures_template.csv';
        break;
      case 'incidents':
        csvContent = generateIncidentsTemplate();
        filename = 'incidents_template.csv';
        break;
      case 'clients':
        csvContent = generateClientsTemplate();
        filename = 'clients_template.csv';
        break;
      default:
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid template type. Use: notes, measures, incidents, or clients',
            },
          },
          { status: 400 }
        );
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Template generation error:', error);
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

function generateNotesTemplate(): string {
  const headers = ['date', 'author', 'section', 'text'];
  const examples = [
    [
      '2024-01-15',
      'Verpleegkundige',
      'ADL',
      'Cliënt heeft ondersteuning nodig bij persoonlijke verzorging',
    ],
    [
      '2024-01-16',
      'Psycholoog',
      'Psyche',
      'Toont angstgevoelens tijdens groepsactiviteiten',
    ],
    [
      '2024-01-17',
      'Fysiotherapeut',
      'Mobiliteit',
      'Valrisico is toegenomen, loophulpmiddel geadviseerd',
    ],
  ];

  return generateCSV(headers, examples);
}

function generateMeasuresTemplate(): string {
  const headers = ['date', 'type', 'score', 'comment'];
  const examples = [
    ['2024-01-15', 'Katz-ADL', 'D', 'Afhankelijk bij meerdere ADL taken'],
    ['2024-01-15', 'MMSE', '22', 'Lichte cognitieve achteruitgang'],
    ['2024-01-16', 'NPI', '35', 'Verhoogde scores op angst en agitatie'],
  ];

  return generateCSV(headers, examples);
}

function generateIncidentsTemplate(): string {
  const headers = ['date', 'type', 'severity', 'description'];
  const examples = [
    [
      '2024-01-15',
      'Valincident',
      'Matig',
      'Gevallen in badkamer, geen verwondingen',
    ],
    [
      '2024-01-16',
      'Gedragsprobleem',
      'Hoog',
      'Agressief gedrag tijdens verzorging',
    ],
    [
      '2024-01-17',
      'Medicatiefout',
      'Laag',
      'Verkeerde tijdstip medicatie toediening',
    ],
  ];

  return generateCSV(headers, examples);
}

function generateClientsTemplate(): string {
  const headers = ['client_id', 'name', 'dob', 'wlz_profile', 'provider'];
  const examples = [
    ['CL-2024-001', 'Mevrouw A.', '1950-05-15', 'VV7', 'Zorgcentrum Noord'],
    ['CL-2024-002', 'Meneer B.', '1945-12-20', 'VV8', 'Berkumstede'],
    ['CL-2024-003', 'Mevrouw C.', '1955-03-08', 'VV6', 'Driezorg'],
  ];

  return generateCSV(headers, examples);
}

function generateCSV(headers: string[], examples: string[][]): string {
  const rows = [headers, ...examples];
  return rows.map((row) => row.join(',')).join('\n');
}
