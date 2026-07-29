// Multiplayer Networking Abstraction & Architecture for Cyber Dash: Genesis

class ConnectionManager {
  constructor(networkManager) {
    this.networkManager = networkManager;
    this.isConnected = false;
    this.latency = 12; // Simulated ping in milliseconds
    this.socket = null;
    this.serverUrl = window.BACKEND_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://cyber-dash-genesis-api.onrender.com');
  }

  connect() {
    this.isConnected = true;
    if (typeof io !== 'undefined') {
      try {
        this.socket = io(this.serverUrl, { autoConnect: true, timeout: 5000 });
        this.socket.on('connect', () => {
          this.networkManager.chat.addSystemMessage(`SOCKET CONNECTED TO BACKEND MATRIX: ${this.serverUrl}`);
        });
        this.socket.on('connect_error', () => {
          this.networkManager.chat.addSystemMessage('SOCKET WARNING: Backend unreachable. Running offline peer simulation.');
        });
      } catch (e) {
        console.warn('Socket.io connection fallback:', e);
      }
    }
    this.networkManager.triggerConnectionChange('connected');
  }

  disconnect() {
    this.isConnected = false;
    if (this.socket) {
      try { this.socket.disconnect(); } catch (e) {}
    }
    this.networkManager.triggerConnectionChange('disconnected');
  }

  simulateDisconnect() {
    this.isConnected = false;
    this.networkManager.chat.addSystemMessage('ERROR: Connection link lost. Peer dropped out.');
    this.networkManager.triggerConnectionChange('disconnected');
    
    // Switch to disconnection display in waiting room
    const mpLobby = document.getElementById('mp-lobby-view');
    const mpDisconnect = document.getElementById('mp-disconnect-view');
    if (mpLobby) mpLobby.classList.add('hidden');
    if (mpDisconnect) mpDisconnect.classList.remove('hidden');
  }
}

class RoomManager {
  constructor(networkManager) {
    this.networkManager = networkManager;
    this.roomCode = '';
    this.isHost = false;
    this.p1Ready = false;
    this.p2Ready = false;
  }

  generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom() {
    this.roomCode = this.generateCode();
    this.isHost = true;
    this.p1Ready = false;
    this.p2Ready = false;
    this.networkManager.chat.clearChat();

    this.networkManager.connection.isConnected = false;
    this.networkManager.triggerConnectionChange('waiting');
    this.networkManager.chat.addSystemMessage(`ROOM CREATED: ${this.roomCode}. Waiting for Player 2 to join...`);

    return this.roomCode;
  }

  connectSimulatedPlayer2() {
    this.networkManager.connection.connect();
    this.networkManager.chat.addSystemMessage('OPPONENT DETECTED: Player 2 synched to slot.');
    setTimeout(() => {
      this.networkManager.chat.receiveChatMessage('P2_GUEST', 'Connection synced. Decryption core ready.');
    }, 800);
  }

  joinRoom(code) {
    if (!code || code.length !== 6) return false;
    this.roomCode = code.toUpperCase();
    this.isHost = false;
    this.p1Ready = false;
    this.p2Ready = false;
    this.networkManager.chat.clearChat();

    this.networkManager.connection.connect();
    this.networkManager.chat.addSystemMessage(`CONNECTED TO LOBBY ROOM: ${this.roomCode}`);
    
    setTimeout(() => {
      this.networkManager.chat.receiveChatMessage('HOST_P1', 'System active. Set your ready check.');
    }, 1200);

    return true;
  }

  setReady(playerNum, status) {
    // STRICT RULE: Cannot ready up or start unless Player 2 is actively connected!
    if (!this.networkManager.connection.isConnected) {
      this.p1Ready = false;
      this.p2Ready = false;
      this.networkManager.chat.addSystemMessage('CANNOT START MATCH: Player 2 has not joined the room! Game launch is locked until Player 2 connects.');
      return;
    }

    if (playerNum === 1) {
      this.p1Ready = status;
      this.networkManager.sendPacket({ type: 'ready', value: status });
    } else {
      this.p2Ready = status;
    }

    if (this.p1Ready && this.p2Ready) {
      this.startCountdown();
    }
  }

  startCountdown() {
    this.networkManager.chat.addSystemMessage('BREACH COMMITTED... Synchronizing timelines.');
    let count = 3;

    const interval = setInterval(() => {
      const overlay = document.getElementById('mp-countdown-overlay');
      const numEl = document.getElementById('mp-countdown-number');

      if (!this.p1Ready || !this.p2Ready) {
        clearInterval(interval);
        this.networkManager.chat.addSystemMessage('SYNC ABORTED: Ready status revoked.');
        if (overlay) {
          overlay.classList.remove('active-screen');
          overlay.classList.add('hidden');
        }
        return;
      }

      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('active-screen');
      }
      if (numEl) {
        numEl.innerText = count > 0 ? count : 'GO!';
      }

      if (count === 0) {
        clearInterval(interval);
        setTimeout(() => {
          if (overlay) {
            overlay.classList.remove('active-screen');
            overlay.classList.add('hidden');
          }
          // Launch game engine
          if (window.game) {
            window.game.startMultiplayerGame();
          }
        }, 800);
      }
      count--;
    }, 1000);
  }
}

