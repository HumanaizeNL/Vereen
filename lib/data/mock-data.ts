// Realistic mock data based on casus 3 and casus 4
// These represent real healthcare scenarios for "meerzorg" (extra care) applications

import { nanoid } from 'nanoid';
import { Client, Note, Measure, Incident } from './types';

// Client profiles based on casus files
export const mockClients: Client[] = [
  {
    client_id: 'CL-2023-001',
    name: 'Mevrouw A.', // Based on Casus 3
    dob: '1952-06-15',
    bsn_encrypted: 'encrypted_bsn_001',
    wlz_profile: 'VV7',
    provider: 'Driezorg',
    created_at: '2020-06-01T00:00:00Z',
  },
  {
    client_id: 'CL-2023-002',
    name: 'Mevrouw B.', // Based on Casus 4
    dob: '1929-03-20',
    bsn_encrypted: 'encrypted_bsn_002',
    wlz_profile: 'VV7',
    provider: 'Berkumstede',
    created_at: '2020-01-01T00:00:00Z',
  },
];

// Notes based on casus 3 - Client with psychiatric problems and anxiety
export const mockNotesClient1: Note[] = [
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
    date: '2023-03-25',
    author: 'Fysiotherapeut',
    section: 'Mobiliteit',
    text: 'Transfer gebeurt met een passieve tillift. Mw zit de gehele dag in een aangepaste rolstoel met beensteunen. Mw is uitbehandeld bij de fysiotherapeut. Ergotherapeut is nauw betrokken bij mw, gezien haar houding, balans en voorzieningen.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-04-10',
    author: 'Zorgmedewerker',
    section: 'Gedrag',
    text: 'Belgedrag overdag: 1x per 5 minuten naar 1x per 2 uur dankzij meerzorg inzet. Mw weigert naar de huiskamer te gaan, het heeft een negatieve invloed doordat mw geen meerdere personen om zich heen wenst. Teveel dynamiek/prikkels van andere bewoners.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-05-15',
    author: 'Zorgmedewerker',
    section: 'Sociaal',
    text: '3 van 6 kinderen komen op bezoek waarvan 1 veelvuldig komt. Pastoraal medewerker is betrokken bij mw. Mw bieden wij aan naar de huiskamer te brengen, maar weigert dit.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-06-07',
    author: 'Psychiater',
    section: 'Medicatie',
    text: 'Start Olanzapine 5mg. Afbouwen Oxazepam. Evaluatie 7 juni 2023: Gedrag is onrustig, veel vragen om bevestiging en bellen, zonder dat interventies geruststelling bieden. Team adviseren om elkaar tijdens diensten af te wisselen.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-07-12',
    author: 'Psychiater',
    section: 'Medicatie',
    text: 'Mevrouw gebruikt sinds 12 juli jl. Lorazepam 5mg (2dd 2,5mg), Oxazepam en Citalopram. Gedrag is stabiel met de huidige medicatie.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-08-20',
    author: 'Zorgcoördinator',
    section: 'Evaluatie meerzorg',
    text: 'Client: Mw gebruikt de middagmaaltijd in de huiskamer. Mw ervaart welzijn door de 1 op 1 aandacht. Belgedrag verminderd van 1x per 5 minuten naar 1x per 2 uur. Omgeving: Rust onder personeel. Personeel gaat met positieve gedachte bij mw naar binnen.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-09-13',
    author: 'Psychiater',
    section: 'Medicatie',
    text: 'Gedrag is stabiel met de huidige medicatie. Geëvalueerd op 13 sept. 2023.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-10-05',
    author: 'Zorgcoördinator',
    section: 'Afbouw meerzorg',
    text: 'Poging gedaan om meerzorg af te bouwen van 3 uur naar 2 uur, echter laat mw op dat moment een terugval in haar gedrag zien. Belgedrag neemt toe. Noodzaak om de zorg die momenteel geboden wordt te continueren.',
  },
];

