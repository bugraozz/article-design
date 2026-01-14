# Quick Setup Script for Adobe PDF Services
# This script helps you create the .env file with your credentials

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "   Adobe PDF Services - Environment Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n📋 You need to create a .env file with your Adobe credentials.`n" -ForegroundColor Yellow

# Check if .env already exists
$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne 'y') {
        Write-Host "`n❌ Setup cancelled." -ForegroundColor Red
        exit
    }
}

Write-Host "`n📝 Please enter your Adobe PDF Services credentials:" -ForegroundColor Green
Write-Host "   (Get them from: https://developer.adobe.com/console)`n" -ForegroundColor Gray

# Get credentials from user
$clientId = Read-Host "Enter your Client ID"
$clientSecret = Read-Host "Enter your Client Secret"

# Validate input
if ([string]::IsNullOrWhiteSpace($clientId) -or [string]::IsNullOrWhiteSpace($clientSecret)) {
    Write-Host "`n❌ Error: Client ID and Client Secret cannot be empty!" -ForegroundColor Red
    exit 1
}

# Create .env file content
$envContent = @"
# Adobe PDF Services API Credentials
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

PDF_SERVICES_CLIENT_ID=$clientId
PDF_SERVICES_CLIENT_SECRET=$clientSecret

# Server Configuration
PORT=3001
"@

# Write to .env file
try {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline
    Write-Host "`n✅ Success! .env file created at: $envPath" -ForegroundColor Green
    Write-Host "`n📌 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Restart your server (Ctrl+C then 'npm start')" -ForegroundColor White
    Write-Host "   2. Try the PDF conversion again" -ForegroundColor White
    Write-Host "`n🔒 Security: This file is in .gitignore and won't be committed to Git`n" -ForegroundColor Gray
} catch {
    Write-Host "`n❌ Error creating .env file: $_" -ForegroundColor Red
    exit 1
}
"@
<parameter name="Complexity">4
