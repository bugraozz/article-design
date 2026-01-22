param(
  [string]$Backend = 'http://localhost:3001',
  [string]$FilePath = '.'
)

Write-Host "WOPI manual test script"

if (-not (Test-Path $FilePath)) {
  Write-Error "File not found: $FilePath"
  exit 1
}

$file = Get-Item $FilePath

Write-Host "Uploading file to $Backend/api/upload-for-collabora ..."
$resp = Invoke-RestMethod -Uri "$Backend/api/upload-for-collabora" -Method Post -InFile $file.FullName -ContentType 'multipart/form-data' -UseBasicParsing

Write-Host "Response:`n" ($resp | ConvertTo-Json -Depth 5)

$accessToken = $resp.accessToken
$fileId = $resp.fileId
$wopiUrl = "$Backend/wopi/files/$fileId?access_token=$accessToken"

Write-Host "1) CheckFileInfo -> $wopiUrl"
$check = Invoke-RestMethod -Uri $wopiUrl -Method Get -UseBasicParsing
Write-Host ($check | ConvertTo-Json -Depth 5)

Write-Host "2) Download contents -> $Backend/wopi/files/$fileId/contents?access_token=$accessToken"
Invoke-RestMethod -Uri "$Backend/wopi/files/$fileId/contents?access_token=$accessToken" -Method Get -OutFile "downloaded-$($file.Name)"
Write-Host "Saved downloaded file: downloaded-$($file.Name)"

Write-Host "3) Try LOCK, REFRESH, UNLOCK"

Write-Host "LOCK..."
$lockResp = Invoke-RestMethod -Uri "$Backend/wopi/files/$fileId?access_token=$accessToken" -Method Post -Headers @{ 'X-WOPI-Override' = 'LOCK'; 'X-WOPI-Lock' = 'my-lock-token' } -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "LOCK response status: $?"

Write-Host "UNLOCK..."
$unlock = Invoke-RestMethod -Uri "$Backend/wopi/files/$fileId?access_token=$accessToken" -Method Post -Headers @{ 'X-WOPI-Override' = 'UNLOCK'; 'X-WOPI-Lock' = 'my-lock-token' } -UseBasicParsing -ErrorAction SilentlyContinue
Write-Host "UNLOCK response status: $?"

Write-Host "Manual test complete. If all steps succeeded, basic WOPI host works." 
