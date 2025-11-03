# Vereen - Herindicatie AI Assistent (UC2)

Een Next.js applicatie voor het evalueren van VV8 herindicatie criteria met behulp van AI (Azure OpenAI).

## Features

### Geïmplementeerde Functionaliteit

#### 📤 Dossier Upload
- Drag & drop file upload component
- Ondersteuning voor CSV, PDF, DOCX, RTF bestanden
- Real-time upload progress met status indicatoren
- Automatische verwerking en indexering

#### 🎯 Criteria Evaluatie
- 8 VV8 2026 criteria (ADL, Nachtelijk toezicht, Gedragsproblematiek, etc.)
- AI-gedreven analyse met Azure OpenAI (GPT-4o)
- Mock mode voor development zonder API credentials
- Betrouwbaarheidsscores en onzekerheidswaarschuwingen

#### 🔍 Evidence Browser
- Zoeken door alle gevonden bewijs
- Filter op bron type (notes, measures, incidents)
- Relevantie scoring en highlighting
- Directe link naar bronbestanden

#### 📊 Interactive UI
- Shadcn UI component library
- Modern, responsive design
- Real-time state management
- Loading states en error handling

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3 + Shadcn UI
- **AI**: Azure OpenAI
- **Search**: FlexSearch (BM25)
- **Parsing**: CSV, PDF, DOCX

## Quick Start

```bash
# Installeer dependencies
pnpm install

# Start development server
pnpm dev
```

Bezoek http://localhost:3000/uc2

## Usage

1. **Upload sample data** - Sleep de CSV bestanden uit `sample-data/` naar de upload zone
2. **Stel periode in** - Kies de analyse periode
3. **Evalueer Criteria** - Klik op "Evalueer Criteria" om AI analyse te starten
4. **Bekijk resultaten** - Zie criteria evaluaties met onderbouwing en bewijs

## Project Structuur

```
├── app/                      # Next.js App Router
│   ├── uc2/                 # UC2 hoofdinterface
│   └── api/                 # API endpoints
├── components/              # React componenten
│   ├── ui/                 # Shadcn UI basis componenten
│   ├── criteria-card.tsx   # Criterium display
│   └── evidence-browser.tsx # Evidence zoeken
├── lib/                    # Business logic
│   ├── data/              # Data stores en types
│   ├── parsers/           # File parsers
│   ├── search/            # BM25 search
│   └── ai/                # Azure OpenAI
└── sample-data/           # Demo CSV bestanden
```

## Development Notes

De applicatie draait in **MOCK MODE** zonder Azure OpenAI configuratie. Alle functionaliteit is testbaar zonder API costs.

