# Calendar Breakout! 🎮📅

A fun breakout-style game where your calendar events become the blocks to destroy! Built with React, TypeScript, and Vite.

## 🎯 Features

- **Interactive Calendar Game**: Your events become breakout blocks
- **iCal Import**: Upload your real calendar files (.ics format)
- **Scoring System**: Earn points for every event you break
- **Level Progression**: Each level gets faster and more challenging
- **Realistic Calendar View**: Complete with time labels and day headers

## 🚀 Live Demo

Play the game online: [https://black-pond-054716910.2.azurestaticapps.net](https://black-pond-054716910.2.azurestaticapps.net)

## 🛠️ Local Development

```bash
cd app
npm install
npm run dev
```

Open the printed local URL in your browser to play.

## 🏗️ Build

```bash
cd app
npm run build
```

## 📦 Deployment

This project is configured for Azure Static Web Apps with automatic deployment from the main branch via GitHub Actions.

### Azure Configuration
- **Resource Group**: WebApps
- **Subscription**: Visual Studio Enterprise Subscription
- **Location**: Global
- **Source**: GitHub (main branch)
- **Authentication**: GitHub

## 🎮 How to Play

1. Use arrow keys to move the paddle
2. Break all calendar events to advance to the next level
3. Each level increases the ball speed
4. Import your own iCal file for a personalized experience
5. Try to achieve the highest score possible!

## 🔧 Technologies Used

- React 19
- TypeScript
- Vite
- HTML5 Canvas
- Azure Static Web Apps
- GitHub Actions
