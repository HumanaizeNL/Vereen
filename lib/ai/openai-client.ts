// Azure OpenAI client factory with Entra ID (DefaultAzureCredential) or API Key
// DefaultAzureCredential checks (in order):
// 1. Environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
// 2. Managed Identity (when running in Azure)
// 3. Azure CLI authentication (local development)
// 4. Visual Studio authentication

import { getAzureOpenAIConfig, MOCK_MODE } from './client';

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
