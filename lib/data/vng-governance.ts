// VNG AI Governance framework data
// Based on https://aigovernance.vng.nl/

export interface GovernanceStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  activities: string[];
  deliverables: string[];
  roles: string[];
  complianceItems: string[];
}

export interface GovernanceRole {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  responsibilities: string[];
  requiredFor: ('hoog' | 'beperkt' | 'minimaal')[];
}

export interface ComplianceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  regulation: string;
  deadline?: string;
  applicableTo: ('hoog' | 'beperkt' | 'minimaal')[];
}

export const GOVERNANCE_PHASES = [
  'Oriëntatie',
  'Probleemanalyse',
  'Oplossingsontwerp',
  'Inkoop/Ontwikkeling',
  'Implementatie',
  'Beheer & Monitoring',
] as const;

export const GOVERNANCE_ROLES: GovernanceRole[] = [
  {
    id: 'role-001',
    name: 'AI Compliance Officer (AICO)',
    nameEn: 'AI Compliance Officer',
    description: 'Verantwoordelijk voor de naleving van de AI-verordening en het toezicht op AI-systemen binnen de organisatie.',
    responsibilities: [
      'Toezicht houden op AI-compliance',
      'Adviseren over AI-verordening verplichtingen',
      'Contactpersoon voor toezichthouders',
      'Beheren algoritmeregister',
      'Coördineren van FRIA (Fundamental Rights Impact Assessment)',
    ],
    requiredFor: ['hoog', 'beperkt'],
  },
  {
    id: 'role-002',
    name: 'Functionaris Gegevensbescherming (FG)',
    nameEn: 'Data Protection Officer',
    description: 'Toezichthouder op de naleving van de AVG en adviseur over privacy-aspecten van AI-systemen.',
    responsibilities: [
      'Toezicht AVG-naleving',
      'Adviseren over DPIA',
      'Contactpersoon AP',
      'Beoordelen rechtmatigheid gegevensverwerking',
    ],
    requiredFor: ['hoog', 'beperkt', 'minimaal'],
  },
  {
    id: 'role-003',
    name: 'Proceseigenaar',
    nameEn: 'Process Owner',
    description: 'Verantwoordelijk voor het bedrijfsproces waarin het AI-systeem wordt ingezet.',
    responsibilities: [
      'Definiëren businesscase',
      'Goedkeuren implementatie',
      'Monitoren procesresultaten',
      'Besluiten over menselijke interventie',
    ],
    requiredFor: ['hoog', 'beperkt', 'minimaal'],
  },
  {
    id: 'role-004',
    name: 'IT Architect',
    nameEn: 'IT Architect',
    description: 'Verantwoordelijk voor de technische architectuur en integratie van AI-systemen.',
    responsibilities: [
      'Ontwerpen technische architectuur',
      'Borgen informatiebeveiliging',
      'Integratie met bestaande systemen',
      'Technische haalbaarheidsanalyse',
    ],
    requiredFor: ['hoog', 'beperkt', 'minimaal'],
  },
  {
    id: 'role-005',
    name: 'Ethisch Adviseur',
    nameEn: 'Ethics Advisor',
    description: 'Adviseert over ethische aspecten van AI-inzet en grondrechtenimpact.',
    responsibilities: [
      'Uitvoeren ethische toets',
      'Adviseren over bias en discriminatie',
      'Beoordelen transparantie',
      'Betrekken stakeholders',
    ],
    requiredFor: ['hoog', 'beperkt'],
  },
  {
    id: 'role-006',
    name: 'Informatiemanager',
    nameEn: 'Information Manager',
    description: 'Verantwoordelijk voor informatiemanagement en datakwaliteit.',
    responsibilities: [
      'Borgen datakwaliteit',
      'Beheren metadata',
      'Definiëren datagovernance',
      'Registratie algoritmeregister',
    ],
    requiredFor: ['hoog', 'beperkt', 'minimaal'],
  },
];

