#!/bin/bash

# Azure Static Web Apps Deployment Script
echo "🚀 Starting deployment process for Calendar Breakout..."

# Navigate to app directory
cd app

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build complete! The built files are in app/dist/"
echo "🌐 The app will be automatically deployed to Azure Static Web Apps when pushed to main branch."
echo "🔗 Live URL: https://black-pond-054716910.2.azurestaticapps.net"
