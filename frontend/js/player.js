// Cyber Runner Operative Profiles (Velocity, Titan, Ghost, Nova, Phoenix, Volt)
window.OPERATIVES = {
  velocity: { name: 'VELOCITY', role: 'LIGHTNING SPEEDSTER', avatar: '🧑‍🎤', skinColor: '#00f3ff', trailColor: '#00f3ff', hpBonus: 0, speedBonus: 1.2 },
  titan: { name: 'TITAN', role: 'ARMORED BRAWLER', avatar: '🤖', skinColor: '#bd00ff', trailColor: '#bd00ff', hpBonus: 40, speedBonus: 0.9 },
  ghost: { name: 'GHOST', role: 'QUANTUM STEALTH', avatar: '🥷', skinColor: '#ff007f', trailColor: '#ff007f', hpBonus: 10, speedBonus: 1.1 },
  nova: { name: 'NOVA', role: 'SOLAR MAGNETIST', avatar: '🌟', skinColor: '#ffcc00', trailColor: '#ffcc00', hpBonus: 20, speedBonus: 1.05 },
  phoenix: { name: 'PHOENIX', role: 'THERMAL REBIRTH', avatar: '🔥', skinColor: '#ff3300', trailColor: '#ff3300', hpBonus: 25, speedBonus: 1.0 },
  volt: { name: 'VOLT', role: 'VOLTAIC SURGE', avatar: '⚡', skinColor: '#00ff66', trailColor: '#00ff66', hpBonus: 15, speedBonus: 1.15 }
};

