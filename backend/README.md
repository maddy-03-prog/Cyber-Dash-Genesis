# ⚡ Cyber Dash: Genesis — Backend Microservice

This folder contains the self-contained **Cyber-Dash-Backend** ready for one-click deployment on **Render** with MongoDB Atlas database integration.

## 🚀 One-Click Render Deployment Instructions

1. Push this `Cyber-Dash-Backend` folder or repo to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Web Service**.
4. Select your repository.
5. Set:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `cyber_dash_super_secret_quantum_key_2026`
   - `CLIENT_URL`: `https://your-netlify-app.netlify.app`
7. Click **Create Web Service**!

## 📡 Endpoints
- `GET /api/health` — Service Status Health Check
- `POST /api/auth/register` — User Registration
- `POST /api/auth/login` — Account Login
- `POST /api/auth/guest` — Instant Guest Session
- `GET /api/leaderboard` — Hall of Fame High Scores
- `POST /api/save/sync` — Cloud Game Save Sync
