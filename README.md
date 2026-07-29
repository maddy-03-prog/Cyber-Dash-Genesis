# CYBER DASH: GENESIS — OFFICIAL AAA GAME PORTAL & REPOSITORY

```
  ██████╗██╗   ██╗██████╗ ███████╗██████╗     ██████╗  █████╗ ███████╗██╗  ██╗
 ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗    ██╔══██╗██╔══██╗██╔════╝██║  ██║
 ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝    ██║  ██║███████║███████╗███████║
 ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗    ██║  ██║██╔══██║╚════██║██╔══██║
 ╚██████╗   ██║   ██████╔╝███████╗██║  ██║    ██████╔╝██║  ██║███████║██║  ██║
  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
                         — G E N E S I S —
```

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://cyber-dash-genesis.netlify.app/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20PWA%20%7C%20Node.js-blue)](https://cyber-dash-genesis.netlify.app/)

> **"The Future Is Running Out."**
> Cyber Dash: Genesis is a high-octane, next-gen cyberpunk HTML5 Canvas action game and multi-mode game portal built with vanilla JS rendering, Node.js REST API microservices, Socket.IO real-time telemetry sync, and MongoDB Atlas persistence.

---

## 🌐 Production Deployments

- 🎮 **Live Web Game (Netlify)**: [https://cyber-dash-genesis.netlify.app/](https://cyber-dash-genesis.netlify.app/)
- 📡 **API & Realtime Backend (Render)**: [https://cyber-dash-genesis-api.onrender.com](https://cyber-dash-genesis-api.onrender.com)

---

## ⚡ Core Features

- **HTML5 60FPS Canvas Engine**: Custom particle physics, kinetic momentum dash, double jump mechanics, and dynamic CRT scanline shader overlays.
- **Singleplayer Story Mode**: 10 distinct districts, boss battles, progression leveling, equipment customizer, and NPC dialogue systems.
- **Real-Time 2-Player Multiplayer**: Socket.IO netcode pairing, 6-character room codes, live ping telemetry, and lobby chat.
- **Cyberpunk Sound Engine**: Web Audio API sound synthesis with positional acoustic feedback, combat dynamic tracks, and SFX toggles.
- **Progressive Web App (PWA)**: Service Worker offline fallback caching, manifest integration, and mobile touch interface support.

---

## 📁 Repository Structure

```
Cyber-Dash-Genesis/
├── README.md                 # Official AAA Repository Documentation
├── LICENSE                   # MIT License
├── CHANGELOG.md              # Versioning & Release Logs
├── CONTRIBUTING.md           # Contribution Guidelines
├── DEPLOYMENT.md             # Production Netlify & Render Deployment Guide
├── netlify.toml              # Netlify Build, Header & Routing Configuration
├── package.json              # Monorepo Workspace Script Orchestration
├── verify_deployment.ps1    # Automated 77-Point Deployment Audit Script
├── frontend/                 # Client Web Application & WebGL/Canvas Engine
│   ├── index.html            # Main Portal Page & Game Viewport
│   ├── 404.html              # Custom 404 Fallback Page
│   ├── offline.html          # Offline PWA Fallback Page
│   ├── manifest.json         # PWA Manifest Specifications
│   ├── robots.txt            # Search Engine Optimization Directives
│   ├── sitemap.xml           # XML Sitemap
│   ├── favicon.svg           # Vector App Icon
│   ├── sw.js                 # Service Worker Cache Strategy
│   ├── _redirects            # Netlify SPA Fallback Configuration
│   ├── css/
│   │   ├── theme.css         # Cyberpunk Design Tokens & Root Variables
│   │   ├── style.css         # Core Game HUD, Canvas & Overlays
│   │   ├── landing.css       # Official AAA Landing Page Portal
│   │   └── responsive.css    # Responsive Breakpoints & Mobile Touch Controls
│   └── js/                   # 28 Modular Game Engine & Portal Systems
│       ├── constants.js      ├── storage.js        ├── audio.js
│       ├── input.js          ├── particle.js       ├── progression.js
│       ├── combat.js         ├── drone_pet.js      ├── stagethemes.js
│       ├── story.js          ├── grade.js          ├── worldmap.js
│       ├── npc.js            ├── hq.js             ├── customizer.js
│       ├── player.js         ├── coop_ai.js        ├── multiplayer.js
│       ├── enemy.js          ├── obstacle.js       ├── boss.js
│       ├── powerup.js        ├── world.js          ├── ui.js
│       ├── devmode.js        ├── game.js           ├── main.js
│       └── landing.js
├── backend/                  # Node.js, Express, Socket.IO & MongoDB Backend
│   ├── server.js             # Express App & Server Initialization
│   ├── package.json          # Backend Dependencies & Scripts
│   ├── seed.js               # Database Seeding Script
│   ├── .env.example          # Environment Variable Blueprint
│   ├── config/               # Database Configuration
│   ├── controllers/          # Auth, Leaderboard & Save Handlers
│   ├── middleware/           # Rate Limiting & Error Handlers
│   ├── models/               # MongoDB Schemas
│   ├── routes/               # REST Endpoints
│   └── sockets/              # Socket.IO Event Handlers
├── docs/                     # Technical Specifications & Architecture
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
└── .github/
    └── workflows/
        └── ci.yml            # GitHub Actions Continuous Integration Pipeline
```

---

## 🛠️ Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Cyber-Dash-Genesis.git
   cd Cyber-Dash-Genesis
   ```

2. **Run Frontend Local Server**:
   ```bash
   npm --prefix frontend start
   # Or serve frontend/ directory directly via Live Server or any static web server
   ```

3. **Install & Run Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Execute Automated Audit**:
   ```bash
   powershell -ExecutionPolicy Bypass -File .\verify_deployment.ps1
   ```

---

## 🚀 Deployment Instructions

### Netlify (Frontend Static Web Host)
- Connect repo to Netlify.
- Set Publish Directory to `frontend`.
- `netlify.toml` handles security headers, asset caching, and SPA redirect handling.

### Render (Backend Node.js & WebSockets)
- Create Web Service on Render with root directory `backend`.
- Build Command: `npm install`
- Start Command: `node server.js`

---

## 📄 License & Credits

Developed by **Madhan Kumar (VIT Chennai)**.  
Licensed under the [MIT License](LICENSE).
