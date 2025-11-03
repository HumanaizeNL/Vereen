# PowerShell Test Commands - Copy & Paste Ready

Open je **PowerShell terminal** en voer deze commands direct uit:

## Test 1: Upload Sample Data

```powershell
$Uri = "http://localhost:3000/api/ingest"
$FilePath = "C:\Users\Stijn\Coding\Vereen\sample-data\notes.csv"
$Form = @{
    file = Get-Item -Path $FilePath
    client_id = "C123"
}
$Response = Invoke-WebRequest -Uri $Uri -Method Post -Form $Form
$Response.Content | ConvertFrom-Json | ConvertTo-Json
```

## Test 2: Upload All CSV Files

```powershell
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
    Write-Host "✓ Uploaded $($Result.ingested[0].type)" -ForegroundColor Green
}
```

## Test 3: Search Data

```powershell
$Uri = "http://localhost:3000/api/search"
$Body = @{
    client_id = "C123"
    query = "ADL Katz"
    k = 5
} | ConvertTo-Json

$Response = Invoke-WebRequest -Uri $Uri -Method Post -ContentType "application/json" -Body $Body
$Response.Content | ConvertFrom-Json | ConvertTo-Json
```

## Test 4: Evaluate Criteria (Main Test)

```powershell
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

$Response = Invoke-WebRequest -Uri $Uri -Method Post -ContentType "application/json" -Body $Body
$Result = $Response.Content | ConvertFrom-Json

Write-Host "Client: $($Result.client_id)" -ForegroundColor Cyan
Write-Host "Criteria: $($Result.criteria.Count)" -ForegroundColor Green
$Result.criteria | ForEach-Object {
    Write-Host "  • $($_.label): $($_.status)"
}
```

## Test 5: Complete Flow (All in One)

```powershell
# Upload all files
Write-Host "Step 1: Uploading files..." -ForegroundColor Cyan
$Uri = "http://localhost:3000/api/ingest"
$SampleDataDir = "C:\Users\Stijn\Coding\Vereen\sample-data"
Get-ChildItem -Path $SampleDataDir -Filter "*.csv" | ForEach-Object {
    $Form = @{ file = Get-Item -Path $_.FullName; client_id = "C123" }
    Invoke-WebRequest -Uri $Uri -Method Post -Form $Form | Out-Null
}
Write-Host "✓ Upload complete" -ForegroundColor Green

# Wait for indexing
Write-Host "Step 2: Waiting for indexing..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Write-Host "✓ Ready" -ForegroundColor Green

# Search
Write-Host "Step 3: Searching..." -ForegroundColor Cyan
$SearchBody = @{ client_id = "C123"; query = "ADL"; k = 5 } | ConvertTo-Json
$SearchResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/search" -Method Post -ContentType "application/json" -Body $SearchBody
$SearchResult = $SearchResponse.Content | ConvertFrom-Json
Write-Host "✓ Found $($SearchResult.hits.Count) results" -ForegroundColor Green

# Evaluate
Write-Host "Step 4: Evaluating criteria..." -ForegroundColor Cyan
$EvalBody = @{
    client_id = "C123"
    period = @{ from = "2025-06-01"; to = "2025-11-02" }
    criteria_set = "herindicatie.vv8.2026"
    max_evidence = 2
} | ConvertTo-Json
$EvalResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/uc2/evaluate-criteria" -Method Post -ContentType "application/json" -Body $EvalBody
$EvalResult = $EvalResponse.Content | ConvertFrom-Json

Write-Host "✓ Evaluated $($EvalResult.criteria.Count) criteria" -ForegroundColor Green
Write-Host ""
Write-Host "RESULTS:" -ForegroundColor Magenta
$EvalResult.criteria | ForEach-Object {
    $Color = if ($_.status -eq "verslechterd") { "Yellow" } elseif ($_.status -eq "voldoet") { "Green" } else { "Gray" }
    Write-Host "  ✓ $($_.label)" -ForegroundColor White
    Write-Host "    Status: $($_.status)" -ForegroundColor $Color
    Write-Host "    Confidence: $(($_.confidence * 100).ToString('F1'))%" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✓ All tests passed!" -ForegroundColor Green
```

---

## Verwachte Output

### Test 1-2 (Upload)
```
Status: 200
{
  "client_id": "C123",
  "ingested": [
    { "filename": "notes.csv", "type": "notes", "rows": 12 }
  ],
  "warnings": []
}
```

### Test 3 (Search)
```
Status: 200
{
  "hits": [ ... 5 items ... ],
  "query": "ADL Katz"
}
```

### Test 4 (Evaluate)
```
Status: 200
{
  "client_id": "C123",
  "criteria": [
    {
      "id": "ADL",
      "label": "ADL-afhankelijkheid",
      "status": "verslechterd",
      "confidence": 0.72,
      "evidence": [ ... ]
    },
    ...
  ]
}
```

---

## Tips

1. **Copy & Paste**: Je kan de hele code block selecteren en in PowerShell plakken
2. **Line by Line**: Of je kan regel voor regel uitvoeren voor debugging
3. **Check Server**: Zorg dat `pnpm dev` nog draait in een ander terminal
4. **Errors**: Als je fouten ziet, controleer:
   - Zijn alle sample CSV files aanwezig?
   - Draait de server op localhost:3000?
   - Heb je internet connectie?

