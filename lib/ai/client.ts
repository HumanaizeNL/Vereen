// Azure OpenAI client configuration with Entra ID support

export interface AzureOpenAIConfig {
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
  useEntraId: boolean;
  apiKey?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}

export function getAzureOpenAIConfig(): AzureOpenAIConfig {
  const useEntraId = process.env.AZURE_USE_ENTRA_ID === 'true';
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
    useEntraId,
    apiKey,
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  };
}

export function isAzureOpenAIConfigured(): boolean {
  const config = getAzureOpenAIConfig();
  const endpoint = !!config.endpoint;
  
  if (!endpoint) return false;

  if (config.useEntraId) {
    // For Entra ID: check if we have credentials (env vars or will use DefaultAzureCredential)
    return true; // DefaultAzureCredential will handle the rest
  }

  // For API Key: check if we have the key
  return !!config.apiKey;
}

// Mock mode for development without credentials
export const MOCK_MODE = !isAzureOpenAIConfigured();

if (MOCK_MODE) {
  console.warn(
    '⚠️  Azure OpenAI not configured - running in MOCK MODE.\n' +
      'To enable real Azure OpenAI, configure one of:\n' +
      '  1. Entra ID (Recommended):\n' +
      '     - Set AZURE_USE_ENTRA_ID=true\n' +
      '     - Set AZURE_OPENAI_ENDPOINT\n' +
      '     - Set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET (optional, uses DefaultAzureCredential)\n' +
      '  2. API Key (Fallback):\n' +
      '     - Set AZURE_OPENAI_ENDPOINT\n' +
      '     - Set AZURE_OPENAI_API_KEY'
  );
} else {
  const config = getAzureOpenAIConfig();
  const authMethod = config.useEntraId ? 'Entra ID' : 'API Key';
  console.log(`✓ Azure OpenAI configured with ${authMethod}`);
}