export const GOVERNANCE_STEPS: GovernanceStep[] = [
  // Fase 1: Oriëntatie
  {
    id: 'step-001',
    phase: 'Oriëntatie',
    title: 'Verkenning AI-mogelijkheden',
    description: 'Inventariseer de mogelijkheden en beperkingen van AI voor uw specifieke vraagstuk.',
    activities: [
      'Analyseer het huidige proces en knelpunten',
      'Onderzoek beschikbare AI-oplossingen in de markt',
      'Raadpleeg het Algoritmeregister voor vergelijkbare toepassingen',
      'Bespreek met vakafdelingen en IT',
    ],
    deliverables: [
      'Probleemstelling',
      'Eerste inventarisatie AI-oplossingen',
      'Stakeholderanalyse',
    ],
    roles: ['Proceseigenaar', 'IT Architect'],
    complianceItems: ['AI geletterdheid waarborgen'],
  },
  {
    id: 'step-002',
    phase: 'Oriëntatie',
    title: 'Risicoklassificatie bepalen',
    description: 'Bepaal de risicoklasse van het beoogde AI-systeem volgens de AI-verordening.',
    activities: [
      'Doorloop de classificatiecriteria van de AI-verordening',
      'Identificeer of het systeem onder verboden praktijken valt',
      'Bepaal of het systeem als hoog-risico wordt geclassificeerd',
      'Documenteer de classificatie en onderbouwing',
    ],
    deliverables: [
      'Risicoklassificatie document',
      'Onderbouwing classificatie',
    ],
    roles: ['AI Compliance Officer', 'FG'],
    complianceItems: ['Risicoklassificatie AI-verordening'],
  },
  // Fase 2: Probleemanalyse
  {
    id: 'step-003',
    phase: 'Probleemanalyse',
    title: 'Businesscase opstellen',
    description: 'Ontwikkel een businesscase voor de AI-oplossing met aandacht voor kosten, baten en risico\'s.',
    activities: [
      'Definieer meetbare doelstellingen',
      'Bereken verwachte kosten en baten',
      'Identificeer risico\'s en mitigerende maatregelen',
      'Vergelijk met alternatieve oplossingen',
    ],
    deliverables: [
      'Businesscase document',
      'Kosten-baten analyse',
      'Risicoanalyse',
    ],
    roles: ['Proceseigenaar', 'IT Architect', 'Informatiemanager'],
    complianceItems: [],
  },
  {
    id: 'step-004',
    phase: 'Probleemanalyse',
    title: 'Grondrechten Impact Assessment',
    description: 'Voer een grondrechten impact assessment (FRIA) uit voor hoog-risico AI-systemen.',
    activities: [
      'Identificeer betrokken grondrechten',
      'Analyseer potentiële negatieve effecten',
      'Bepaal mitigerende maatregelen',
      'Betrek relevante stakeholders',
    ],
    deliverables: [
      'FRIA rapport',
      'Mitigatieplan',
    ],
    roles: ['Ethisch Adviseur', 'FG', 'AI Compliance Officer'],
    complianceItems: ['FRIA voor hoog-risico AI', 'Transparantie naar betrokkenen'],
  },
  {
    id: 'step-005',
    phase: 'Probleemanalyse',
    title: 'Data Protection Impact Assessment',
    description: 'Voer een DPIA uit indien het AI-systeem persoonsgegevens verwerkt.',
    activities: [
      'Beschrijf de gegevensverwerking',
      'Beoordeel noodzaak en proportionaliteit',
      'Identificeer privacy-risico\'s',
      'Bepaal technische en organisatorische maatregelen',
    ],
    deliverables: [
      'DPIA rapport',
      'Maatregelenplan',
    ],
    roles: ['FG', 'IT Architect', 'Informatiemanager'],
    complianceItems: ['DPIA uitvoeren (AVG)', 'Rechtmatige grondslag verwerking'],
  },
  // Fase 3: Oplossingsontwerp
  {
    id: 'step-006',
    phase: 'Oplossingsontwerp',
    title: 'Functioneel ontwerp',
    description: 'Ontwerp de functionele specificaties van het AI-systeem.',
    activities: [
      'Definieer functionele requirements',
      'Ontwerp user interface en interacties',
      'Specificeer integraties met bestaande systemen',
      'Definieer acceptatiecriteria',
    ],
    deliverables: [
      'Functioneel ontwerp document',
      'User stories',
      'Acceptatiecriteria',
    ],
    roles: ['Proceseigenaar', 'IT Architect'],
    complianceItems: ['Menselijke controle inbouwen'],
  },
  {
    id: 'step-007',
    phase: 'Oplossingsontwerp',
    title: 'Technisch ontwerp',
    description: 'Ontwerp de technische architectuur en specificeer de AI-componenten.',
    activities: [
      'Ontwerp systeemarchitectuur',
      'Specificeer AI-model requirements',
      'Definieer data pipeline',
      'Specificeer beveiligingsmaatregelen',
    ],
    deliverables: [
      'Technisch ontwerp document',
      'Architectuur diagram',
      'Beveiligingsplan',
    ],
    roles: ['IT Architect', 'Informatiemanager'],
    complianceItems: ['Technische documentatie AI-systeem', 'Cybersecurity maatregelen'],
  },
  // Fase 4: Inkoop/Ontwikkeling
  {
    id: 'step-008',
    phase: 'Inkoop/Ontwikkeling',
    title: 'Leveranciersselectie of ontwikkeling',
    description: 'Selecteer een leverancier of start interne ontwikkeling van het AI-systeem.',
    activities: [
      'Stel inkoopspecificaties op inclusief AI-verordening eisen',
      'Evalueer leveranciers op compliance',
      'Contracteer met AI-specifieke bepalingen',
      'Of: start interne ontwikkeling volgens richtlijnen',
    ],
    deliverables: [
      'Inkoopspecificaties',
      'Leveranciersevaluatie',
      'Contract met AI-bepalingen',
    ],
    roles: ['Proceseigenaar', 'AI Compliance Officer', 'IT Architect'],
    complianceItems: ['Leverancierscontract AI-verordening compliant', 'Kwaliteitsmanagementsysteem'],
  },
  {
    id: 'step-009',
    phase: 'Inkoop/Ontwikkeling',
    title: 'Testen en valideren',
    description: 'Test het AI-systeem op functionaliteit, nauwkeurigheid en compliance.',
    activities: [
      'Voer functionele tests uit',
      'Test op bias en discriminatie',
      'Valideer nauwkeurigheid en performance',
      'Voer security tests uit',
    ],
    deliverables: [
      'Testrapportage',
      'Bias analyse',
      'Security assessment',
    ],
    roles: ['IT Architect', 'Ethisch Adviseur', 'AI Compliance Officer'],
    complianceItems: ['Testen op bias en discriminatie', 'Nauwkeurigheid en robuustheid testen'],
  },
  // Fase 5: Implementatie
  {
    id: 'step-010',
    phase: 'Implementatie',
    title: 'Pilotfase',
    description: 'Implementeer het AI-systeem in een gecontroleerde pilot omgeving.',
    activities: [
      'Selecteer pilotgroep en use cases',
      'Implementeer met beperkte scope',
      'Monitor resultaten intensief',
      'Verzamel feedback van gebruikers',
    ],
    deliverables: [
      'Pilotplan',
      'Evaluatierapport pilot',
      'Go/no-go besluit',
    ],
    roles: ['Proceseigenaar', 'IT Architect'],
    complianceItems: ['Menselijke controle tijdens pilot'],
  },
  {
    id: 'step-011',
    phase: 'Implementatie',
    title: 'Registratie in Algoritmeregister',
    description: 'Registreer het AI-systeem in het Algoritmeregister van de overheid.',
    activities: [
      'Vul alle verplichte velden in',
      'Beschrijf werking en doel begrijpelijk',
      'Publiceer registratie',
      'Plan periodieke updates',
    ],
    deliverables: [
      'Algoritmeregister registratie',
      'Updateplanning',
    ],
    roles: ['AI Compliance Officer', 'Informatiemanager'],
    complianceItems: ['Registratie Algoritmeregister', 'Transparantie naar burgers'],
  },
  {
    id: 'step-012',
    phase: 'Implementatie',
    title: 'Training en uitrol',
    description: 'Train gebruikers en rol het AI-systeem breed uit.',
    activities: [
      'Ontwikkel trainingsmateriaal',
      'Train eindgebruikers op AI-geletterdheid',
      'Implementeer in productie',
      'Communiceer naar stakeholders',
    ],
    deliverables: [
      'Trainingsmateriaal',
      'Implementatieplan',
      'Communicatieplan',
    ],
    roles: ['Proceseigenaar', 'IT Architect'],
    complianceItems: ['AI-geletterdheid medewerkers'],
  },
  // Fase 6: Beheer & Monitoring
  {
    id: 'step-013',
    phase: 'Beheer & Monitoring',
    title: 'Continue monitoring',
    description: 'Monitor de werking en impact van het AI-systeem continu.',
    activities: [
      'Monitor performance metrics',
      'Analyseer op drift en bias',
      'Verwerk klachten en feedback',
      'Rapporteer aan stakeholders',
    ],
    deliverables: [
      'Monitoring dashboard',
      'Periodieke rapportages',
      'Incidentlog',
    ],
    roles: ['Proceseigenaar', 'IT Architect', 'AI Compliance Officer'],
    complianceItems: ['Continue monitoring AI-systeem', 'Incidentregistratie'],
  },
  {
    id: 'step-014',
    phase: 'Beheer & Monitoring',
    title: 'Evaluatie en verbetering',
    description: 'Evalueer periodiek en verbeter het AI-systeem.',
    activities: [
      'Voer periodieke evaluaties uit',
      'Analyseer trends en patronen',
      'Identificeer verbetermogelijkheden',
      'Plan en implementeer verbeteringen',
    ],
    deliverables: [
      'Evaluatierapport',
      'Verbeterplan',
      'Update Algoritmeregister',
    ],
    roles: ['Proceseigenaar', 'AI Compliance Officer'],
    complianceItems: ['Periodieke herijking', 'Update Algoritmeregister'],
  },
];

