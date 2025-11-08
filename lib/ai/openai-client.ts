// Azure OpenAI client factory with Entra ID (DefaultAzureCredential) or API Key
// DefaultAzureCredential checks (in order):
// 1. Environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
// 2. Managed Identity (when running in Azure)
// 3. Azure CLI authentication (local development)
// 4. Visual Studio authentication

import { getAzureOpenAIConfig, MOCK_MODE } from './client';
import { getCachedContextChunks, getRelevantContext } from './context-extractor';

let cachedClient: any = null;

/**
 * Get Azure OpenAI client with Entra ID or API Key
 * Automatically handles credential selection and caching
 */
export async function getOpenAIClient(): Promise<any> {
  if (MOCK_MODE) return null;

  if (cachedClient) return cachedClient;

  const config = getAzureOpenAIConfig();

  try {
    // Dynamically import to avoid issues in SSR contexts
    const { AzureOpenAI } = await import('openai');
    const { DefaultAzureCredential, getBearerTokenProvider } = await import('@azure/identity');

    if (config.useEntraId) {
      // Use DefaultAzureCredential for Entra ID
      // This supports:
      // - Environment variables: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID
      // - Managed Identity (in Azure)
      // - Azure CLI credentials (local development)
      // - Visual Studio credentials
      console.log('✓ Initializing Azure OpenAI with Entra ID (DefaultAzureCredential)');

      const credential = new DefaultAzureCredential({
        tenantId: process.env.AZURE_TENANT_ID,
      });
      const azureADTokenProvider = getBearerTokenProvider(credential, 'https://cognitiveservices.azure.com/.default');

      cachedClient = new AzureOpenAI({
        endpoint: config.endpoint,
        azureADTokenProvider,
        apiVersion: config.apiVersion,
        deployment: config.deploymentName,
      });
    } else if (config.apiKey) {
      // Fallback to API Key authentication
      console.log('✓ Initializing Azure OpenAI with API Key');

      cachedClient = new AzureOpenAI({
        endpoint: config.endpoint,
        apiKey: config.apiKey,
        apiVersion: config.apiVersion,
        deployment: config.deploymentName,
      });
    }

    console.log(`✓ Azure OpenAI client ready (endpoint: ${config.endpoint})`);
  } catch (error) {
    console.error('Failed to initialize Azure OpenAI client:', error);
    return null;
  }

  return cachedClient;
}

/**
 * Get deployment name
 */
export function getDeploymentName(): string {
  const config = getAzureOpenAIConfig();
  return config.deploymentName;
}

/**
 * Check if Azure OpenAI is properly configured
 */
export function isOpenAIReady(): boolean {
  return !MOCK_MODE && getAzureOpenAIConfig().endpoint !== '';
}

/**
 * Call Azure OpenAI chat completion
 */
