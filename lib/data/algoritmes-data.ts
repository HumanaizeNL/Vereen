// Sample data from algoritmes.overheid.nl
// This represents a curated subset of algorithms suitable for AI onboarding recommendations

export interface Algorithm {
  id: string;
  name: string;
  organization: string;
  description: string;
  shortDescription: string;
  domain: string;
  category: string;
  riskLevel: 'hoog' | 'beperkt' | 'minimaal';
  aiActCategory?: string;
  status: 'active' | 'pilot' | 'deprecated';
  sourceUrl?: string;
  tags: string[];
  useCases: string[];
  requirements: {
    dataTypes: string[];
    technicalRequirements: string[];
    privacyConsiderations: string[];
  };
}

export const DOMAINS = [
  'Zorg en Welzijn',
  'Onderwijs',
  'Veiligheid en Handhaving',
  'Ruimtelijke Ordening',
  'Financiën en Belastingen',
  'Werk en Inkomen',
  'Milieu en Duurzaamheid',
  'Burgerzaken',
  'Communicatie en Dienstverlening',
  'Bedrijfsvoering',
] as const;

export const RISK_LEVELS = {
  hoog: {
    label: 'Hoog Risico',
    description: 'AI-systemen die significante impact hebben op fundamentele rechten',
    color: 'destructive',
  },
  beperkt: {
    label: 'Beperkt Risico',
    description: 'AI-systemen met transparantieverplichtingen',
    color: 'warning',
  },
  minimaal: {
    label: 'Minimaal Risico',
    description: 'AI-systemen zonder specifieke verplichtingen',
    color: 'success',
  },
} as const;

