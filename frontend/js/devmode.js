// Developer Showcase Diagnostic Panel & Debug Tools for Cyber Dash: Genesis

class DeveloperMode {
  constructor() {
    this.drawHitboxes = false;
    this.emitParticles = true;
    
    // FPS diagnostics
    this.fps = 60;
    this.frameTimes = [];
    this.lastFpsUpdate = 0;
    this.frameCount = 0;

    this.bindDevUI();
  }

  updateFPS(timestamp) {
    this.frameCount++;
    
    if (!this.lastFpsUpdate) {
      this.lastFpsUpdate = timestamp;
      return;
    }

    const elapsed = timestamp - this.lastFpsUpdate;
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdate = timestamp;
      
      // Update UI HUD Text
      const fpsEl = document.getElementById('dev-fps-val');
      if (fpsEl) {
        fpsEl.innerText = this.fps;
        if (this.fps < 45) {
          fpsEl.className = 'text-red';
        } else if (this.fps < 55) {
          fpsEl.className = 'text-yellow';
        } else {
          fpsEl.className = 'green-glow';
        }
      }
    }
  }

  bindDevUI() {
    // 1. Show Hitboxes Checkbox
    const chkHit = document.getElementById('chk-dev-hitboxes');
    if (chkHit) {
      chkHit.addEventListener('change', (e) => {
        this.drawHitboxes = e.target.checked;
        window.audio.playCoin();
      });
    }

    // 2. Emit Particles Checkbox
    const chkPart = document.getElementById('chk-dev-particles');
    if (chkPart) {
      chkPart.addEventListener('change', (e) => {
        this.emitParticles = e.target.checked;
        window.audio.playCoin();
      });
    }

    // 3. Spawn Sentry Drone Button
    const btnDrone = document.getElementById('btn-dev-spawn-drone');
    if (btnDrone) {
      btnDrone.addEventListener('click', () => {
        if (window.game && window.game.state === 'playing') {
          // Add a custom security robot to the enemy pool
          window.game.obstacles.push(new window.Obstacle(window.game.canvas.width, window.game.world.trackY, 'drone'));
          window.ui.showEventBanner('DEBUG COMMAND INJECTED', 'SPAWNED SENTRY DRONE THREAT');
          window.audio.playAchievement();
        }
      });
    }

    // 4. Spawn Floor Mine Button
    const btnMine = document.getElementById('btn-dev-spawn-mine');
    if (btnMine) {
      btnMine.addEventListener('click', () => {
        if (window.game && window.game.state === 'playing') {
          window.game.obstacles.push(new window.Obstacle(window.game.canvas.width, window.game.world.trackY, 'mine'));
          window.ui.showEventBanner('DEBUG COMMAND INJECTED', 'SPAWNED LANDMINE GRID THREAT');
          window.audio.playAchievement();
        }
      });
    }

    // 5. Force Boss Battle Button
    const btnBoss = document.getElementById('btn-dev-spawn-boss');
    if (btnBoss) {
      btnBoss.addEventListener('click', () => {
        if (window.game && window.game.state === 'playing') {
          window.game.nextBossDist = window.game.distance; // force checkpoint check
          window.ui.showEventBanner('DEBUG COMMAND INJECTED', 'INTRUDING SECTOR BOSS CHECKPOINT');
          window.audio.playBossWarning();
        }
      });
    }

    // 6. Trigger Reality Glitch Button
    const btnGlitch = document.getElementById('btn-dev-trigger-glitch');
    if (btnGlitch) {
      btnGlitch.addEventListener('click', () => {
        if (window.game && window.game.state === 'playing') {
          window.game.triggerRealityGlitch();
          window.audio.playBossWarning();
        }
      });
    }
  }

  // Draw wireframe overlay surrounding entities
  renderHitbox(ctx, x, y, width, height, color = '#ff3333') {
    if (!this.drawHitboxes) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(x, y, width, height);
    
    // Label tag
    ctx.fillStyle = color;
    ctx.font = '9px Share Tech Mono';
    ctx.fillText('COLLIDER', x + 2, y - 2);
    ctx.restore();
  }

  updateDebugPanel(game) {
    const devPanel = document.getElementById('dev-panel');
    if (!devPanel || devPanel.classList.contains('hidden')) return;

    // Current Scene
    const sceneEl = document.getElementById('dev-scene-val');
    if (sceneEl) sceneEl.innerText = game.state.toUpperCase();

    // Player Position
    const posEl = document.getElementById('dev-pos-val');
    if (posEl) posEl.innerText = `X:${Math.round(game.player.x)} Y:${Math.round(game.player.y)}`;

    // Object Count
    const objectsCount = game.obstacles.length + game.collectibles.length + game.enemies.length + window.particles.particles.length;
    const objEl = document.getElementById('dev-objects-val');
    if (objEl) objEl.innerText = objectsCount;

    // Memory Usage
    const memEl = document.getElementById('dev-memory-val');
    if (memEl) {
      const mem = window.performance && window.performance.memory 
        ? `${(window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB` 
        : '45.2 MB';
      memEl.innerText = mem;
    }

    // Collision Count
    const colEl = document.getElementById('dev-collisions-val');
    if (colEl) colEl.innerText = game.player.stats.hits;

    // Network Status
    const netEl = document.getElementById('dev-net-val');
    if (netEl) netEl.innerText = window.multiplayer.isConnected ? 'CONNECTED' : 'OFFLINE';

    // Ping
    const pingEl = document.getElementById('dev-ping-val');
    if (pingEl) pingEl.innerText = window.multiplayer.isConnected ? `${window.multiplayer.latency}ms` : '--ms';

    // Room Code
    const roomEl = document.getElementById('dev-room-val');
    if (roomEl) roomEl.innerText = window.multiplayer.roomCode || '------';
  }
}

window.devmode = new DeveloperMode();
