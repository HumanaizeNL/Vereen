# UC1 - Data Ingestion & Search

This document describes the Use Case 1 (UC1) functionality - comprehensive data ingestion, management, and search for healthcare client records.

## Overview

UC1 provides complete data lifecycle management for client records in the Vereen herindicatie system:
- **File Upload** - Upload and parse CSV, PDF, and DOCX files
- **Client Management** - CRUD operations for client records
- **Search** - Full-text search across all client data using FlexSearch
- **Statistics** - Data overview and analytics
- **Templates** - Generate CSV templates for easy data entry

## Features Implemented

### 1. File Ingestion (`/api/ingest`)

**Endpoint:** `POST /api/ingest`

Upload and automatically parse multiple file types:

**Supported Formats:**
- **CSV** - Auto-detects data type (notes, measures, incidents, clients)
- **PDF** - Extracts text and stores as notes
- **DOCX/RTF** - Extracts text and stores as notes

**Request:**
```bash
curl -X POST http://localhost:3000/api/ingest \
  -F "client_id=CL-2024-001" \
  -F "file=@notes.csv"
```

**CSV Auto-Detection:**
The system automatically detects CSV type based on:
- Filename (e.g., `notes.csv`, `measures.csv`)
- Column headers (e.g., presence of `text`, `score`, `severity`)

**Supported CSV Types:**

1. **Notes CSV**
   - Columns: `date`, `author`, `section`, `text`
   - Auto-indexed for search

2. **Measures CSV**
   - Columns: `date`, `type`, `score`, `comment`
   - Types: Katz-ADL, MMSE, NPI, GAF, etc.

3. **Incidents CSV**
   - Columns: `date`, `type`, `severity`, `description`
   - Severity: Laag, Matig, Hoog

4. **Clients CSV**
   - Columns: `client_id`, `name`, `dob`, `wlz_profile`, `provider`

**Response:**
```json
{
  "client_id": "CL-2024-001",
  "ingested": [
    {
      "filename": "notes.csv",
      "rows": 10,
      "type": "csv"
    }
  ],
  "warnings": [],
  "summary": "Uploaded 1 file(s), processed 1 successfully"
}
```

### 2. Client Management API

#### List All Clients
**Endpoint:** `GET /api/uc1/clients`

Query parameters:
- `provider` - Filter by provider
- `wlz_profile` - Filter by WLZ profile (VV6, VV7, VV8)

```bash
curl http://localhost:3000/api/uc1/clients
```

**Response:**
```json
{
  "clients": [
    {
      "client_id": "CL-2024-001",
      "name": "Mevrouw Jansen",
      "dob": "1950-05-15",
      "wlz_profile": "VV7",
      "provider": "Zorgcentrum Noord",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1
}
```

#### Create Client
**Endpoint:** `POST /api/uc1/clients`

```bash
curl -X POST http://localhost:3000/api/uc1/clients \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CL-2024-001",
    "name": "Mevrouw Jansen",
    "dob": "1950-05-15",
    "wlz_profile": "VV7",
    "provider": "Zorgcentrum Noord"
  }'
```

**Response:**
```json
{
  "client": { ... },
  "message": "Client created successfully"
}
```

#### Get Single Client
**Endpoint:** `GET /api/uc1/clients/[client_id]`

Query parameters:
- `include_summary=true` - Include data summary

```bash
curl http://localhost:3000/api/uc1/clients/CL-2024-001?include_summary=true
```

**Response:**
```json
{
  "client": {
    "client_id": "CL-2024-001",
    "name": "Mevrouw Jansen",
    ...
  },
  "summary": {
    "notes_count": 10,
    "measures_count": 5,
    "incidents_count": 2,
    "latest_note_date": "2024-01-25",
    "latest_measure_date": "2024-02-16"
  }
}
```

#### Update Client
**Endpoint:** `PUT /api/uc1/clients/[client_id]`

```bash
curl -X PUT http://localhost:3000/api/uc1/clients/CL-2024-001 \
  -H "Content-Type: application/json" \
  -d '{
    "wlz_profile": "VV8",
    "provider": "Berkumstede"
  }'
```

#### Delete Client
**Endpoint:** `DELETE /api/uc1/clients/[client_id]`

⚠️ **Warning:** Deletes client and all associated data (notes, measures, incidents, search index)

```bash
curl -X DELETE http://localhost:3000/api/uc1/clients/CL-2024-001
```

**Response:**
```json
{
  "message": "Client and all associated data deleted successfully",
  "deleted": {
    "client_id": "CL-2024-001",
    "notes": 10,
    "measures": 5,
    "incidents": 2
  }
}
```

### 3. Search API

**Endpoint:** `POST /api/search`

Full-text search powered by FlexSearch with BM25-like scoring.

**Request:**
```json
{
  "client_id": "CL-2024-001",
  "query": "angst psyche gedrag",
  "k": 10,
  "filters": {
    "date_from": "2024-01-01",
    "date_to": "2024-12-31",
    "section": "Psyche",
    "author": "Psycholoog"
  }
}
```

