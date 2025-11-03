# Vereen - UC2 Herindicatie Platform

AI-powered documentation platform for Meerzorg and Herindicatie assessment using Azure OpenAI.

## 🎯 Features Implemented (UC2)

### ✅ Backend API
- **POST /api/ingest** - Upload and process dossier files (CSV, PDF, DOCX, RTF)
- **POST /api/search** - Full-text search through dossier data with BM25 scoring
- **POST /api/uc2/evaluate-criteria** - AI-powered VV7/VV8 criteria evaluation
- **POST /api/uc2/compose-report** - Generate herindicatie advisory reports
- **GET /api/audit/logs** - Audit trail for all operations

### ✅ Core Infrastructure
- **In-memory data stores** for MVP (easy migration to PostgreSQL later)
- **Document parsers**: CSV (with auto field mapping), PDF, DOCX/RTF
- **FlexSearch engine**: In-memory BM25 search with filters
- **Azure OpenAI integration**: With mock mode for development
- **Type-safe API**: Zod schemas for all requests/responses

### ✅ UI
- Landing page with UC1/UC2 navigation
- UC2 layout with criteria panel (basic)
- Upload zone placeholder
- Evidence browser placeholder

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

Visit http://localhost:3000

## 📝 Mock Mode

The app runs in MOCK MODE by default (no Azure OpenAI required for development).

To enable real AI, create `.env.local`:
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
```

## 📊 API Examples

### Upload Files
```bash
curl -X POST http://localhost:3000/api/ingest \
  -F "client_id=C123" \
  -F "files=@notes.csv"
```

### Evaluate Criteria
```bash
curl -X POST http://localhost:3000/api/uc2/evaluate-criteria \
  -H "Content-Type: application/json" \
  -d '{"client_id":"C123","period":{"from":"2025-06-01","to":"2025-11-02"},"criteria_set":"herindicatie.vv8.2026"}'
```

## 🏗️ Status

✅ Completed: Core UC2 backend + Basic UI
🚧 Pending: Interactive UI, Export, Voice commands, Auth