class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    // Spatial coordinates (Canvas Space)
    this.x = 150;
    this.y = 350;
    this.vx = 0;
    this.vy = 0;
    
    // Size parameters
    this.width = 32;
    this.height = 64;
    this.baseHeight = 64;
    this.slideHeight = 32;

    // Physics States
    this.isGrounded = false;
    this.jumpCount = 0;
    this.slideTimer = 0;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.isDead = false;
    
    // Status metrics - influenced by customizable gear modifiers & difficulty levels
    let baseHp = 60; // Medium
    const activeDiff = (window.storage && window.storage.state && window.storage.state.settings.difficulty) || 'medium';
    if (activeDiff === 'easy') baseHp = 100;
    else if (activeDiff === 'hard') baseHp = 40;

    this.maxHp = baseHp + (window.customizer ? window.customizer.getHPModifier() : 0);
    this.hp = this.maxHp;
    this.maxEnergy = 100;
    this.energy = 100;
    
    // Visual and animation counters
    this.runCycle = 0;
    this.victoryPoseTimer = 0;
    this.damagedTimer = 0;
    this.invincibilityTimer = 0;
    this.shieldTimer = 0;
    this.magnetTimer = 0;
    this.speedBoostTimer = 0;
    this.doubleCoinsTimer = 0;

    // Customizable elements
    this.equippedSkin = window.storage.state.equippedSkin;
    this.equippedTrail = window.storage.state.equippedTrail;

    // Stat Trackers (For this run)
    this.stats = {
      jumps: 0,
      dashes: 0,
      slides: 0,
      hits: 0,
    };

    // Replay Recording Buffer
    this.replayBuffer = [];
    this.maxReplayFrames = 60 * 15; // 15 seconds at 60fps
  }

  getSkinColor() {
    const skin = window.SHOP_SKINS.find(s => s.id === this.equippedSkin);
    return skin ? skin.color : window.COLORS.CYAN;
  }

  getTrailType() {
    const trail = window.SHOP_TRAILS.find(t => t.id === this.equippedTrail);
    return trail ? trail.type : 'laser';
  }

  // Handle damage
  takeDamage(amount) {
    if (this.isDead || this.speedBoostTimer > 0) return false;
    
    // Shield blocks hit
    if (this.shieldTimer > 0) {
      // Matrix shield absorbs double if shield matrix tech is purchased
      const hasMatrix = window.progression && window.progression.hasSkill('shield_matrix');
      this.shieldTimer = hasMatrix ? this.shieldTimer - 150 : 0;
      
      window.audio.playHit();
      this.damagedTimer = 25;
      window.particles.spawn(this.x + this.width / 2, this.y + this.height / 2, window.COLORS.CYAN, 20, 'spark');
      return false;
    }

    if (this.invincibilityTimer > 0) return false;

    // Cyber Pets: Phoenix revive check on fatal damage
    const isFatal = this.hp - amount <= 0;
    if (isFatal && window.companions && window.companions.equippedPet === 'phoenix') {
      window.companions.equippedPet = 'none'; // consume pet
      window.companions.saveState();
      this.hp = Math.round(this.maxHp * 0.35); // restore to 35% health
      this.invincibilityTimer = 180; // 3s immunity
      window.audio.playAchievement();
      window.ui.showEventBanner('PHOENIX BOT PROTOCOL', 'CORE SYSTEM REVIVED FROM SHUTDOWN');
      window.particles.spawn(this.x + this.width/2, this.y + this.height/2, window.COLORS.PINK, 30, 'explosion');
      return false;
    }

    this.hp -= amount;
    this.stats.hits++;
    this.damagedTimer = 35;
    
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      window.audio.playExplosion();
      window.particles.spawn(this.x + this.width/2, this.y + this.height/2, this.getSkinColor(), 30, 'explosion', 1.2);
      return true;
    } else {
      window.audio.playHit();
      window.particles.spawn(this.x + this.width/2, this.y + this.height/2, window.COLORS.RED, 15, 'spark');
      return false;
    }
  }

  applyPowerup(type, duration = 300) {
    switch (type) {
      case 'shield':
        this.shieldTimer = duration;
        break;
      case 'magnet':
        this.magnetTimer = duration;
        break;
      case 'slow_motion':
        break;
      case 'speed_boost':
        this.speedBoostTimer = duration;
        this.invincibilityTimer = duration;
        break;
      case 'double_coins':
        this.doubleCoinsTimer = duration;
        break;
      case 'extra_life':
        if (this.hp < this.maxHp) this.hp = this.maxHp;
        break;
      case 'invincibility':
        this.invincibilityTimer = duration;
        break;
    }
  }

  update(trackY, speedMultiplier, quality = 'medium') {
    if (this.isDead) return;

    const actions = (window.game && window.game.isMultiplayer && this === window.game.player2)
      ? window.input.activeActionsP2
      : window.input.activeActions;

    // Regenerate Energy
    if (this.dashTimer <= 0) {
      this.energy = Math.min(this.maxEnergy, this.energy + window.CONFIG.ENERGY_REGEN);
    }

    // Decay Timers
    if (this.damagedTimer > 0) this.damagedTimer--;
    if (this.invincibilityTimer > 0) this.invincibilityTimer--;
    if (this.shieldTimer > 0) this.shieldTimer--;
    if (this.magnetTimer > 0) this.magnetTimer--;
    if (this.speedBoostTimer > 0) this.speedBoostTimer--;
    if (this.doubleCoinsTimer > 0) this.doubleCoinsTimer--;
    if (this.dashCooldown > 0) this.dashCooldown--;

    // ==================== PHYSICS & INPUT ====================

    // Horizontal steering
    const moveSpeed = 5 * speedMultiplier;
    if (actions.left) {
      this.vx = -moveSpeed;
    } else if (actions.right) {
      this.vx = moveSpeed;
    } else {
      this.vx = 0;
    }

    // Apply horizontal limits
    this.x += this.vx;
    if (this.x < 50) this.x = 50;
    if (this.x > this.canvas.width - 250) this.x = this.canvas.width - 250;

    // Dash Action
    const hasAirDash = window.story && window.story.hasAbility('air_dash');
    const canDash = this.isGrounded || hasAirDash;
    const dashCost = window.progression && window.progression.hasSkill('air_dash') ? window.CONFIG.DASH_ENERGY_COST * 0.7 : window.CONFIG.DASH_ENERGY_COST;
    if (actions.dash && canDash && this.dashCooldown === 0 && this.dashTimer === 0 && this.energy >= dashCost) {
      this.dashTimer = window.CONFIG.DASH_DURATION;
      this.dashCooldown = window.CONFIG.DASH_COOLDOWN;
      this.energy -= dashCost;
      this.stats.dashes++;
      if (window.progression) window.progression.gainXp(15);
      window.audio.playDash();
      window.particles.spawn(this.x, this.y + this.height/2, this.getSkinColor(), 15, 'spark');
    }

    // Slide Action
    if (this.slideTimer > 0) {
      this.slideTimer--;
      this.height = this.slideHeight;
      if (this.isGrounded && Math.random() > 0.4) {
        window.particles.spawn(this.x, this.y + this.height, window.COLORS.PURPLE, 2, 'spark');
      }
    } else {
      this.height = this.baseHeight;
      if (actions.slide && this.isGrounded && this.dashTimer <= 0) {
        this.slideTimer = window.CONFIG.SLIDE_DURATION;
        this.stats.slides++;
        if (window.progression) window.progression.gainXp(15);
      }
    }

    // Combat weapon attack trigger check
    if (actions.attack) {
      actions.attack = false;
      if (window.combat) window.combat.triggerAttack(this);
    }

    // Grapple hook wire trigger check
    if (actions.grapple) {
      actions.grapple = false;
      if (window.combat) {
        if (window.combat.grapplePoint) {
          window.combat.detachGrapple();
        } else {
          const node = this.findNearestGrappleNode();
          if (node) {
            window.combat.attachGrapple(node.x, node.y);
          }
        }
      }
    }

    // Gravity, Jumps, Wall Running, and Rail Grinding
    if (this.dashTimer > 0) {
      this.vy = 0;
      this.dashTimer--;
      if (this.dashTimer % 2 === 0) {
        window.particles.spawn(this.x, this.y, this.getSkinColor(), 1, 'dash_ghost', 1, {
          drawGhost: (ctx, x, y, alpha, color) => this.drawGhostChassis(ctx, x, y, alpha, color)
        });
      }
    } else if (window.combat && window.combat.grapplePoint) {
      window.combat.updateGrapplePhysics(this);
      this.y += this.vy;
      this.x += this.vx;
      this.isGrounded = false;
    } else {
      const wallRunning = this.checkWallRun(actions);
      if (wallRunning) {
        this.vy = 0.65; // slide down slowly
        this.y += this.vy;
        this.isGrounded = false;
        this.jumpCount = 0;
        if (Math.random() > 0.6) {
          window.particles.spawn(this.x, this.y + this.height/2, window.COLORS.CYAN, 1, 'spark');
        }

        if (actions.jump) {
          this.vy = window.CONFIG.JUMP_FORCE * 0.85;
          this.vx = 4.5;
          window.audio.playJump();
          actions.jump = false;
        }
      } else {
        const grinding = this.checkRailGrind();
        if (grinding) {
          this.vy = 0;
          this.y = this.grindY - this.height;
          this.isGrounded = true;
          this.jumpCount = 0;
          if (Math.random() > 0.5) {
            window.particles.spawn(this.x, this.y + this.height, window.COLORS.YELLOW, 2, 'spark');
          }

          if (actions.jump) {
            this.vy = window.CONFIG.JUMP_FORCE;
            this.isGrounded = false;
            window.audio.playJump();
            actions.jump = false;
          }
        } else {
          this.vy += window.CONFIG.GRAVITY;
          this.y += this.vy;

          if (this.y + this.height >= trackY) {
            this.y = trackY - this.height;
            this.vy = 0;
            if (!this.isGrounded) {
              this.isGrounded = true;
              this.jumpCount = 0;
              window.particles.spawn(this.x + this.width/2, this.y + this.height, '#999', 5, 'dust');
            }
          } else {
            this.isGrounded = false;
          }

          if (actions.jump) {
            if (this.isGrounded) {
              this.vy = window.CONFIG.JUMP_FORCE;
              this.isGrounded = false;
              this.jumpCount = 1;
              this.stats.jumps++;
              if (window.progression) window.progression.gainXp(15);
              window.audio.playJump();
              window.particles.spawn(this.x + this.width/2, this.y + this.height, '#555', 4, 'dust');
            } else {
              const hasTriple = (window.story && window.story.hasAbility('triple_jump'));
              const maxJumps  = hasTriple ? 3 : 2;
              const isDoubleUnlocked = (window.storage && window.storage.state && window.storage.state.doubleJumpUnlocked) || (window.story && window.story.hasAbility('triple_jump')) || true;
              
              if (this.jumpCount < maxJumps && isDoubleUnlocked) {
                // Gravity Jump ability (Stage 9): if gravity_jump unlocked and airborne, launch upwards with high force
                const hasGrav = window.story && window.story.hasAbility('gravity_jump');
                this.vy = hasGrav ? window.CONFIG.JUMP_FORCE * 1.2 : window.CONFIG.DOUBLE_JUMP_FORCE;
                this.jumpCount++;
                this.stats.jumps++;
                if (window.progression) window.progression.gainXp(15);
                window.audio.playJump();
                window.particles.spawn(this.x + this.width/2, this.y + this.height, hasGrav ? window.COLORS.PURPLE : window.COLORS.CYAN, 10, 'spark');
              }
            }
            actions.jump = false;
          }
        }
      }
    }

    if (this.isGrounded && this.vx !== 0) {
      this.runCycle += 0.25;
    } else if (this.isGrounded) {
      this.runCycle += 0.15;
    }

    this.updateTrail(speedMultiplier);
    this.recordReplayFrame();
  }

  updateTrail(speedMultiplier) {
    if (this.isDead) return;
    
    const trailType = this.getTrailType();
    const trailColor = this.getSkinColor();
    const trailX = this.x;
    const trailY = this.y + this.height - 15;

    if (this.speedBoostTimer > 0) {
      window.particles.spawn(trailX, trailY, window.COLORS.GREEN, 2, 'spark');
      return;
    }

    if (trailType === 'sparks') {
      if (Math.random() > 0.6) {
        window.particles.spawn(trailX, trailY, trailColor, 1, 'spark');
      }
    } else if (trailType === 'rainbow') {
      const hues = ['#ff0055', '#ff9900', '#33ff00', '#00ffff', '#9900ff'];
      const pickHue = hues[Math.floor(this.runCycle) % hues.length];
      window.particles.spawn(trailX, trailY + Math.sin(this.runCycle)*5, pickHue, 1, 'laser');
    } else if (trailType === 'glitch') {
      if (Math.random() > 0.8) {
        window.particles.spawn(trailX, trailY - 10, '#3f3', 1, 'laser');
      }
    } else {
      if (Math.random() > 0.5) {
        window.particles.spawn(trailX, trailY, trailColor, 1, 'laser');
      }
    }
  }

  draw(ctx, quality = 'medium') {
    if (this.isDead) return;

    const skinColor = this.getSkinColor();
    const isHighQuality = quality === 'high';

    ctx.save();

    if (this.damagedTimer > 0 && Math.floor(this.damagedTimer / 3) % 2 === 0) {
      ctx.fillStyle = window.COLORS.RED;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
      return;
    }

    if (isHighQuality) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = skinColor;
    }

    const headX = this.x + this.width / 2;
    const headY = this.y + 12;
    const bodyX = this.x + this.width / 2;
    const bodyY = this.y + 26;

    if (this.dashTimer > 0 || this.vy < 0) {
      ctx.fillStyle = this.speedBoostTimer > 0 ? window.COLORS.GREEN : window.COLORS.PINK;
      ctx.beginPath();
      ctx.moveTo(this.x - 5, this.y + this.height / 2);
      ctx.lineTo(this.x - 25 - Math.random() * 15, this.y + this.height / 2 + (Math.random() * 6 - 3));
      ctx.lineTo(this.x - 5, this.y + this.height / 2 + 10);
      ctx.fill();
    }

    if (this.shieldTimer > 0) {
      ctx.save();
      ctx.strokeStyle = window.COLORS.CYAN;
      ctx.lineWidth = 2;
      if (isHighQuality) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = window.COLORS.CYAN;
      }
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, this.height * 0.7, 0, Math.PI*2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 243, 255, 0.04)';
      ctx.fill();
      ctx.restore();
    }

    if (this.invincibilityTimer > 0 && this.speedBoostTimer <= 0) {
      ctx.save();
      ctx.strokeStyle = window.COLORS.YELLOW;
      ctx.lineWidth = 1.5;
      const angle = (Date.now() / 150) % (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, this.height * 0.65, angle, angle + Math.PI/3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, this.height * 0.65, angle + Math.PI, angle + Math.PI + Math.PI/3);
      ctx.stroke();
      ctx.restore();
    }

    if (this.magnetTimer > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(51, 153, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, 120, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.slideTimer > 0) {
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, [8]);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x + 12, this.y + 8, 16, 4);
    } else {
      ctx.fillStyle = '#111';
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(this.x + 4, this.y + 16, this.width - 8, 24, [4]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(bodyX, bodyY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.roundRect(this.x + 6, this.y + 2, this.width - 12, 14, [6]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skinColor;
      ctx.fillRect(this.x + 10, this.y + 5, this.width - 20, 4);

      const legSwingAngle = Math.sin(this.runCycle) * 0.55;
      
      const drawLeg = (isLeft) => {
        const offset = isLeft ? 1 : -1;
        const swing = legSwingAngle * offset;
        const hipX = this.x + (isLeft ? 8 : this.width - 8);
        const hipY = this.y + 40;
        const kneeX = hipX + Math.sin(swing) * 12;
        const kneeY = hipY + Math.cos(swing) * 12;
        const footX = kneeX + Math.sin(swing * 0.5) * 10;
        const footY = kneeY + Math.cos(swing * 0.5) * 10;

        ctx.strokeStyle = skinColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();
      };

      if (this.isGrounded) {
        drawLeg(true);
        drawLeg(false);
      } else {
        ctx.strokeStyle = skinColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x + 8, this.y + 40);
        ctx.lineTo(this.x + 4, this.y + 48);
        ctx.lineTo(this.x + 14, this.y + 52);
        ctx.moveTo(this.x + this.width - 8, this.y + 40);
        ctx.lineTo(this.x + this.width - 4, this.y + 48);
        ctx.lineTo(this.x + this.width - 14, this.y + 52);
        ctx.stroke();
      }

      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (this.isGrounded) {
        const armSwing = Math.sin(this.runCycle + Math.PI) * 12;
        ctx.moveTo(bodyX, bodyY);
        ctx.lineTo(bodyX - 8 + armSwing * 0.5, bodyY + 12);
        ctx.lineTo(bodyX - 12 + armSwing, bodyY + 22);
      } else {
        ctx.moveTo(bodyX - 8, bodyY);
        ctx.lineTo(this.x - 6, bodyY - 10);
        ctx.moveTo(bodyX + 8, bodyY);
        ctx.lineTo(this.x + this.width + 6, bodyY - 10);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  drawGhostChassis(ctx, x, y, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, this.width, this.height, [6]);
    ctx.fill();
    ctx.restore();
  }

  recordReplayFrame() {
    if (this.replayBuffer.length >= this.maxReplayFrames) {
      this.replayBuffer.shift();
    }
    
    this.replayBuffer.push({
      x: this.x,
      y: this.y,
      height: this.y + this.height,
      slideTimer: this.slideTimer,
      dashTimer: this.dashTimer,
      vy: this.vy,
      isGrounded: this.isGrounded,
      runCycle: this.runCycle,
      hp: this.hp,
      shieldTimer: this.shieldTimer,
      damagedTimer: this.damagedTimer,
      skinColor: this.getSkinColor(),
      equippedSkin: this.equippedSkin
    });
  }
  findNearestGrappleNode() {
    if (window.game && window.game.world) {
      const nodes = window.game.world.holograms;
      for (let node of nodes) {
        const dx = node.x - this.x;
        const dy = node.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 280) {
          return node;
        }
      }
    }
    return null;
  }

  checkWallRun(actions = window.input.activeActions) {
    if (!window.progression || !window.progression.hasSkill('wall_run')) return false;
    if (this.isGrounded || this.vy <= 0) return false;
    const holdingWallKey = actions.left || actions.right;
    if (!holdingWallKey) return false;

    if (window.game && window.game.world) {
      for (let b of window.game.world.midBuildings) {
        if (this.x + this.width > b.x && this.x < b.x + b.width) {
          return true;
        }
      }
    }
    return false;
  }

  checkRailGrind() {
    if (this.vy < 0) return false;
    if (window.game && window.game.world) {
      const railY = 280;
      if (Math.abs((this.y + this.height) - railY) < 8 && this.vy >= 0) {
        this.grindY = railY;
        return true;
      }
    }
    return false;
  }
}

window.Player = Player;
