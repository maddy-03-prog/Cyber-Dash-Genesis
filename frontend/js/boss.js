// Boss Battles Module for Cyber Dash

// Base Boss class
class Boss {
  constructor(canvasWidth, trackY, type = 'drone_boss') {
    this.canvasWidth = canvasWidth;
    this.trackY = trackY;
    this.type = type; // drone_boss, tank_boss
    
    // Core attributes
    this.x = canvasWidth + 200;
    this.y = 150;
    this.width = 120;
    this.height = 120;
    this.hp = 100;
    this.maxHp = 100;
    this.active = false;
    
    // States: entrance, combat, hit, defeated
    this.state = 'entrance';
    this.entranceTimer = 180;
    this.phase = 0;
    
    // Attack timers
    this.attackTimer = 0;
    this.attackCycle = 0;
    this.projectiles = [];
    this.glowingBattery = null;

    this.hitFlash = 0;
    this.color = window.COLORS.RED;

    this.init();
  }

  init() {
    let diffMult = 1.0;
    const currentDiff = (window.storage && window.storage.state && window.storage.state.settings.difficulty) || 'medium';
    if (currentDiff === 'easy') diffMult = 0.6;
    else if (currentDiff === 'hard') diffMult = 1.3;

    if (this.type === 'tank_boss') {
      this.width = 140;
      this.height = 90;
      this.y = this.trackY - this.height;
      this.maxHp = Math.round(140 * diffMult);
      this.hp = this.maxHp;
    } else {
      this.width = 110;
      this.height = 110;
      this.y = 100;
      this.maxHp = Math.round(100 * diffMult);
      this.hp = this.maxHp;
    }
  }

  triggerBossEntrance() {
    this.active = true;
    this.state = 'entrance';
    this.entranceTimer = 180;
    this.hp = this.maxHp;
    this.x = this.canvasWidth + 200;
    this.projectiles = [];
    window.audio.playBossWarning();
  }

  takeDamage(amount) {
    if (this.state === 'defeated' || this.state === 'entrance') return;

    this.hp -= amount;
    this.hitFlash = 10;
    window.audio.playHit();
    window.particles.spawn(this.x + this.width / 4, this.y + this.height / 2, window.COLORS.YELLOW, 12, 'spark');

    if (this.hp <= 0) {
      this.hp = 0;
      this.state = 'defeated';
      this.entranceTimer = 120;
    }
  }

