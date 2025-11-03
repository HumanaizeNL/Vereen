import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { parseCSV } from '@/lib/parsers/csv';
import { parsePDF } from '@/lib/parsers/pdf';
import { parseDOCX } from '@/lib/parsers/docx';
import {
  setClient,
  addNotes,
  addMeasures,
  addIncidents,
  addAuditEvent,
} from '@/lib/data/stores';
import { indexClientData } from '@/lib/search/flexsearch';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const client_id = formData.get('client_id') as string;
    const files = formData.getAll('files') as File[];
    const dataset_label = formData.get('dataset_label') as string | null;

    if (!client_id) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: "Field 'client_id' missing",
          },
        },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No files uploaded',
          },
        },
        { status: 400 }
      );
    }

    const ingested: any[] = [];
    const warnings: any[] = [];

    // Process each file
    for (const file of files) {
      const filename = file.name.toLowerCase();

      try {
        if (filename.endsWith('.csv')) {
          // Parse CSV
          const { result, data } = await parseCSV(file, client_id);

          ingested.push({
            filename: file.name,
            rows: result.rows,
            type: result.type,
          });

          // Store parsed data
          if (data.clients && data.clients.length > 0) {
            data.clients.forEach((client) => setClient(client));
          }

          if (data.notes) {
            addNotes(data.notes);
          }

          if (data.measures) {
            addMeasures(data.measures);
          }

          if (data.incidents) {
            addIncidents(data.incidents);
          }

          // Add warnings
          result.warnings.forEach((msg) => {
            warnings.push({
              filename: file.name,
              message: msg,
            });
          });
        } else if (filename.endsWith('.pdf')) {
          // Parse PDF
          const result = await parsePDF(file);

          ingested.push({
            filename: file.name,
            pages: result.pages,
            type: result.type,
          });

          // Store PDF text as notes (chunked)
          // For MVP, we'll just store the full text as one note
          if (result.text) {
            addNotes([
              {
                id: nanoid(),
                client_id,
                date: new Date().toISOString().split('T')[0],
                author: 'PDF Import',
                section: 'Documents',
                text: result.text,
              },
            ]);
          }

          result.warnings.forEach((msg) => {
            warnings.push({
              filename: file.name,
              message: msg,
            });
          });
        } else if (filename.endsWith('.docx') || filename.endsWith('.rtf')) {
          // Parse DOCX/RTF
          const result = await parseDOCX(file);

          ingested.push({
            filename: file.name,
            type: result.type,
          });

          // Store DOCX text as notes
          if (result.text) {
            addNotes([
              {
                id: nanoid(),
                client_id,
                date: new Date().toISOString().split('T')[0],
                author: 'DOCX Import',
                section: 'Documents',
                text: result.text,
              },
            ]);
          }

          result.warnings.forEach((msg) => {
            warnings.push({
              filename: file.name,
              message: msg,
            });
          });
        } else {
          warnings.push({
            filename: file.name,
            message: 'Unsupported file type',
          });
        }
      } catch (error) {
        warnings.push({
          filename: file.name,
          message: `Error processing file: ${(error as Error).message}`,
        });
      }
    }

    // Index the client data for search
    indexClientData(client_id);

    // Add audit event
    addAuditEvent({
      id: nanoid(),
      ts: new Date().toISOString(),
      actor: 'ai',
      client_id,
      action: 'ingest',
      meta: {
        files: files.length,
        dataset_label,
        ingested_count: ingested.length,
      },
    });

    return NextResponse.json({
      client_id,
      ingested,
      warnings,
    });
  } catch (error) {
    console.error('Ingest error:', error);
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