export const COMPLIANCE_ITEMS: ComplianceItem[] = [
  // AI-Verordening verplichtingen
  {
    id: 'comp-001',
    category: 'AI-Verordening',
    title: 'AI-geletterdheid personeel',
    description: 'Zorg dat medewerkers die met AI-systemen werken voldoende kennis hebben over AI, risico\'s en verantwoord gebruik.',
    regulation: 'AI-Verordening Art. 4',
    deadline: '2 februari 2025',
    applicableTo: ['hoog', 'beperkt', 'minimaal'],
  },
  {
    id: 'comp-002',
    category: 'AI-Verordening',
    title: 'Verboden AI-praktijken',
    description: 'Identificeer en voorkom het gebruik van verboden AI-systemen zoals social scoring en ongeoorloofde biometrische identificatie.',
    regulation: 'AI-Verordening Art. 5',
    deadline: '2 februari 2025',
    applicableTo: ['hoog', 'beperkt', 'minimaal'],
  },
  {
    id: 'comp-003',
    category: 'AI-Verordening',
    title: 'Conformiteitsbeoordeling hoog-risico AI',
    description: 'Voer een conformiteitsbeoordeling uit voor hoog-risico AI-systemen voordat deze in gebruik worden genomen.',
    regulation: 'AI-Verordening Art. 43',
    deadline: '2 augustus 2026',
    applicableTo: ['hoog'],
  },
  {
    id: 'comp-004',
    category: 'AI-Verordening',
    title: 'Registratie EU-databank',
    description: 'Registreer hoog-risico AI-systemen in de EU-databank voor AI-systemen.',
    regulation: 'AI-Verordening Art. 71',
    deadline: '2 augustus 2026',
    applicableTo: ['hoog'],
  },
  {
    id: 'comp-005',
    category: 'AI-Verordening',
    title: 'Menselijk toezicht',
    description: 'Implementeer passend menselijk toezicht op hoog-risico AI-systemen.',
    regulation: 'AI-Verordening Art. 14',
    applicableTo: ['hoog'],
  },
  {
    id: 'comp-006',
    category: 'AI-Verordening',
    title: 'Transparantie naar gebruikers',
    description: 'Informeer gebruikers dat ze interacteren met een AI-systeem (chatbots, deepfakes, etc.).',
    regulation: 'AI-Verordening Art. 50',
    applicableTo: ['beperkt'],
  },
  // AVG verplichtingen
  {
    id: 'comp-007',
    category: 'AVG',
    title: 'DPIA uitvoeren',
    description: 'Voer een Data Protection Impact Assessment uit bij hoog-risico verwerkingen.',
    regulation: 'AVG Art. 35',
    applicableTo: ['hoog', 'beperkt'],
  },
  {
    id: 'comp-008',
    category: 'AVG',
    title: 'Rechtmatige grondslag',
    description: 'Zorg voor een rechtmatige grondslag voor de verwerking van persoonsgegevens door het AI-systeem.',
    regulation: 'AVG Art. 6',
    applicableTo: ['hoog', 'beperkt', 'minimaal'],
  },
  {
    id: 'comp-009',
    category: 'AVG',
    title: 'Recht op uitleg',
    description: 'Bied betrokkenen uitleg over geautomatiseerde besluitvorming die hen raakt.',
    regulation: 'AVG Art. 22',
    applicableTo: ['hoog'],
  },
  // Algoritmeregister
  {
    id: 'comp-010',
    category: 'Transparantie',
    title: 'Registratie Algoritmeregister',
    description: 'Registreer impactvolle algoritmen in het Algoritmeregister van de overheid.',
    regulation: 'Kabinetsbeleid',
    applicableTo: ['hoog', 'beperkt'],
  },
];

