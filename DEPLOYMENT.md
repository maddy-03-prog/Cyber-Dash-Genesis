# Cyber Dash: Genesis — Official Production Deployment Guide

This guide details how to deploy **Cyber Dash: Genesis** to **Netlify** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database).

---

## 🏗️ Architecture Overview

The project is structured into two independent production applications:
- **`Cyber-Dash-Frontend/`**: Main AAA Game Website & HTML5 Canvas Game (Deploy to **Netlify**).
- **`Cyber-Dash-Backend/`**: Node.js, Express, Socket.IO & Mongoose Microservice (Deploy to **Render**).

---

## 📋 STEP-BY-STEP DEPLOYMENT CHECKLIST

### STEP 1: Push Repositories to GitHub
You can push the frontend and backend to GitHub:
- Target Repository 1: `Cyber-Dash-Frontend`
- Target Repository 2: `Cyber-Dash-Backend`

Or push the entire root repository containing both folders to GitHub.

---

### STEP 2: Create a Free MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Click **Create a Database** -> Choose **M0 Free Shared Cluster**.
3. **Database Security**:
   - Create a database user (e.g. `cyberadmin` / password).
   - In **Network Access**, click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Connect** -> Choose **Drivers** -> Copy your `MONGODB_URI` connection string:
   ```text
   mongodb+srv://cyberadmin:<password>@cluster0.mongodb.net/cyber_dash_db?retryWrites=true&w=majority
   ```

---

### STEP 3: Deploy Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and log in.
2. Click **New +** -> Select **Web Service**.
3. Connect your GitHub repository.
4. Set Build Options:
   - **Root Directory**: `Cyber-Dash-Backend` (or `.` if deploying a separate backend repo)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `cyber_dash_super_secret_quantum_key_2026`
   - `CLIENT_URL`: `https://cyber-dash-genesis.netlify.app`
6. Click **Create Web Service**. Copy your live Render Web Service URL (e.g. `https://cyber-dash-backend.onrender.com`).

---

### STEP 4: Deploy Frontend to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/) and log in.
2. Click **Add new site** -> Select **Import an existing project**.
3. Connect to GitHub and select your repository.
4. Netlify will automatically detect `netlify.toml` and `_redirects`!
   - **Base directory**: `Cyber-Dash-Frontend` (or `.` if deploying a separate frontend repo)
   - **Publish directory**: `.`
5. Click **Deploy Site**.

---

### STEP 5: Final Verification Checklist
- [x] **Health Check**: Open `https://cyber-dash-backend.onrender.com/api/health` -> returns `{"status":"ONLINE"}`.
- [x] **Landing Page & Trailer**: Open Netlify URL -> Page scrolls smoothly, 1-minute trailer plays.
- [x] **Game Launch**: Click `▶ PLAY NOW` -> Game launches cleanly.
- [x] **Single Player & AI Co-op**: Run campaign & AI companion modes.
- [x] **Multiplayer**: Test 2-Player room creation via Socket.IO.
