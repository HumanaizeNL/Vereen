# Vereen - WLZ Care Management AI Platform

Een Next.js platform voor het ondersteunen van WLZ zorgprofessionals bij het beheren van indicaties en aanvragen, met behulp van AI (Azure OpenAI).

## 🎯 Use Cases

### UC1 - Meerzorg Aanvraag
**Doel**: Voorbereiden en indienen van goed onderbouwde Meerzorg (extra zorgfinanciering) aanvragen voor WLZ cliënten, met gebruikmaking van dossiercontext voor automatische formulier invulling.

**Status**: 🟡 Basis implementatie (data management, upload, AI samenvatting)

**Hoofdfuncties**:
- 📤 Dossier upload en extractie (CSV, PDF, DOCX, RTF)
- 👥 Cliënt data management (notities, metingen, incidenten)
- 🤖 AI-gedreven samenvatting van cliëntdossiers
- 📊 Statistieken dashboard

**In Ontwikkeling** (zie [PLAN.md](./PLAN.md)):
- Automatische formulier invulling vanuit dossier
- Toetsingskader normatieve checks
- Bewijs bundeling (incidenten, ADL, nachtzorg)
- Review workflow (zorgprofessional → backoffice)
- Export naar officiële Meerzorg templates (2025/2026)
- Takenlijst voor ontbrekende documenten

---

### UC2 - Herindicatie (Re-assessment)
**Doel**: Signaleren en onderbouwen dat een bestaande WLZ-indicatie moet worden aangepast, met een gestructureerd herindicatie-advies uit dossierdata.

**Status**: 🟢 Basis functionaliteit geïmplementeerd

**Geïmplementeerde Functionaliteit**:
- 🎯 8 VV8 2026 criteria evaluatie (ADL, Nachtelijk toezicht, Gedragsproblematiek, etc.)
- 🤖 AI-gedreven analyse met Azure OpenAI (GPT-4o)
- 🔍 Evidence browser met zoeken/filteren
- 📄 DOCX export met bewijs bijlagen
- 🧪 Mock mode voor development zonder API credentials

**Geplande Verbeteringen** (zie [PLAN.md](./PLAN.md)):
- 📈 Automatische monitoring en trend detectie
- ⚠️ Risico scoring en case flagging
- 📊 Trend visualisatie (grafieken)
- 👨‍⚕️ Multidisciplinair team review workflow
- 🔀 Route selectie (intern vs formele herindicatie)
- 📝 Follow-up taak generatie

## 🏗️ Architectuur

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3 + Shadcn UI
- **AI**: Azure OpenAI (GPT-4o)
- **Search**: FlexSearch (BM25)
- **Parsing**: CSV, PDF, DOCX
- **Database**: (In development)

### Gedeelde Bouwstenen
Beide use cases delen:
- **Dossier Extractie Engine** - parsing en data extractie
- **Normatieve Checks** - validatie tegen regelgeving
- **Bewijs Linking** - koppeling claims ↔ bronnen
- **Export Pipelines** - template-based document generatie
- **AI Integratie** - Azure OpenAI voor intelligente features

Zie [PLAN.md](./PLAN.md) voor gedetailleerde architectuur.

## 🚀 Quick Start

### Installatie
```bash
# Installeer dependencies
pnpm install
```

### Configuratie
Maak een `.env.local` bestand:
```env
# Azure OpenAI (optioneel - werkt ook in mock mode)
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Feature flags
ENABLE_AI_FEATURES=true
ENABLE_MOCK_MODE=true
```

### Development Server
```bash
# Start development server
pnpm dev
```

Bezoek:
- **UC1 (Data Management)**: http://localhost:3000/uc1
- **UC2 (Herindicatie)**: http://localhost:3000/uc2

## 📖 Gebruik

### UC1 - Data Management
1. **Upload sample data** - Sleep CSV bestanden uit `sample-data/` naar de upload zone
2. **Browse clients** - Bekijk cliënten, filter op aanbieder/profiel
3. **View details** - Klik op een cliënt voor notities, metingen en incidenten
4. **AI Summary** - Genereer AI samenvatting van cliënt dossier

### UC2 - Herindicatie Evaluatie
1. **Upload dossier** - Sleep CSV bestanden naar de upload zone
2. **Stel periode in** - Kies de analyse periode
3. **Evalueer Criteria** - Klik op "Evalueer Criteria" om AI analyse te starten
4. **Bekijk resultaten** - Zie criteria evaluaties met onderbouwing en bewijs
5. **Export** - Exporteer naar DOCX met alle bronnen

## 📁 Project Structuur

```
├── app/                          # Next.js App Router
│   ├── uc1/                     # UC1 Data Management
│   ├── uc2/                     # UC2 Herindicatie Evaluatie
│   └── api/                     # API endpoints
│       ├── uc1/                 # UC1 APIs
│       │   ├── clients/         # Client management
│       │   ├── stats/           # Statistics
│       │   ├── templates/       # Template downloads
│       │   └── ai/              # AI features
│       ├── uc2/                 # UC2 APIs
│       │   ├── evaluate-criteria/
│       │   └── export/
│       └── dev/                 # Development utilities
├── components/                   # React componenten
│   ├── ui/                      # Shadcn UI basis componenten
│   ├── criteria-card.tsx        # UC2 Criterium display
│   ├── evidence-browser.tsx     # UC2 Evidence zoeken
│   └── file-upload.tsx          # Upload component
├── lib/                         # Business logic
│   ├── data/                    # Data stores en types
│   ├── parsers/                 # File parsers (CSV, PDF, DOCX)
│   ├── search/                  # BM25 search engine
│   └── ai/                      # Azure OpenAI integration
├── sample-data/                 # Demo CSV bestanden
├── context/                     # Reference documents
│   ├── Toetsingskader_meerzorg_2026.pdf
│   ├── Aanvraagformulier_*.docx
│   ├── casus-*.txt
│   └── ...
└── PLAN.md                      # Detailed implementation plan
```

