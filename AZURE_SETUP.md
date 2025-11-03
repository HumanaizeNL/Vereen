# Azure OpenAI Setup for Vereen

## ✅ Completed Setup

### Azure Resources Created
- **Resource Group**: `ChatHumanaize` (swedencentral)
- **Azure OpenAI Account**: `openai-vereen`
- **Endpoint**: `https://swedencentral.api.cognitive.microsoft.com/`
- **Deployed Model**: `gpt-4o` (version 2024-05-13, 128K context, 4K output)

### Entra ID (Service Principal) Created
- **App Name**: `Vereen-App`
- **App ID**: `8da7264f-af70-4386-9746-c3a30f962f33`
- **Tenant ID**: `471e0be0-f64d-4b85-9bd1-2435cca337c0`
- **Client Secret**: Configured in `.env.local`

### Environment Configuration
File: `.env.local`

```env
AZURE_OPENAI_ENDPOINT=https://swedencentral.api.cognitive.microsoft.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_USE_ENTRA_ID=true
AZURE_TENANT_ID=471e0be0-f64d-4b85-9bd1-2435cca337c0
AZURE_CLIENT_ID=8da7264f-af70-4386-9746-c3a30f962f33
AZURE_CLIENT_SECRET=.x78Q~GRFlNcux9jnlmL6Fq7lRpKJYYWghbr6bor
```

## ⏳ Pending: Role Assignment

The service principal needs the **"Cognitive Services OpenAI User"** role on the `openai-vereen` resource.

### Option 1: Azure Portal (Recommended for immediate testing)
1. Go to https://portal.azure.com
2. Navigate to `openai-vereen` resource in `ChatHumanaize` RG
3. Click "Access Control (IAM)" → "Add Role Assignment"
4. Select Role: **"Cognitive Services OpenAI User"**
5. Assign to: Search for `Vereen-App`
6. Click "Save"

### Option 2: Azure CLI (Requires proper subscription context)
```bash
PRINCIPAL_ID="ba446050-6780-4de5-8388-daa85b32a5ca"
RESOURCE_ID="/subscriptions/6cd12b98-b50d-41ff-bb81-35aa3ac26596/resourceGroups/ChatHumanaize/providers/Microsoft.CognitiveServices/accounts/openai-vereen"

az role assignment create \
  --assignee "$PRINCIPAL_ID" \
  --role "Cognitive Services OpenAI User" \
  --scope "$RESOURCE_ID"
```

### Option 3: Use Managed Identity (Production Recommended)
When deploying to Azure Container Apps or App Service:
1. Enable System-assigned Managed Identity
2. Assign "Cognitive Services OpenAI User" role to the managed identity
3. DefaultAzureCredential will automatically use the managed identity

## 🚀 Testing the Setup

### Local Development (Current)
```bash
# Terminal 1: Dev server
pnpm dev

# Terminal 2: Upload test data
curl -X POST http://localhost:3000/api/ingest \
  -F "file=@sample-data/notes.csv" \
  -F "client_id=C123"

# Terminal 3: Evaluate criteria
curl -X POST http://localhost:3000/api/uc2/evaluate-criteria \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "C123",
    "period": {"from": "2025-06-01", "to": "2025-11-02"},
    "criteria_set": "herindicatie.vv8.2026"
  }'
```

### Authentication Flow
1. **Local Development**: Uses DefaultAzureCredential
   - Tries environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)
   - Falls back to Azure CLI credentials (`az login`)
   - Falls back to Visual Studio credentials

2. **Azure Hosted**: Uses Managed Identity automatically
   - No credentials needed
   - Just set `AZURE_USE_ENTRA_ID=true`

## 📝 Configuration Reference

### Environment Variables
| Variable | Required | Purpose |
|----------|----------|---------|
| `AZURE_OPENAI_ENDPOINT` | Yes | Azure OpenAI resource endpoint |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | No | Model deployment name (default: gpt-4o) |
| `AZURE_USE_ENTRA_ID` | No | Enable Entra ID auth (default: false) |
| `AZURE_TENANT_ID` | Conditional | Tenant ID for service principal |
| `AZURE_CLIENT_ID` | Conditional | Client ID for service principal |
| `AZURE_CLIENT_SECRET` | Conditional | Client secret for service principal |
| `AZURE_OPENAI_API_KEY` | Alternative | API key (if not using Entra ID) |

### API Versions Supported
- `2024-08-01-preview` (Current, default)
- `2024-05-13`
- `2023-12-01-preview`

## 🔧 Troubleshooting

### "Authorization failed for deployment"
- Service principal lacks "Cognitive Services OpenAI User" role
- **Fix**: Assign role via Azure Portal (Option 1 above)

### "DefaultAzureCredential: No credentials found"
- Azure CLI not authenticated or credentials expired
- **Fix**: Run `az login` to authenticate

### "Invalid tenant ID"
- Check `AZURE_TENANT_ID` environment variable
- Correct tenant: `471e0be0-f64d-4b85-9bd1-2435cca337c0`

## 📚 Related Resources
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/cognitive-services/openai/)
- [DefaultAzureCredential Guide](https://github.com/Azure/azure-sdk-for-python/wiki/Set-up-your-environment-for-authentication)
- [Entra ID Service Principal Setup](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