class MessageHandler {
  constructor(networkManager) {
    this.networkManager = networkManager;
    this.chatLog = [];
  }

  clearChat() {
    this.chatLog = [];
    this.networkManager.triggerChatUpdate();
  }

  sendChatMessage(message) {
    if (!message.trim()) return;
    const sender = this.networkManager.rooms.isHost ? 'P1_HOST' : 'P2_GUEST';
    this.chatLog.push({ sender, text: message });
    this.networkManager.triggerChatUpdate();

    this.networkManager.sendPacket({ type: 'chat', text: message });

    // Simulate peer responses randomly
    if (Math.random() > 0.4) {
      setTimeout(() => {
        const replies = [
          'Copy that. Let\'s overload the firewall.',
          'Understood. Watch out for the buzzsaws.',
          'Sync clear. Heading to upper levels.',
          'Let\'s breach.',
          'Triple combos active!'
        ];
        const text = replies[Math.floor(Math.random() * replies.length)];
        this.receiveChatMessage(this.networkManager.rooms.isHost ? 'P2_GUEST' : 'P1_HOST', text);
      }, 1500);
    }
  }

  receiveChatMessage(sender, text) {
    this.chatLog.push({ sender, text });
    this.networkManager.triggerChatUpdate();
  }

  addSystemMessage(text) {
    this.chatLog.push({ sender: 'SYSTEM', text });
    this.networkManager.triggerChatUpdate();
  }
}

class PlayerSync {
  constructor(networkManager) {
    this.networkManager = networkManager;
    this.opponentState = {
      x: 150,
      y: 350,
      vx: 0,
      vy: 0,
      slideTimer: 0,
      dashTimer: 0,
      isGrounded: true,
      jumpCount: 0,
      score: 0,
      isDead: false
    };
  }

  receiveState(packet) {
    this.opponentState = packet;
  }
}

class ReconnectManager {
  constructor(networkManager) {
    this.networkManager = networkManager;
  }

  triggerAutoReconnect() {
    this.networkManager.chat.addSystemMessage('Attempting link recovery...');
    setTimeout(() => {
      this.networkManager.connection.connect();
      this.networkManager.chat.addSystemMessage('CONNECTION RE-ESTABLISHED.');
      
      const mpDisconnect = document.getElementById('mp-disconnect-view');
      const mpLobby = document.getElementById('mp-lobby-view');
      if (mpDisconnect) mpDisconnect.classList.add('hidden');
      if (mpLobby) mpLobby.classList.remove('hidden');
    }, 1500);
  }
}

// Unified Networking Facade
class NetworkManager {
  constructor() {
    this.connection = new ConnectionManager(this);
    this.rooms = new RoomManager(this);
    this.chat = new MessageHandler(this);
    this.sync = new PlayerSync(this);
    this.reconnect = new ReconnectManager(this);

    this.chatCallbacks = [];
    this.connectionCallbacks = [];
  }

  // Getters for legacy compatibility
  get roomCode() { return this.rooms.roomCode; }
  get isConnected() { return this.connection.isConnected; }
  get isHost() { return this.rooms.isHost; }
  get p1Ready() { return this.rooms.p1Ready; }
  get p2Ready() { return this.rooms.p2Ready; }
  get latency() { return this.connection.latency; }
  get opponentState() { return this.sync.opponentState; }
  get chatLog() { return this.chat.chatLog; }

  createRoom() {
    return this.rooms.createRoom();
  }

  connectSimulatedPlayer2() {
    this.rooms.connectSimulatedPlayer2();
  }

  joinRoom(code) {
    return this.rooms.joinRoom(code);
  }

  setReady(playerNum, status) {
    this.rooms.setReady(playerNum, status);
  }

  sendChatMessage(message) {
    this.chat.sendChatMessage(message);
  }

  sendPacket(data) {
    // low-level packet dispatch hooks
  }

  receiveStatePacket(packet) {
    this.sync.receiveState(packet);
  }

  disconnect() {
    this.connection.disconnect();
  }

  simulateDisconnect() {
    this.connection.simulateDisconnect();
  }

  onChatUpdate(callback) { this.chatCallbacks.push(callback); }
  onConnectionChange(callback) { this.connectionCallbacks.push(callback); }

  triggerChatUpdate() {
    this.chatCallbacks.forEach(cb => cb(this.chat.chatLog));
  }

  triggerConnectionChange(state) {
    this.connectionCallbacks.forEach(cb => cb(state));
  }

  triggerLobbyUpdate() {
    const r1 = document.getElementById('ready-p1');
    const r2 = document.getElementById('ready-p2');
    if (r1) r1.innerText = this.rooms.p1Ready ? 'READY' : 'NOT READY';
    if (r1) r1.className = this.rooms.p1Ready ? 'ready-status green-glow' : 'ready-status text-red';
    
    if (r2) r2.innerText = this.rooms.p2Ready ? 'READY' : 'NOT READY';
    if (r2) r2.className = this.rooms.p2Ready ? 'ready-status green-glow' : 'ready-status text-red';
  }
}

window.multiplayer = new NetworkManager();
window.NetworkManager = NetworkManager;
window.ConnectionManager = ConnectionManager;
window.RoomManager = RoomManager;
window.MessageHandler = MessageHandler;
window.PlayerSync = PlayerSync;
window.ReconnectManager = ReconnectManager;
