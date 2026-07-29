// AI Drone Companion & Cyber Pets System for Cyber Dash: Genesis

class CompanionSystem {
  constructor() {
    this.equippedDrone = 'medic'; // medic, attack, hacker, collector
    this.equippedPet = 'none';    // none, wolf, fox, phoenix
    
    // Animation phases
    this.hoverPhase = 0;
    this.petRunCycle = 0;

    this.droneLevels = { medic: 1, attack: 1, hacker: 1, collector: 1 };
    
    this.loadState();
  }

  loadState() {
    if (window.storage && window.storage.state) {
      if (!window.storage.state.companions) {
        window.storage.state.companions = {
          equippedDrone: 'medic',
          equippedPet: 'none',
          droneLevels: { medic: 1, attack: 1, hacker: 1, collector: 1 }
        };
      }
      const data = window.storage.state.companions;
      this.equippedDrone = data.equippedDrone || 'medic';
      this.equippedPet = data.equippedPet || 'none';
      this.droneLevels = data.droneLevels || { medic: 1, attack: 1, hacker: 1, collector: 1 };
    }
  }

  saveState() {
    if (window.storage && window.storage.state) {
      window.storage.state.companions = {
        equippedDrone: this.equippedDrone,
        equippedPet: this.equippedPet,
        droneLevels: this.droneLevels
      };
      window.storage.save();
    }
  }

  equipDrone(droneType) {
    this.equippedDrone = droneType;
    this.saveState();
  }

  equipPet(petType) {
    this.equippedPet = petType;
    this.saveState();
  }

  upgradeDrone(droneType) {
    const cost = this.droneLevels[droneType] * 120;
    if (window.storage.spendCoins(cost)) {
      this.droneLevels[droneType]++;
      this.saveState();
      window.audio.playAchievement();
      return true;
    }
    return false;
  }

  // Update passive buff ticks
  updatePassives(player, collectibles, enemies, frameCount) {
    if (player.isDead) return;

    this.hoverPhase += 0.08;
    this.petRunCycle += 0.2;

    // 1. DRONE BUFFS
    const droneLvl = this.droneLevels[this.equippedDrone];
    
    if (this.equippedDrone === 'medic') {
      // Heal player +1 HP periodically
      const healInterval = Math.max(60, 240 - droneLvl * 30); // Lvl 1: every 4s, Lvl 3: every 2.5s
      if (frameCount % healInterval === 0 && player.hp < 100) {
        player.hp = Math.min(100, player.hp + 1);
        window.particles.spawn(player.x + 10, player.y - 10, window.COLORS.GREEN, 2, 'spark');
      }
    } else if (this.equippedDrone === 'collector') {
      // Collector drone pulls nearby coin nodes automatically (minor collector magnet)
      const pullDist = 70 + droneLvl * 15;
      collectibles.forEach(c => {
        if (c.active && c instanceof window.Coin) {
          // Calculate distance to drone position (floating behind player)
          const dx = (player.x - 30) - c.x;
          const dy = (player.y - 20) - c.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pullDist) {
            c.x += (dx / dist) * 7;
            c.y += (dy / dist) * 7;
          }
        }
      });
    } else if (this.equippedDrone === 'attack') {
      // Attack drone zaps nearby obstacles/enemies
      const shootInterval = Math.max(80, 180 - droneLvl * 20);
      if (frameCount % shootInterval === 0 && enemies && enemies.length > 0) {
        // Find first active target enemy
        const target = enemies.find(e => e.active && e.x < window.innerWidth && e.x > player.x);
        if (target) {
          window.audio.playLaser();
          // Drone coordinates
          const dx = player.x - 30;
          const dy = player.y - 20 + Math.sin(this.hoverPhase) * 6;
          // Spawn seek spark to enemy
          window.particles.spawn(dx, dy, window.COLORS.PURPLE, 4, 'spark');
          target.takeDamage(10 + droneLvl * 2);
        }
      }
    }

    // 2. PET PASSIVES (multipliers)
    // Wolf gives XP gains multiplier, Fox gives coin valuation gains multiplier.
    // Revival phoenix check is performed in player hit calculations inside game.js.
  }

  // Draw Drone & Pet relative to player positioning
  draw(ctx, player, trackY, quality = 'medium') {
    if (player.isDead) return;

    const isHigh = quality === 'high';

    // ==================== DRAW HOVER DRONE ====================
    ctx.save();
    
    // Position drone floating behind/above the runner
    const droneX = player.x - 30;
    const droneY = player.y - 20 + Math.sin(this.hoverPhase) * 6;

    if (isHigh) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.getDroneColor();
    }

    ctx.fillStyle = '#222';
    ctx.strokeStyle = this.getDroneColor();
    ctx.lineWidth = 1.5;

    // Small cyber disk chassis
    ctx.beginPath();
    ctx.arc(droneX, droneY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central glowing core
    ctx.fillStyle = this.getDroneColor();
    ctx.beginPath();
    ctx.arc(droneX, droneY, 4, 0, Math.PI*2);
    ctx.fill();

    // Mini antenna wings
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(droneX - 16, droneY);
    ctx.lineTo(droneX + 16, droneY);
    ctx.stroke();

    ctx.restore();

    // ==================== DRAW CYBER PET ====================
    if (this.equippedPet === 'none') return;

    ctx.save();
    // Pet runs on the track platform just in front of player feet
    const petWidth = 20;
    const petHeight = 16;
    const petX = player.x + player.width + 10;
    const petY = trackY - petHeight;

    if (isHigh) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.getPetColor();
    }

    ctx.fillStyle = '#111';
    ctx.strokeStyle = this.getPetColor();
    ctx.lineWidth = 1.5;

    // Compact quadrilateral digital pet body
    ctx.beginPath();
    ctx.roundRect(petX, petY, petWidth, petHeight, [4]);
    ctx.fill();
    ctx.stroke();

    // Glowing pet visor eye
    ctx.fillStyle = this.getPetColor();
    ctx.fillRect(petX + 12, petY + 3, 6, 2);

    // Animated legs swing
    const legSwing = Math.sin(this.petRunCycle) * 4;
    ctx.strokeStyle = this.getPetColor();
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Front leg
    ctx.moveTo(petX + 5, petY + petHeight);
    ctx.lineTo(petX + 5 + legSwing, petY + petHeight + 4);
    // Back leg
    ctx.moveTo(petX + 15, petY + petHeight);
    ctx.lineTo(petX + 15 - legSwing, petY + petHeight + 4);
    ctx.stroke();

    ctx.restore();
  }

  getDroneColor() {
    switch (this.equippedDrone) {
      case 'medic': return window.COLORS.GREEN;
      case 'attack': return window.COLORS.PURPLE;
      case 'hacker': return window.COLORS.PINK;
      case 'collector': return window.COLORS.BLUE;
      default: return '#fff';
    }
  }

  getPetColor() {
    switch (this.equippedPet) {
      case 'wolf': return window.COLORS.BLUE;
      case 'fox': return window.COLORS.YELLOW;
      case 'phoenix': return window.COLORS.PINK;
      default: return '#fff';
    }
  }
}

window.companions = new CompanionSystem();