// Notes based on casus 4 - 94-year-old woman with cognitive decline after CVA
export const mockNotesClient2: Note[] = [
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
    date: '2023-02-15',
    author: 'Verpleegkundige',
    section: 'ADL',
    text: 'Mw heeft gedurende de dag volledige ondersteuning nodig bij persoonlijke verzorging. Mw toont geen initiatief in handelen. Ze zit de hele dag in haar rolstoel voor de tv.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-03-20',
    author: 'Psycholoog',
    section: 'Cognitie',
    text: 'Door de cognitieve achteruitgang na CVA kunnen er moeilijk afspraken met mw worden gemaakt. Mw wordt angstig/onrustig wanneer dingen niet gebeuren zoals zij wenst of gewend is. Mw is gefocust op haar eigen structuur.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-04-05',
    author: 'Zorgmedewerker',
    section: 'Gedrag',
    text: 'Mw begint voorafgaande aan het zorgmoment dwangmatig te herhalen welke handelingen ze verwacht en wenst. Mw lijkt te vergeten welke handeling al uitgevoerd zijn. Mw verliest steeds meer regie over haar dagelijkse leven. Mw kan moedeloos en neerslachtig worden.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-05-12',
    author: 'Psycholoog',
    section: 'Gedrag',
    text: 'Mw is bekend met gedragsstoornissen ten gevolge van niet-aangeboren hersenletsel na CVA. Het gedrag wordt gekenmerkt door dwangmatige en ongeduldige uitingen. Behandeling vindt plaats door middel van continu begeleiding volgens de geadviseerde interventies.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-06-18',
    author: 'Zorgmedewerker',
    section: 'Gedrag',
    text: 'Mw heeft een uitgebreide begeleidingsvraag op het gebied van stemming en gedrag. Hierdoor is gedurende de gehele dag nabijheid noodzakelijk waarbij mw nabijheid in groepsverband niet accepteert. Mw vraagt veel en is moeilijk te sturen/gerust te stellen. Mw alarmeert zeer vaak en blijft daarbij herhaaldelijk dezelfde vragen stellen.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-07-01',
    author: 'Psychiater',
    section: 'Medicatie',
    text: 'Mw ervaart angstgevoelens vanwege gebrek aan controle. Gestart met psychofarmaca (Citalopram) in juli 2023.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-08-10',
    author: 'Zorgmedewerker',
    section: 'Dagbesteding',
    text: 'Mw wordt dagbesteding in een gezamenlijke huiskamer geboden. Mw weigert dit vaak. Mw heeft moeite met activiteiten waarbij anderen aanwezig zijn. Wanneer mw wel deelneemt probeert mw de aandacht van zorgmedewerkers vast te houden. Wanneer dit niet lukt, roept mw luid de namen van zorgmedewerkers die niet aanwezig zijn.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-09-05',
    author: 'Zorgmedewerker',
    section: 'Gedrag',
    text: 'Haar gedrag is dwangmatig en ongeduldig. Dit uit zich door hyperfocus op alles in de omgeving, zoals positionering van servetten, kopjes, televisie (volume/zender) en lichamelijke klachten.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-10-15',
    author: 'Sociaal werker',
    section: 'Sociaal',
    text: 'Mw heeft nauw contact met een van haar dochters. Zij is tevens eerste contactpersoon en (wettelijk)vertegenwoordiger. Naast haar dochter heeft mw beperkte sociale contacten. Een maal per week komt er een vrijwilligster bij mw. Mw heeft geen contact met andere bewoners zonder begeleiding van een zorgmedewerker.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-11-20',
    author: 'Zorgcoördinator',
    section: 'Meerzorg noodzaak',
    text: 'Er is sprake van aanhoudende gedragsproblematiek en de blijvende behoefte aan intensieve, continue nabijheid en begeleiding. Door verslechtering in cognitie is het begrip van mw verminderd in afspraken. Voorheen was nabijheid op de afdeling voldoende, nu is de vraag naar directe nabijheid (naast mw) nodig.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-12-01',
    author: 'Zorgmedewerker',
    section: 'Impact',
    text: 'Mw blijft de gehele dag/avond zeer vaak alarmeren. Het alarmeren van mw belast zorgmedewerkers en andere bewoners. Wanneer zorg wordt verleend bij anderen, blijft mw haar alarmering doorkomen waardoor bewoners en medewerkers onrustig worden. Zorgmedewerkers geven aan, andere bewoners niet de aandacht te kunnen geven die zij verdienen doordat hun aandacht continu wordt afgeleid door mw.',
  },
];

