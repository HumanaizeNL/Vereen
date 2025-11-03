# Vereen Testing Commands - PowerShell

## 🚀 Quick Start

### Prerequisites
```powershell
# Check if server is running
Invoke-WebRequest -Uri "http://localhost:3000" -ErrorAction SilentlyContinue | Select-Object StatusCode, StatusDescription
```

---

## 📤 Test 1: Upload Sample Data

### Upload CSV File
```powershell
# Upload notes.csv
$FilePath = "C:\Users\Stijn\Coding\Vereen\sample-data\notes.csv"
$Uri = "http://localhost:3000/api/ingest"

$Form = @{
    file = Get-Item -Path $FilePath
    client_id = "C123"
}

$Response = Invoke-WebRequest -Uri $Uri -Method Post -Form $Form
$Response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Upload All Sample Files (Batch)
```powershell
# Upload all CSV files from sample-data directory
$Uri = "http://localhost:3000/api/ingest"
$SampleDataDir = "C:\Users\Stijn\Coding\Vereen\sample-data"

Get-ChildItem -Path $SampleDataDir -Filter "*.csv" | ForEach-Object {
    Write-Host "Uploading: $($_.Name)" -ForegroundColor Cyan

    $Form = @{
        file = Get-Item -Path $_.FullName
        client_id = "C123"
    }

    $Response = Invoke-WebRequest -Uri $Uri -Method Post -Form $Form
    $Result = $Response.Content | ConvertFrom-Json

    Write-Host "Result: $($Result.ingested[0].type) - $($Result.ingested[0].rows) rows" -ForegroundColor Green
}
```

---

## 🎯 Test 2: Search in Uploaded Data

### Full-Text Search
```powershell
$Uri = "http://localhost:3000/api/search"
$Body = @{
    client_id = "C123"
    query = "ADL Katz aankleden eten"
    k = 5
} | ConvertTo-Json

$Response = Invoke-WebRequest -Uri $Uri `
    -Method Post `
    -ContentType "application/json" `
    -Body $Body

$Response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## 📊 Test 3: Evaluate Criteria (Main Test)

### Evaluate All 8 VV8 Criteria
```powershell
$Uri = "http://localhost:3000/api/uc2/evaluate-criteria"

$Body = @{
    client_id = "C123"
    period = @{
        from = "2025-06-01"
        to = "2025-11-02"
    }
    criteria_set = "herindicatie.vv8.2026"
    max_evidence = 3
} | ConvertTo-Json

$Response = Invoke-WebRequest -Uri $Uri `
    -Method Post `
    -ContentType "application/json" `
    -Body $Body

# Pretty print the response
$Result = $Response.Content | ConvertFrom-Json
Write-Host "Client: $($Result.client_id)" -ForegroundColor Cyan
Write-Host "Criteria evaluated: $($Result.criteria.Count)" -ForegroundColor Green
Write-Host ""

# Show each criterion result
$Result.criteria | ForEach-Object {
    Write-Host "$($_.label)" -ForegroundColor Yellow
    Write-Host "  Status: $($_.status)"
    Write-Host "  Confidence: $($_.confidence * 100)%"
    Write-Host "  Evidence: $($_.evidence.Count) items"
    Write-Host ""
}
```

---

## 💾 Test 4: Get Audit Logs

### View All Ingestion Events
```powershell
$Uri = "http://localhost:3000/api/audit/logs"

$Response = Invoke-WebRequest -Uri $Uri -Method Get
$Logs = $Response.Content | ConvertFrom-Json

Write-Host "Total events: $($Logs.events.Count)" -ForegroundColor Cyan
$Logs.events | ForEach-Object {
    Write-Host "$($_.ts) - $($_.action) (Client: $($_.client_id))" -ForegroundColor Green
}
```

---

## 🔄 Test 5: Complete Flow (All Tests in Sequence)

