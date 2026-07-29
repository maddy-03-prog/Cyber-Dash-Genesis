// REST API Client & Backend Connection Manager for Cyber Dash: Genesis

class APIClient {
  constructor() {
    this.API_BASE = 'https://cyber-dash-genesis.onrender.com/api';
    this.token = localStorage.getItem('cyberdash_token') || null;
    this.isOnline = false;
    this.pollInterval = null;

    this.initHealthCheck();
  }

  getToken() {
    return this.token || localStorage.getItem('cyberdash_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('cyberdash_token', token);
    } else {
      localStorage.removeItem('cyberdash_token');
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('cyberdash_token');
  }

  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${this.API_BASE}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        this.updateStatusIndicator(true);
        return true;
      }
    } catch (e) {
      // Offline / Render backend spinning up
    }
    this.updateStatusIndicator(false);
    return false;
  }

  initHealthCheck() {
    this.checkHealth();
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => this.checkHealth(), 15000);
  }

  updateStatusIndicator(online) {
    this.isOnline = online;
    const badge = document.getElementById('backend-status-indicator');
    const text = document.getElementById('backend-status-text');
    if (badge && text) {
      if (online) {
        badge.className = 'backend-status-badge online';
        badge.setAttribute('title', 'Render Backend Online & Connected');
        text.innerText = 'BACKEND ONLINE';
      } else {
        badge.className = 'backend-status-badge offline';
        badge.setAttribute('title', 'Render Backend Offline / Connecting...');
        text.innerText = 'BACKEND OFFLINE';
      }
    }
  }

  // --- Auth Endpoints ---

  async register(username, password) {
    try {
      const res = await fetch(`${this.API_BASE}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err) {
      console.error('API Register Error:', err);
      return { success: false, message: 'Network connection failed' };
    }
  }

  async login(username, password) {
    try {
      const res = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err) {
      console.error('API Login Error:', err);
      return { success: false, message: 'Network connection failed' };
    }
  }

  async guest() {
    try {
      const res = await fetch(`${this.API_BASE}/auth/guest`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success && data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (err) {
      console.error('API Guest Error:', err);
      return { success: false, message: 'Network connection failed' };
    }
  }

  // --- Leaderboard Endpoints ---

  async getLeaderboard(timeframe = 'alltime', limit = 10) {
    try {
      const res = await fetch(`${this.API_BASE}/leaderboard?timeframe=${timeframe}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API Get Leaderboard Error:', err);
      return { success: false, data: [] };
    }
  }

  async submitScore(scoreData) {
    try {
      const res = await fetch(`${this.API_BASE}/leaderboard`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(scoreData)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API Submit Score Error:', err);
      return { success: false, message: 'Failed to record high score' };
    }
  }

  // --- Cloud Save Endpoints ---

  async saveCloud(saveData) {
    try {
      const res = await fetch(`${this.API_BASE}/save`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ saveData })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API Cloud Save Error:', err);
      return { success: false, message: 'Cloud save network error' };
    }
  }

  async loadCloud() {
    try {
      const res = await fetch(`${this.API_BASE}/save`, {
        method: 'GET',
        headers: this.getHeaders(true)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('API Cloud Load Error:', err);
      return { success: false, message: 'Cloud load network error' };
    }
  }
}

window.api = new APIClient();
