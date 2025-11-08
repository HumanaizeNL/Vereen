#!/usr/bin/env node

/**
 * Directly ingest the extracted text from INPUT.docx using the load-mock-data endpoint
 */

const API_BASE = 'http://localhost:3000';
const CLIENT_ID = 'INPUT-CASUS-A';

// Extracted text from INPUT.docx (Casus A - Psychiatric patient)
const EXTRACTED_TEXT = `Zorgplan casus A

Levensgeschiedenis: Mw. is geboren in 1955 en heeft een belastende levensgeschiedenis met psychotrauma in haar jeugd. Is opgegroeid in een pleeggezin vanaf dat ze een half jaar oud was. Mw. is getrouwd geweest, haar vrouw heette X en is in 2019 overleden. In 2005 heeft mw. een auto ongeluk gehad. Mw. heeft een verstoorde emotieregulatie waardoor zij na het overlijden van haar partner in 2019 niet meer voor zichzelf kon zorgen en is vanaf 2023 in de langdurige psychiatrie in Raalte opgenomen geweest.

Mentaal welbevinden: Mw. is eigenzinnig, lollig, zorgzaam, avontuurlijk, naïef. Feminist.

Bewegen: Onrust en wegloopdrang. maart 2025: Mw heeft een IBS. Polsalarm met dwaalpreventie. 28 mei 2025: Juridische status RM (Recht van machtiging) t/m 28 nov. Mw. zit in WZD stap 1, dwaalpreventie is ingezet. Keytag voor eigen kamer en Plaza sinds 6 april 2025.

ADL:Lichamelijke hygiene: Mw. was zichzelf onder de douche en droogt zich af. Mw. smeert zichzelf in met body lotion, maar heeft hierbij ondersteuning/ toezicht nodig door haar dementie. Mw. poetst zelf haar tanden en kamt haar haren. Zichtbaar toezicht nodig.

Aan en Uitkleden: Mw. kleedt zichzelf aan en uit onder toezicht. Mw. legt nog wel eens kleding verkeerd in de kast en zoekt spullen op de verkeerde plek.

Eten en drinken: Mw. eet zelfstandig haar maaltijden. Mw. heeft toezicht nodig om voldoende en niet te snel te eten. Mw. kan drinken inschenken maar heeft toezicht nodig zodat zij voldoende drinkt.

Incontinentie: Mw. draagt onco's voor de zekerheid. Mw. gaat zelfstandig naar het toilet, maar heeft soms ondersteuning nodig met verschonen van het onco.

Mobiliteit: Mw. gebruikt een rollator voor mobiliteit. Zij loopt buiten met begeleiding, heeft ondersteuning nodig bij traplopen.

Gedragsproblematiek: Mw. heeft onrust, wegloopdrang, agitatie en boosheid. Geregeld agressief. Door haar traumatisch verleden kan mw. sterk reageren op aanraking. Aanraken van mw alleen van de voorkant en kondigen het aan!

Cognitie: Mw. heeft dementie. Zij vergeet informatie snel. Kort recent geheugen. Mw. heeft het gevoel naar de winkel te moeten en loopt naar de uitgang. Zij is moeilijk af te leiden.

Communicatie: Mw. communiceert verbaal. Zij zegt altijd: "zeg maar jij hoor". Ze wil niet met u aangesproken worden.

Nacht: Mw. slaapt wisselend. Zij kan zich 's nachts klaarmaken om de deur uit te gaan. Nachtelijk toezicht nodig.

Medicatie: Oxazepam 10mg, Sertraline 100mg, Lorazepam 1mg, Paracetamol 1000mg. Medicatie wordt door zorg toegediend.

Psychosociale functies: Mw. heeft een nicht die actief bij haar betrokken is. Mw. heeft ook een zus in Limburg. Mw. heeft een vrijwilliger die wekelijks 2 uur komt.

Daginvulling: Mw. gaat dagelijks begeleid naar buiten (vast moment). Mw. houdt van knikker-sjoelen, muziek luisteren/zingen, pianospelen en foto's van honden bekijken. Hiervoor is 1-op-1 begeleiding nodig. Dagstructuur is belangrijk. Voorkom verveling.

Wilsverklaring: Nee. Niet reanimeren. Palliatief beleid. Niet insturen naar ziekenhuis. Patiente heeft geen ziekte-inzicht. Gedeeltelijk wilsbekwaam.`;

