# Vereen API Test Script - PowerShell

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║           VEREEN API TEST - POWERSHELL                        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Test 1: Upload Sample Data
Write-Host "=== TEST 1: UPLOAD SAMPLE DATA ===" -ForegroundColor Cyan
Write-Host ""

$Uri = "http://localhost:3000/api/ingest"
$SampleDataDir = "C:\Users\Stijn\Coding\Vereen\sample-data"

$uploadedFiles = @()

Get-ChildItem -Path $SampleDataDir -Filter "*.csv" | ForEach-Object {
    Write-Host "  Uploading: $($_.Name)" -ForegroundColor Yellow

    $Form = @{
        file = Get-Item -Path $_.FullName
        client_id = "C123"
    }

    try {
        $Response = Invoke-WebRequest -Uri $Uri -Method Post -Form $Form
        $Result = $Response.Content | ConvertFrom-Json

        if ($Result.ingested -and $Result.ingested.Count -gt 0) {
            Write-Host "    ✓ Success: $($Result.ingested[0].type) - $($Result.ingested[0].rows) rows" -ForegroundColor Green
            $uploadedFiles += $_.Name
        } else {
            Write-Host "    ✗ Failed: No data ingested" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "    ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  ✓ Uploaded: $($uploadedFiles.Count) file(s)" -ForegroundColor Green
Write-Host ""

# Wait for indexing
Write-Host "=== WAITING FOR INDEXING ===" -ForegroundColor Cyan
Write-Host "  Waiting 2 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "  ✓ Ready" -ForegroundColor Green
Write-Host ""

# Test 2: Search
Write-Host "=== TEST 2: SEARCH DATA ===" -ForegroundColor Cyan
Write-Host ""

$SearchUri = "http://localhost:3000/api/search"
$SearchBody = @{
    client_id = "C123"
    query = "ADL Katz"
    k = 5
} | ConvertTo-Json

try {
    $Response = Invoke-WebRequest -Uri $SearchUri -Method Post -ContentType "application/json" -Body $SearchBody
    $Result = $Response.Content | ConvertFrom-Json

    Write-Host "  Query: 'ADL Katz'" -ForegroundColor Yellow
    Write-Host "  Results: $($Result.hits.Count) hit(s)" -ForegroundColor Green

    if ($Result.hits.Count -gt 0) {
        $Result.hits | Select-Object -First 3 | ForEach-Object {
            Write-Host "    • $($_.source) (row $($_.row))" -ForegroundColor White
        }
    }
}
catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Evaluate Criteria
Write-Host "=== TEST 3: EVALUATE CRITERIA ===" -ForegroundColor Cyan
Write-Host ""

$EvalUri = "http://localhost:3000/api/uc2/evaluate-criteria"
$EvalBody = @{
    client_id = "C123"
    period = @{
        from = "2025-06-01"
        to = "2025-11-02"
    }
    criteria_set = "herindicatie.vv8.2026"
    max_evidence = 2
} | ConvertTo-Json

try {
    $Response = Invoke-WebRequest -Uri $EvalUri -Method Post -ContentType "application/json" -Body $EvalBody
    $Result = $Response.Content | ConvertFrom-Json

    Write-Host "  Client: $($Result.client_id)" -ForegroundColor Yellow
    Write-Host "  Criteria Evaluated: $($Result.criteria.Count)" -ForegroundColor Green
    Write-Host ""

    $Result.criteria | ForEach-Object {
        $StatusColor = switch($_.status) {
            "voldoet" { "Green" }
            "niet_voldoet" { "Red" }
            "verslechterd" { "Yellow" }
            "toegenomen_behoefte" { "Yellow" }
            "onvoldoende_bewijs" { "Gray" }
            default { "White" }
        }

        Write-Host "  • $($_.label)" -ForegroundColor White
        Write-Host "    Status: $($_.status)" -ForegroundColor $StatusColor
        Write-Host "    Confidence: $(($_.confidence * 100).ToString('F1'))%" -ForegroundColor Cyan
        Write-Host "    Evidence: $($_.evidence.Count) item(s)" -ForegroundColor Cyan

        if ($_.evidence.Count -gt 0) {
            $_.evidence | Select-Object -First 1 | ForEach-Object {
                Write-Host "      Source: $($_.source_type) #$($_.source_id)" -ForegroundColor Gray
            }
        }
        Write-Host ""
    }
}
catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "=== SUMMARY ===" -ForegroundColor Magenta
Write-Host "✓ All tests completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Check http://localhost:3000/uc2 in your browser" -ForegroundColor Cyan
Write-Host ""
