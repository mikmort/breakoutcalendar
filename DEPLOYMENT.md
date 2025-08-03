# Azure Static Web Apps Deployment Guide

## Quick Setup

Your Azure Static Web App is already configured! Here's what you need to know:

### 🔗 Live URL
https://black-pond-054716910.2.azurestaticapps.net

### 🚀 Automatic Deployment
The app automatically deploys when you push to the `main` branch. The GitHub Action workflow handles:
- Installing dependencies
- Building the React app
- Deploying to Azure Static Web Apps

### 📁 Project Structure
```
/
├── app/                          # React application
│   ├── src/                      # Source code
│   ├── dist/                     # Build output (auto-generated)
│   ├── package.json              # Dependencies
│   └── vite.config.ts            # Build configuration
├── .github/workflows/            # GitHub Actions
│   └── azure-static-web-apps-*.yml
├── staticwebapp.config.json      # Azure SWA configuration
└── README.md
```

### 🛠️ Local Development
```bash
cd app
npm install
npm run dev
```

### 🏗️ Manual Build (Optional)
```bash
# Windows
./deploy.ps1

# Linux/Mac
./deploy.sh
```

### 🔐 Required Secrets
The GitHub repository needs this secret (already configured):
- `AZURE_STATIC_WEB_APPS_API_TOKEN_BLACK_POND_054716910`

### 📋 Azure Configuration
- **Resource Group**: WebApps
- **Subscription**: Visual Studio Enterprise Subscription
- **Subscription ID**: 8cf05593-3360-4741-b3e8-ccc6f4f61290
- **Location**: Global
- **SKU**: Free
- **Authentication**: GitHub

### 🚨 Troubleshooting
1. Check GitHub Actions tab for deployment status
2. Ensure all commits are pushed to `main` branch
3. Verify build passes locally before pushing
4. Check Azure portal for any service issues

### 🎮 Game Features Deployed
- ✅ Calendar Breakout game
- ✅ iCal file import
- ✅ Scoring and level progression
- ✅ Responsive design
- ✅ Day/time labels
- ✅ Sample calendar data