```powershell
# 1. Upload sample data
Write-Host "=== STEP 1: Uploading Sample Data ===" -ForegroundColor Magenta
$Uri = "http://localhost:3000/api/ingest"
$Files = @("notes.csv", "measures.csv", "incidents.csv")

foreach ($File in $Files) {
    $FilePath = "C:\Users\Stijn\Coding\Vereen\sample-data\$File"

    $Form = @{
        file = Get-Item -Path $FilePath
        client_id = "C123"
    }

    $Response = Invoke-WebRequest -Uri $Uri -Method Post -Form $Form
    $Result = $Response.Content | ConvertFrom-Json
    Write-Host "✓ Uploaded $File" -ForegroundColor Green
}

# 2. Wait a moment for indexing
Write-Host "`n=== STEP 2: Waiting for Indexing ===" -ForegroundColor Magenta
Start-Sleep -Seconds 2

# 3. Search
Write-Host "`n=== STEP 3: Searching Data ===" -ForegroundColor Magenta
$Uri = "http://localhost:3000/api/search"
$Body = @{
    client_id = "C123"
    query = "ADL"
    k = 3
} | ConvertTo-Json

$Response = Invoke-WebRequest -Uri $Uri `
    -Method Post `
    -ContentType "application/json" `
    -Body $Body

$SearchResults = $Response.Content | ConvertFrom-Json
Write-Host "✓ Found $($SearchResults.hits.Count) results" -ForegroundColor Green

# 4. Evaluate criteria
Write-Host "`n=== STEP 4: Evaluating Criteria ===" -ForegroundColor Magenta
$Uri = "http://localhost:3000/api/uc2/evaluate-criteria"

$Body = @{
    client_id = "C123"
    period = @{
        from = "2025-06-01"
        to = "2025-11-02"
    }
    criteria_set = "herindicatie.vv8.2026"
    max_evidence = 2
} | ConvertTo-Json

$Response = Invoke-WebRequest -Uri $Uri `
    -Method Post `
    -ContentType "application/json" `
    -Body $Body

$EvalResult = $Response.Content | ConvertFrom-Json
Write-Host "✓ Evaluated $($EvalResult.criteria.Count) criteria" -ForegroundColor Green

# 5. Show summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Magenta
$EvalResult.criteria | ForEach-Object {
    $StatusColor = switch($_.status) {
        "voldoet" { "Green" }
        "niet_voldoet" { "Red" }
        "verslechterd" { "Yellow" }
        default { "Gray" }
    }

    Write-Host "  ✓ $($_.label): $($_.status)" -ForegroundColor $StatusColor
}

Write-Host "`n✓ All tests completed!" -ForegroundColor Green
```

---

## 📋 Test Results Expected

### Upload Test
- Status: 200 OK
- Response: `{ ingested: [...], warnings: [] }`

### Search Test
- Status: 200 OK
- Response: `{ hits: [...], query: "..." }`

### Evaluate Test
- Status: 200 OK
- Response: `{ client_id: "C123", criteria: [...] }`
- Each criterion has: status, argument, evidence[], confidence

---

## 🐛 Troubleshooting

### Test Fails: Connection Refused
```powershell
# Check if server is running
Get-Process -Name "node" | Select-Object ProcessName, Id
# or
netstat -ano | findstr ":3000"
```

### Test Fails: 400 Bad Request
```powershell
# Verify client_id is passed correctly
# Verify file path exists
Test-Path "C:\Users\Stijn\Coding\Vereen\sample-data\notes.csv"
```

### Test Fails: 500 Internal Error
```powershell
# Check dev server logs in Terminal 1
# Look for error messages in stdout/stderr
```

---

## 💡 Tips

- Run commands in PowerShell Core for best compatibility
- Use `Format-Table` for better output formatting
- Use `ConvertTo-Json -Depth 10` to see full nested responses
- Each test builds on previous (upload first, then search, then evaluate)