**Response:**
```json
{
  "hits": [
    {
      "source": "notes.csv",
      "row": 2,
      "snippet": "...angstgevoelens tijdens groepsactiviteiten...",
      "score": 95.5
    }
  ]
}
```

**Search Features:**
- Full-text search with contextual matching
- Relevance scoring
- Date range filtering
- Section/author filtering
- Automatic snippet generation
- Searches across: notes, measures, incidents

### 4. Statistics API

**Endpoint:** `GET /api/uc1/stats`

Query parameters:
- `client_id` - Get stats for specific client (optional)

#### Global Statistics

```bash
curl http://localhost:3000/api/uc1/stats
```

**Response:**
```json
{
  "summary": {
    "total_clients": 3,
    "total_notes": 30,
    "total_measures": 15,
    "total_incidents": 6
  },
  "breakdown": {
    "by_profile": {
      "VV7": 2,
      "VV8": 1
    },
    "by_provider": {
      "Zorgcentrum Noord": 1,
      "Berkumstede": 2
    }
  },
  "averages": {
    "notes_per_client": "10.0",
    "measures_per_client": "5.0",
    "incidents_per_client": "2.0"
  }
}
```

#### Client-Specific Statistics

```bash
curl http://localhost:3000/api/uc1/stats?client_id=CL-2024-001
```

**Response:**
```json
{
  "client_id": "CL-2024-001",
  "summary": {
    "notes_count": 10,
    "measures_count": 5,
    "incidents_count": 2
  },
  "notes": {
    "by_section": {
      "ADL": 2,
      "Psyche": 3,
      "Mobiliteit": 2
    },
    "by_author": {
      "Verpleegkundige": 4,
      "Psycholoog": 3,
      "Fysiotherapeut": 2
    },
    "date_range": {
      "earliest": "2024-01-15",
      "latest": "2024-01-25"
    }
  },
  "measures": {
    "by_type": {
      "Katz-ADL": 2,
      "MMSE": 2,
      "NPI": 2
    }
  },
  "incidents": {
    "by_type": {
      "Valincident": 1,
      "Gedragsprobleem": 2
    },
    "by_severity": {
      "Hoog": 2,
      "Matig": 1
    }
  }
}
```

### 5. CSV Templates API

**Endpoint:** `GET /api/uc1/templates?type={type}`

Generate downloadable CSV templates with headers and example data.

**Template Types:**
- `notes` - Notes template
- `measures` - Measures template
- `incidents` - Incidents template
- `clients` - Clients template

```bash
curl http://localhost:3000/api/uc1/templates?type=notes \
  -o notes_template.csv
```

**Example Output (notes_template.csv):**
```csv
date,author,section,text
2024-01-15,Verpleegkundige,ADL,Cliënt heeft ondersteuning nodig bij persoonlijke verzorging
2024-01-16,Psycholoog,Psyche,Toont angstgevoelens tijdens groepsactiviteiten
2024-01-17,Fysiotherapeut,Mobiliteit,Valrisico is toegenomen, loophulpmiddel geadviseerd
```

## Sample Data

Pre-generated sample CSV files are available in `/sample-data/`:

### clients.csv
```csv
client_id,name,dob,wlz_profile,provider
CL-2024-TEST-001,Mevrouw Jansen,1950-05-15,VV7,Zorgcentrum Noord
CL-2024-TEST-002,Meneer De Vries,1945-12-20,VV8,Berkumstede
CL-2024-TEST-003,Mevrouw Peters,1955-03-08,VV6,Driezorg
```

### notes.csv
10 realistic healthcare notes covering:
- ADL (Activities of Daily Living)
- Psyche (psychological observations)
- Mobiliteit (mobility)
- Gedrag (behavior)
- Medicatie (medication)
- Sociaal (social)
- Dagbesteding (day care)
- Nacht (night observations)
- Evaluatie (evaluations)
- Welzijn (well-being)

### measures.csv
7 measurements including:
- Katz-ADL scores (D → E progression)
- MMSE cognitive scores (22 → 19 decline)
- NPI behavioral scores (35 → 42 increase)
- GAF functional assessment

### incidents.csv
5 incidents with varying severity:
- Falls (Valincident)
- Behavioral problems (Gedragsprobleem)
- Medication errors (Medicatiefout)
- Wandering (Dwalen)

## Data Model

### Client
```typescript
{
  client_id: string;        // Unique identifier
  name: string;            // Full name
  dob: string;             // Date of birth (YYYY-MM-DD)
  bsn_encrypted?: string;  // Encrypted BSN number
  wlz_profile: string;     // WLZ profile (VV6, VV7, VV8, etc.)
  provider: string;        // Care provider name
  created_at: string;      // ISO timestamp
}
```

### Note
```typescript
{
  id: string;              // Auto-generated UUID
  client_id: string;       // Foreign key to client
  date: string;            // Note date (YYYY-MM-DD)
  author: string;          // Author name/role
  section: string;         // Category (ADL, Psyche, etc.)
  text: string;            // Note content
}
```

### Measure
```typescript
{
  id: string;              // Auto-generated UUID
  client_id: string;       // Foreign key to client
  date: string;            // Measurement date
  type: string;            // Type (Katz-ADL, MMSE, NPI, etc.)
  score: string | number;  // Score value
  comment?: string;        // Optional comment
}
```

