# Cyber Dash: Genesis — Deployment Guide

## 1. Netlify Deployment (Frontend)

1. Connect GitHub Repository to Netlify.
2. Build Settings:
   - **Base directory**: `(leave empty or root)`
   - **Publish directory**: `frontend`
   - **Build command**: `(leave empty)`
3. Configuration File (`netlify.toml` in repository root automatically applies):
   - Sets `publish = "frontend"`.
   - Configures SPA redirect `/* -> /index.html`.
   - Applies security headers & cache control.

---

## 2. Render Deployment (Backend)

1. Create a **Web Service** on Render pointing to your GitHub repository.
2. Environment: `Node`
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Environment Variables:
   - `PORT`: `5000`
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/cyberdash`
   - `JWT_SECRET`: `<your_secret_key>`
   - `CLIENT_URL`: `https://cyber-dash-genesis.netlify.app`