  update(player, worldSpeed) {
    if (!this.active) return;

    this.phase += 0.04;
    if (this.hitFlash > 0) this.hitFlash--;

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x -= proj.vx;
      proj.y += proj.vy;
      
      if (proj.active && this.checkProjCollision(proj, player)) {
        player.takeDamage(15);
        proj.active = false;
      }
      
      if (proj.x < -50 || proj.x > this.canvasWidth + 100) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update Battery/EMP cells
    if (this.glowingBattery) {
      this.glowingBattery.x -= worldSpeed;
      if (this.glowingBattery.x < -50) {
        this.glowingBattery = null;
      }
    }

    // STATE MACHINE
    switch (this.state) {
      case 'entrance':
        const targetX = this.canvasWidth - 180;
        this.x += (targetX - this.x) * 0.04;
        
        if (this.type === 'drone_boss') {
          this.y = 120 + Math.sin(this.phase) * 15;
        }

        this.entranceTimer--;
        if (this.entranceTimer <= 0) {
          this.state = 'combat';
          this.attackTimer = 90;
        }
        break;

      case 'combat':
        if (this.type === 'drone_boss') {
          this.y = 130 + Math.sin(this.phase * 1.5) * 35;
          this.x = (this.canvasWidth - 180) + Math.cos(this.phase) * 30;
        } else {
          this.y = this.trackY - this.height;
          this.x = (this.canvasWidth - 180) + Math.cos(this.phase * 0.8) * 15;
        }

        if (!this.glowingBattery && Math.random() > 0.99) {
          this.glowingBattery = {
            x: this.canvasWidth + 100,
            y: this.trackY - 24,
            size: 16
          };
        }

        this.attackTimer--;
        if (this.attackTimer <= 0) {
          this.executeAttack();
          this.attackTimer = 180 - (this.type === 'tank_boss' ? 30 : 0);
        }

        if (player.dashTimer > 0) {
          const distance = Math.abs((player.x + player.width) - this.x);
          const yDiff = player.y < this.y + this.height && player.y + player.height > this.y;
          if (distance < 40 && yDiff) {
            this.takeDamage(12);
            player.vx = -12;
            player.dashTimer = 0;
            window.particles.spawn(player.x + player.width, player.y + player.height/2, window.COLORS.PINK, 15, 'explosion');
          }
        } else {
          const distance = Math.abs((player.x + player.width) - this.x);
          const yDiff = player.y < this.y + this.height && player.y + player.height > this.y;
          if (distance < 30 && yDiff) {
            player.takeDamage(15);
            player.vx = -8; // knock back
            window.particles.spawn(player.x + player.width, player.y + player.height/2, window.COLORS.RED, 10, 'spark');
          }
        }
        break;

      case 'defeated':
        this.entranceTimer--;
        
        if (this.type === 'drone_boss') {
          this.y += 0.8;
          this.x -= 0.5;
        }
        
        if (this.entranceTimer % 5 === 0) {
          window.audio.playHit();
          window.particles.spawn(
            this.x + Math.random() * this.width, 
            this.y + Math.random() * this.height, 
            window.COLORS.RED, 6, 'explosion', 0.5
          );
        }

        if (this.entranceTimer <= 0) {
          window.audio.playExplosion();
          window.particles.spawn(this.x + this.width / 2, this.y + this.height / 2, window.COLORS.YELLOW, 45, 'explosion', 1.5);
          window.particles.spawn(this.x + this.width / 2, this.y + this.height / 2, window.COLORS.CYAN, 30, 'spark', 1.5);
          
          this.active = false;
          return 'victory';
        }
        break;
    }

    if (this.glowingBattery && this.checkBatteryCollect(player)) {
      this.glowingBattery = null;
      window.audio.playCoin();
      this.launchEMPSeekingShot(player);
    }
  }

  executeAttack() {
    if (this.type === 'drone_boss') {
      this.attackCycle = (this.attackCycle + 1) % 3;
      if (this.attackCycle === 0) {
        window.audio.playLaser();
        this.projectiles.push({ x: this.x, y: this.y + 30, vx: 9, vy: 0, size: 8, color: window.COLORS.RED, active: true });
        this.projectiles.push({ x: this.x, y: this.y + 60, vx: 9, vy: 1, size: 8, color: window.COLORS.RED, active: true });
        this.projectiles.push({ x: this.x, y: this.y + 90, vx: 9, vy: -1, size: 8, color: window.COLORS.RED, active: true });
      } else if (this.attackCycle === 1) {
        window.audio.playLaser();
        this.projectiles.push({ x: this.x, y: this.y + 60, vx: 7, vy: 1.5, size: 12, color: window.COLORS.PURPLE, active: true });
        this.projectiles.push({ x: this.x, y: this.y + 60, vx: 7, vy: -1.5, size: 12, color: window.COLORS.PURPLE, active: true });
      } else {
        window.audio.playLaser();
        this.projectiles.push({ x: this.x, y: this.trackY - 20, vx: 6.5, vy: 0, size: 14, color: window.COLORS.PINK, active: true });
      }
    } else {
      this.attackCycle = (this.attackCycle + 1) % 2;
      if (this.attackCycle === 0) {
        window.audio.playLaser();
        this.projectiles.push({ x: this.x, y: this.y + 15, vx: 8, vy: -4, size: 16, color: window.COLORS.YELLOW, active: true, gravity: 0.15 });
        this.projectiles.push({ x: this.x, y: this.y + 15, vx: 9.5, vy: -4.8, size: 16, color: window.COLORS.YELLOW, active: true, gravity: 0.15 });
      } else {
        window.audio.playLaser();
        this.projectiles.push({ x: this.x, y: this.trackY - 30, vx: 7, vy: 0, size: 10, color: window.COLORS.RED, active: true });
        this.projectiles.push({ x: this.x, y: this.trackY - 80, vx: 7, vy: 0, size: 10, color: window.COLORS.RED, active: true });
      }
    }
  }