// Helper functions
export function getStepsByPhase(phase: string): GovernanceStep[] {
  return GOVERNANCE_STEPS.filter(step => step.phase === phase);
}

export function getRolesByRiskLevel(riskLevel: 'hoog' | 'beperkt' | 'minimaal'): GovernanceRole[] {
  return GOVERNANCE_ROLES.filter(role => role.requiredFor.includes(riskLevel));
}

export function getComplianceByRiskLevel(riskLevel: 'hoog' | 'beperkt' | 'minimaal'): ComplianceItem[] {
  return COMPLIANCE_ITEMS.filter(item => item.applicableTo.includes(riskLevel));
}

export function generateImplementationPlan(
  riskLevel: 'hoog' | 'beperkt' | 'minimaal',
  selectedAlgorithm?: { name: string; domain: string }
): {
  steps: GovernanceStep[];
  roles: GovernanceRole[];
  compliance: ComplianceItem[];
  summary: string;
} {
  const steps = GOVERNANCE_STEPS;
  const roles = getRolesByRiskLevel(riskLevel);
  const compliance = getComplianceByRiskLevel(riskLevel);

  let summary = `Implementatieplan voor een ${riskLevel} risico AI-systeem`;
  if (selectedAlgorithm) {
    summary += ` gebaseerd op "${selectedAlgorithm.name}" in het domein ${selectedAlgorithm.domain}`;
  }
  summary += `. Dit plan omvat ${steps.length} stappen verdeeld over ${GOVERNANCE_PHASES.length} fasen, `;
  summary += `vereist ${roles.length} rollen, en bevat ${compliance.length} compliance items.`;

  return { steps, roles, compliance, summary };
}