export async function chatCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' | 'text' };
}): Promise<string | null> {
  const client = await getOpenAIClient();
  if (!client) {
    console.warn('⚠️ Azure OpenAI client not available - using mock mode');
    return null;
  }

  try {
    const response = await client.chat.completions.create({
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2000,
      response_format: params.responseFormat,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    throw new Error(`Azure OpenAI API call failed: ${error}`);
  }
}

/**
 * Evaluate a criterion using AI with WLZ context
 */
export async function evaluateCriterionWithAI(params: {
  criterion: { id: string; label: string; description: string };
  evidence: Array<{ source: string; snippet: string; row?: number }>;
  clientContext?: string;
  useContext?: boolean; // Enable/disable context retrieval
}): Promise<{
  status: 'voldoet' | 'niet_voldoet' | 'toegenomen_behoefte' | 'verslechterd' | 'onvoldoende_bewijs';
  argument: string;
  confidence: number;
}> {
  const { criterion, evidence, clientContext, useContext = true } = params;

  if (evidence.length === 0) {
    return {
      status: 'onvoldoende_bewijs',
      argument: `Geen recente evidence gevonden voor ${criterion.label}.`,
      confidence: 0.0,
    };
  }

  // Get relevant context from WLZ documents if enabled
  let contextSection = '';
  if (useContext) {
    try {
      const chunks = await getCachedContextChunks();
      const relevantContext = getRelevantContext(chunks, criterion, 3);
      if (relevantContext) {
        contextSection = `\n\n=== RELEVANTE WLZ CONTEXT ===\n${relevantContext}\n\n=== EINDE CONTEXT ===\n\n`;
      }
    } catch (error) {
      console.error('Error loading context for evaluation:', error);
      // Continue without context if it fails
    }
  }

  const systemPrompt = `Je bent een expert in WLZ (Wet langdurige zorg) indicatiestelling voor VV8 2026 profielen.
Je taak is om criteria te evalueren op basis van beschikbare evidence uit zorgnota's, metingen en incidenten.

Voor het criterium "${criterion.label}": ${criterion.description}
${contextSection}
Gebruik de bovenstaande WLZ context als referentie voor de beoordeling. De context bevat relevante beleidsregels, voorschriften en richtlijnen.

Beoordeel op basis van de evidence of:
- "voldoet": Cliënt voldoet aan huidige profiel, geen verandering nodig
- "niet_voldoet": Cliënt voldoet niet aan profiel, maar geen verslechtering
- "toegenomen_behoefte": Er is een toegenomen zorgbehoefte zichtbaar
- "verslechterd": De situatie is verslechterd, mogelijk herindicatie nodig
- "onvoldoende_bewijs": Te weinig evidence voor betrouwbare beoordeling

Geef je antwoord in JSON formaat:
{
  "status": "een van de bovenstaande statussen",
  "argument": "beargumenteerde beoordeling in 2-3 zinnen, verwijs naar relevante beleidsregels indien van toepassing",
  "confidence": getal tussen 0 en 1
}`;

  const userPrompt = `${clientContext ? `Context: ${clientContext}\n\n` : ''}Evidence:\n\n${evidence
    .map((e, i) => `${i + 1}. ${e.source}: "${e.snippet}"`)
    .join('\n')}

Evalueer het criterium "${criterion.label}" op basis van deze evidence.`;

  try {
    const result = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      maxTokens: 500,
      responseFormat: { type: 'json_object' },
    });

    if (!result) {
      throw new Error('No response from Azure OpenAI');
    }

    const parsed = JSON.parse(result);
    return {
      status: parsed.status || 'onvoldoende_bewijs',
      argument: parsed.argument || 'Geen argumentatie beschikbaar',
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error('Error evaluating criterion with AI:', error);
    return {
      status: 'onvoldoende_bewijs',
      argument: `Automatische evaluatie mislukt. Handmatige beoordeling vereist.`,
      confidence: 0.0,
    };
  }
}

/**
 * Generate a report section using AI
 */
export async function generateReportSection(params: {
  sectionType: 'aanleiding' | 'ontwikkelingen' | 'conclusie';
  context: {
    clientName?: string;
    wlzProfile?: string;
    changedCriteria?: Array<{ label: string; status: string; argument: string }>;
    period?: { from: string; to: string };
  };
}): Promise<string> {
  const { sectionType, context } = params;

  const systemPrompts = {
    aanleiding: `Je schrijft de aanleiding voor een herindicatie rapport in professionele Nederlandse zorgtaal. Houd het beknopt (2-3 zinnen).`,
    ontwikkelingen: `Je vat belangrijke ontwikkelingen samen uit criteria evaluaties voor een herindicatie rapport. Gebruik professionele zorgtaal.`,
    conclusie: `Je schrijft een conclusie voor een herindicatie rapport op basis van geëvalueerde criteria. Geef een duidelijk advies.`,
  };

  const userPrompts = {
    aanleiding: `Schrijf een aanleiding voor een herindicatie rapport voor ${context.clientName || 'de cliënt'} met huidig WLZ-profiel ${context.wlzProfile || 'VV7'}. De periode van evaluatie is ${context.period?.from} tot ${context.period?.to}.`,
    ontwikkelingen: `Vat de volgende ontwikkelingen samen:\n\n${context.changedCriteria?.map((c) => `- ${c.label}: ${c.argument}`).join('\n')}`,
    conclusie: `Op basis van ${context.changedCriteria?.length || 0} veranderde criteria, schrijf een conclusie met advies voor het vervolg.`,
  };

  try {
    const result = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompts[sectionType] },
        { role: 'user', content: userPrompts[sectionType] },
      ],
      temperature: 0.7,
      maxTokens: 800,
    });

    return result || `[Generatie van ${sectionType} mislukt]`;
  } catch (error) {
    console.error(`Error generating ${sectionType}:`, error);
    return `[Automatische generatie van ${sectionType} niet beschikbaar]`;
  }
}

