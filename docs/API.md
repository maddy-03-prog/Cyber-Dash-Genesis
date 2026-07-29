# Cyber Dash: Genesis — REST API & Socket.IO Reference

## REST Endpoints

### Health Check
- **`GET /api/health`**
- Response:
```json
{
  "status": "ONLINE",
  "system": "CYBER DASH GENESIS API BACKEND",
  "timestamp": "2026-07-29T19:00:00.000Z",
  "version": "1.0.0"
}
```

### Authentication Routes (`/api/auth`)
- **`POST /api/auth/register`**: Register player profile (`username`, `email`, `password`).
- **`POST /api/auth/login`**: Authenticate and receive JWT token.

### Leaderboard Routes (`/api/leaderboard`)
- **`GET /api/leaderboard`**: Fetch global top 50 high scores.
- **`POST /api/leaderboard`**: Submit score record (requires JWT).

### Save Game State (`/api/save`)
- **`GET /api/save`**: Retrieve saved player progression & stats.
- **`POST /api/save`**: Sync progress state to database.

---

## Socket.IO Events

- **`create_room`**: Host creates match room.
- **`join_room`**: Guest joins via 6-digit room code.
- **`player_ready`**: Player updates readiness status.
- **`player_state`**: High-frequency telemetry sync (x, y, vx, vy, score, combo).
- **`chat_message`**: Real-time room chat messaging.
