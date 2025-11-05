// Enhanced mock data with 7 diverse client scenarios
// Demonstrates various WLZ profiles, conditions, and meerzorg situations

import { nanoid } from 'nanoid';
import { Client, Note, Measure, Incident, EvidenceLink, AuditEvent } from './types';

// ===============================================
// CLIENTS - 7 Diverse Scenarios
// ===============================================

export const mockClients: Client[] = [
  // Existing clients from original casus
  {
    client_id: 'CL-2023-001',
    name: 'Mevrouw A.',
    dob: '1952-06-15',
    bsn_encrypted: 'encrypted_bsn_001',
    wlz_profile: 'VV7',
    provider: 'Driezorg',
    created_at: '2020-06-01T00:00:00Z',
  },
  {
    client_id: 'CL-2023-002',
    name: 'Mevrouw B.',
    dob: '1929-03-20',
    bsn_encrypted: 'encrypted_bsn_002',
    wlz_profile: 'VV7',
    provider: 'Berkumstede',
    created_at: '2020-01-01T00:00:00Z',
  },
  // New diverse clients
  {
    client_id: 'CL-2024-003',
    name: 'Meneer C.',
    dob: '1975-08-12',
    bsn_encrypted: 'encrypted_bsn_003',
    wlz_profile: 'VV2',
    provider: 'Vivalys',
    created_at: '2022-03-15T00:00:00Z',
  },
  {
    client_id: 'CL-2024-004',
    name: 'Mevrouw D.',
    dob: '1938-11-05',
    bsn_encrypted: 'encrypted_bsn_004',
    wlz_profile: 'VV5',
    provider: 'Carintreggeland',
    created_at: '2021-09-20T00:00:00Z',
  },
  {
    client_id: 'CL-2024-005',
    name: 'Meneer E.',
    dob: '1985-02-28',
    bsn_encrypted: 'encrypted_bsn_005',
    wlz_profile: 'VV9',
    provider: 'Abrona',
    created_at: '2018-05-10T00:00:00Z',
  },
  {
    client_id: 'CL-2024-006',
    name: 'Mevrouw F.',
    dob: '1950-04-18',
    bsn_encrypted: 'encrypted_bsn_006',
    wlz_profile: 'VV7',
    provider: 'Driezorg',
    created_at: '2019-11-12T00:00:00Z',
  },
  {
    client_id: 'CL-2024-007',
    name: 'Meneer G.',
    dob: '1942-07-22',
    bsn_encrypted: 'encrypted_bsn_007',
    wlz_profile: 'VV6',
    provider: 'Mijzo',
    created_at: '2020-08-05T00:00:00Z',
  },
];

// ===============================================
// NOTES - Comprehensive care documentation
// ===============================================

// Client 1 notes (from original casus 3)
const notesClient1: Note[] = [
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-03-15',
    author: 'Psycholoog',
    section: 'Psyche',
    text: 'Vaak paniek en angst, dwangmatige behoefte aan aandacht en mensen om zich heen bij vlagen. Moeilijk voorspelbaar in haar gedrag. Eén op één contact biedt haar rust voor het moment dat de zorgverlener bij mw. is. Persoonlijkheidsstoornis lijkt aan de hand gezien hetero-anamnese. Voorop staat veiligheid en als ze zich onveilig voelt dan zoekt ze hulp (bellen). GAF score: 50.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-03-20',
    author: 'Verpleegkundige',
    section: 'ADL',
    text: 'Mw heeft volledige hulp en ondersteuning nodig bij haar persoonlijke verzorging en bij haar toiletgang, 24 uur per dag.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-08-20',
    author: 'Zorgcoördinator',
    section: 'Evaluatie meerzorg',
    text: 'Client: Mw gebruikt de middagmaaltijd in de huiskamer. Mw ervaart welzijn door de 1 op 1 aandacht. Belgedrag verminderd van 1x per 5 minuten naar 1x per 2 uur. Omgeving: Rust onder personeel. Personeel gaat met positieve gedachte bij mw naar binnen.',
  },
];