## 🎨 Features Matrix

| Feature | UC1 | UC2 | Status |
|---------|-----|-----|--------|
| **Data Management** |
| File upload (CSV, PDF, DOCX) | ✅ | ✅ | Geïmplementeerd |
| Client management | ✅ | ✅ | Geïmplementeerd |
| Notes/measures/incidents | ✅ | ✅ | Geïmplementeerd |
| Statistics dashboard | ✅ | ⬜ | UC1 only |
| **AI Features** |
| Document summarization | ✅ | ⬜ | UC1 only |
| Criteria evaluation | ⬜ | ✅ | UC2 only |
| Evidence extraction | ⬜ | ✅ | UC2 only |
| Form auto-fill | 🔄 | ⬜ | In ontwikkeling |
| Trend interpretation | ⬜ | 🔄 | Gepland |
| **Workflows** |
| Evidence browser | ⬜ | ✅ | UC2 only |
| Review workflow | 🔄 | 🔄 | In ontwikkeling |
| Task management | 🔄 | 🔄 | Gepland |
| **Export** |
| Basic DOCX export | ⬜ | ✅ | UC2 only |
| Template-based export | 🔄 | 🔄 | In ontwikkeling |
| **Advanced** |
| Normative checks | 🔄 | ⬜ | In ontwikkeling |
| Trend monitoring | ⬜ | 🔄 | Gepland |
| Risk flagging | ⬜ | 🔄 | Gepland |
| Audit logging | 🔄 | 🔄 | Gepland |

**Legenda**: ✅ Geïmplementeerd | 🔄 In ontwikkeling/Gepland | ⬜ Niet van toepassing

## 📚 Documentatie

- **[PLAN.md](./PLAN.md)** - Gedetailleerd implementatie plan met:
  - Complete use case specificaties
  - Technische architectuur
  - Database schema
  - API endpoints
  - Sprint roadmap (12 weken)
  - Risico management
  - Success metrics

- **[CLAUDE.md](./CLAUDE.md)** - Project-specifieke development instructies

- **Context folder** - Referentie documenten:
  - Toetsingskader (2025/2026)
  - Meerzorg aanvraag formulieren
  - Case voorbeelden
  - Beleidsdocumenten

## 🔧 Development

### Mock Mode
De applicatie draait in **MOCK MODE** zonder Azure OpenAI configuratie. Alle functionaliteit is testbaar zonder API costs.

Voor UC2 krijg je realistische mock evaluaties met bewijs. Voor productie gebruik, configureer Azure OpenAI in `.env.local`.

### Development Utilities
- **Load Mock Data** - Laad voorbeeld data in UC1
- **Templates** - Download CSV templates voor bulk upload
- **Dev Mode Indicators** - Visuele indicatoren wanneer in mock mode

### Testing
```bash
# Run tests (when implemented)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 🗓️ Roadmap

Zie [PLAN.md](./PLAN.md) voor de volledige implementatie roadmap:

- **Sprint 1-2** (Weken 1-4): Shared foundation + UC1 core
- **Sprint 3-4** (Weken 5-8): UC1 advanced + UC2 monitoring
- **Sprint 5-6** (Weken 9-12): UC2 advanced + integration

### Aankomende Features
**UC1 - Meerzorg**:
- ✨ Automatische formulier invulling
- ✅ Toetsingskader validatie
- 📋 Review workflow met goedkeuring
- 📄 Export naar officiële templates

**UC2 - Herindicatie**:
- 📈 Trend monitoring dashboard
- ⚠️ Automatische risk flagging
- 👥 MD team review interface
- 📊 Enhanced visualisaties

**Platform**:
- 🔐 Role-based access control
- 📝 Comprehensive audit logging
- 🔄 Version management (2025/2026 frameworks)
- ⚡ Performance optimizations

## 🔐 Security & Privacy

- **Data Minimization** - Alleen noodzakelijke gegevens
- **Encryption** - At rest en in transit (in productie)
- **Anonymization** - Export opties voor geanonimiseerde rapporten
- **Audit Trail** - Volledige logging van acties (in ontwikkeling)
- **RBAC** - Role-based access control (gepland)

## 🤝 Contributing

Dit project is in actieve ontwikkeling. Voor wijzigingen:

1. Check [PLAN.md](./PLAN.md) voor roadmap en architectuur
2. Volg bestaande code patterns
3. Update documentatie bij wijzigingen
4. Test met mock data én echte Azure OpenAI (indien beschikbaar)

## 📄 License

[License information to be added]

## 📞 Support

Voor vragen of issues:
- Check [PLAN.md](./PLAN.md) voor gedetailleerde specificaties
- Review context folder voor referentie documenten
- Contact development team

---

**Status**: In Development
**Version**: 0.5.0
**Last Updated**: 2025-11-06