// Measures (Katz-ADL scores, vital signs, etc.)
export const mockMeasures: Measure[] = [
  // Client 1 - Casus 3
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-03-01',
    type: 'Katz-ADL',
    score: 'F',
    comment: 'Volledig afhankelijk van hulp bij alle ADL taken',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-06-01',
    type: 'Katz-ADL',
    score: 'F',
    comment: 'Onveranderd, blijft volledig afhankelijk',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-09-01',
    type: 'Katz-ADL',
    score: 'F',
    comment: 'Geen verbetering, continue zorg noodzakelijk',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-03-15',
    type: 'GAF',
    score: 50,
    comment: 'Ernstige beperking in sociaal en beroepsmatig functioneren',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-04-01',
    type: 'NPI',
    score: 45,
    comment: 'Neuropsychiatrische symptomen: angst, agitatie, dwanggedrag',
  },
  // Client 2 - Casus 4
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-02-01',
    type: 'Katz-ADL',
    score: 'E',
    comment: 'Afhankelijk bij wassen, aankleden, toiletgang',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-05-01',
    type: 'Katz-ADL',
    score: 'F',
    comment: 'Verslechtering naar volledig afhankelijk',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-08-01',
    type: 'Katz-ADL',
    score: 'F',
    comment: 'Blijft volledig afhankelijk, geen initiatief',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-11-01',
    type: 'Katz-ADL',
    score: 'F',
    comment: 'Onveranderd volledig afhankelijk',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-03-15',
    type: 'MMSE',
    score: 18,
    comment: 'Matige cognitieve achteruitgang na CVA',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-09-15',
    type: 'MMSE',
    score: 15,
    comment: 'Verdere cognitieve achteruitgang',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-06-01',
    type: 'NPI',
    score: 52,
    comment: 'Hoge scores op angst, agitatie, dwanggedrag, depressie',
  },
];

// Incidents
export const mockIncidents: Incident[] = [
  // Client 1 - Casus 3
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-04-15',
    type: 'Gedragsprobleem',
    severity: 'Hoog',
    description:
      'Extreme onrust en veelvuldig bellen (1x per 5 minuten). Personeel overbelast, andere bewoners hinder.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-001',
    date: '2023-10-10',
    type: 'Terugval na afbouw',
    severity: 'Hoog',
    description:
      'Na afbouw meerzorg van 3 naar 2 uur: terugval in gedrag. Belgedrag neemt sterk toe. Afbouw gestopt.',
  },
  // Client 2 - Casus 4
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-07-20',
    type: 'Gedragsprobleem',
    severity: 'Hoog',
    description:
      'Continue alarmering gehele dag. Andere bewoners en personeel sterk belast. Onrust op de afdeling.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-09-15',
    type: 'Psychisch',
    severity: 'Matig',
    description:
      'Moedeloos en neerslachtig door verlies van controle. Weigert deel te nemen aan groepsactiviteiten.',
  },
  {
    id: nanoid(),
    client_id: 'CL-2023-002',
    date: '2023-11-25',
    type: 'Sociale impact',
    severity: 'Hoog',
    description:
      'Personeel kan door continue alarmering van mw niet adequaat andere bewoners verzorgen. Dilemma in zorgverlening.',
  },
];

// Function to load all mock data into stores
export function loadMockData() {
  return {
    clients: mockClients,
    notes: [...mockNotesClient1, ...mockNotesClient2],
    measures: mockMeasures,
    incidents: mockIncidents,
  };
}