// Client 2 notes (from original casus 4)
const notesClient2: Note[] = [
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-01-10',
    author: 'Verpleegkundig specialist',
    section: 'Anamnese',
    text: 'Mw. X is een 94-jarige vrouw. Zij vindt het van belang er verzorgd uit te zien en van een schoon en opgeruimd huis/omgeving houdt. Ze vindt het belangrijk eigen regie te hebben over haar leven. Na een I-CVA is mw beperkt in mobiliteit. Mw heeft een hemiparese links waardoor mw rolstoelgebonden is.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-11-20',
    author: 'Zorgcoördinator',
    section: 'Meerzorg noodzaak',
    text: 'Er is sprake van aanhoudende gedragsproblematiek en de blijvende behoefte aan intensieve, continue nabijheid en begeleiding. Door verslechtering in cognitie is het begrip van mw verminderd in afspraken. Voorheen was nabijheid op de afdeling voldoende, nu is de vraag naar directe nabijheid (naast mw) nodig.',
  },
];

// Client 3 notes (VV2 - Physical disability, stable)
const notesClient3: Note[] = [
  {
    id: nanoid(),
    client_id: 'CL-2024-003',
    date: '2024-01-15',
    author: 'Fysiotherapeut',
    section: 'Mobiliteit',
    text: 'Meneer C heeft een dwarslaesie ter hoogte van T12 na motorongeluk in 2020. Gebruikt elektrische rolstoel voor mobiliteit. Goed aangepast aan situatie, zelfstandig in transfers met hulpmiddelen.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-003',
    date: '2024-02-10',
    author: 'Ergotherapeut',
    section: 'ADL',
    text: 'Meneer is zelfstandig in persoonlijke verzorging met aangepaste badkamer. Gebruikt technologie actief: spraakbediening, tablet voor communicatie en administratie. Geen cognitieve beperkingen.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-003',
    date: '2024-11-01',
    author: 'Casemanager',
    section: 'Sociaal',
    text: 'Meneer woont zelfstandig in aangepaste woning. Heeft goede sociale contacten, werkt parttime vanuit huis als IT-consultant. Zeer zelfredzaam, gebruikt zorg alleen voor fysieke ondersteuning waar nodig.',
  },
];

// Client 4 notes (VV5 - Early dementia + caregiver burnout)
const notesClient4: Note[] = [
  {
    id: nanoid(),
    client_id: 'CL-2024-004',
    date: '2024-01-20',
    author: 'Psycholoog',
    section: 'Cognitie',
    text: 'Mevrouw D heeft de diagnose Alzheimer dementie, beginstadium. MMSE score 22/30. Vergeetachtig, vooral kortetermijngeheugen aangedaan. Heeft nog inzicht in situatie, ervaart angst voor toekomst.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-004',
    date: '2024-06-15',
    author: 'Maatschappelijk werker',
    section: 'Sociaal',
    text: 'Echtgenoot (85 jaar) is mantelzorger maar raakt overbelast. ZBI score 48 (hoge belasting). Dochter woont op afstand, komt 1x per maand. Echtgenoot heeft zelf ook gezondheidsproblemen (hartfalen), kan zorg niet langer alleen dragen.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-004',
    date: '2024-10-30',
    author: 'Verpleegkundige',
    section: 'Evaluatie meerzorg',
    text: 'Meerzorg ingezet voor respijtzorg 3 dagen per week. Echtgenoot kan hierdoor eigen medische afspraken bijwonen en bijkomen. Situatie thuis is stabiel gebleven, mw kan langer thuis blijven wonen.',
  },
];

