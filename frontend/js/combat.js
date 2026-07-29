// Combat, Weapons, Projectiles, and Grappling Hook System for Cyber Dash: Genesis

class CombatSystem {
  constructor() {
    this.projectiles = [];
    this.weapons = {
      sword: { id: 'sword', name: 'Z-1 ENERGY SABER', range: 75, energyCost: 8, damage: 25 },
      pistols: { id: 'pistols', name: 'DUAL NEON REVOLVERS', range: 450, energyCost: 15, damage: 12, speed: 12 },
      bow: { id: 'bow', name: 'APEX DIGITAL BOW', range: 600, energyCost: 25, damage: 45, speed: 15 }
    };
    
    this.equippedWeapon = 'sword'; // default
    this.swordSwingActive = 0; // Swing frame countdown
    this.grapplePoint = null; // Active coordinate {x, y}
    this.grappleTime = 0;

    this.loadState();
  }

  loadState() {
    if (window.storage && window.storage.state && window.storage.state.equippedWeapon) {
      this.equippedWeapon = window.storage.state.equippedWeapon;
    }
  }

  equipWeapon(weaponId) {
    if (this.weapons[weaponId]) {
      this.equippedWeapon = weaponId;
      if (window.storage && window.storage.state) {
        window.storage.state.equippedWeapon = weaponId;
        window.storage.save();
      }
      return true;
    }
    return false;
  }

  // Execute active attack based on equipped weapon
  triggerAttack(player) {
    if (player.isDead) return;

    const weapon = this.weapons[this.equippedWeapon];
    if (player.energy < weapon.energyCost) {
      window.audio.playHit(); // error buzz
      return;
    }

    // Spend energy
    player.energy -= weapon.energyCost;

    if (this.equippedWeapon === 'sword') {
      // Swipe sword swing sfx
      this.swordSwingActive = 15; // Swing for 15 frames
      window.audio.playJump(); // sweep up sfx
      window.particles.spawn(player.x + player.width, player.y + player.height / 3, window.COLORS.CYAN, 8, 'laser');
    } else {
      // Ranged projectile
      window.audio.playLaser();
      const bulletY = player.y + player.height / 2;
      this.projectiles.push({
        x: player.x + player.width,
        y: bulletY,
        vx: weapon.speed,
        vy: 0,
        damage: weapon.damage,
        color: this.equippedWeapon === 'bow' ? window.COLORS.PINK : window.COLORS.CYAN,
        size: this.equippedWeapon === 'bow' ? 10 : 5,
        type: this.equippedWeapon,
        active: true
      });
      // Gun muzzle flash particles
      window.particles.spawn(player.x + player.width, bulletY, window.COLORS.WHITE, 4, 'spark');
    }
  }

  updateProjectiles(enemies, boss, worldSpeed) {
    // 1. Update player fired projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      
      // Check collision with snipers/dogs/drones
      let hit = false;
      if (enemies && enemies.length > 0) {
        for (let enemy of enemies) {
          if (enemy.active && this.checkHit(proj, enemy)) {
            enemy.takeDamage(proj.damage);
            hit = true;
            break;
          }
        }
      }

      // Check collision with active boss
      if (!hit && boss && boss.active && boss.state === 'combat') {
        if (this.checkHit(proj, boss)) {
          boss.takeDamage(proj.damage);
          hit = true;
        }
      }

      // Remove hit or offscreen
      if (hit || proj.x > window.innerWidth + 100) {
        this.projectiles.splice(i, 1);
      }
    }

    // 2. Decrement sword swing count
    if (this.swordSwingActive > 0) this.swordSwingActive--;
  }

  checkHit(proj, target) {
    const tLeft = target.x;
    const tRight = target.x + target.width;
    const tTop = target.y;
    const tBottom = target.y + target.height;
    return (proj.x > tLeft && proj.x < tRight && proj.y > tTop && proj.y < tBottom);
  }

  // Grapple anchor attachment
  attachGrapple(anchorX, anchorY) {
    this.grapplePoint = { x: anchorX, y: anchorY };
    this.grappleTime = 0;
    window.audio.playJump();
    window.particles.spawn(anchorX, anchorY, window.COLORS.GREEN, 10, 'spark');
  }

  detachGrapple() {
    this.grapplePoint = null;
  }

  updateGrapplePhysics(player) {
    if (!this.grapplePoint) return;

    this.grappleTime++;
    const dx = this.grapplePoint.x - player.x;
    const dy = this.grapplePoint.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40 || this.grappleTime > 50) {
      // Auto release grapple on close proximity or timeout
      this.detachGrapple();
      player.vy = -6; // launch upward
      player.vx = 4;
      return;
    }

    // Pull force towards grapple hook anchor
    const pullStrength = 0.45;
    player.vx += (dx / dist) * pullStrength;
    player.vy += (dy / dist) * pullStrength;

    // Damp speed
    player.vx *= 0.96;
    player.vy *= 0.96;
  }

  draw(ctx, player, quality = 'medium') {
    const isHigh = quality === 'high';

    // 1. Draw active sword melee swipe arc
    if (this.swordSwingActive > 0) {
      ctx.save();
      ctx.strokeStyle = player.getSkinColor();
      ctx.lineWidth = 5;
      if (isHigh) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = player.getSkinColor();
      }
      ctx.beginPath();
      // Draw arc sweeping forward from player hand
      const cx = player.x + player.width + 10;
      const cy = player.y + player.height / 2;
      ctx.arc(cx, cy, 32, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw projectilies
    ctx.save();
    this.projectiles.forEach(p => {
      ctx.fillStyle = p.color;
      if (isHigh) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
      }
      ctx.beginPath();
      if (p.type === 'bow') {
        // Draw laser arrow polygon
        ctx.rect(p.x - 12, p.y - 2, 16, 4);
      } else {
        // Standard revolver round circle
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      }
      ctx.fill();
    });
    ctx.restore();

    // 3. Draw active Grappling Hook cable
    if (this.grapplePoint) {
      ctx.save();
      ctx.strokeStyle = window.COLORS.GREEN;
      ctx.lineWidth = 2.5;
      if (isHigh) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = window.COLORS.GREEN;
      }
      ctx.beginPath();
      ctx.moveTo(player.x + player.width/2, player.y + player.height/3);
      ctx.lineTo(this.grapplePoint.x, this.grapplePoint.y);
      ctx.stroke();

      // Grapple line cable pulse
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }
}

window.combat = new CombatSystem();