export const SAMPLE_ALGORITHMS: Algorithm[] = [
  // Zorg en Welzijn
  {
    id: 'alg-001',
    name: 'AI Zorgadvies Assistent',
    organization: 'Gemeente Utrecht',
    description: 'Een AI-systeem dat burgers helpt bij het vinden van passende zorgvoorzieningen op basis van hun situatie. Het systeem analyseert de ingevoerde informatie en geeft advies over mogelijke zorgarrangementen binnen de WMO.',
    shortDescription: 'Helpt burgers bij het vinden van passende zorgvoorzieningen',
    domain: 'Zorg en Welzijn',
    category: 'Indicatiestelling',
    riskLevel: 'beperkt',
    aiActCategory: 'Beperkt risico - transparantieverplichtingen',
    status: 'active',
    sourceUrl: 'https://algoritmes.overheid.nl/nl/algoritme/ai-zorgadvies-assistent',
    tags: ['zorg', 'wmo', 'indicatie', 'advies', 'burgerservice'],
    useCases: [
      'Eerste lijn advies voor zorgvragen',
      'Doorverwijzing naar juiste loket',
      'Voorbereiden indicatiegesprek',
    ],
    requirements: {
      dataTypes: ['Persoonsgegevens', 'Zorgsituatie', 'Woonsituatie'],
      technicalRequirements: ['Webformulier', 'API integratie', 'NLP model'],
      privacyConsiderations: ['AVG compliant', 'Geen BSN verwerking', 'Anonimisering na sessie'],
    },
  },
  {
    id: 'alg-002',
    name: 'Herindicatie Ondersteuning Tool',
    organization: 'Zorginstelling Vereen',
    description: 'AI-gedreven tool voor het ondersteunen van zorgprofessionals bij herindicatie van WLZ cliënten. Analyseert zorgdossiers en genereert conceptrapportages op basis van VV8 criteria.',
    shortDescription: 'Ondersteunt zorgprofessionals bij WLZ herindicatie',
    domain: 'Zorg en Welzijn',
    category: 'Indicatiestelling',
    riskLevel: 'hoog',
    aiActCategory: 'Hoog risico - kritieke infrastructuur/zorg',
    status: 'active',
    tags: ['wlz', 'herindicatie', 'zorgprofessional', 'rapportage', 'vv8'],
    useCases: [
      'Automatische analyse zorgdossier',
      'Genereren conceptrapportage',
      'Evidence-based onderbouwing',
    ],
    requirements: {
      dataTypes: ['Zorgdossier', 'Medische gegevens', 'ADL scores'],
      technicalRequirements: ['ECD integratie', 'Azure OpenAI', 'Document parsing'],
      privacyConsiderations: ['BSN verwerking', 'Medische gegevens', 'Logging verplicht'],
    },
  },
  {
    id: 'alg-003',
    name: 'Valpreventie Voorspeller',
    organization: 'GGD Amsterdam',
    description: 'Machine learning model dat op basis van gezondheidsgegevens en omgevingsfactoren het risico op vallen bij ouderen voorspelt. Gebruikt voor preventieve interventies.',
    shortDescription: 'Voorspelt valrisico bij ouderen voor preventie',
    domain: 'Zorg en Welzijn',
    category: 'Preventie',
    riskLevel: 'beperkt',
    status: 'pilot',
    tags: ['ouderen', 'preventie', 'valrisico', 'machine learning'],
    useCases: [
      'Risicoscreening ouderen',
      'Preventieve huisbezoeken',
      'Aanpassen woonomgeving',
    ],
    requirements: {
      dataTypes: ['Leeftijd', 'Medicijngebruik', 'Valhistorie', 'Woonsituatie'],
      technicalRequirements: ['ML model', 'Data warehouse', 'Dashboard'],
      privacyConsiderations: ['Toestemming vereist', 'Geanonimiseerde training data'],
    },
  },
  // Onderwijs
  {
    id: 'alg-004',
    name: 'Leerling Monitoring Systeem',
    organization: 'Gemeente Rotterdam',
    description: 'AI-systeem dat schoolverzuim en leerachterstanden vroegtijdig signaleert door analyse van aanwezigheidsdata en leerprestaties. Ondersteunt leerplichtambtenaren bij interventies.',
    shortDescription: 'Signaleert schoolverzuim en leerachterstanden',
    domain: 'Onderwijs',
    category: 'Vroegsignalering',
    riskLevel: 'hoog',
    aiActCategory: 'Hoog risico - onderwijs/toegang',
    status: 'active',
    tags: ['onderwijs', 'leerplicht', 'verzuim', 'vroegsignalering'],
    useCases: [
      'Detectie problematisch verzuim',
      'Identificatie risicoleerlingen',
      'Ondersteuning interventieplan',
    ],
    requirements: {
      dataTypes: ['Aanwezigheidsregistratie', 'Cijfers', 'Leerlinggegevens'],
      technicalRequirements: ['Koppeling leerlingadministratie', 'Alert systeem'],
      privacyConsiderations: ['Minderjarigen', 'Schoolgegevens', 'Bewaartermijnen'],
    },
  },
  {
    id: 'alg-005',
    name: 'Onderwijsadvies Generator',
    organization: 'DUO',
    description: 'Chatbot die leerlingen en ouders helpt bij vragen over studiekeuze, financiering en regelingen. Gebaseerd op kennisbank met actuele informatie over het Nederlandse onderwijsstelsel.',
    shortDescription: 'Chatbot voor onderwijsvragen en studiekeuze',
    domain: 'Onderwijs',
    category: 'Informatievoorziening',
    riskLevel: 'minimaal',
    status: 'active',
    tags: ['chatbot', 'studiekeuze', 'studiefinanciering', 'informatie'],
    useCases: [
      'Beantwoorden studievragen',
      'Uitleg regelingen',
      'Doorverwijzing naar juiste informatie',
    ],
    requirements: {
      dataTypes: ['Geen persoonsgegevens', 'Sessiedata'],
      technicalRequirements: ['NLP chatbot', 'Kennisbank', 'Webintegratie'],
      privacyConsiderations: ['Geen identificatie', 'Anonieme sessies'],
    },
  },
  // Veiligheid en Handhaving
  {
    id: 'alg-006',
    name: 'Meldingen Prioritering Tool',
    organization: 'Politie Nederland',
    description: 'AI-systeem dat binnenkomende meldingen analyseert en prioriteert op basis van urgentie en ernst. Ondersteunt de meldkamer bij het toewijzen van capaciteit.',
    shortDescription: 'Prioriteert meldingen op basis van urgentie',
    domain: 'Veiligheid en Handhaving',
    category: 'Operationele ondersteuning',
    riskLevel: 'hoog',
    aiActCategory: 'Hoog risico - rechtshandhaving',
    status: 'active',
    tags: ['politie', 'meldkamer', 'prioritering', 'urgentie'],
    useCases: [
      'Automatische classificatie meldingen',
      'Capaciteitstoewijzing',
      'Patroonherkenning incidenten',
    ],
    requirements: {
      dataTypes: ['Meldingsinhoud', 'Locatie', 'Tijd', 'Historische data'],
      technicalRequirements: ['Real-time verwerking', 'NLP', 'GIS integratie'],
      privacyConsiderations: ['Gevoelige gegevens', 'Beperkte toegang', 'Audit trail'],
    },
  },
  {
    id: 'alg-007',
    name: 'Ondermijning Signalering',
    organization: 'Gemeente Den Haag',
    description: 'Analysetool die signalen van ondermijnende criminaliteit detecteert door het combineren van verschillende databronnen zoals vergunningen, belastinggegevens en meldingen.',
    shortDescription: 'Detecteert signalen van ondermijnende criminaliteit',
    domain: 'Veiligheid en Handhaving',
    category: 'Criminaliteitsbestrijding',
    riskLevel: 'hoog',
    status: 'active',
    tags: ['ondermijning', 'criminaliteit', 'data-analyse', 'signalering'],
    useCases: [
      'Detectie verdachte patronen',
      'Risicoprofilering locaties',
      'Ondersteuning onderzoek',
    ],
    requirements: {
      dataTypes: ['Vergunningen', 'Belastingdata', 'Meldingen', 'Kadaster'],
      technicalRequirements: ['Data integratie', 'Pattern matching', 'Dashboard'],
      privacyConsiderations: ['DPIA vereist', 'Proportionaliteit', 'Toezicht'],
    },
  },
  // Werk en Inkomen
  {
    id: 'alg-008',
    name: 'Bijstand Fraude Detectie',
    organization: 'Gemeente Amsterdam',
    description: 'Machine learning model dat potentiële fraudegevallen in de bijstand signaleert door analyse van aanvraaggegevens en externe databronnen. Menselijke beoordeling blijft vereist.',
    shortDescription: 'Signaleert potentiële bijstandsfraude',
    domain: 'Werk en Inkomen',
    category: 'Fraudedetectie',
    riskLevel: 'hoog',
    aiActCategory: 'Hoog risico - toegang uitkeringen',
    status: 'active',
    tags: ['bijstand', 'fraude', 'detectie', 'machine learning'],
    useCases: [
      'Risicosignalering aanvragen',
      'Ondersteuning handhaving',
      'Patroonherkenning',
    ],
    requirements: {
      dataTypes: ['Aanvraaggegevens', 'Inkomensgegevens', 'BRP'],
      technicalRequirements: ['ML model', 'Data warehouse', 'Case management'],
      privacyConsiderations: ['Hoog risico', 'Menselijke beoordeling verplicht', 'DPIA'],
    },
  },
  {
    id: 'alg-009',
    name: 'Werkmatching Assistent',
    organization: 'UWV',
    description: 'AI-systeem dat werkzoekenden koppelt aan passende vacatures op basis van vaardigheden, ervaring en voorkeuren. Ondersteunt arbeidsbemiddeling.',
    shortDescription: 'Matcht werkzoekenden met vacatures',
    domain: 'Werk en Inkomen',
    category: 'Arbeidsbemiddeling',
    riskLevel: 'beperkt',
    status: 'active',
    tags: ['arbeidsmarkt', 'matching', 'vacatures', 'werkzoekenden'],
    useCases: [
      'Vacature matching',
      'Skill gap analyse',
      'Scholingsadvies',
    ],
    requirements: {
      dataTypes: ['CV gegevens', 'Vacatures', 'Vaardigheden'],
      technicalRequirements: ['NLP', 'Matching algoritme', 'Integratie werkgevers'],
      privacyConsiderations: ['Opt-in basis', 'Gegevensminimalisatie'],
    },
  },
  // Ruimtelijke Ordening
  {
    id: 'alg-010',
    name: 'Vergunning Checker',
    organization: 'Gemeente Utrecht',
    description: 'Chatbot die burgers helpt bepalen of ze een vergunning nodig hebben voor bouwplannen. Stelt gerichte vragen en geeft advies op basis van het Omgevingsloket.',
    shortDescription: 'Helpt bepalen of bouwvergunning nodig is',
    domain: 'Ruimtelijke Ordening',
    category: 'Vergunningen',
    riskLevel: 'minimaal',
    status: 'active',
    tags: ['bouw', 'vergunning', 'chatbot', 'omgevingsloket'],
    useCases: [
      'Eerste lijn vergunningcheck',
      'Voorlichting bouwplannen',
      'Doorverwijzing vergunningaanvraag',
    ],
    requirements: {
      dataTypes: ['Bouwplangegevens', 'Locatie', 'Bestemmingsplan'],
      technicalRequirements: ['Chatbot', 'Regels engine', 'Kaartintegratie'],
      privacyConsiderations: ['Geen identificatie vereist', 'Anoniem gebruik'],
    },
  },
  {
    id: 'alg-011',
    name: 'Hittestress Analyse Tool',
    organization: 'RIVM',
    description: 'GIS-gebaseerd model dat hittestress in stedelijke gebieden voorspelt op basis van bebouwing, groenvoorziening en demografische data. Ondersteunt klimaatadaptatie beleid.',
    shortDescription: 'Voorspelt hittestress in stedelijke gebieden',
    domain: 'Ruimtelijke Ordening',
    category: 'Klimaatadaptatie',
    riskLevel: 'minimaal',
    status: 'active',
    tags: ['klimaat', 'hitte', 'gis', 'stedelijk', 'analyse'],
    useCases: [
      'Identificatie kwetsbare gebieden',
      'Planning vergroening',
      'Beleidsondersteuning klimaat',
    ],
    requirements: {
      dataTypes: ['GIS data', 'Bebouwingsdata', 'Groenkaarten', 'Bevolkingsdata'],
      technicalRequirements: ['GIS analyse', 'Warmtemodel', 'Visualisatie'],
      privacyConsiderations: ['Geaggregeerde data', 'Geen persoonsgegevens'],
    },
  },
  // Communicatie en Dienstverlening
  {
    id: 'alg-012',
    name: 'Gemeente Chatbot',
    organization: 'Diverse gemeenten',
    description: 'AI-chatbot die vragen van burgers beantwoordt over gemeentelijke diensten, openingstijden, procedures en regelingen. Geïntegreerd met gemeentelijke website.',
    shortDescription: 'Beantwoordt vragen over gemeentelijke diensten',
    domain: 'Communicatie en Dienstverlening',
    category: 'Klantenservice',
    riskLevel: 'minimaal',
    status: 'active',
    tags: ['chatbot', 'klantenservice', 'gemeente', 'informatie'],
    useCases: [
      'Beantwoorden veelgestelde vragen',
      'Doorverwijzing naar juiste loket',
      'Afspraak maken',
    ],
    requirements: {
      dataTypes: ['Sessiedata', 'Vraagcategorisatie'],
      technicalRequirements: ['NLP chatbot', 'Kennisbank', 'Website integratie'],
      privacyConsiderations: ['Anonieme interactie', 'Geen persoonsgegevens'],
    },
  },
  {
    id: 'alg-013',
    name: 'Document Classificatie Systeem',
    organization: 'Gemeente Rotterdam',
    description: 'AI-systeem dat inkomende documenten automatisch classificeert en doorstuurt naar de juiste afdeling. Gebruikt OCR en tekstclassificatie.',
    shortDescription: 'Classificeert en routeert inkomende documenten',
    domain: 'Communicatie en Dienstverlening',
    category: 'Documentverwerking',
    riskLevel: 'minimaal',
    status: 'active',
    tags: ['documentverwerking', 'ocr', 'classificatie', 'automatisering'],
    useCases: [
      'Automatische postverwerking',
      'Routering naar afdelingen',
      'Snellere doorlooptijd',
    ],
    requirements: {
      dataTypes: ['Documenten', 'Metadata'],
      technicalRequirements: ['OCR', 'ML classificatie', 'Workflow integratie'],
      privacyConsiderations: ['Verwerking documenten met persoonsgegevens'],
    },
  },
  // Milieu en Duurzaamheid
  {
    id: 'alg-014',
    name: 'Energie Advies Tool',
    organization: 'RVO',
    description: 'Online tool die huiseigenaren advies geeft over energiebesparende maatregelen op basis van woningkenmerken en energielabel. Berekent besparingspotentieel.',
    shortDescription: 'Adviseert over energiebesparende maatregelen',
    domain: 'Milieu en Duurzaamheid',
    category: 'Energietransitie',
    riskLevel: 'minimaal',
    status: 'active',
    tags: ['energie', 'duurzaamheid', 'besparing', 'advies', 'woning'],
    useCases: [
      'Energieadvies woningen',
      'Besparingsberekening',
      'Subsidie informatie',
    ],
    requirements: {
      dataTypes: ['Woningkenmerken', 'Energielabel', 'Energieverbruik'],
      technicalRequirements: ['Rekenmodel', 'Database energielabels', 'Webformulier'],
      privacyConsiderations: ['Opt-in', 'Adresgegevens optioneel'],
    },
  },
  {
    id: 'alg-015',
    name: 'Afval Sortering Herkenning',
    organization: 'Afvalverwerker AEB',
    description: 'Computer vision systeem dat afval herkent en classificeert voor betere sortering. Wordt gebruikt in afvalverwerkingsinstallaties voor kwaliteitscontrole.',
    shortDescription: 'Herkent en classificeert afval voor sortering',
    domain: 'Milieu en Duurzaamheid',
    category: 'Afvalverwerking',
    riskLevel: 'minimaal',
    status: 'pilot',
    tags: ['afval', 'recycling', 'computer vision', 'sortering'],
    useCases: [
      'Kwaliteitscontrole sortering',
      'Detectie vervuiling',
      'Optimalisatie recycling',
    ],
    requirements: {
      dataTypes: ['Beeldmateriaal afvalband', 'Sorteerdata'],
      technicalRequirements: ['Computer vision', 'Real-time verwerking', 'Cameras'],
      privacyConsiderations: ['Geen persoonsgegevens', 'Industriële toepassing'],
    },
  },
  // Bedrijfsvoering
  {
    id: 'alg-016',
    name: 'AI Vergaderassistent',
    organization: 'Diverse organisaties',
    description: 'AI-systeem dat vergaderingen transcribeert, samenvat en actiepunten extraheert. Bespaart tijd bij notulen maken en follow-up.',
    shortDescription: 'Transcribeert en vat vergaderingen samen',
    domain: 'Bedrijfsvoering',
    category: 'Productiviteit',
    riskLevel: 'beperkt',
    status: 'active',
    tags: ['vergadering', 'transcriptie', 'samenvatting', 'productiviteit'],
    useCases: [
      'Automatische notulen',
      'Actiepunten extractie',
      'Doorzoekbaar archief',
    ],
    requirements: {
      dataTypes: ['Audio/video opnames', 'Deelnemerslijst'],
      technicalRequirements: ['Speech-to-text', 'NLP samenvatting', 'Cloud opslag'],
      privacyConsiderations: ['Toestemming deelnemers', 'Verwerking audio'],
    },
  },
  {
    id: 'alg-017',
    name: 'HR Analytics Dashboard',
    organization: 'Grote gemeenten',
    description: 'Analyse tool voor HR data die inzicht geeft in verzuim, verloop en ontwikkelbehoeften van medewerkers. Ondersteunt strategisch personeelsbeleid.',
    shortDescription: 'Analyseert HR data voor personeelsbeleid',
    domain: 'Bedrijfsvoering',
    category: 'Human Resources',
    riskLevel: 'beperkt',
    status: 'active',
    tags: ['hr', 'analytics', 'verzuim', 'personeelsbeleid'],
    useCases: [
      'Verzuimanalyse',
      'Verlooprisicovoorspelling',
      'Capaciteitsplanning',
    ],
    requirements: {
      dataTypes: ['Personeelsgegevens', 'Verzuimdata', 'Beoordelingen'],
      technicalRequirements: ['BI platform', 'HR systeem integratie', 'Dashboards'],
      privacyConsiderations: ['Medewerkersgegevens', 'Aggregatie vereist', 'OR betrokkenheid'],
    },
  },
  // Financiën en Belastingen
  {
    id: 'alg-018',
    name: 'WOZ Waarde Taxatie Model',
    organization: 'Belastingdienst',
    description: 'Machine learning model dat de WOZ-waarde van woningen taxeert op basis van woningkenmerken, locatie en marktgegevens. Ondersteunt massa-taxatie.',
    shortDescription: 'Taxeert WOZ-waarde van woningen',
    domain: 'Financiën en Belastingen',
    category: 'Belastingheffing',
    riskLevel: 'hoog',
    aiActCategory: 'Hoog risico - financiële impact burgers',
    status: 'active',
    tags: ['woz', 'taxatie', 'onroerend goed', 'belasting'],
    useCases: [
      'Massa-taxatie woningen',
      'Onderbouwing WOZ-beschikking',
      'Marktwaarde analyse',
    ],
    requirements: {
      dataTypes: ['Woningkenmerken', 'Verkoopdata', 'Kadaster', 'BAG'],
      technicalRequirements: ['ML model', 'GIS', 'Data integratie'],
      privacyConsiderations: ['Objectgegevens', 'Transparantie algoritme'],
    },
  },
  // Burgerzaken
  {
    id: 'alg-019',
    name: 'Identiteitsdocument Verificatie',
    organization: 'RvIG',
    description: 'AI-systeem dat de echtheid van identiteitsdocumenten controleert door analyse van beveiligingskenmerken en vergelijking met databases.',
    shortDescription: 'Controleert echtheid identiteitsdocumenten',
    domain: 'Burgerzaken',
    category: 'Identiteitscontrole',
    riskLevel: 'hoog',
    aiActCategory: 'Hoog risico - biometrie/identiteit',
    status: 'active',
    tags: ['identiteit', 'verificatie', 'documenten', 'fraude'],
    useCases: [
      'Controle bij balieaanvraag',
      'Detectie vervalste documenten',
      'Grenscontrole ondersteuning',
    ],
    requirements: {
      dataTypes: ['Documentscans', 'Biometrische data', 'Referentiedata'],
      technicalRequirements: ['Computer vision', 'Document analyse', 'Database koppeling'],
      privacyConsiderations: ['Biometrie verwerking', 'Hoge beveiliging'],
    },
  },
  {
    id: 'alg-020',
    name: 'Naamswijziging Assistent',
    organization: 'Justis',
    description: 'Online tool die burgers helpt bij het aanvragen van een naamswijziging door vragen te stellen over de situatie en te adviseren over de procedure.',
    shortDescription: 'Begeleidt burgers bij naamswijziging aanvraag',
    domain: 'Burgerzaken',
    category: 'Aanvraagbegeleiding',
    riskLevel: 'minimaal',
    status: 'active',
    tags: ['naamswijziging', 'aanvraag', 'begeleiding', 'procedure'],
    useCases: [
      'Informatie over procedure',
      'Checklist documenten',
      'Doorverwijzing aanvraag',
    ],
    requirements: {
      dataTypes: ['Situatiebeschrijving', 'Geen identificatie'],
      technicalRequirements: ['Beslisboom', 'Webformulier'],
      privacyConsiderations: ['Anoniem gebruik mogelijk'],
    },
  },
];

// Helper function to search algorithms
export function searchAlgorithms(query: string, filters?: {
  domain?: string;
  riskLevel?: string;
  status?: string;
}): Algorithm[] {
  const queryLower = query.toLowerCase();

  return SAMPLE_ALGORITHMS.filter(alg => {
    // Apply filters
    if (filters?.domain && alg.domain !== filters.domain) return false;
    if (filters?.riskLevel && alg.riskLevel !== filters.riskLevel) return false;
    if (filters?.status && alg.status !== filters.status) return false;

    // Search in various fields
    const searchFields = [
      alg.name,
      alg.description,
      alg.shortDescription,
      alg.organization,
      alg.domain,
      alg.category,
      ...alg.tags,
      ...alg.useCases,
    ].map(s => s.toLowerCase());

    return searchFields.some(field => field.includes(queryLower));
  });
}

// Helper function to get algorithms by domain
export function getAlgorithmsByDomain(domain: string): Algorithm[] {
  return SAMPLE_ALGORITHMS.filter(alg => alg.domain === domain);
}

// Helper function to get algorithm by ID
export function getAlgorithmById(id: string): Algorithm | undefined {
  return SAMPLE_ALGORITHMS.find(alg => alg.id === id);
}