// Client 5 notes (VV9 - Severe ID + autism)
const notesClient5: Note[] = [
  {
    id: nanoid(),
    client_id: 'CL-2024-005',
    date: '2024-01-05',
    author: 'Gedragsdeskundige',
    section: 'Gedrag',
    text: 'Meneer E heeft een ernstige verstandelijke beperking (IQ < 35) en autisme spectrum stoornis. Heeft strikte dagstructuur nodig, veranderingen leiden tot agressief gedrag. Communicatie beperkt tot enkele woorden en pictogrammen.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-005',
    date: '2024-05-20',
    author: 'Orthopedagoog',
    section: 'Gedrag',
    text: 'Bij verstoring dagritme treedt zelfbeschadigend gedrag op (hoofdbonken). Vaste begeleiders cruciaal voor veiligheid. 24/7 toezicht noodzakelijk. Positief: reageert goed op muziek en sensorische prikkels.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-005',
    date: '2024-11-10',
    author: 'Zorgcoördinator',
    section: 'Evaluatie meerzorg',
    text: 'Meerzorg gericht op crisispreventie en veiligheid. Vaste team van 4 begeleiders in 2-ploegendienst. Situatie stabiel met huidige inzet, aantal incidenten gedaald van 15/maand naar 3/maand.',
  },
];

// Client 6 notes (VV7 - Successfully stabilized, consider phase-out)
const notesClient6: Note[] = [
  {
    id: nanoid(),
    client_id: 'CL-2024-006',
    date: '2023-01-10',
    author: 'Psychiater',
    section: 'Psyche',
    text: 'Mevrouw F heeft diagnose borderline persoonlijkheidsstoornis. Wisselende stemmingen, angsten, afhankelijk gedrag. Start meerzorg vanwege crisis met 20+ belacties per dag en suïcidegedachten.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-006',
    date: '2024-03-15',
    author: 'Psycholoog',
    section: 'Gedrag',
    text: 'Positieve ontwikkeling door combinatie medicatie (Quetiapine) en intensieve begeleiding. Mw heeft copingstrategieën aangeleerd. Belgedrag gedaald naar 2-3x per dag, binnen normale zorgcapaciteit.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-006',
    date: '2024-10-20',
    author: 'Zorgcoördinator',
    section: 'Evaluatie meerzorg',
    text: 'Advies: gefaseerde afbouw meerzorg. Situatie stabiel sinds 6 maanden. Mw participeert in groepsactiviteiten, heeft sociale contacten opgebouwd. Reguliere zorg lijkt voldoende. Plan: afbouw van 3 uur naar 0 uur over 3 maanden.',
  },
];

// Client 7 notes (VV6 - Aggressive behavior, medication trial)
const notesClient7: Note[] = [
  {
    id: nanoid(),
    client_id: 'CL-2024-007',
    date: '2024-01-15',
    author: 'Specialist ouderengeneeskunde',
    section: 'Anamnese',
    text: 'Meneer G, 82 jaar, heeft vasculaire dementie na meerdere TIA\'s. Frontaal syndroom met impulsiviteit en agressie. Sloeg vorige week verzorgende, verschillende incidenten van verbale agressie.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-007',
    date: '2024-06-20',
    author: 'Psychiater',
    section: 'Medicatie',
    text: 'Start medicatie trial: Risperidon 0.5mg 2dd. Doel: vermindering agressief gedrag. Evaluatie na 6 weken. Let op bijwerkingen: parkinsonisme, sedatie.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-007',
    date: '2024-09-10',
    author: 'Verpleegkundige',
    section: 'Evaluatie',
    text: 'Positieve response op medicatie. Aantal agressie-incidenten gedaald van 12/week naar 2/week. Gedrag beter voorspelbaar. Personeel voelt zich veiliger. Continueer huidige beleid, evaluatie over 3 maanden voor evt. meerzorg indicatie.',
  },
];

export const mockNotes = [
  ...notesClient1,
  ...notesClient2,
  ...notesClient3,
  ...notesClient4,
  ...notesClient5,
  ...notesClient6,
  ...notesClient7,
];

// ===============================================
// MEASURES - Various assessment tools
// ===============================================

