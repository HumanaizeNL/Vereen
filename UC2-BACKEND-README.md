# UC2 Backend - Herindicatie Analysis

This document describes the backend functionality created for Use Case 2 (UC2) - Herindicatie (reassessment) for healthcare clients.

## Overview

The UC2 backend provides comprehensive analysis of client data to support herindicatie decisions. It analyzes trends, patterns, and complexity indicators to recommend whether a client should:
- Move to a heavier care profile (VV7 → VV8)
- Apply for additional care (meerzorg)
- Maintain current profile
- Move to a lighter care profile

## Files Created

### 1. Mock Data (`lib/data/mock-data.ts`)

Realistic mock data based on two real-world cases (casus 3 and casus 4):

**Client 1 (CL-2023-001) - Based on Casus 3:**
- Female client with psychiatric problems
- Panic, anxiety, and behavioral issues
- Requires 24-hour care and 1-on-1 attention
- 10 detailed notes covering psyche, ADL, mobility, behavior, medication
- Measures: Katz-ADL (F), GAF (50), NPI (45)
- 2 high-severity incidents

**Client 2 (CL-2023-002) - Based on Casus 4:**
- 94-year-old woman with cognitive decline after CVA
- Obsessive behavior, anxiety, continuous alarms
- Requires intensive 1-on-1 care
- 12 detailed notes covering anamnesis, ADL, cognition, behavior, social
- Measures: Katz-ADL (E→F), MMSE (18→15), NPI (52)
- 3 high-severity incidents

### 2. Analysis API (`app/api/uc2/analyze-client/route.ts`)

**Endpoint:** `POST /api/uc2/analyze-client`

**Request:**
```json
{
  "client_id": "CL-2023-001",
  "period": {
    "from": "2023-01-01",
    "to": "2023-12-31"
  },
  "include_trends": true,
  "include_patterns": true
}
```

**Response:**
```json
{
  "client_id": "CL-2023-001",
  "client_name": "Mevrouw A.",
  "current_profile": "VV7",
  "provider": "Driezorg",
  "data_summary": {
    "notes_count": 10,
    "measures_count": 5,
    "incidents_count": 2
  },
  "trends": {
    "katz_adl": {
      "direction": "verslechterd",
      "first_value": "E",
      "last_value": "F",
      "change_magnitude": 1
    },
    "cognitive": {
      "direction": "verslechterd",
      "first_value": 18,
      "last_value": 15,
      "change_points": -3
    },
    "behavioral": {
      "direction": "verslechterd",
      "first_value": 45,
      "last_value": 52,
      "change_points": 7
    }
  },
  "patterns": {
    "key_themes": [
      { "theme": "gedrag", "count": 4 },
      { "theme": "medicatie", "count": 3 }
    ],
    "incident_frequency": {
      "total_count": 2,
      "by_type": { "Gedragsprobleem": 1, "Terugval": 1 },
      "by_severity": { "Hoog": 2 }
    },
    "critical_issues": [...]
  },
  "complexity_assessment": {
    "complexity_level": "zeer_hoog",
    "factors": [
      "Hoge ADL-afhankelijkheid",
      "Matige tot ernstige cognitieve achteruitgang",
      "Significante gedragsproblematiek",
      "Meerdere ernstige incidenten"
    ],
    "meerzorg_indicators": [...]
  },
  "herindicatie_recommendation": {
    "advised_action": "herindicatie_naar_zwaarder_profiel",
    "confidence": 0.85,
    "suggested_profile": "VV8",
    "rationale": [
      "ADL-afhankelijkheid is verslechterd",
      "Cognitieve functie is achteruitgegaan",
      "Zeer hoge zorgcomplexiteit geconstateerd",
      "2 incident(en) met hoge ernst",
      "Overweeg herindicatie naar VV8 gezien toegenomen zorgbehoefte"
    ]
  }
}
```

**Analysis Features:**

1. **Trend Analysis:**
   - Katz-ADL progression (A→B→C→D→E→F)
   - Cognitive function (MMSE scores)
   - Behavioral problems (NPI scores)
   - Tracks direction: verbeterd, stabiel, verslechterd

2. **Pattern Analysis:**
   - Key themes from notes (most documented areas)
   - Incident frequency by type and severity
   - Critical issues identification

3. **Complexity Assessment:**
   - Complexity level: laag, matig, hoog, zeer_hoog
   - Contributing factors
   - Meerzorg indicators

4. **Herindicatie Recommendation:**
   - Advised action:
     - `herindicatie_naar_zwaarder_profiel` (upgrade to heavier profile)
     - `meerzorg_aanvragen` (request additional care)
     - `behouden` (maintain current)
     - `herindicatie_naar_lichter_profiel` (downgrade to lighter profile)
   - Confidence score (0.0 - 1.0)
   - Suggested profile
   - Detailed rationale

### 3. Mock Data Loader (`app/api/dev/load-mock-data/route.ts`)

**Endpoints:**