// Create mock data structure
const mockData = {
  clients: [
    {
      id: CLIENT_ID,
      name: 'Mw. Casus A',
      dob: '1955-01-01',
      wlz_profile: 'VV8',
      provider: 'Vereen',
    },
  ],
  notes: [
    {
      id: 'note-input-001',
      client_id: CLIENT_ID,
      date: '2025-11-01',
      author: 'INPUT.docx Import',
      section: 'Evaluatie',
      text: EXTRACTED_TEXT,
    },
    {
      id: 'note-input-002',
      client_id: CLIENT_ID,
      date: '2025-10-15',
      author: 'Verzorgende',
      section: 'ADL',
      text: 'Mw. was zichzelf onder de douche en droogt zich af. Heeft ondersteuning/toezicht nodig door dementie. Poetst zelf tanden, kamt haren. Zichtbaar toezicht nodig. Kleedt zichzelf aan en uit onder toezicht.',
    },
    {
      id: 'note-input-003',
      client_id: CLIENT_ID,
      date: '2025-10-20',
      author: 'Verzorgende',
      section: 'Gedrag',
      text: 'Mw. heeft vandaag onrust en wegloopdrang getoond. Liep meerdere keren naar de uitgang. Moeilijk af te leiden. Werd geagiteerd toen geprobeerd werd haar terug te leiden. Door traumatisch verleden reageert sterk op aanraking.',
    },
    {
      id: 'note-input-004',
      client_id: CLIENT_ID,
      date: '2025-10-25',
      author: 'Psycholoog',
      section: 'Psyche',
      text: 'Mw. heeft verstoorde emotieregulatie. Na overlijden partner in 2019 niet meer voor zichzelf kunnen zorgen. Psychotrauma in jeugd. Opgegroeid in pleeggezin. Vanaf 2023 opgenomen in langdurige psychiatrie Raalte.',
    },
    {
      id: 'note-input-005',
      client_id: CLIENT_ID,
      date: '2025-10-28',
      author: 'Verpleegkundige',
      section: 'Nacht',
      text: 'Mw. slaapt wisselend. Vannacht om 3 uur bezig zichzelf klaar te maken om deur uit te gaan. Nachtelijk toezicht noodzakelijk vanwege dwaalrisico.',
    },
    {
      id: 'note-input-006',
      client_id: CLIENT_ID,
      date: '2025-11-02',
      author: 'Activiteitenbegeleider',
      section: 'Dagbesteding',
      text: 'Mw. heeft genoten van het sjoelen vandaag. Ook foto\'s van Hollands Smoushonden bekeken, kon daar vol passie over vertellen. 1-op-1 begeleiding was nodig om aandacht erbij te houden. Dagstructuur en regelmaat helpt haar.',
    },
  ],
  measures: [
    {
      id: 'measure-input-001',
      client_id: CLIENT_ID,
      date: '2025-09-01',
      type: 'Katz-ADL',
      score: 'D',
      comment: 'Toezicht nodig bij ADL, kan veel zelfstandig met ondersteuning',
    },
    {
      id: 'measure-input-002',
      client_id: CLIENT_ID,
      date: '2025-10-01',
      type: 'Katz-ADL',
      score: 'E',
      comment: 'Toename hulpbehoevendheid, meer toezicht nodig',
    },
    {
      id: 'measure-input-003',
      client_id: CLIENT_ID,
      date: '2025-09-15',
      type: 'NPI',
      score: '32',
      comment: 'Agitatie, onrust, apathie',
    },
    {
      id: 'measure-input-004',
      client_id: CLIENT_ID,
      date: '2025-10-15',
      type: 'NPI',
      score: '38',
      comment: 'Toename gedragsproblematiek: agitatie, irritabiliteit, onrust',
    },
  ],
  incidents: [
    {
      id: 'incident-input-001',
      client_id: CLIENT_ID,
      date: '2025-10-10',
      type: 'Dwalen',
      severity: 'Hoog',
      description: 'Mw. liep de afdeling uit via nooduitgang. Werd teruggevonden bij receptie. Polsalarm geactiveerd.',
    },
    {
      id: 'incident-input-002',
      client_id: CLIENT_ID,
      date: '2025-10-18',
      type: 'Gedragsprobleem',
      severity: 'Matig',
      description: 'Mw. werd boos en agressief toen verzorgende haar probeerde aan te raken om haar terug te leiden. Schreeuwde en duwde.',
    },
    {
      id: 'incident-input-003',
      client_id: CLIENT_ID,
      date: '2025-10-25',
      type: 'Dwalen',
      severity: 'Hoog',
      description: 'Mw. stond langdurig in sluis. Wilde deur uit. Keytag voorkomt uitgaan maar zorgt voor frustratie.',
    },
  ],
};