export const mockMeasures: Measure[] = [
  // Client 1 - VV7 psychiatric/anxiety
  { id: nanoid(), client_id: 'CL-2023-001', date: '2023-03-01', type: 'Katz-ADL', score: 'F', comment: 'Volledig afhankelijk' },
  { id: nanoid(), client_id: 'CL-2023-001', date: '2023-03-15', type: 'GAF', score: '50', comment: 'Ernstige beperking' },
  { id: nanoid(), client_id: 'CL-2023-001', date: '2023-04-01', type: 'NPI', score: '45', comment: 'Angst, agitatie, dwanggedrag' },

  // Client 2 - VV7 post-CVA cognitive
  { id: nanoid(), client_id: 'CL-2023-002', date: '2023-02-01', type: 'Katz-ADL', score: 'E', comment: 'Afhankelijk bij meerdere taken' },
  { id: nanoid(), client_id: 'CL-2023-002', date: '2023-05-01', type: 'Katz-ADL', score: 'F', comment: 'Verslechtering naar volledig afhankelijk' },
  { id: nanoid(), client_id: 'CL-2023-002', date: '2023-03-15', type: 'MMSE', score: '18', comment: 'Matige cognitieve achteruitgang' },
  { id: nanoid(), client_id: 'CL-2023-002', date: '2023-09-15', type: 'MMSE', score: '15', comment: 'Verdere achteruitgang' },

  // Client 3 - VV2 physical disability
  { id: nanoid(), client_id: 'CL-2024-003', date: '2024-01-10', type: 'Barthel-Index', score: '65', comment: 'Redelijk zelfstandig met hulpmiddelen' },
  { id: nanoid(), client_id: 'CL-2024-003', date: '2024-06-10', type: 'Barthel-Index', score: '70', comment: 'Lichte verbetering door training' },
  { id: nanoid(), client_id: 'CL-2024-003', date: '2024-11-01', type: 'Katz-ADL', score: 'C', comment: 'Grotendeels zelfstandig' },

  // Client 4 - VV5 early dementia
  { id: nanoid(), client_id: 'CL-2024-004', date: '2024-01-20', type: 'MMSE', score: '22', comment: 'Lichte cognitieve beperking' },
  { id: nanoid(), client_id: 'CL-2024-004', date: '2024-07-15', type: 'MMSE', score: '20', comment: 'Progressie dementie' },
  { id: nanoid(), client_id: 'CL-2024-004', date: '2024-06-15', type: 'ZBI', score: '48', comment: 'Hoge mantelzorgbelasting echtgenoot' },
  { id: nanoid(), client_id: 'CL-2024-004', date: '2024-02-10', type: 'Katz-ADL', score: 'D', comment: 'Hulp nodig bij meerdere ADL' },

  // Client 5 - VV9 severe ID + autism
  { id: nanoid(), client_id: 'CL-2024-005', date: '2024-01-05', type: 'SRZ', score: '8', comment: 'Zeer beperkt sociaal-adaptief functioneren' },
  { id: nanoid(), client_id: 'CL-2024-005', date: '2024-05-20', type: 'ABC', score: '78', comment: 'Hoge score probleemgedrag' },
  { id: nanoid(), client_id: 'CL-2024-005', date: '2024-11-10', type: 'ABC', score: '52', comment: 'Daling na gedragsinterventie' },

  // Client 6 - VV7 stabilized
  { id: nanoid(), client_id: 'CL-2024-006', date: '2023-01-10', type: 'GAF', score: '45', comment: 'Ernstige beperking bij crisis' },
  { id: nanoid(), client_id: 'CL-2024-006', date: '2024-03-15', type: 'GAF', score: '65', comment: 'Aanzienlijke verbetering' },
  { id: nanoid(), client_id: 'CL-2024-006', date: '2024-10-20', type: 'GAF', score: '70', comment: 'Stabiel functioneren' },

  // Client 7 - VV6 aggressive behavior
  { id: nanoid(), client_id: 'CL-2024-007', date: '2024-01-15', type: 'NPI', score: '42', comment: 'Hoge score agressie en irritabiliteit' },
  { id: nanoid(), client_id: 'CL-2024-007', date: '2024-06-20', type: 'CMAI', score: '68', comment: 'Fysieke agressie frequent' },
  { id: nanoid(), client_id: 'CL-2024-007', date: '2024-09-10', type: 'CMAI', score: '38', comment: 'Significante daling agressie na medicatie' },
];

