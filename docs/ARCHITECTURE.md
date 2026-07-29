# Cyber Dash: Genesis — System Architecture & Design

## System Architecture

Cyber Dash: Genesis is architected as a modular, decoupled HTML5 Canvas Action Game paired with a Node.js Express & Socket.IO backend for real-time multiplayer telemetry, user authentication, and global leaderboards.

```
+-----------------------------------------------------------------------+
|                            FRONTEND LAYER                             |
|  +---------------------+  +---------------------+  +-----------------+  |
|  |  HTML5 Canvas HUD   |  |  Game Engine Cycle  |  |   Landing Page  |  |
|  +---------------------+  +---------------------+  +-----------------+  |
|  +-----------------------------------------------------------------+  |
|  |    28 Core JS Modules (Player, Enemy, Boss, World, UI, etc.)   |  |
|  +-----------------------------------------------------------------+  |
|  +-----------------------------------------------------------------+  |
|  |   Multiplayer Socket Client & Offline Fallback Simulation      |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------||----------------------------------+
                                    || WebSocket / REST API
+-----------------------------------VV----------------------------------+
|                            BACKEND LAYER                              |
|  +--------------------+  +---------------------+  +----------------+  |
|  |  Express REST API  |  |  Socket.IO Gateway  |  | Mongoose ORM   |  |
|  +--------------------+  +---------------------+  +----------------+  |
|                             MongoDB Atlas Cluster                     |
+-----------------------------------------------------------------------+
```

## Component Overview

1. **Frontend Core (`frontend/`)**:
   - `index.html`: Main game container & AAA landing page portal.
   - `css/`: Theme (`theme.css`), Core Game (`style.css`), Landing Page (`landing.css`), Responsive (`responsive.css`).
   - `js/`: 28 standalone modules executing game loops, rendering cycles, audio management, and entity logic.

2. **Backend Services (`backend/`)**:
   - `server.js`: Entry point initializing Express HTTP server and Socket.IO listeners.
   - `sockets/roomSocket.js`: Handles real-time room creation, joining, ready checks, and state broadcasts.
   - `controllers/`: Handles Auth, Leaderboard, and Save State persistence.
   - `config/db.js`: MongoDB Atlas database connection pool.