async function loadMockData() {
  console.log('📦 Loading INPUT.docx data into system...\n');

  try {
    const response = await fetch(`${API_BASE}/api/dev/load-mock-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clear_existing: false, // Don't clear existing data
        data: mockData,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to load data: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Data loaded successfully:');
    console.log(`   - Clients: ${result.loaded.clients}`);
    console.log(`   - Notes: ${result.loaded.notes}`);
    console.log(`   - Measures: ${result.loaded.measures}`);
    console.log(`   - Incidents: ${result.loaded.incidents}`);

    return result;
  } catch (error) {
    console.error('❌ Error loading data:', error.message);
    throw error;
  }
}

async function evaluateVV8() {
  console.log('\n📊 Evaluating against VV8 criteria...\n');

  try {
    const response = await fetch(`${API_BASE}/api/vv8/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VV8 assessment failed: ${response.status} - ${errorText}`);
    }

    const assessment = await response.json();
    console.log('✅ VV8 Assessment completed\n');

    return assessment;
  } catch (error) {
    console.error('❌ Error during assessment:', error.message);
    throw error;
  }
}

function displayResults(assessment) {
  console.log('=' .repeat(60));
  console.log('VV8 ASSESSMENT RESULTS - INPUT.DOCX (Casus A)');
  console.log('='.repeat(60));

  const summary = assessment.summary || {};
  console.log('\n📈 Overall Summary:');
  console.log(`   Voldoet: ${summary.voldoet || 0}`);
  console.log(`   Toegenomen Behoefte: ${summary.toegenomen_behoefte || 0}`);
  console.log(`   Niet Voldoet: ${summary.niet_voldoet || 0}`);
  console.log(`   Verslechterd: ${summary.verslechterd || 0}`);
  console.log(`   Onvoldoende Bewijs: ${summary.onvoldoende_bewijs || 0}`);

  console.log(`\n💡 Recommendation:`);
  console.log(`   Action: ${(assessment.action || 'N/A').toUpperCase()}`);
  console.log(`   Message: ${assessment.message || 'N/A'}`);

  console.log('\n📋 Individual Criteria:\n');
  assessment.criteria.forEach((criterion, index) => {
    const statusEmoji = {
      voldoet: '✅',
      toegenomen_behoefte: '⚠️',
      niet_voldoet: '❌',
      verslechterd: '🔻',
      onvoldoende_bewijs: '❓',
    }[criterion.status] || '❓';

    console.log(`${index + 1}. ${statusEmoji} ${criterion.name}`);
    console.log(`   Status: ${criterion.status}`);
    console.log(`   Confidence: ${((criterion.confidence || 0) * 100).toFixed(0)}%`);
    if (criterion.argumentation) {
      console.log(`   Reasoning: ${criterion.argumentation.substring(0, 100)}...`);
    }
    if (criterion.evidence && criterion.evidence.length > 0) {
      console.log(`   Evidence: ${criterion.evidence.length} items`);
    }
    console.log('');
  });

  console.log('=' .repeat(60));
}

async function main() {
  console.log('🏥 INPUT.docx VV8 Evaluation - Casus A\n');

  // Step 1: Load data
  const loadResult = await loadMockData();

  // Step 2: Evaluate
  const assessment = await evaluateVV8();

  // Step 3: Display
  displayResults(assessment);

  console.log('\n✅ Evaluation complete!');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