// ===============================================
// INCIDENTS
// ===============================================

export const mockIncidents: Incident[] = [
  // Client 1
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-04-15',
    type: 'Gedragsprobleem',
    severity: 'Hoog',
    description: 'Extreme onrust en veelvuldig bellen (1x per 5 minuten). Personeel overbelast, andere bewoners hinder.',
  },

  // Client 2
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-07-20',
    type: 'Gedragsprobleem',
    severity: 'Hoog',
    description: 'Continue alarmering gehele dag. Andere bewoners en personeel sterk belast. Onrust op de afdeling.',
  },

  // Client 5 - Severe ID + autism incidents
  {
    id: nanoid(),
    client_id: 'CL-2024-005',
    date: '2024-02-10',
    type: 'Zelfbeschadiging',
    severity: 'Hoog',
    description: 'Hoofdbonken tegen muur na verandering dagritme. Oppervlakkige wond, EHBO toegepast.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-005',
    date: '2024-04-15',
    type: 'Agressie',
    severity: 'Matig',
    description: 'Slaan naar begeleider tijdens persoonlijke verzorging. Geen letsel.',
  },

  // Client 7 - Aggressive behavior
  {
    id: nanoid(),
    client_id: 'CL-2024-007',
    date: '2024-01-08',
    type: 'Agressie',
    severity: 'Hoog',
    description: 'Slaan naar verzorgende tijdens ochtendzorg. Verzorgende heeft blauwe plek aan arm. Melding bij leidinggevende.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2024-007',
    date: '2024-02-20',
    type: 'Verbale agressie',
    severity: 'Matig',
    description: 'Schelden en bedreigen van personeel. Meerdere keren per dag.',
  },
];

// ===============================================
// EVIDENCE LINKS - Connects data to UC2 criteria
// ===============================================

export const mockEvidenceLinks: EvidenceLink[] = [
  // Client 1 - ADL dependency evidence
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    target_path: 'uc2.criteria.ADL_dependency',
    source: `note:${notesClient1.find((n) => n.section === 'ADL')?.id || 'note_adl'}`,
    snippet: 'volledige hulp en ondersteuning nodig bij haar persoonlijke verzorging en bij haar toiletgang, 24 uur per dag',
    created_by: 'ai',
    created_at: new Date('2024-01-15T10:30:00Z').toISOString(),
  },

  // Client 1 - Behavioral problems evidence
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    target_path: 'uc2.criteria.behavioral_problems',
    source: `note:${notesClient1.find((n) => n.section === 'Psyche')?.id || 'note_psych'}`,
    snippet: 'Vaak paniek en angst, dwangmatige behoefte aan aandacht. Moeilijk voorspelbaar in haar gedrag.',
    created_by: 'ai',
    created_at: new Date('2024-01-15T10:32:00Z').toISOString(),
  },

  // Client 1 - Meerzorg effectiveness
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    target_path: 'uc2.criteria.meerzorg_effectiveness',
    source: `note:${notesClient1.find((n) => n.section === 'Evaluatie meerzorg')?.id || 'note_eval'}`,
    snippet: 'Belgedrag verminderd van 1x per 5 minuten naar 1x per 2 uur. Rust onder personeel.',
    created_by: 'user@vereen.nl',
    created_at: new Date('2024-01-20T14:15:00Z').toISOString(),
  },

  // Client 2 - Cognitive decline evidence
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    target_path: 'uc2.criteria.cognitive_function',
    source: `measure:${mockMeasures.find((m) => m.client_id === 'CL-2023-002' && m.type === 'MMSE')?.id || 'measure_mmse'}`,
    snippet: 'MMSE score gedaald van 18 naar 15 - verdere cognitieve achteruitgang',
    created_by: 'ai',
    created_at: new Date('2024-01-15T11:00:00Z').toISOString(),
  },

  // Client 4 - Caregiver burden evidence
  {
    id: nanoid(),
    client_id: 'CL-2024-004',
    target_path: 'uc2.criteria.social_support',
    source: `measure:${mockMeasures.find((m) => m.type === 'ZBI')?.id || 'measure_zbi'}`,
    snippet: 'ZBI score 48 - hoge mantelzorgbelasting echtgenoot. Echtgenoot heeft zelf ook gezondheidsproblemen.',
    created_by: 'ai',
    created_at: new Date('2024-06-20T09:45:00Z').toISOString(),
  },

  // Client 6 - Stabilization evidence (phase-out candidate)
  {
    id: nanoid(),
    client_id: 'CL-2024-006',
    target_path: 'uc2.criteria.stability',
    source: `note:${notesClient6.find((n) => n.section === 'Evaluatie meerzorg')?.id || 'note_eval6'}`,
    snippet: 'Situatie stabiel sinds 6 maanden. Belgedrag gedaald naar 2-3x per dag, binnen normale zorgcapaciteit. Advies: gefaseerde afbouw meerzorg.',
    created_by: 'user@vereen.nl',
    created_at: new Date('2024-10-25T15:30:00Z').toISOString(),
  },
];

