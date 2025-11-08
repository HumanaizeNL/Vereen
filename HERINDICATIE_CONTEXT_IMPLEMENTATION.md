# Herindicatie Context Implementatie

## Overzicht

De herindicatie evaluatie AI is nu uitgebreid met WLZ context uit officiële documenten. Dit zorgt voor:
- Betere beoordeling op basis van actuele WLZ beleidsregels
- Verwijzingen naar relevante voorschriften in evaluaties
- Meer accurate en onderbouwde herindicatie adviezen

## 📚 Geïntegreerde Context Documenten

De volgende documenten uit `herindicatie_context/` zijn beschikbaar voor de AI:

### Geëxtraheerde Statistieken:
- **10 documenten** totaal
- **379 chunks** (tekstfragmenten)
- **964.316 karakters** aan WLZ context

### Documenten per type:

**PDF Bestanden:**
- `beleidsregels_indicatiestelling_wlz_2025.pdf` - 36 chunks
- `Voorschrift-Zorgtoewijzing-2025.pdf` - 251 chunks (grootste bestand)
- `wetten.nl - Regeling langdurige zorg - BWBR0036014.pdf` - 50 chunks
- `Complete Wlz-aanvraag _ CIZ.pdf` - 5 chunks
- `Protocol Herindicatie WLZ intramuraal Vereen` - 3 chunks (2x)
- `Formulier CIZ.pdf` - 13 chunks
- `Webinar Administatie Meerzorg okt 2025 DEF.pdf` - 3 chunks

**DOCX Bestanden:**
- `Format vv8 aanvraag.docx` - 4 chunks
- `herindicatie formulier beoordeling zorg.docx` - 11 chunks

## 🔧 Implementatie Details

### 1. Context Extractor (`lib/ai/context-extractor.ts`)

**Functies:**
- `extractAllContextDocuments()` - Extraheert alle PDF en DOCX bestanden
- `searchContextChunks(chunks, keywords, maxResults)` - Zoekt op keywords
- `getRelevantContext(chunks, criterion, maxChunks)` - Haalt relevante context op voor een criterium
- `getCachedContextChunks()` - Cached versie voor performance

**Features:**
- Automatische PDF extractie met `pdf-parse-new`
- DOCX extractie met `mammoth`
- Intelligent chunking (2000 karakters per chunk)
- Keyword-based relevantie scoring
- Caching voor snelle herhaalde toegang

### 2. AI Evaluatie Updates (`lib/ai/openai-client.ts`)

**Aangepaste functies:**

#### `evaluateCriterionWithAI()`
```typescript
// Nieuwe parameter toegevoegd:
useContext?: boolean  // Standaard: true
```

De AI krijgt nu:
- Relevante WLZ context voor het specifieke criterium
- Beleidsregels en voorschriften als referentie
- Instructie om naar beleidsregels te verwijzen in argumentatie

#### `analyzeClientTrendsWithAI()`
```typescript
// Nieuwe parameter toegevoegd:
useContext?: boolean  // Standaard: true
```

De AI gebruikt WLZ richtlijnen voor:
- Trendanalyse
- Aanbevelingen gebaseerd op beleidsregels
- Complexiteitsbeoordeling

### 3. API Endpoints

#### `GET /api/herindicatie/context`
Haalt context statistieken op en laadt alle documenten.

**Query parameters:**
- `?action=reload` - Herlaadt de context (verwijdert cache)

**Response:**
```json
{
  "success": true,
  "statistics": {
    "total_documents": 10,
    "total_chunks": 379,
    "total_characters": 964316
  },
  "documents": [...]
}
```

#### `POST /api/herindicatie/context`
Zoekt in de context met keywords of criterion.

**Request body (keywords):**
```json
{
  "keywords": ["indicatiestelling", "VV8", "zorgbehoefte"],
  "maxResults": 5
}
```

**Request body (criterion):**
```json
{
  "criterion": {
    "label": "ADL functies",
    "description": "Cliënt heeft beperkingen in ADL functies..."
  },
  "maxResults": 3
}
```

## 🧪 Testen

### Context API Testen

