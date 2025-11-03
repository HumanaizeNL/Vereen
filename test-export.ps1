# Test Export Functionality

Write-Host "Step 1: Uploading sample data..." -ForegroundColor Cyan
$Uri = "http://localhost:3000/api/ingest"
$SampleDataDir = "C:\Users\Stijn\Coding\Vereen\sample-data"

Get-ChildItem -Path $SampleDataDir -Filter "*.csv" | ForEach-Object {
    Write-Host "  Uploading: $($_.Name)" -ForegroundColor Yellow
    $Form = @{
        file = Get-Item -Path $_.FullName
        client_id = "C123"
    }
    $Response = Invoke-WebRequest -Uri $Uri -Method Post -Form $Form
    $Result = $Response.Content | ConvertFrom-Json
    Write-Host "  ✓ Uploaded $($Result.ingested[0].type)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 2: Waiting for indexing..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Write-Host "  ✓ Ready" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Evaluating criteria..." -ForegroundColor Cyan
$EvalBody = @{
    client_id = "C123"
    period = @{
        from = "2025-06-01"
        to = "2025-11-02"
    }
    criteria_set = "herindicatie.vv8.2026"
    max_evidence = 5
} | ConvertTo-Json

$EvalResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/uc2/evaluate-criteria" -Method Post -ContentType "application/json" -Body $EvalBody
$EvalResult = $EvalResponse.Content | ConvertFrom-Json

Write-Host "  ✓ Evaluated $($EvalResult.criteria.Count) criteria" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Testing export API..." -ForegroundColor Cyan
$ExportBody = @{
    client_id = "C123"
    period = @{
        from = "2025-06-01"
        to = "2025-11-02"
    }
    criteria = $EvalResult.criteria
    options = @{
        anonymize = $false
        include_evidence_appendix = $true
        template = "herindicatie_2026_v1"
    }
} | ConvertTo-Json -Depth 10

try {
    $ExportResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/uc2/export" -Method Post -ContentType "application/json" -Body $ExportBody

    if ($ExportResponse.StatusCode -eq 200) {
        $OutputPath = "C:\Users\Stijn\Coding\Vereen\test-export-output.docx"
        [System.IO.File]::WriteAllBytes($OutputPath, $ExportResponse.Content)
        Write-Host "  ✓ Export successful!" -ForegroundColor Green
        Write-Host "  File saved to: $OutputPath" -ForegroundColor Green
        Write-Host "  File size: $([Math]::Round($ExportResponse.Content.Length / 1024, 2)) KB" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Export failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception
}

Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Green