/**
 * Analyze client trends using AI with WLZ context
 */
export async function analyzeClientTrendsWithAI(params: {
  clientName: string;
  notes: Array<{ date: string; section: string; text: string }>;
  measures: Array<{ date: string; type: string; score: string }>;
  incidents: Array<{ date: string; type: string; severity: string; description: string }>;
  useContext?: boolean;
}): Promise<{
  summary: string;
  trends: string[];
  recommendation: string;
  complexity: 'laag' | 'gemiddeld' | 'hoog' | 'zeer hoog';
}> {
  const { useContext = true } = params;

  // Get general WLZ context for trend analysis
  let contextSection = '';
  if (useContext) {
    try {
      const chunks = await getCachedContextChunks();
      // Get context related to assessment and trends
      const relevantContext = getRelevantContext(
        chunks,
        { label: 'trend analyse zorgbehoefte', description: 'indicatiestelling herindicatie beoordeling' },
        2
      );
      if (relevantContext) {
        contextSection = `\n\nRELEVANTE WLZ RICHTLIJNEN:\n${relevantContext}\n\n`;
      }
    } catch (error) {
      console.error('Error loading context for trend analysis:', error);
    }
  }

  const systemPrompt = `Je bent een expert in WLZ zorganalyse. Analyseer de trends in zorgbehoeften van een cliënt op basis van notities, metingen en incidenten.
${contextSection}
Gebruik de WLZ richtlijnen als referentiekader voor je analyse.

Geef je analyse in JSON formaat:
{
  "summary": "Korte samenvatting in 2-3 zinnen",
  "trends": ["trend 1", "trend 2", "trend 3"],
  "recommendation": "Concreet advies voor het vervolg, gebaseerd op WLZ richtlijnen",
  "complexity": "laag|gemiddeld|hoog|zeer hoog"
}`;

  const userPrompt = `Analyseer de zorgbehoeften trends voor ${params.clientName}:

NOTITIES (${params.notes.length} items):
${params.notes.slice(0, 10).map((n) => `- ${n.date} [${n.section}]: ${n.text.substring(0, 100)}...`).join('\n')}

METINGEN (${params.measures.length} items):
${params.measures.slice(0, 10).map((m) => `- ${m.date}: ${m.type} = ${m.score}`).join('\n')}

INCIDENTEN (${params.incidents.length} items):
${params.incidents.slice(0, 10).map((i) => `- ${i.date} [${i.severity}]: ${i.description.substring(0, 100)}...`).join('\n')}

Analyseer de trends en geef een advies.`;

  try {
    const result = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      maxTokens: 1000,
      responseFormat: { type: 'json_object' },
    });

    if (!result) {
      throw new Error('No response from Azure OpenAI');
    }

    const parsed = JSON.parse(result);
    return {
      summary: parsed.summary || 'Geen samenvatting beschikbaar',
      trends: parsed.trends || [],
      recommendation: parsed.recommendation || 'Geen aanbeveling beschikbaar',
      complexity: parsed.complexity || 'gemiddeld',
    };
  } catch (error) {
    console.error('Error analyzing trends with AI:', error);
    return {
      summary: 'Automatische analyse niet beschikbaar',
      trends: [],
      recommendation: 'Handmatige analyse vereist',
      complexity: 'gemiddeld',
    };
  }
}