```bash
# Statistieken ophalen
curl http://localhost:3000/api/herindicatie/context

# Context herladen
curl http://localhost:3000/api/herindicatie/context?action=reload

# Keyword search
curl -X POST http://localhost:3000/api/herindicatie/context \
  -H "Content-Type: application/json" \
  -d @test-search.json

# Criterion search
curl -X POST http://localhost:3000/api/herindicatie/context \
  -H "Content-Type: application/json" \
  -d @test-criterion.json
```

### Test Bestanden

- `test-search.json` - Voorbeeld keyword search
- `test-criterion.json` - Voorbeeld criterion search
- `scripts/test-context-extraction.js` - Test script voor extractie

## 📝 Gebruik in Evaluaties

De context wordt automatisch gebruikt in:

1. **Criterion Evaluatie** - Elke criterium evaluatie krijgt relevante WLZ context
2. **Trend Analyse** - WLZ richtlijnen worden gebruikt voor trend beoordeling
3. **Rapport Generatie** - Beleidsregels worden meegenomen in conclusies

### Voorbeeld Workflow

```typescript
// Context wordt automatisch opgehaald en gebruikt
const result = await evaluateCriterionWithAI({
  criterion: {
    id: 'adl-1',
    label: 'ADL functies',
    description: 'Beperkingen in dagelijkse activiteiten'
  },
  evidence: [...],
  clientContext: '...',
  useContext: true  // Standaard aan
});

// Result bevat nu argumentatie met verwijzing naar beleidsregels
console.log(result.argument);
// "Op basis van de evidence blijkt... Volgens de WLZ beleidsregels..."
```

## 🚀 Voordelen

1. **Accurate Evaluaties** - Gebaseerd op officiële WLZ documenten
2. **Onderbouwde Adviezen** - Verwijzingen naar specifieke beleidsregels
3. **Up-to-date** - Context kan eenvoudig geüpdatet worden door nieuwe bestanden toe te voegen
4. **Performance** - Caching zorgt voor snelle toegang
5. **Flexibel** - Context kan uit/aan gezet worden per evaluatie

## 🔄 Context Updaten

Nieuwe documenten toevoegen:

1. Plaats PDF of DOCX bestanden in `herindicatie_context/`
2. Herlaad de context via API: `GET /api/herindicatie/context?action=reload`
3. Of herstart de server - context wordt automatisch geladen bij eerste gebruik

## 📊 Performance

- **Eerste keer laden**: ~13 seconden voor alle 10 documenten
- **Gecached toegang**: <100ms
- **Keyword search**: <1 seconde
- **Criterion context retrieval**: <500ms

## ⚙️ Configuratie

### Context Chunk Size
Default: 2000 karakters per chunk

Aanpassen in `lib/ai/context-extractor.ts`:
```typescript
const CHUNK_SIZE = 2000; // Verhoog voor meer context per chunk
```

### Max Context per Evaluatie
Default: 3 chunks per criterion

Aanpassen in functie calls:
```typescript
getRelevantContext(chunks, criterion, 3); // Verhoog voor meer context
```

## 🐛 Troubleshooting

### Context wordt niet geladen
1. Check of `herindicatie_context/` directory bestaat
2. Check of bestanden lees-rechten hebben
3. Check server logs voor extractie errors

### Lage relevantie scores
1. Voeg meer specifieke keywords toe aan criteria descriptions
2. Verhoog `maxChunks` parameter
3. Check of relevante documenten aanwezig zijn

### Slow performance
1. Check of caching werkt (tweede call moet veel sneller zijn)
2. Verlaag `maxResults` parameters
3. Optimaliseer chunk size

## 📚 Dependencies

Bestaande dependencies gebruikt:
- `pdf-parse-new`: ^1.4.1 - PDF extractie
- `mammoth`: ^1.8.1 - DOCX extractie
- `openai`: ^6.7.0 - Azure OpenAI integratie

Geen nieuwe dependencies nodig! ✅

## 🎯 Volgende Stappen

Mogelijke verbeteringen:
1. **Vector Search** - Implementeer embeddings voor semantische search
2. **Context Highlighting** - Toon gebruikte context in UI
3. **Admin Panel** - UI voor context management
4. **Context Versioning** - Track welke versie van documenten gebruikt werd
5. **Multi-language Support** - Support voor andere talen
