Write-Host "TEST 1: Upload Sample Data" -ForegroundColor Cyan
$Uri = "http://localhost:3000/api/ingest"
$FilePath = "C:\Users\Stijn\Coding\Vereen\sample-data\notes.csv"
$Form = @{ file = Get-Item -Path $FilePath; client_id = "C123" }
$Response = Invoke-WebRequest -Uri $Uri -Method Post -Form $Form
$Result = $Response.Content | ConvertFrom-Json
Write-Host "Uploaded: $($Result.ingested[0].type) - $($Result.ingested[0].rows) rows" -ForegroundColor Green

Write-Host "`nTEST 2: Search Data" -ForegroundColor Cyan
$SearchUri = "http://localhost:3000/api/search"
$SearchBody = @{ client_id = "C123"; query = "ADL"; k = 5 } | ConvertTo-Json
$Response = Invoke-WebRequest -Uri $SearchUri -Method Post -ContentType "application/json" -Body $SearchBody
$Result = $Response.Content | ConvertFrom-Json
Write-Host "Found $($Result.hits.Count) results" -ForegroundColor Green

Write-Host "`nTEST 3: Evaluate Criteria" -ForegroundColor Cyan
Start-Sleep -Seconds 1
$EvalUri = "http://localhost:3000/api/uc2/evaluate-criteria"
$EvalBody = @{ client_id = "C123"; period = @{ from = "2025-06-01"; to = "2025-11-02" }; criteria_set = "herindicatie.vv8.2026"; max_evidence = 2 } | ConvertTo-Json
$Response = Invoke-WebRequest -Uri $EvalUri -Method Post -ContentType "application/json" -Body $EvalBody
$Result = $Response.Content | ConvertFrom-Json
Write-Host "Evaluated $($Result.criteria.Count) criteria" -ForegroundColor Green
$Result.criteria | ForEach-Object { Write-Host "  - $($_.label): $($_.status)" }
