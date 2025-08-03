# Azure Static Web Apps Deployment Script
Write-Host "🚀 Starting deployment process for Calendar Breakout..." -ForegroundColor Green

# Navigate to app directory
Set-Location app

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the application
Write-Host "🏗️ Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build complete! The built files are in app/dist/" -ForegroundColor Green
Write-Host "🌐 The app will be automatically deployed to Azure Static Web Apps when pushed to main branch." -ForegroundColor Cyan
Write-Host "🔗 Live URL: https://black-pond-054716910.2.azurestaticapps.net" -ForegroundColor Cyan
