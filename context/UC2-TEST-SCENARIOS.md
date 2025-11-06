# UC2 Herindicatie - Complete Test Scenarios
**Vereen Healthcare Application - Test Data Documentation**  
**Versie:** 1.0  
**Datum:** 6 november 2024

---

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Test Scenario's](#test-scenarios)
3. [Cliënt Profielen](#client-profielen)
4. [Test Data per Cliënt](#test-data-per-client)
5. [Verwachte Uitkomsten](#verwachte-uitkomsten)
6. [API Test Flows](#api-test-flows)

---

## Overzicht

Deze documentatie bevat complete test scenario's voor **UC2: Herindicatie Enhancement**. De test data demonstreert drie verschillende cliënt situaties die verschillende aspecten van het herindicatie systeem testen:

### Functionaliteiten die getest worden:

1. **VV8 Criteria Beoordeling** - 8 criteria evaluatie voor herindicatie
2. **Trend Analyse** - Historische data analyse voor ADL, BPSD, incidenten
3. **Risico Detectie** - Automatische detectie van risico's en red flags
4. **MD Review Workflow** - Multidisciplinaire team beoordelingen
5. **Herindicatie Dashboard** - Overzicht van cliënt status en aanbevelingen

### Test Scenario Overzicht:

| Cliënt | Scenario | Complexiteit | Verwachte Uitkomst |
|--------|----------|--------------|-------------------|
| Maria van den Berg | Achteruitgang ADL + BPSD | Hoog | Dringende herindicatie naar VV9 |
| Jan Bakker | Stabiele conditie | Laag | Geen herindicatie nodig |
| Anna de Vries | Ernstige BPSD | Zeer Hoog | Gespecialiseerde zorg vereist |

---

## Test Scenario's

### Scenario 1: Maria van den Berg - Progressieve Dementie met Achteruitgang

**Situatie:**  
75-jarige vrouw met VV8 indicatie die significante achteruitgang vertoont in ADL-functie, cognitie en gedrag. Meerdere valincidenten en toenemende zorgbehoefte.

**Doel van test:**
- Demonstreren van trend analyse over 6 maanden
- Risico detectie voor achteruitgang ADL
- Risico detectie voor toegenomen incidenten
- VV8 criteria evaluatie met meerdere failing criteria
- MD review consensus voor herindicatie

**Belangrijkste meetpunten:**
- Katz-ADL: 8 → 5 → 2 (dramatische daling)
- MMSE: 18 → 12 (van matig naar ernstig)
- NPI: 18 → 28 → 42 (toenemende BPSD)
- Incidenten: 10 in 3 maanden (3.3 per maand gemiddeld)

**Verwachte system detectie:**
- ⚠️ CRITICAL: Deteriorating ADL (67% achteruitgang)
- ⚠️ CRITICAL: High incidents (10 incidenten in 3 maanden)
- ⚠️ HIGH: Increased care needs
- ⚠️ CRITICAL: Multiple VV8 criteria failing

---

### Scenario 2: Jan Bakker - Stabiele Cliënt

**Situatie:**  
84-jarige man met VV7 indicatie die stabiel functioneert met minimale zorgbehoefte. Goed medicatie-compliance en weinig incidenten.

**Doel van test:**
- Demonstreren van stabiele trends
- Geen valse positieven in risico detectie
- VV8 criteria allen passing
- MD review met observe beslissing

**Belangrijkste meetpunten:**
- Katz-ADL: 10 → 10 → 9 (stabiel)
- Incidenten: 2 in 6 maanden (laag)
- Geen gedragsproblematiek

**Verwachte system detectie:**
- ✅ Status: Stable
- ✅ Geen risico flags
- ✅ VV8 criteria: All passing
- ✅ Aanbeveling: Routine monitoring

---

### Scenario 3: Anna de Vries - Ernstige BPSD

**Situatie:**  
86-jarige vrouw met VV9 indicatie maar ernstige gedragsproblematiek die huidige zorgomgeving overstijgt. Meerdere agressie-incidenten waarbij personeel letsel opliep.

**Doel van test:**
- Extreme BPSD scores testen
- Meerdere ernstige incidenten
- Veiligheidsrisico's
- Specialistische zorgbehoefte detectie
- Urgente interventie triggers

**Belangrijkste meetpunten:**
- NPI: 58 → 72 (zeer hoog)
- CMAI: 68 (zeer hoge agitatie)
- Incidenten: 5 ernstige agressie-incidenten in 2 weken
- MD reviews: Psychiater + gedragsdeskundige

**Verwachte system detectie:**
- 🚨 CRITICAL: Severe BPSD (NPI > 70)
- 🚨 CRITICAL: Safety risk - staff injuries
- 🚨 CRITICAL: Specialized care required
- 🚨 Aanbeveling: Overplaatsing naar BPSD unit

---

## Cliënt Profielen

### Cliënt 1: Maria van den Berg

```json
{
  "client_id": "test-client-001",
  "name": "Maria van den Berg",
  "dob": "1945-03-15",
  "age": 79,
  "bsn": "[encrypted]",
  "wlz_profile": "VV8",
  "provider": "Zorgcentrum Vereen",
  "admission_date": "2023-01-15",
  "primary_diagnosis": "Alzheimer dementie",
  "secondary_diagnoses": ["Diabetes type 2", "Hypertensie", "Osteoporose"]
}
```

**Familie Context:**
- Dochter: Els van den Berg (contactpersoon)
- Zoon: Peter van den Berg
- Bezoekfrequentie: 3x per week
- Familie zeer betrokken, zorgen over veiligheid

**Zorg Team:**
- Vaste verzorgende IG: Lisa Jansen
- Verpleegkundige: Mark de Boer
- Specialist ouderengeneeskunde: Dr. Maria Peters
- Psycholoog: Drs. Sophie van Leeuwen
- Fysiotherapeut: Jan Vermeulen

---

### Cliënt 2: Jan Bakker

```json
{
  "client_id": "test-client-002",
  "name": "Jan Bakker",
  "dob": "1940-07-22",
  "age": 84,
  "bsn": "[encrypted]",
  "wlz_profile": "VV7",
  "provider": "Zorgcentrum Vereen",
  "admission_date": "2022-06-01",
  "primary_diagnosis": "Lichte cognitieve stoornis",
  "secondary_diagnoses": ["COPD", "Hypertensie"]
}
```

**Familie Context:**
- Partner: Overleden 2020
- Kinderen: 2 dochters, woonachtig in andere steden
- Bezoekfrequentie: 1x per maand
- Redelijk zelfstandig

**Zorg Team:**
- Verzorgende IG: Peter Visser
- Verpleegkundige: Maria Konings
- Huisarts in zorginstelling
- Minimale externe specialisten nodig

---

### Cliënt 3: Anna de Vries

```json
{
  "client_id": "test-client-003",
  "name": "Anna de Vries",
  "dob": "1938-11-08",
  "age": 86,
  "bsn": "[encrypted]",
  "wlz_profile": "VV9",
  "provider": "Zorgcentrum Vereen",
  "admission_date": "2021-03-10",
  "primary_diagnosis": "Vasculaire dementie met psychotische kenmerken",
  "secondary_diagnoses": ["CVA 2019", "Hypertensie", "Diabetes type 2"]
}
```

**Familie Context:**
- Geen directe familie
- Bewindvoerder: Mr. J. de Jong
- Geen bezoek (geen contacten)
- Sociale isolatie

**Zorg Team:**
- Verpleegkundige: Emma de Groot
- Psychiater: Dr. Robert van Dijk
- Gedragsdeskundige: Linda Bakker
- Specialist ouderengeneeskunde: Dr. Maria Peters
- Vaak wisselende verzorgenden (door agressie)

---

## Test Data per Cliënt

### Maria van den Berg - Complete Dataset

#### Notes (8 stuks over 2 maanden)

**15 oktober 2024 - Lisa Jansen, verzorgende IG**
```
Sectie: ADL
Cliënte heeft toenemende moeite met zelfstandig wassen en aankleden. 
Heeft nu dagelijks volledige ondersteuning nodig bij douchen. Voorheen 
kon ze dit met toezicht. Cognitieve achteruitgang merkbaar - vergeet 
stappen in de routine.
```

**10 oktober 2024 - Mark de Boer, verpleegkundige**
```
Sectie: Mobiliteit
Transfer van bed naar stoel gaat met meer moeite. Balans is verslechterd. 
Fysiotherapeut geraadpleegd voor loophulpmiddel. Risico op vallen is 
toegenomen.
```

**5 oktober 2024 - Sophie Smit, verzorgende IG**
```
Sectie: Gedrag
Cliënte vertoont toenemende onrust in de avonduren. Dwaalt door de gang, 
zoekt naar 'huis'. Reageert angstig op nieuwe gezichten. Sundowing 
verschijnselen duidelijk aanwezig.
```

**28 september 2024 - Thomas Klein, verzorgende IG**
```
Sectie: ADL
Incontinentie is toegenomen. Cliënte draagt nu permanent incontinentiemateriaal. 
Kan niet meer tijdig toiletbehoefte aangeven door cognitieve achteruitgang.
```

**20 september 2024 - Lisa Jansen, verzorgende IG**
```
Sectie: Voeding
Eetlust verminderd. Gewichtsverlies van 3kg in afgelopen maand. Heeft 
aanmoediging en begeleiding nodig tijdens maaltijden. Vergeet soms te 
kauwen en doorslikken.
```

**15 september 2024 - Dr. Peters, specialist ouderengeneeskunde**
```
Sectie: Medisch
Progressie van dementie vastgesteld. MMSE score gedaald van 18 naar 12 
in 6 maanden tijd. Overgang naar ernstige fase. Medicatie aangepast. 
Zorgbehoefte zal toenemen.
```

**30 augustus 2024 - Mark de Boer, verpleegkundige**
```
Sectie: Nacht
Nachtelijke onrust toegenomen. Wordt 4-5x per nacht wakker. Roept om hulp. 
Heeft begeleiding nodig bij toiletgang. Nachtzorg uren moeten worden uitgebreid.
```

**15 augustus 2024 - Sophie Smit, verzorgende IG**
```
Sectie: Sociaal
Familie gesproken over achteruitgang. Dochter maakt zich zorgen over veiligheid 
en welzijn. Familie vraagt om evaluatie of huidige zorg nog toereikend is.
```

#### Measures (8 metingen over 6 maanden)

| Datum | Type | Score | Interpretatie | Trend |
|-------|------|-------|---------------|-------|
| 1 okt 2024 | Katz-ADL | 2 | Sterk verminderd | ⬇️ |
| 1 jul 2024 | Katz-ADL | 5 | Matig afhankelijk | ⬇️ |
| 1 apr 2024 | Katz-ADL | 8 | Licht afhankelijk | - |
| 5 okt 2024 | MMSE | 12 | Ernstige stoornis | ⬇️ |
| 10 apr 2024 | MMSE | 18 | Matige stoornis | - |
| 8 okt 2024 | NPI | 42 | Verhoogd | ⬆️ |
| 5 jul 2024 | NPI | 28 | Matig | ⬆️ |
| 8 apr 2024 | NPI | 18 | Licht | - |

**Trend Analyse:**
- ADL: **75% achteruitgang** in 6 maanden (8→2)
- MMSE: **33% achteruitgang** in 6 maanden (18→12)
- NPI: **133% toename** in 6 maanden (18→42)

#### Incidents (10 stuks over 2 maanden)

**20 oktober 2024 - Val (Matig)**
```
Cliënte gevallen in badkamer tijdens ochtendverzorging. Probeerde 
zelfstandig op te staan uit stoel zonder hulp te vragen. Geen letsel, 
wel schrik.
```

**12 oktober 2024 - Dwalen (Matig)**
```
Cliënte aangetroffen in verkeerde kamer, probeerde in bed van andere 
bewoner te gaan liggen. Gedesoriënteerd in tijd en plaats. Rustig 
terugbegeleid naar eigen kamer.
```

**5 oktober 2024 - Onrust (Laag)**
```
Avondlijke onrust met roepen om hulp. Angstig en verward. Heeft 45 
minuten extra begeleiding nodig gehad om te kalmeren.
```

**28 september 2024 - Val (Hoog)** ⚠️
```
Val uit bed tijdens nacht. Probeerde zelfstandig naar toilet te gaan. 
Hematoom op heup. Arts geconsulteerd, geen fractuur. Bedgalg geplaatst.
```

**22 september 2024 - Medicatie (Laag)**
```
Weigerde medicatie in te nemen. Herkende verpleegkundige niet en 
wantrouwde haar. Na geruststellend gesprek alsnog ingenomen.
```

**15 september 2024 - Verzet zorg (Matig)**
```
Verzet bij ochtendverzorging. Duwde verzorgende weg, riep dat ze naar 
huis wilde. Zorg uitgesteld en later op dag met succes uitgevoerd.
```

**8 september 2024 - Onrust (Matig)**
```
Nachtelijke onrust met dwalen door de gang. Wakker maken van medebewoners. 
Extra nachtzorg ingezet voor begeleiding.
```

**30 augustus 2024 - Dwalen (Hoog)** ⚠️
```
Cliënte probeerde het gebouw te verlaten via nooduitgang. Alarm afgegaan. 
Politie ingeschakeld. Zeer angstig en verward. Wilde 'naar huis naar kinderen'.
```

**25 augustus 2024 - Val (Matig)**
```
Gestruikeld over eigen voeten in gang. Ondersteund door verzorgende dus 
geen val compleet. Wel instabiel in balans.
```

**18 augustus 2024 - Eetproblemen (Matig)**
```
Verslikte zich tijdens avondmaaltijd. Hoesten en rood aangelopen. Kort 
beademing ondersteund, daarna weer goed. Advies logopedie aangevraagd.
```

**Incident Analyse:**
- Totaal: 10 incidenten in 2 maanden (5 per maand)
- Ernst: 2 Hoog, 6 Matig, 2 Laag
- Categorieën: Vallen (4), Dwalen (3), Onrust (2), Overig (1)
- Trend: **Toenemend** (4 in augustus → 6 in oktober)

#### MD Reviews (3 disciplines)

**Dr. Maria Peters - Specialist Ouderengeneeskunde**
```
Beslissing: APPROVE herindicatie

Bevindingen:
Cliënte vertoont duidelijke progressie van dementie met toenemende ADL-afhankelijkheid 
en BPSD. MMSE gedaald van 18 naar 12 in 6 maanden. Katz-ADL score gedaald van 8 naar 2. 
Incident frequentie toegenomen met valrisico en dwaalgedrag. Nachtelijke zorg intensiever. 
Familie terecht bezorgd.

Aanbeveling:
Herindicatie naar VV9 of hoger, uitbreiding zorguren, multidisciplinaire evaluatie, 
mogelijk gespecialiseerde dementiezorg overwegen.
```

**Drs. Sophie van Leeuwen - Psycholoog**
```
Beslissing: APPROVE herindicatie

Bevindingen:
BPSD symptomen toegenomen met NPI stijging van 18 naar 42. Vooral agitatie, angst en 
nachtelijk gedrag problematisch. Sundowing duidelijk aanwezig. Gedragsinterventies tot 
nu toe onvoldoende effectief. Medicatie-aanpassing door SOG heeft beperkt effect.

Aanbeveling:
Gestructureerde dagindeling, meer 1-op-1 begeleiding bij ADL, validatietechnieken, en 
mogelijk overplaatsing naar kleinschalig wonen met dementie-expertise.
```

**Jan Vermeulen - Fysiotherapeut**
```
Beslissing: APPROVE herindicatie

Bevindingen:
Mobiliteit achteruit gegaan. Balans en coördinatie verminderd. Valrisico significant 
toegenomen. Meerdere valincidenten laatste maanden. Loophulpmiddel geadviseerd maar 
naleving problematisch door cognitie. Transfers gaan met meer moeite.

Aanbeveling:
Aangepast loophulpmiddel, verhoogd toezicht bij mobiliteit, valpreventie protocol, en 
eventueel rolstoel voor langere afstanden.
```

---

### Jan Bakker - Complete Dataset

#### Notes (2 stuks)

**12 oktober 2024 - Peter Visser, verzorgende IG**
```
Sectie: ADL
Cliënt functioneert stabiel. Kan zelfstandig wassen en aankleden met enkel 
toezicht. Heeft hulp nodig bij douchen vanwege mobiliteitsbeperking.
```

**15 september 2024 - Maria Konings, verpleegkundige**
```
Sectie: Medisch
Geen significante veranderingen in gezondheidstoestand. Medicatie trouw 
ingenomen. Bloeddruk goed gereguleerd. Dagelijkse conditie goed.
```

#### Measures (3 metingen)

| Datum | Type | Score | Interpretatie | Trend |
|-------|------|-------|---------------|-------|
| 1 okt 2024 | Katz-ADL | 9 | Zeer zelfstandig | ➡️ |
| 1 jul 2024 | Katz-ADL | 10 | Zeer zelfstandig | ➡️ |
| 1 apr 2024 | Katz-ADL | 10 | Zeer zelfstandig | - |

**Trend Analyse:**
- ADL: **Stabiel** (10→10→9, minimale variatie)
- Geen gedragsmetingen nodig
- Geen cognitieve achteruitgang

#### Incidents (2 stuks over 6 maanden)

**10 september 2024 - Medicatie (Laag)**
```
Vergeten ochtendmedicatie in te nemen. Tijdens controle geconstateerd en 
alsnog ingenomen.
```

**22 juli 2024 - Val (Laag)**
```
Lichte struikeling over drempel. Geen letsel. Alert en goed hersteld.
```

**Incident Analyse:**
- Totaal: 2 incidenten in 6 maanden (0.33 per maand)
- Ernst: Beide laag
- Trend: **Laag en stabiel**

#### MD Reviews (1 review)

**Dr. Thomas de Jong - Specialist Ouderengeneeskunde**
```
Beslissing: OBSERVE (90 dagen)

Bevindingen:
Cliënt functioneert stabiel op VV7 niveau. Kleine toename in zorgbehoefte maar 
binnen normale variatie. ADL scores stabiel. Geen significante gedragsproblematiek. 
Huidige indicatie blijft passend.

Aanbeveling:
Continueer huidige zorg, geen herindicatie noodzakelijk op dit moment. Herevaluatie 
over 3 maanden.
```

---

### Anna de Vries - Complete Dataset

#### Notes (3 stuks)

**18 oktober 2024 - Emma de Groot, verpleegkundige**
```
Sectie: Gedrag
Ernstige agitatieperiodes met verbaal agressief gedrag. Slaat naar verzorgenden 
tijdens ADL. Kan niet worden gestopt met woorden alleen. Team vindt het moeilijk 
om zorg te verlenen.
```

**10 oktober 2024 - Dr. Van Dijk, psychiater**
```
Sectie: Medisch
Diagnose: Ernstige BPSD in context van vasculaire dementie. NPI score zeer hoog 
(72 punten). Medicamenteuze behandeling opgestart met antipsychoticum. Monitoring 
vereist. Overleg met gedragsdeskundige gestart.
```

**15 september 2024 - Emma de Groot, verpleegkundige**
```
Sectie: Veiligheid
Team ervaart hoge werkdruk en stress door agressief gedrag cliënt. Al twee 
verzorgenden met letsel. Vragen om specialistische ondersteuning en mogelijk 
andere setting voor cliënt.
```

#### Measures (4 metingen)

| Datum | Type | Score | Interpretatie | Trend |
|-------|------|-------|---------------|-------|
| 15 okt 2024 | NPI | 72 | Zeer hoog (kritiek) | ⬆️ |
| 1 aug 2024 | NPI | 58 | Hoog | - |
| 15 okt 2024 | CMAI | 68 | Zeer hoge agitatie | - |
| 1 okt 2024 | Katz-ADL | 7 | Redelijk, maar moeilijk uitvoerbaar | - |

**Trend Analyse:**
- NPI: **24% toename** in 2 maanden (58→72)
- CMAI: **Zeer hoog** (68 punten)
- ADL: Technisch redelijk maar zorg niet veilig uitvoerbaar

#### Incidents (5 stuks over 2 weken)

**22 oktober 2024 - Agressie (Ernstig)** 🚨
```
Fysieke agressie tijdens ADL verzorging. Cliënt sloeg verzorgende in gezicht. 
Verzorgende heeft blauw oog. Incident gemeld bij leidinggevende. Zorg uitgesteld, 
later met 2 personen uitgevoerd.
```

**18 oktober 2024 - Agressie (Ernstig)** 🚨
```
Verbale agressie met schelden en dreigen. Gooide met voorwerpen naar personeel. 
Kamer verlaten, later teruggekomen met psychiater.
```

**15 oktober 2024 - Verzet zorg (Hoog)** ⚠️
```
Weigerde alle zorg. Schreeuwde en vloekte. Zorg kon niet worden uitgevoerd. Arts 
ingeschakeld voor medicatie-aanpassing.
```

**10 oktober 2024 - Agressie (Ernstig)** 🚨
```
Duwde verzorgende weg met kracht. Verzorgende viel tegen muur. Blessure aan schouder. 
Arbo-arts geconsulteerd.
```

**5 oktober 2024 - Onrust (Hoog)** ⚠️
```
Extreme motorische onrust met ijsberen, schreeuwen. Kon niet worden gekalmeerd. 
PRN medicatie toegediend.
```

**Incident Analyse:**
- Totaal: 5 ernstige incidenten in 2 weken (10 per maand geëxtrapoleerd)
- Ernst: 3 Ernstig, 2 Hoog
- Personeel letsel: 2 keer
- Trend: **Zeer hoog en urgent**

#### MD Reviews (2 disciplines)

**Dr. Robert van Dijk - Psychiater**
```
Beslissing: APPROVE - URGENT overplaatsing

Bevindingen:
Ernstige BPSD met agressie, agitatie en psychotische symptomen. NPI score 72 
(zeer hoog). Meerdere ernstige agressie-incidenten waarbij personeel letsel opliep. 
Huidige setting niet toereikend voor veiligheid cliënt en personeel. Medicamenteuze 
behandeling opgestart maar nog onvoldoende effectief.

Aanbeveling:
DRINGEND advies overplaatsing naar gespecialiseerde BPSD unit met psychiatrische 
expertise, 1-op-1 zorg waar nodig, uitgebreid gedragsplan, en multidisciplinair 
team met psychiatrie.
```

**Linda Bakker - Gedragsdeskundige**
```
Beslissing: APPROVE - Specialistische zorg vereist

Bevindingen:
Complexe gedragsproblematiek vereist specialistische aanpak. Huidige triggers 
geïdentificeerd: ADL momenten, nieuwe gezichten, drukke omgeving. Team ervaart 
hoge belasting. Huidige zorgintensiteit niet houdbaar zonder specialistische 
ondersteuning.

Aanbeveling:
Vaste kleine groep verzorgenden, rustige omgeving, aangepaste ADL benadering, 
medicatie-optimalisatie, en mogelijk opname in gespecialiseerde unit.
```

---

## Verwachte Uitkomsten

### Maria van den Berg - Verwachte Systeem Output

#### VV8 Criteria Evaluatie

| Criterium | Status | Score | Rationale |
|-----------|--------|-------|-----------|
| ADL Functioneren | ❌ FAIL | 20/100 | Katz-ADL 2/15 - ernstige afhankelijkheid |
| Gedragsproblematiek | ❌ FAIL | 35/100 | NPI 42 - significant gedrag, sundowing |
| Mobiliteit | ⚠️ WARNING | 55/100 | Valrisico hoog, meerdere valincidenten |
| Cognitie | ❌ FAIL | 40/100 | MMSE 12 - ernstige cognitieve stoornis |
| Medische Complexiteit | ⚠️ WARNING | 65/100 | Progressieve dementie gedocumenteerd |
| Sociale Participatie | ⚠️ WARNING | 60/100 | Familie bezorgd, verminderde interactie |
| Veiligheid | ❌ FAIL | 30/100 | 10 incidenten, 2 hoge ernst, dwaalgedrag |
| Zorgintensiteit | ❌ FAIL | 25/100 | Dagzorg en nachtzorg overschreden |

**Overall Score: 41/100** ⚠️  
**Status: NEEDS RE-ASSESSMENT**  
**Priority: URGENT**

#### Trend Analyse Output

```json
{
  "client_id": "test-client-001",
  "period": {
    "start": "2024-04-01",
    "end": "2024-10-15",
    "months": 6
  },
  "trends": [
    {
      "metric_type": "adl_score",
      "trend": "decreasing",
      "change_percentage": -75,
      "significance": "high",
      "data_points": [
        {"date": "2024-04", "value": 8},
        {"date": "2024-07", "value": 5},
        {"date": "2024-10", "value": 2}
      ],
      "recommendation": "Dalende ADL score duidt op achteruitgang. Overweeg aanpassing zorgplan of herindicatie."
    },
    {
      "metric_type": "incident_count",
      "trend": "increasing",
      "change_percentage": 150,
      "significance": "high",
      "data_points": [
        {"date": "2024-08", "value": 4},
        {"date": "2024-09", "value": 3},
        {"date": "2024-10", "value": 6}
      ],
      "recommendation": "Stijgend aantal incidenten vereist aandacht. Overweeg aanvullende maatregelen of observatie."
    },
    {
      "metric_type": "bpsd_score",
      "trend": "increasing",
      "change_percentage": 133,
      "significance": "high",
      "data_points": [
        {"date": "2024-04", "value": 18},
        {"date": "2024-07", "value": 28},
        {"date": "2024-10", "value": 42}
      ],
      "recommendation": "Stijgende BPSD scores vereisen heroverweging van behandelplan en mogelijk specialistische consultatie."
    }
  ],
  "assessment": {
    "status": "urgent",
    "summary": "Meerdere zorgelijke trends gedetecteerd. Directe actie vereist.",
    "recommendations": [
      "Dalende ADL score duidt op achteruitgang. Overweeg aanpassing zorgplan of herindicatie.",
      "Stijgend aantal incidenten vereist aandacht. Overweeg aanvullende maatregelen of observatie.",
      "Stijgende BPSD scores vereisen heroverweging van behandelplan en mogelijk specialistische consultatie.",
      "Overleg met behandelend team om multidisciplinaire evaluatie in te plannen."
    ]
  }
}
```

#### Risico Flags Output

```json
{
  "client_id": "test-client-001",
  "risks_detected": 3,
  "flags": [
    {
      "flag_type": "deteriorating_adl",
      "severity": "critical",
      "description": "ADL achteruitgang van 6.0 punten (75%)",
      "evidence": [
        "Vorige score: 8 (2024-04-01)",
        "Huidige score: 2 (2024-10-01)",
        "Achteruitgang: 75%"
      ],
      "recommended_actions": [
        "Plan herindicatie in",
        "Overweeg aanpassing zorgintensiteit",
        "Multidisciplinaire evaluatie"
      ]
    },
    {
      "flag_type": "high_incidents",
      "severity": "critical",
      "description": "10 incidenten in laatste 3 maanden (2 ernstig)",
      "evidence": [
        "Totaal: 10 incidenten",
        "Ernstig: 2 incidenten",
        "Gemiddeld: 3.3 per maand"
      ],
      "recommended_actions": [
        "Evalueer veiligheidsmaatregelen",
        "Overweeg aanpassing zorgplan",
        "Overleg met multidisciplinair team"
      ]
    },
    {
      "flag_type": "increased_care",
      "severity": "high",
      "description": "Zorguren gestegen boven indicatie",
      "evidence": [
        "Nachtzorg 4-5x per nacht",
        "ADL volledig afhankelijk",
        "1-op-1 begeleiding frequent nodig"
      ],
      "recommended_actions": [
        "Analyseer oorzaak van toegenomen zorgbehoefte",
        "Overweeg Meerzorg aanvraag",
        "Evalueer zorgplan"
      ]
    }
  ],
  "summary": {
    "critical": 2,
    "high": 1,
    "medium": 0,
    "low": 0
  }
}
```

#### Herindicatie Dashboard Output

```
╔═══════════════════════════════════════════════════════════════╗
║                   HERINDICATIE ANALYSE                         ║
║          Maria van den Berg - test-client-001                  ║
╠═══════════════════════════════════════════════════════════════╣
║ Huidige indicatie: VV8                                        ║
║ Status: 🚨 URGENT - Herindicatie vereist                      ║
║ Laatste evaluatie: 15 oktober 2024                           ║
╠═══════════════════════════════════════════════════════════════╣
║ TRENDS (laatste 6 maanden):                                   ║
║  ⬇️ ADL Score: -75% (8 → 2) [CRITICAL]                       ║
║  ⬆️ BPSD Score: +133% (18 → 42) [HIGH]                       ║
║  ⬆️ Incidenten: +150% (4 → 10/3mnd) [HIGH]                   ║
╠═══════════════════════════════════════════════════════════════╣
║ RISICO FLAGS: 3 actief                                        ║
║  🚨 Achteruitgang ADL - CRITICAL                              ║
║  🚨 Hoog aantal incidenten - CRITICAL                         ║
║  ⚠️ Toegenomen zorgbehoefte - HIGH                            ║
╠═══════════════════════════════════════════════════════════════╣
║ VV8 CRITERIA: 4/8 FAILING                                     ║
║  ❌ ADL (20/100)          ⚠️ Mobiliteit (55/100)              ║
║  ❌ Gedrag (35/100)       ❌ Cognitie (40/100)                ║
║  ❌ Veiligheid (30/100)   ❌ Zorgintensiteit (25/100)         ║
║  ⚠️ Medisch (65/100)     ⚠️ Sociaal (60/100)                 ║
╠═══════════════════════════════════════════════════════════════╣
║ MD TEAM REVIEWS: 3/3 APPROVE herindicatie                     ║
║  ✅ SOG: Dr. Peters - Herindicatie naar VV9+                  ║
║  ✅ Psycholoog: Drs. van Leeuwen - Specialistische zorg       ║
║  ✅ Fysio: Vermeulen - Valpreventie + aanpassingen            ║
╠═══════════════════════════════════════════════════════════════╣
║ AANBEVELING:                                                   ║
║ Dringende herindicatie naar VV9 of hoger geïndiceerd.        ║
║ Overweeg gespecialiseerde dementiezorg met expertise in      ║
║ BPSD en valpreventie. Familie moet worden geïnformeerd.       ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### Jan Bakker - Verwachte Systeem Output

#### VV8 Criteria Evaluatie

| Criterium | Status | Score | Rationale |
|-----------|--------|-------|-----------|
| ADL Functioneren | ✅ PASS | 90/100 | Zeer zelfstandig, stabiel |
| Gedragsproblematiek | ✅ PASS | 95/100 | Geen gedragsproblemen |
| Mobiliteit | ✅ PASS | 85/100 | Adequate mobiliteit |
| Cognitie | ✅ PASS | 80/100 | Lichte stoornis, stabiel |
| Medische Complexiteit | ✅ PASS | 85/100 | Goed gereguleerd |
| Sociale Participatie | ✅ PASS | 80/100 | Functioneert goed |
| Veiligheid | ✅ PASS | 90/100 | Minimale incidenten |
| Zorgintensiteit | ✅ PASS | 90/100 | Binnen indicatie |

**Overall Score: 87/100** ✅  
**Status: STABLE**  
**Priority: ROUTINE MONITORING**

#### Herindicatie Dashboard Output

```
╔═══════════════════════════════════════════════════════════════╗
║                   HERINDICATIE ANALYSE                         ║
║              Jan Bakker - test-client-002                      ║
╠═══════════════════════════════════════════════════════════════╣
║ Huidige indicatie: VV7                                        ║
║ Status: ✅ STABIEL - Geen herindicatie nodig                  ║
║ Laatste evaluatie: 12 oktober 2024                           ║
╠═══════════════════════════════════════════════════════════════╣
║ TRENDS (laatste 6 maanden):                                   ║
║  ➡️ ADL Score: Stabiel (10 → 9)                               ║
║  ➡️ Incidenten: Laag (2 in 6 maanden)                         ║
╠═══════════════════════════════════════════════════════════════╣
║ RISICO FLAGS: Geen actieve flags                              ║
╠═══════════════════════════════════════════════════════════════╣
║ VV8 CRITERIA: 8/8 PASSING                                     ║
║  ✅ Alle criteria binnen normale waarden                      ║
╠═══════════════════════════════════════════════════════════════╣
║ MD TEAM REVIEWS: 1 OBSERVE (90 dagen)                         ║
║  👁️ SOG: Dr. de Jong - Continueer huidige zorg               ║
╠═══════════════════════════════════════════════════════════════╣
║ AANBEVELING:                                                   ║
║ Huidige VV7 indicatie blijft passend. Continueer routine     ║
║ monitoring. Herevaluatie gepland over 3 maanden.              ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### Anna de Vries - Verwachte Systeem Output

#### VV8 Criteria Evaluatie

| Criterium | Status | Score | Rationale |
|-----------|--------|-------|-----------|
| ADL Functioneren | ⚠️ WARNING | 50/100 | Technisch OK, maar moeilijk uitvoerbaar |
| Gedragsproblematiek | ❌ FAIL | 10/100 | NPI 72 - ernstige BPSD met agressie |
| Mobiliteit | ✅ PASS | 70/100 | Geen mobiliteitsproblemen |
| Cognitie | ⚠️ WARNING | 45/100 | Dementie met psychotische kenmerken |
| Medische Complexiteit | ❌ FAIL | 20/100 | Psychiatrische interventie vereist |
| Sociale Participatie | ❌ FAIL | 15/100 | Team veiligheid in gevaar |
| Veiligheid | ❌ FAIL | 5/100 | Meerdere ernstige agressie-incidenten |
| Zorgintensiteit | ❌ FAIL | 10/100 | Specialistische zorg noodzakelijk |

**Overall Score: 28/100** 🚨  
**Status: CRITICAL - IMMEDIATE ACTION REQUIRED**  
**Priority: URGENT - SPECIALIZED CARE**

#### Risico Flags Output

```json
{
  "client_id": "test-client-003",
  "risks_detected": 3,
  "flags": [
    {
      "flag_type": "severe_bpsd",
      "severity": "critical",
      "description": "NPI score 72 - Zeer ernstige BPSD met agressie",
      "evidence": [
        "NPI: 72 punten (kritieke grens: 50)",
        "CMAI: 68 punten (zeer hoge agitatie)",
        "Fysieke en verbale agressie aanwezig"
      ],
      "recommended_actions": [
        "URGENT: Psychiatrische consultatie",
        "Overweeg tijdelijke 1-op-1 zorg",
        "Evalueer medicatie-aanpassingen",
        "Overplaatsing naar BPSD-unit"
      ]
    },
    {
      "flag_type": "safety_risk_staff",
      "severity": "critical",
      "description": "Personeel veiligheid in gevaar - 2 letsel incidenten",
      "evidence": [
        "5 ernstige agressie-incidenten in 2 weken",
        "2 verzorgenden met letsel (blauw oog, schouderblessure)",
        "Team ervaart hoge stress en onveiligheid"
      ],
      "recommended_actions": [
        "Directe veiligheidsmaatregelen implementeren",
        "Team debriefing en ondersteuning",
        "Arbo-arts consultatie",
        "Heroverweeg huidige setting"
      ]
    },
    {
      "flag_type": "specialized_care_required",
      "severity": "critical",
      "description": "Huidige zorgomgeving niet toereikend",
      "evidence": [
        "Psychiater en gedragsdeskundige ingeschakeld",
        "Zorg moeilijk/niet veilig uitvoerbaar",
        "Medicamenteuze interventie onvoldoende"
      ],
      "recommended_actions": [
        "URGENT overplaatsing naar BPSD-unit",
        "Gespecialiseerd team met psychiatrie-expertise",
        "Uitgebreid gedragsplan vereist",
        "Continue monitoring en aanpassing"
      ]
    }
  ],
  "summary": {
    "critical": 3,
    "high": 0,
    "medium": 0,
    "low": 0
  }
}
```

#### Herindicatie Dashboard Output

```
╔═══════════════════════════════════════════════════════════════╗
║                   HERINDICATIE ANALYSE                         ║
║            Anna de Vries - test-client-003                     ║
╠═══════════════════════════════════════════════════════════════╣
║ Huidige indicatie: VV9                                        ║
║ Status: 🚨 CRITICAL - Specialistische zorg vereist            ║
║ Laatste evaluatie: 18 oktober 2024                           ║
╠═══════════════════════════════════════════════════════════════╣
║ TRENDS (laatste 2 maanden):                                   ║
║  ⬆️ BPSD Score: +24% (58 → 72) [CRITICAL]                    ║
║  ⬆️ Incidenten: 5 ernstig in 2 weken [CRITICAL]              ║
║  🚨 Personeel letsel: 2 incidenten                            ║
╠═══════════════════════════════════════════════════════════════╣
║ RISICO FLAGS: 3 CRITICAL                                      ║
║  🚨 Ernstige BPSD (NPI 72)                                    ║
║  🚨 Veiligheidsrisico personeel                               ║
║  🚨 Specialistische zorg vereist                              ║
╠═══════════════════════════════════════════════════════════════╣
║ VV8 CRITERIA: 5/8 FAILING                                     ║
║  ❌ Gedrag (10/100) - CRITICAL                                ║
║  ❌ Veiligheid (5/100) - CRITICAL                             ║
║  ❌ Medisch (20/100) - Psychiatrie nodig                      ║
║  ❌ Sociaal (15/100) - Team overbelast                        ║
║  ❌ Zorgintensiteit (10/100) - Specialistisch                 ║
╠═══════════════════════════════════════════════════════════════╣
║ MD TEAM REVIEWS: 2/2 APPROVE URGENT overplaatsing             ║
║  🚨 Psychiater: Dr. van Dijk - DRINGEND BPSD-unit             ║
║  🚨 Gedragsdeskundige: Bakker - Niet houdbaar                 ║
╠═══════════════════════════════════════════════════════════════╣
║ AANBEVELING:                                                   ║
║ 🚨 URGENTE ACTIE VEREIST 🚨                                   ║
║ Onmiddellijke overplaatsing naar gespecialiseerde BPSD-unit  ║
║ met psychiatrische 24/7 expertise. Huidige situatie niet     ║
║ veilig voor cliënt en personeel. Crisis-protocol activeren.   ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## API Test Flows

### Complete Test Flow voor Maria van den Berg

#### 1. Ingest Client Data
```bash
POST /api/ingest
Content-Type: application/json

{
  "client": {
    "id": "test-client-001",
    "name": "Maria van den Berg",
    "dob": "1945-03-15",
    ...
  },
  "notes": [...],
  "measures": [...],
  "incidents": [...]
}

Expected: 201 Created
Response: { "message": "Data ingested successfully" }
```

#### 2. Get Herindicatie Overview
```bash
GET /api/herindicatie?client_id=test-client-001

Expected: 200 OK
Response: {
  "client": {...},
  "statistics": {
    "total_notes": 8,
    "recent_notes": 8,
    "total_incidents": 10,
    "recent_incidents": 10,
    "active_risk_flags": 3
  },
  "latest_data": {...}
}
```

#### 3. Run VV8 Criteria Assessment
```bash
POST /api/vv8/assess
Content-Type: application/json

{
  "client_id": "test-client-001"
}

Expected: 200 OK
Response: {
  "client_id": "test-client-001",
  "criteria": [
    {
      "id": "adl",
      "name": "ADL Functioneren",
      "status": "fail",
      "score": 20,
      "evidence": [...]
    },
    ...
  ],
  "overall_score": 41,
  "recommendation": "needs_re_assessment"
}
```

#### 4. Analyze Trends
```bash
POST /api/trends/analyze
Content-Type: application/json

{
  "client_id": "test-client-001",
  "metric_types": ["adl_score", "incident_count", "bpsd_score"],
  "period_months": 6
}

Expected: 200 OK
Response: {
  "trends": [
    {
      "metric_type": "adl_score",
      "trend": "decreasing",
      "change_percentage": -75,
      "significance": "high"
    },
    ...
  ],
  "assessment": {
    "status": "urgent",
    "summary": "Meerdere zorgelijke trends gedetecteerd."
  }
}
```

#### 5. Flag Risks
```bash
POST /api/risks/flag
Content-Type: application/json

{
  "client_id": "test-client-001",
  "auto_detect": true
}

Expected: 200 OK
Response: {
  "risks_detected": 3,
  "flags": [
    {
      "flag_type": "deteriorating_adl",
      "severity": "critical",
      "description": "ADL achteruitgang van 6.0 punten (75%)"
    },
    ...
  ],
  "summary": {
    "critical": 2,
    "high": 1
  }
}
```

#### 6. Add MD Reviews
```bash
POST /api/md-review
Content-Type: application/json

{
  "client_id": "test-client-001",
  "reviewer_name": "Dr. Maria Peters",
  "reviewer_role": "specialist ouderengeneeskunde",
  "clinical_notes": "Cliënte vertoont duidelijke progressie...",
  "decision": "approve",
  "observation_period_days": null
}

Expected: 201 Created
Response: { "id": "...", "message": "MD review created" }
```

#### 7. Export Herindicatie Report
```bash
POST /api/uc2/export
Content-Type: application/json

{
  "client_id": "test-client-001",
  "format": "pdf"
}

Expected: 200 OK
Response: Binary PDF file with complete herindicatie report
```

---

### Quick Test Flow voor alle Cliënten

```bash
# 1. Ingest all test data
POST /api/dev/load-mock-data
# (gebruik UC2-TEST-DATA.json)

# 2. Test Maria (Urgent case)
GET /api/herindicatie?client_id=test-client-001
# Expected: urgent status, 3 risks, failing criteria

# 3. Test Jan (Stable case)
GET /api/herindicatie?client_id=test-client-002
# Expected: stable status, no risks, passing criteria

# 4. Test Anna (Critical case)
GET /api/herindicatie?client_id=test-client-003
# Expected: critical status, severe BPSD, safety concerns

# 5. Run VV8 on all clients
POST /api/vv8/assess { "client_id": "test-client-001" }
POST /api/vv8/assess { "client_id": "test-client-002" }
POST /api/vv8/assess { "client_id": "test-client-003" }

# 6. Compare results in dashboard
# Navigate to /herindicatie in browser
```

---

## Validatie Checklist

### ✅ Functionele Tests

- [ ] **VV8 Criteria Assessment werkt**
  - [ ] Maria: 4/8 criteria failing
  - [ ] Jan: 8/8 criteria passing
  - [ ] Anna: 5/8 criteria failing

- [ ] **Trend Analyse werkt**
  - [ ] Maria: Detecteert ADL daling -75%
  - [ ] Maria: Detecteert NPI stijging +133%
  - [ ] Jan: Detecteert stabiele trends
  - [ ] Anna: Detecteert NPI stijging +24%

- [ ] **Risico Detectie werkt**
  - [ ] Maria: 3 risks (2 critical, 1 high)
  - [ ] Jan: 0 risks
  - [ ] Anna: 3 critical risks

- [ ] **MD Reviews werken**
  - [ ] Maria: 3 APPROVE reviews
  - [ ] Jan: 1 OBSERVE review
  - [ ] Anna: 2 URGENT APPROVE reviews

- [ ] **Dashboard toont correcte data**
  - [ ] Overzicht alle cliënten
  - [ ] Filter op priority (urgent/stable)
  - [ ] Detail view per cliënt

### ✅ Data Integriteit Tests

- [ ] **Alle relaties kloppen**
  - [ ] Notes linked naar juiste client_id
  - [ ] Measures linked naar juiste client_id
  - [ ] Incidents linked naar juiste client_id
  - [ ] MD reviews linked naar juiste client_id

- [ ] **Datum volgorde klopt**
  - [ ] Notes van oud naar nieuw
  - [ ] Measures in chronologische volgorde
  - [ ] Incidents in chronologische volgorde

- [ ] **Scores consistent**
  - [ ] Katz-ADL tussen 0-15
  - [ ] MMSE tussen 0-30
  - [ ] NPI scores realistisch

### ✅ Edge Case Tests

- [ ] **Onvolledige data**
  - [ ] Client zonder measures
  - [ ] Client zonder incidents
  - [ ] Client met 1 measure (geen trend mogelijk)

- [ ] **Extreme waarden**
  - [ ] NPI > 100 (moet falen)
  - [ ] Negatieve scores (moet falen)
  - [ ] Toekomstige datums (moet warning geven)

---

## Gebruik Instructies

### Data Laden

**Optie 1: Via API**
```bash
POST /api/dev/load-mock-data
Content-Type: application/json

# Upload UC2-TEST-DATA.json
```

**Optie 2: Via Prisma Seed**
```bash
pnpm exec prisma db seed
# Configureer seed script om UC2-TEST-DATA.json te laden
```

### Handmatige Test Scenario's

1. **Test Trend Analyse**
   - Ga naar `/herindicatie`
   - Selecteer Maria van den Berg
   - Klik op "Analyseer Trends"
   - Verifieer dat 3 trends detected worden
   - Check dat assessment "urgent" is

2. **Test VV8 Criteria**
   - Selecteer Maria van den Berg
   - Klik op "Evalueer Criteria"
   - Verifieer 4/8 failing criteria
   - Check evidence per criterium

3. **Test Risico Detectie**
   - Selecteer Anna de Vries
   - Klik op "Detecteer Risico's"
   - Verifieer 3 critical flags
   - Check safety warning voor personeel

4. **Test MD Reviews**
   - Bekijk MD reviews voor Maria
   - Verifieer 3 disciplines
   - Check dat allen APPROVE status hebben

### Automatische Test Suite

```typescript
// tests/uc2/herindicatie.test.ts

describe('UC2 Herindicatie', () => {
  beforeAll(async () => {
    // Load test data
    await loadTestData('UC2-TEST-DATA.json');
  });

  test('Maria - Urgent re-assessment', async () => {
    const result = await analyzeHerindicatie('test-client-001');
    expect(result.status).toBe('urgent');
    expect(result.risks.length).toBe(3);
    expect(result.vv8.failing).toBe(4);
  });

  test('Jan - Stable condition', async () => {
    const result = await analyzeHerindicatie('test-client-002');
    expect(result.status).toBe('stable');
    expect(result.risks.length).toBe(0);
    expect(result.vv8.failing).toBe(0);
  });

  test('Anna - Critical BPSD', async () => {
    const result = await analyzeHerindicatie('test-client-003');
    expect(result.status).toBe('critical');
    expect(result.risks.some(r => r.flag_type === 'severe_bpsd')).toBe(true);
  });
});
```

---

## Troubleshooting

### Probleem: Geen trends gedetecteerd
**Oorzaak:** Onvoldoende datapunten  
**Oplossing:** Zorg voor minimaal 2 measures per metric_type

### Probleem: VV8 criteria allemaal passing voor Maria
**Oorzaak:** Verkeerde client_id of data niet geladen  
**Oplossing:** Verifieer dat test-client-001 correct is aangemaakt

### Probleem: Risico's niet gedetecteerd
**Oorzaak:** Drempelwaarden niet bereikt  
**Oplossing:** Check dat ADL daling > 20% en incidents > 10 per 3 maanden

### Probleem: MD reviews niet zichtbaar
**Oorzaak:** Reviews niet gekoppeld aan juiste client_id  
**Oplossing:** Verifieer foreign key relaties in database

---

**Einde Document**  
Voor vragen of aanvullingen: contact development team