### Incident
```typescript
{
  id: string;              // Auto-generated UUID
  client_id: string;       // Foreign key to client
  date: string;            // Incident date
  type: string;            // Type (Valincident, etc.)
  severity: string;        // Laag, Matig, Hoog
  description: string;     // Incident description
}
```

## Architecture

### In-Memory Storage
Currently uses in-memory Map structures for fast access:
```typescript
clientsStore: Map<string, Client>
notesStore: Map<string, Note>
measuresStore: Map<string, Measure>
incidentsStore: Map<string, Incident>
```

⚠️ **Note:** Data is lost on server restart. Migration to PostgreSQL/Prisma is planned.

### Search Indexing
- **FlexSearch** library with contextual search
- Automatically indexes all client data on ingestion
- Separate index per client for isolation
- BM25-like relevance scoring

### File Parsing
- **CSV**: Papa Parse with auto-detection
- **PDF**: pdf-parse for text extraction
- **DOCX**: mammoth for document parsing

## Testing

### Manual Testing with Sample Data

1. **Start the server:**
```bash
pnpm run dev
```

2. **Load sample client:**
```bash
curl -X POST http://localhost:3000/api/uc1/clients \
  -H "Content-Type: application/json" \
  -d @sample-data/clients.csv
```

3. **Upload data files:**
```bash
# Upload notes
curl -X POST http://localhost:3000/api/ingest \
  -F "client_id=CL-2024-TEST-001" \
  -F "file=@sample-data/notes.csv"

# Upload measures
curl -X POST http://localhost:3000/api/ingest \
  -F "client_id=CL-2024-TEST-001" \
  -F "file=@sample-data/measures.csv"

# Upload incidents
curl -X POST http://localhost:3000/api/ingest \
  -F "client_id=CL-2024-TEST-001" \
  -F "file=@sample-data/incidents.csv"
```

4. **Test search:**
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "CL-2024-TEST-001",
    "query": "angst gedrag",
    "k": 5
  }'
```

5. **View statistics:**
```bash
curl http://localhost:3000/api/uc1/stats?client_id=CL-2024-TEST-001
```

### Automated Testing

Run the comprehensive test suite:
```bash
node scripts/test-uc1-ingestion.cjs
```

This tests:
- Client CRUD operations
- File uploads (CSV, PDF, DOCX)
- Search queries
- Statistics generation
- Template downloads

## Integration with UC2

UC1 provides the data foundation for UC2 (Herindicatie Analysis):

1. **Data Collection** (UC1):
   - Upload client records via CSV/PDF/DOCX
   - Organize notes, measures, incidents

2. **Analysis** (UC2):
   - Analyze trends in measures
   - Identify patterns in notes/incidents
   - Generate herindicatie recommendations

3. **Reporting** (UC2):
   - Compose professional reports
   - Export to DOCX format

**Workflow:**
```
UC1: Ingest → UC2: Analyze → UC2: Export
```

## API Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }  // Optional additional details
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error

## Performance Considerations

### Current Implementation
- **In-memory storage** - Fast but limited by RAM
- **FlexSearch** - Very fast full-text search (~1ms queries)
- **No pagination** - All results returned at once

### Future Optimizations
- **PostgreSQL** - Persistent storage with indexes
- **Pagination** - Large result sets chunked
- **Caching** - Redis for frequently accessed data
- **Streaming** - Large file uploads via streams
- **Batch processing** - Parallel file parsing

## Security Considerations

### Current Implementation
- No authentication/authorization
- No data encryption at rest
- BSN field placeholder only

### Production Requirements
- **Authentication** - OAuth 2.0 / OIDC
- **Authorization** - Role-based access control
- **Encryption** - TLS for transit, AES for rest
- **BSN Handling** - Proper encryption/masking
- **Audit Logging** - All data access logged
- **Rate Limiting** - Prevent abuse

## Future Enhancements

1. **Advanced Search**
   - Semantic search with embeddings
   - Fuzzy matching
   - Filter by multiple criteria simultaneously

2. **Data Validation**
   - Schema validation for uploads
   - Duplicate detection
   - Data quality checks

3. **Batch Operations**
   - Bulk client creation
   - Bulk data import/export
   - Scheduled imports

4. **Version Control**
   - Track data changes over time
   - Rollback capabilities
   - Change history

5. **Real-time Updates**
   - WebSocket for live data sync
   - Push notifications for new data

6. **Analytics Dashboard**
   - Visual statistics
   - Trend charts
   - Custom reports

## Troubleshooting

### Upload Fails
- Check file format (CSV headers must match expected format)
- Verify client_id exists
- Check file size (large files may timeout)

### Search Returns No Results
- Verify data was ingested successfully
- Check search index was created (automatic on ingest)
- Try broader search terms

### Missing Data
- Remember: in-memory storage is lost on restart
- Use `/api/dev/load-mock-data` to reload test data
- Or re-upload your CSV files

## Contact

For questions or issues with UC1, refer to the main project documentation or create an issue in the repository.