**POST /api/dev/load-mock-data** - Load mock data
```json
{
  "clear_existing": true
}
```

**GET /api/dev/load-mock-data** - Get info about available mock data

### 4. Test Script (`scripts/test-uc2-analysis.js`)

Comprehensive test script that:
1. Loads mock data
2. Analyzes both clients
3. Displays full analysis results
4. Verifies all functionality

**Usage:**
```bash
# Start dev server
pnpm run dev

# In another terminal
node scripts/test-uc2-analysis.js
```

## Data Model

The backend uses the following data structures:

### Client
```typescript
{
  client_id: string;
  name: string;
  dob: string;
  bsn_encrypted?: string;
  wlz_profile: string;  // VV6, VV7, VV8, etc.
  provider: string;
  created_at: string;
}
```

### Note
```typescript
{
  id: string;
  client_id: string;
  date: string;
  author: string;
  section: string;  // ADL, Gedrag, Psyche, Medicatie, etc.
  text: string;
}
```

### Measure
```typescript
{
  id: string;
  client_id: string;
  date: string;
  type: string;  // Katz-ADL, MMSE, NPI, GAF, etc.
  score: string | number;
  comment?: string;
}
```

### Incident
```typescript
{
  id: string;
  client_id: string;
  date: string;
  type: string;
  severity: string;  // Laag, Matig, Hoog
  description: string;
}
```

## Algorithm Details

### Trend Analysis

**Katz-ADL Scoring:**
- A = 1 (independent)
- B = 2
- C = 3
- D = 4
- E = 5
- F = 6 (completely dependent)

**Direction:**
- Score increase = verslechterd
- Score decrease = verbeterd
- No change = stabiel

**MMSE (Cognitive):**
- < 20 = Matige tot ernstige cognitieve achteruitgang
- Decreasing score = verslechterd

**NPI (Behavioral):**
- Higher scores = more problems
- Increasing score = verslechterd

### Complexity Scoring

Points are assigned for:
- High ADL dependency (E or F): +factor
- Cognitive decline (MMSE < 20): +factor
- Significant behavioral problems (>3 notes): +factor
- High severity incidents: +factor
- Frequent medication changes (>2): +factor

**Levels:**
- 4+ factors: zeer_hoog
- 3 factors: hoog
- 2 factors: matig
- 1 factor: laag

### Recommendation Logic

Points for upgrade:
- ADL verslechterd: +2
- Cognitive verslechterd: +2
- Behavioral verslechterd: +2
- Zeer hoog complexity: +3
- Hoog complexity: +2
- Critical incidents: +1 each

**Thresholds:**
- ≥5 points: herindicatie_naar_zwaarder_profiel (confidence: 0.85)
- ≥3 points: meerzorg_aanvragen (confidence: 0.70)
- <3 points: behouden (confidence: 0.60)

## Test Results

### Client 1 (Psychiatric problems)
- **Complexity:** Hoog (3 factors)
- **Recommendation:** Meerzorg aanvragen
- **Confidence:** 70%
- **Rationale:** High complexity + 2 critical incidents

### Client 2 (Cognitive decline after CVA)
- **Complexity:** Zeer hoog (4 factors)
- **Recommendation:** Herindicatie naar VV8
- **Confidence:** 85%
- **Rationale:** ADL verslechterd + cognitive decline + zeer hoog complexity + 2 critical incidents

## Integration with Existing UC2 Endpoints

The new `/analyze-client` endpoint complements the existing UC2 endpoints:

1. **`/api/uc2/analyze-client`** - Analyzes client data (NEW)
2. **`/api/uc2/evaluate-criteria`** - Evaluates specific criteria
3. **`/api/uc2/compose-report`** - Composes herindicatie report
4. **`/api/uc2/export`** - Exports report to DOCX

**Typical workflow:**
```
1. POST /api/uc2/analyze-client
   → Get overall analysis and recommendation

2. POST /api/uc2/evaluate-criteria
   → Detailed criteria evaluation (ADL, GEDRAG, etc.)

3. POST /api/uc2/compose-report
   → Generate formal herindicatie report

4. POST /api/uc2/export
   → Export to professional DOCX format
```

## Future Enhancements

Potential improvements:
1. **Azure OpenAI integration** for natural language analysis
2. **Temporal pattern detection** (time-series analysis)
3. **Peer comparison** (compare with similar clients)
4. **Risk prediction** (predict future care needs)
5. **Intervention recommendations** (specific care interventions)
6. **Multi-client batch analysis**
7. **Export analysis results to PDF/DOCX**

## Development Notes

- Mock data is based on real-world "meerzorg" application forms (casus 3 & 4)
- All data is stored in-memory (will be migrated to PostgreSQL/Prisma later)
- Analysis runs synchronously (consider async for production)
- Audit logging tracks all analysis operations
- Dutch terminology used to match healthcare domain

## Contact

For questions or issues with the UC2 backend, please refer to the main project documentation.