// ===============================================
// AUDIT EVENTS - Trail of all actions
// ===============================================

export const mockAuditEvents: AuditEvent[] = [
  // Data imports
  {
    id: nanoid(),
    ts: new Date('2024-01-15T08:00:00Z').toISOString(),
    actor: 'user@vereen.nl',
    client_id: 'CL-2023-001',
    action: 'data_import',
    meta: { file: 'notes_batch_2024_01.csv', rows: 12, source: 'csv_upload' },
  },
  {
    id: nanoid(),
    ts: new Date('2024-01-15T08:05:00Z').toISOString(),
    actor: 'user@vereen.nl',
    client_id: 'CL-2023-002',
    action: 'data_import',
    meta: { file: 'notes_batch_2024_01.csv', rows: 10, source: 'csv_upload' },
  },

  // AI evidence suggestions
  {
    id: nanoid(),
    ts: new Date('2024-01-15T10:30:00Z').toISOString(),
    actor: 'ai',
    client_id: 'CL-2023-001',
    action: 'evidence_suggested',
    meta: { criteria: 'ADL_dependency', confidence: 0.92, source: 'note:abc123' },
  },
  {
    id: nanoid(),
    ts: new Date('2024-01-15T10:32:00Z').toISOString(),
    actor: 'ai',
    client_id: 'CL-2023-001',
    action: 'evidence_suggested',
    meta: { criteria: 'behavioral_problems', confidence: 0.88, source: 'note:def456' },
  },

  // User actions
  {
    id: nanoid(),
    ts: new Date('2024-01-20T14:15:00Z').toISOString(),
    actor: 'user@vereen.nl',
    client_id: 'CL-2023-001',
    action: 'evidence_linked',
    meta: { criteria: 'meerzorg_effectiveness', manual: true },
  },

  // AI data validation
  {
    id: nanoid(),
    ts: new Date('2024-06-20T09:45:00Z').toISOString(),
    actor: 'ai',
    client_id: 'CL-2024-004',
    action: 'data_validated',
    meta: { score: 85, issues: 2, warnings: ['Missing recent measure: Katz-ADL'] },
  },

  // AI summary generation
  {
    id: nanoid(),
    ts: new Date('2024-10-25T15:30:00Z').toISOString(),
    actor: 'ai',
    client_id: 'CL-2024-006',
    action: 'summary_generated',
    meta: { focus: 'recent', length: 'medium', confidence: 0.85 },
  },
];

// ===============================================
// EXPORT FUNCTION
// ===============================================

export function loadMockData() {
  return {
    clients: mockClients,
    notes: mockNotes,
    measures: mockMeasures,
    incidents: mockIncidents,
    evidenceLinks: mockEvidenceLinks,
    auditEvents: mockAuditEvents,
  };
}