  launchEMPSeekingShot(player) {
    const startX = player.x + player.width;
    const startY = player.y + player.height / 2;
    
    let seekerX = startX;
    let seekerY = startY;
    
    const steps = 24;
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        if (!this.active) return;
        const progress = i / steps;
        const currentX = startX + (this.x - startX) * progress;
        const currentY = startY + (this.y + this.height/2 - startY) * progress - Math.sin(progress * Math.PI) * 120;
        
        window.particles.spawn(currentX, currentY, window.COLORS.CYAN, 3, 'spark', 0.5);
        
        if (i === steps - 1) {
          this.takeDamage(20);
        }
      }, i * 20);
    }
  }

  checkProjCollision(proj, player) {
    const pLeft = player.x;
    const pRight = player.x + player.width;
    const pTop = player.y;
    const pBottom = player.y + player.height;

    const projRadius = proj.size;
    const projX = proj.x;
    const projY = proj.y;

    return (projX + projRadius > pLeft && projX - projRadius < pRight &&
            projY + projRadius > pTop && projY - projRadius < pBottom);
  }

  checkBatteryCollect(player) {
    const pLeft = player.x;
    const pRight = player.x + player.width;
    const pTop = player.y;
    const pBottom = player.y + player.height;

    const bat = this.glowingBattery;
    return (bat.x + bat.size > pLeft && bat.x < pRight &&
            bat.y + bat.size > pTop && bat.y < pBottom);
  }

  draw(ctx, quality = 'medium') {
    if (!this.active) return;

    const isHighQuality = quality === 'high';
    ctx.save();

    if (this.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
      if (isHighQuality) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
      }
    } else {
      ctx.fillStyle = '#181824';
      if (isHighQuality) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
      }
    }

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;

    if (this.type === 'drone_boss') {
      ctx.beginPath();
      ctx.moveTo(this.x + 20, this.y);
      ctx.lineTo(this.x + this.width - 20, this.y);
      ctx.lineTo(this.x + this.width, this.y + 30);
      ctx.lineTo(this.x + this.width, this.y + this.height - 30);
      ctx.lineTo(this.x + this.width - 20, this.y + this.height);
      ctx.lineTo(this.x + 20, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height - 30);
      ctx.lineTo(this.x, this.y + 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const eyeColor = this.state === 'defeated' ? '#555' : window.COLORS.RED;
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.roundRect(this.x + 20, this.y + 45, this.width - 40, 25, [6]);
      ctx.fill();

      if (this.state !== 'defeated') {
        const scanX = this.x + 30 + Math.abs(Math.sin(this.phase * 3)) * (this.width - 70);
        ctx.fillStyle = '#fff';
        ctx.fillRect(scanX, this.y + 48, 8, 19);
      }

      ctx.fillStyle = '#222';
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.roundRect(this.x - 20, this.y + 20, 20, 60, [4]);
      ctx.roundRect(this.x + this.width, this.y + 20, 20, 60, [4]);
      ctx.fill();
      ctx.stroke();

      if (this.state !== 'defeated') {
        ctx.fillStyle = window.COLORS.PINK;
        ctx.fillRect(this.x - 18, this.y + 80 + Math.sin(this.phase * 10) * 5, 12, 10);
        ctx.fillRect(this.x + this.width + 6, this.y + 80 + Math.sin(this.phase * 10) * 5, 12, 10);
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x + 25, this.y);
      ctx.lineTo(this.x + this.width - 20, this.y);
      ctx.lineTo(this.x + this.width, this.y + 40);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.lineTo(this.x, this.y + 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#111';
      ctx.fillRect(this.x - 40, this.y + 25, 45, 16);
      ctx.strokeStyle = this.color;
      ctx.strokeRect(this.x - 40, this.y + 25, 45, 16);

      ctx.fillStyle = '#111';
      ctx.fillRect(this.x + 10, this.y + this.height - 20, this.width - 20, 16);
      ctx.strokeStyle = this.color;
      ctx.strokeRect(this.x + 10, this.y + this.height - 20, this.width - 20, 16);
      
      ctx.fillStyle = this.color;
      const slotCount = 6;
      for (let i = 0; i < slotCount; i++) {
        const offset = (this.phase * 20 + (i * (this.width / slotCount))) % (this.width - 30);
        ctx.fillRect(this.x + 15 + offset, this.y + this.height - 18, 4, 12);
      }
    }

    ctx.restore();
    
    ctx.save();
    for (let i = 0; i < this.projectiles.length; i++) {
      const proj = this.projectiles[i];
      if (!proj.active) continue;

      if (isHighQuality) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = proj.color;
      }
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (this.glowingBattery) {
      ctx.save();
      const bat = this.glowingBattery;
      
      if (isHighQuality) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = window.COLORS.CYAN;
      }
      
      ctx.fillStyle = '#112233';
      ctx.strokeStyle = window.COLORS.CYAN;
      ctx.lineWidth = 2.5;
      
      ctx.save();
      ctx.translate(bat.x + bat.size / 2, bat.y + bat.size / 2);
      ctx.rotate(this.phase * 2);
      
      ctx.beginPath();
      ctx.roundRect(-bat.size/2, -bat.size/2, bat.size, bat.size, [4]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = window.COLORS.CYAN;
      ctx.beginPath();
      ctx.arc(0, 0, 4 + Math.sin(this.phase * 5) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }
  }
}

// ==========================================
//  CAMPAIGN BOSS — Multi-Phase Giant Bosses
// ==========================================

class CampaignBoss extends Boss {
  constructor(canvasWidth, trackY, bossType) {
    super(canvasWidth, trackY, bossType === 'mega_drone' ? 'drone_boss' : 'tank_boss');
    this.bossType    = bossType;
    this.combatPhase = 1;    // Which phase we're in (1-4)
    this.maxPhases   = 2;    // Most bosses have 2 phases; NEXUS PRIME has 4
    this.phaseHpThresholds = [0.5]; // HP% where phase changes happen
    this.weakPoint   = null; // Exposed weak point state

    this.initBossType();
  }

  initBossType() {
    let diffMult = 1.0;
    const diff = (window.storage && window.storage.state.settings.difficulty) || 'medium';
    if (diff === 'easy') diffMult = 0.65;
    if (diff === 'hard') diffMult = 1.35;

    const configs = {
      mega_drone:      { w: 130, h: 130, y: 80,              hp: 120, color: '#00f3ff', phases: 2, thresholds: [0.5] },
      traffic_warden:  { w: 160, h: 110, y: null,            hp: 150, color: '#ff007f', phases: 2, thresholds: [0.5] },
      laser_spider:    { w: 150, h: 150, y: null,            hp: 160, color: '#ffcc00', phases: 2, thresholds: [0.6] },
      titan_mech:      { w: 180, h: 200, y: null,            hp: 220, color: '#ff6600', phases: 3, thresholds: [0.66, 0.33] },
      cyber_worm:      { w: 200, h: 80,  y: null,            hp: 200, color: '#3399ff', phases: 2, thresholds: [0.5] },
      gravity_hawk:    { w: 160, h: 140, y: 60,              hp: 190, color: '#00ccff', phases: 2, thresholds: [0.5] },
      quantum_ghost:   { w: 120, h: 160, y: 80,              hp: 180, color: '#00ff88', phases: 3, thresholds: [0.66, 0.33] },
      ice_colossus:    { w: 200, h: 220, y: null,            hp: 260, color: '#88ccff', phases: 2, thresholds: [0.5] },
      reality_ripper:  { w: 150, h: 150, y: 70,              hp: 240, color: '#bd00ff', phases: 3, thresholds: [0.66, 0.33] },
      nexus_titan:     { w: 220, h: 250, y: null,            hp: 320, color: '#ff0040', phases: 3, thresholds: [0.66, 0.33] },
      nexus_prime:     { w: 300, h: 300, y: 20,              hp: 500, color: '#ffffff', phases: 4, thresholds: [0.75, 0.5, 0.25] }
    };

    const cfg = configs[this.bossType] || configs.mega_drone;
    this.width    = cfg.w;
    this.height   = cfg.h;
    this.y        = cfg.y !== null ? cfg.y : (this.trackY - cfg.h);
    this.maxHp    = Math.round(cfg.hp * diffMult);
    this.hp       = this.maxHp;
    this.color    = cfg.color;
    this.maxPhases = cfg.phases;
    this.phaseHpThresholds = cfg.thresholds;

    // Boss HUD name update
    const bossNameEl = document.getElementById('boss-name');
    if (bossNameEl && window.STAGE_BOSS_TYPES) {
      const stageId = Object.keys(window.STAGE_BOSS_TYPES).find(k => window.STAGE_BOSS_TYPES[k] === this.bossType);
      const stage = stageId && window.story && window.story.getStage(parseInt(stageId));
      if (stage) bossNameEl.innerText = stage.bossName || this.bossType.toUpperCase();
    }
  }

  takeDamage(amount) {
    if (this.state === 'defeated' || this.state === 'entrance') return;

    this.hp -= amount;
    this.hitFlash = 10;
    window.audio.playHit();
    window.particles.spawn(this.x + this.width / 4, this.y + this.height / 2, window.COLORS.YELLOW, 12, 'spark');

    // Check phase transitions
    const hpRatio = this.hp / this.maxHp;
    this.phaseHpThresholds.forEach((threshold, i) => {
      if (hpRatio <= threshold && this.combatPhase <= i + 1) {
        this.combatPhase = i + 2;
        this.onPhaseTransition(this.combatPhase);
      }
    });

    if (this.hp <= 0) {
      this.hp = 0;
      this.state = 'defeated';
      this.entranceTimer = 150;
      window.particles.spawn(this.x + this.width / 2, this.y + this.height / 2, this.color, 40, 'explosion', 2.0);

      // Track phase count for grade system
      if (window.game) {
        window.game.campaignRunData = window.game.campaignRunData || {};
        window.game.campaignRunData.phasesDefeated = this.maxPhases;
        window.game.campaignRunData.bossKilled = true;
      }
    }
  }

  onPhaseTransition(newPhase) {
    // Flash the screen
    window.ui && window.ui.showEventBanner(
      `PHASE ${newPhase} ACTIVATED`,
      `${this.bossType.toUpperCase().replace('_', ' ')} HAS EVOLVED`
    );
    window.audio.playBossWarning();
    // Burst particles on phase change
    window.particles.spawn(this.x + this.width / 2, this.y + this.height / 2, this.color, 30, 'explosion', 1.2);
    // Expose weak point
    this.weakPoint = { x: this.x + this.width * 0.5, y: this.y + this.height * 0.4, r: 18, flash: 60 };
  }

  executeAttack() {
    // Phase-scaled attack patterns
    const speed = 7 + this.combatPhase * 1.5;
    const count = this.combatPhase;

    switch (this.bossType) {
      case 'mega_drone':
      case 'gravity_hawk':
      case 'quantum_ghost':
        window.audio.playLaser();
        for (let i = 0; i < count + 1; i++) {
          this.projectiles.push({
            x: this.x, y: this.y + 30 + i * 30, vx: speed, vy: (i - 1) * 1.2,
            size: 8 + this.combatPhase * 2, color: this.color, active: true
          });
        }
        break;
      case 'titan_mech':
      case 'nexus_titan':
      case 'ice_colossus':
        window.audio.playLaser();
        // Stomp shockwave — ground projectile
        this.projectiles.push({ x: this.x, y: this.trackY - 18, vx: speed + 2, vy: 0, size: 16 + this.combatPhase * 3, color: this.color, active: true });
        // Air shot
        if (this.combatPhase >= 2) {
          this.projectiles.push({ x: this.x, y: this.y + 20, vx: speed, vy: 2, size: 10, color: this.color, active: true });
        }
        break;
      case 'nexus_prime':
        window.audio.playLaser();
        // Phase 1: laser sweep
        if (this.combatPhase === 1) {
          for (let i = 0; i < 3; i++) {
            this.projectiles.push({ x: this.x, y: this.y + 60 + i * 80, vx: 11, vy: 0, size: 14, color: '#ffffff', active: true });
          }
        } else if (this.combatPhase === 2) {
          // Drone swarm
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              this.projectiles.push({ x: this.x - i * 30, y: this.y + Math.random() * this.height, vx: 9, vy: (Math.random() - 0.5) * 3, size: 10, color: '#00f3ff', active: true });
            }, i * 200);
          }
        } else if (this.combatPhase === 3) {
          // Homing missiles
          for (let i = 0; i < 2; i++) {
            this.projectiles.push({ x: this.x, y: this.y + 80 + i * 100, vx: 6, vy: (Math.random() - 0.5) * 4, size: 12, color: '#ff4400', active: true, homing: true });
          }
        } else {
          // Core exposed — rapid fire
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI - Math.PI / 2;
            this.projectiles.push({ x: this.x + this.width / 2, y: this.y + this.height / 2, vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8, size: 8, color: '#ffcc00', active: true });
          }
        }
        break;
      default:
        super.executeAttack();
    }
  }

  draw(ctx, quality = 'medium') {
    if (!this.active) return;
    const isHigh = quality === 'high';
    ctx.save();

    const flashAlpha = this.hitFlash > 0 ? 1.0 : 0;

    if (isHigh) {
      ctx.shadowBlur  = 20 + this.combatPhase * 5;
      ctx.shadowColor = this.color;
    }

    // Phase-based color shift
    const phaseColors = ['#ffffff00', this.color, this.color + 'cc', '#ff4400'];
    const drawColor   = this.hitFlash > 0 ? '#ffffff' : this.color;

    // Draw large boss body based on type
    this.drawBossBody(ctx, drawColor, isHigh);

    // Weak point indicator
    if (this.weakPoint && this.weakPoint.flash > 0) {
      this.weakPoint.flash--;
      ctx.save();
      const wpPulse = Math.sin(Date.now() / 100) * 4;
      ctx.beginPath();
      ctx.arc(this.weakPoint.x, this.weakPoint.y, this.weakPoint.r + wpPulse, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff0000';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      ctx.fill();
      ctx.restore();
    }

    // Health bar (larger for campaign bosses)
    this.drawBossHealthBar(ctx);

    ctx.restore();

    // Draw projectiles
    ctx.save();
    this.projectiles.forEach(proj => {
      if (!proj.active) return;
      if (isHigh) { ctx.shadowBlur = 12; ctx.shadowColor = proj.color; }
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Draw EMP battery pickup
    if (this.glowingBattery) {
      ctx.save();
      const bat = this.glowingBattery;
      if (isHigh) { ctx.shadowBlur = 12; ctx.shadowColor = window.COLORS.CYAN; }
      ctx.fillStyle = '#112233';
      ctx.strokeStyle = window.COLORS.CYAN;
      ctx.lineWidth = 2.5;
      ctx.save();
      ctx.translate(bat.x + bat.size / 2, bat.y + bat.size / 2);
      ctx.rotate(this.phase * 2);
      ctx.beginPath();
      ctx.roundRect(-bat.size/2, -bat.size/2, bat.size, bat.size, [4]);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = window.COLORS.CYAN;
      ctx.beginPath();
      ctx.arc(0, 0, 4 + Math.sin(this.phase * 5) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();
    }
  }

  drawBossBody(ctx, color, isHigh) {
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff44' : '#101020';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;

    switch (this.bossType) {
      case 'mega_drone':
      case 'gravity_hawk': {
        // Hexagonal drone body
        ctx.beginPath();
        const cx = this.x + this.width / 2, cy = this.y + this.height / 2;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const r = this.width / 2;
          i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                  : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Eye band
        ctx.fillStyle = color;
        ctx.fillRect(this.x + 20, this.y + this.height * 0.4, this.width - 40, 18);
        // Rotor arms
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + this.phase;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * this.width * 0.6, cy + Math.sin(a) * this.height * 0.4);
          ctx.stroke();
        }
        break;
      }
      case 'titan_mech':
      case 'nexus_titan': {
        // Massive bipedal mech
        ctx.beginPath();
        ctx.roundRect(this.x + 20, this.y, this.width - 40, this.height * 0.7, [8]);
        ctx.fill(); ctx.stroke();
        // Head
        ctx.fillStyle = '#101020';
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.roundRect(this.x + 35, this.y - 30, this.width - 70, 40, [6]);
        ctx.fill(); ctx.stroke();
        // Eye visor
        ctx.fillStyle = color;
        ctx.fillRect(this.x + 40, this.y - 20, this.width - 80, 12);
        // Legs
        ctx.fillStyle = '#101020';
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.fillRect(this.x + 25, this.y + this.height * 0.68, 40, this.height * 0.32);
        ctx.strokeRect(this.x + 25, this.y + this.height * 0.68, 40, this.height * 0.32);
        ctx.fillRect(this.x + this.width - 65, this.y + this.height * 0.68, 40, this.height * 0.32);
        ctx.strokeRect(this.x + this.width - 65, this.y + this.height * 0.68, 40, this.height * 0.32);
        // Shoulder cannons
        ctx.fillStyle = '#1a1a30';
        ctx.strokeStyle = color;
        ctx.fillRect(this.x - 25, this.y + 20, 30, 50);
        ctx.strokeRect(this.x - 25, this.y + 20, 30, 50);
        ctx.fillRect(this.x + this.width - 5, this.y + 20, 30, 50);
        ctx.strokeRect(this.x + this.width - 5, this.y + 20, 30, 50);
        // Phase glow on chest
        ctx.fillStyle = `${color}${this.combatPhase > 1 ? 'aa' : '44'}`;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height * 0.3, 20 + Math.sin(this.phase * 3) * 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'laser_spider': {
        // Spider body
        const scx = this.x + this.width / 2, scy = this.y + this.height / 2;
        ctx.beginPath();
        ctx.ellipse(scx, scy, this.width * 0.45, this.height * 0.42, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // 8 legs
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + Math.sin(this.phase + i) * 0.3;
          const legLen = this.width * 0.65;
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(scx + Math.cos(a) * this.width * 0.4, scy + Math.sin(a) * this.height * 0.35);
          ctx.lineTo(scx + Math.cos(a) * legLen, scy + Math.sin(a) * legLen * 0.6 + 20);
          ctx.stroke();
        }
        // Eyes
        ctx.fillStyle = '#ff0000';
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(scx - 25 + i * 16, scy - 15, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'nexus_prime': {
        // Giant AI core — massive glowing sphere + geometric frame
        const pcx = this.x + this.width / 2, pcy = this.y + this.height / 2;
        const pulseR = this.width * 0.45 + Math.sin(this.phase * 2) * 8;
        // Outer ring
        ctx.beginPath();
        ctx.arc(pcx, pcy, pulseR + 20, 0, Math.PI * 2);
        ctx.strokeStyle = `${color}66`;
        ctx.lineWidth = 6;
        ctx.stroke();
        // Core body
        const grad = ctx.createRadialGradient(pcx, pcy, 0, pcx, pcy, pulseR);
        grad.addColorStop(0, `${color}88`);
        grad.addColorStop(0.5, `${color}33`);
        grad.addColorStop(1, `${color}11`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pcx, pcy, pulseR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
        // Rotating geometric frame
        ctx.save();
        ctx.translate(pcx, pcy);
        ctx.rotate(this.phase * 0.8);
        ctx.strokeStyle = `${color}aa`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, pulseR * (0.65 + i * 0.12), 0, Math.PI * 2);
          ctx.setLineDash([8, 8]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Phase core (exposed in phase 4)
        if (this.combatPhase >= 4) {
          ctx.fillStyle = '#ffcc00';
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#ffcc00';
          ctx.beginPath();
          ctx.arc(0, 0, 22 + Math.sin(this.phase * 5) * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        // Eyes (Phase 1-3 closed, Phase 4 wide open)
        const eyeOpen = this.combatPhase >= 2;
        ctx.fillStyle = eyeOpen ? '#ff0000' : '#550000';
        ctx.beginPath();
        ctx.ellipse(pcx - 30, pcy - 20, 14, eyeOpen ? 12 : 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(pcx + 30, pcy - 20, 14, eyeOpen ? 12 : 4, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      default:
        // Generic large boss
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, [12]);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = color;
        ctx.fillRect(this.x + 20, this.y + 30, this.width - 40, 20);
    }
  }

  drawBossHealthBar(ctx) {
    const barW = this.width + 30;
    const barH = 10;
    const barX = this.x - 15;
    const barY = this.y - 22;
    const hpRatio = Math.max(0, this.hp / this.maxHp);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(barX, barY, barW, barH);

    // Phase-colored HP segments
    const phaseColor = this.combatPhase >= 3 ? '#ff4400' : this.combatPhase >= 2 ? '#ffcc00' : this.color;
    ctx.fillStyle = phaseColor;
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    // Phase markers
    this.phaseHpThresholds.forEach(t => {
      const markerX = barX + barW * t;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(markerX - 1, barY - 2, 2, barH + 4);
    });

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
  }
}

window.Boss = Boss;
window.CampaignBoss = CampaignBoss;
