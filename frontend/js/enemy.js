// Cooperating Security Enemy AI for Cyber Dash: Genesis

class Enemy {
  constructor(canvasWidth, trackY, type) {
    this.x = canvasWidth + 100;
    this.trackY = trackY;
    this.type = type; // sniper, dog, heavy_guard
    this.width = 30;
    this.height = 50;
    this.y = trackY - this.height;
    this.active = true;
    this.hp = 20;
    this.maxHp = 20;
    
    this.phase = Math.random() * Math.PI;
    this.color = window.COLORS.RED;
    this.projectiles = []; // Projectiles fired by enemy
    this.aimLaser = 0; // target line alpha
    
    // Adaptive AI State Checks
    this.antiAirActive = false;
    this.laneBlockActive = false;

    this.init();
  }

  init() {
    switch (this.type) {
      case 'sniper':
        this.width = 24;
        this.height = 54;
        this.y = this.trackY - this.height;
        this.color = window.COLORS.RED;
        this.hp = 15;
        this.maxHp = 15;
        break;
      case 'dog':
        this.width = 38;
        this.height = 24;
        this.y = this.trackY - this.height;
        this.color = window.COLORS.PINK;
        this.hp = 20;
        this.maxHp = 20;
        break;
      case 'heavy_guard':
        this.width = 45;
        this.height = 70;
        this.y = this.trackY - this.height;
        this.color = window.COLORS.PURPLE;
        this.hp = 50;
        this.maxHp = 50;
        break;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    window.audio.playHit();
    window.particles.spawn(this.x + this.width/2, this.y + this.height/2, window.COLORS.YELLOW, 6, 'spark');

    if (this.hp <= 0) {
      this.active = false;
      window.audio.playExplosion();
      window.particles.spawn(this.x + this.width/2, this.y + this.height/2, this.color, 12, 'explosion', 0.6);
      
      // Award XP
      if (window.progression) {
        // Gain XP based on enemy type
        const xpEarned = this.type === 'heavy_guard' ? 40 : 20;
        window.progression.gainXp(xpEarned);
      }
    }
  }

  update(worldSpeed, player, activeProjectilesPool) {
    if (!this.active) return;

    // Scroll left
    this.x -= worldSpeed;
    this.phase += 0.05;

    // 1. ADAPTIVE AI LOGIC
    // Check player stats history: if player jumps frequently, activate anti-air; if dashes frequently, lane block
    if (player.stats.jumps > 8) {
      this.antiAirActive = true;
    }
    if (player.stats.dashes > 6) {
      this.laneBlockActive = true;
    }

    // 2. SPECIFIC TYPE ACTION LOOPS
    if (this.type === 'dog') {
      // Robotic dog runs left/right dynamically to intercept
      const interceptSpeed = 2 + Math.sin(this.phase) * 1.5;
      this.x -= interceptSpeed;
    } else if (this.type === 'sniper') {
      // Snipers draw aiming lines to player and shoot heavy pulses
      if (this.x < window.innerWidth && this.x > player.x) {
        this.aimLaser = Math.min(1.0, this.aimLaser + 0.015);
        if (this.aimLaser >= 1.0) {
          // Shoot!
          this.aimLaser = 0.0;
          window.audio.playLaser();
          // Aim target Y: if anti-air is active and player is high, aim high; else aim chest
          const targetY = (this.antiAirActive && player.y < this.trackY - 80) ? player.y + 10 : this.trackY - 30;
          const dy = targetY - (this.y + 12);
          const dx = player.x - this.x;
          const dist = Math.sqrt(dx*dx + dy*dy);

          activeProjectilesPool.push({
            x: this.x,
            y: this.y + 12,
            vx: 8.5, // fly speed
            vy: (dy / dist) * 8.5,
            size: 6,
            color: window.COLORS.RED,
            active: true
          });
        }
      }
    } else if (this.type === 'heavy_guard') {
      // Heavy guards deploy lane blocking shields if player dashes often
      if (this.laneBlockActive && this.x < window.innerWidth && Math.random() > 0.99 && activeProjectilesPool.length < 5) {
        // Deploy a laser beam barrier directly forward
        window.audio.playLaser();
        activeProjectilesPool.push({
          x: this.x,
          y: this.trackY - 24,
          vx: 5,
          vy: 0,
          size: 10,
          color: window.COLORS.PINK,
          active: true
        });
      }
    }
  }

  draw(ctx, quality = 'medium') {
    if (!this.active) return;

    const isHigh = quality === 'high';
    ctx.save();

    if (isHigh) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }

    // Health Bar overhead
    if (this.hp < this.maxHp) {
      ctx.fillStyle = '#444';
      ctx.fillRect(this.x, this.y - 8, this.width, 3);
      ctx.fillStyle = window.COLORS.RED;
      ctx.fillRect(this.x, this.y - 8, (this.hp / this.maxHp) * this.width, 3);
    }

    switch (this.type) {
      case 'sniper':
        // Robot sniper posture
        ctx.fillStyle = '#111';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, [4]);
        ctx.fill();
        ctx.stroke();

        // Gun barrel
        ctx.fillRect(this.x - 12, this.y + 12, 12, 6);

        // Aiming laser guide line
        if (this.aimLaser > 0 && this.x < window.innerWidth) {
          ctx.strokeStyle = `rgba(255, 0, 85, ${this.aimLaser * 0.4})`;
          ctx.lineWidth = 1.0;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(this.x, this.y + 15);
          // Laser beam aims directly leftwards
          ctx.lineTo(0, this.y + 15);
          ctx.stroke();
        }
        break;

      case 'dog':
        // Cyber quadruped hound shapes
        ctx.fillStyle = '#1e1e24';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Body cylinder
        ctx.roundRect(this.x, this.y + 4, this.width, this.height - 8, [5]);
        ctx.fill();
        ctx.stroke();

        // Visor eye glowing pink
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 2, this.y + 6, 8, 2);

        // Legs running
        const swing = Math.sin(this.phase * 5) * 5;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y + this.height - 4);
        ctx.lineTo(this.x + 8 + swing, this.y + this.height + 4);
        ctx.moveTo(this.x + this.width - 8, this.y + this.height - 4);
        ctx.lineTo(this.x + this.width - 8 - swing, this.y + this.height + 4);
        ctx.stroke();
        break;

      case 'heavy_guard':
        // Large robotic chassis
        ctx.fillStyle = '#222';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, [8]);
        ctx.fill();
        ctx.stroke();

        // Massive shield arm plates
        ctx.fillStyle = '#111';
        ctx.fillRect(this.x - 6, this.y + 10, 8, this.height - 20);
        ctx.strokeRect(this.x - 6, this.y + 10, 8, this.height - 20);
        break;
    }

    ctx.restore();
  }
}

window.Enemy = Enemy;
