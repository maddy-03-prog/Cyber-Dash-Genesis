// Autonomous God-Tier Master AI Controller for Player 2 (Cyberbot AI)

class CoopAI {
  constructor() {
    this.targetXOffset = 130; // Runs ahead of Player 1 to set a fast competitive pace
  }

  reset() {
    this.targetXOffset = 130;
  }

  // Called every frame from game.js when game.isAiPartner is true
  update(game) {
    if (!game || !game.player2 || game.player2.isDead) return;

    const p2 = game.player2;
    const p1 = game.player;
    const actionsP2 = window.input ? window.input.activeActionsP2 : {};

    // Reset default actions for this frame
    actionsP2.jump = false;
    actionsP2.slide = false;
    actionsP2.dash = false;
    actionsP2.left = false;
    actionsP2.right = false;

    if (game.state !== 'playing') return;

    // Accumulate AI competitive score per frame
    game.scoreP2 = (game.scoreP2 || 0) + 1.2;

    // 1. Position & Speed Management — Maintain aggressive lead ahead of P1
    const p1TargetX = p1.x + this.targetXOffset;
    if (p2.x < p1TargetX - 10) {
      actionsP2.right = true;
    } else if (p2.x > p1TargetX + 30) {
      actionsP2.left = true;
    }

    // High Velocity Dash: dash whenever energy allows
    if (p2.dashCooldown === 0 && p2.energy >= 30 && p2.isGrounded && Math.random() > 0.3) {
      actionsP2.dash = true;
    }

    // Emergency Shield trigger if AI takes damage
    if (p2.hp < p2.maxHp * 0.7 && p2.shieldTimer <= 0 && Math.random() > 0.7) {
      p2.applyPowerup('shield', 300);
    }

    // 2. Raycasting Gap & Platform Calculation (Scan 400px ahead)
    const currentFloor = game.world ? game.world.getFloorHeightAt(p2.x, p2.width) : 9999;
    const floorAhead60 = game.world ? game.world.getFloorHeightAt(p2.x + 60, p2.width) : 9999;
    const floorAhead120 = game.world ? game.world.getFloorHeightAt(p2.x + 120, p2.width) : 9999;
    const floorAhead200 = game.world ? game.world.getFloorHeightAt(p2.x + 200, p2.width) : 9999;

    // Detect pit gap
    const isGapAhead = (floorAhead60 > currentFloor + 50) || (floorAhead120 > currentFloor + 50);
    if (isGapAhead && p2.isGrounded) {
      actionsP2.jump = true;
    }

    // Air Control: execute 2nd jump at jump apex if over gap to ensure reaching far side
    if (!p2.isGrounded && p2.vy > 0 && p2.jumpCount === 1 && floorAhead200 > currentFloor + 50) {
      actionsP2.jump = true;
    }

    // 3. Precision Hazard Scanning (Obstacles & Projectiles)
    const scanDist = 340;
    let closestObstacle = null;
    let minDist = 9999;

    if (game.obstacles) {
      game.obstacles.forEach(obs => {
        if (!obs.active) return;
        const dx = obs.x - p2.x;
        if (dx > -30 && dx < scanDist && dx < minDist) {
          minDist = dx;
          closestObstacle = obs;
        }
      });
    }

    // Scan enemy projectiles
    if (game.enemyProjectiles) {
      game.enemyProjectiles.forEach(proj => {
        if (!proj.active) return;
        const dx = proj.x - p2.x;
        if (dx > -15 && dx < scanDist * 0.85 && dx < minDist) {
          minDist = dx;
          closestObstacle = { type: 'laser_proj', x: proj.x, y: proj.y, height: 20, width: 20 };
        }
      });
    }

    // Flawless Hazard Evasion
    if (closestObstacle) {
      const dx = closestObstacle.x - p2.x;
      const obsType = closestObstacle.type || '';

      // High obstacles / Overhead Laser nets -> Slide under
      if (obsType.includes('laser') || obsType.includes('high') || obsType === 'laser_net' || (closestObstacle.y < p2.y + 25 && closestObstacle.y > p2.y - 45)) {
        if (dx < 210 && p2.isGrounded && p2.slideTimer === 0) {
          actionsP2.slide = true;
        }
      }
      // Low obstacles / Floor Spikes / Barriers -> Jump over
      else {
        if (dx < 185 && p2.isGrounded) {
          actionsP2.jump = true;
        } else if (dx < 140 && !p2.isGrounded && p2.jumpCount === 1) {
          // Double jump for high clearance
          actionsP2.jump = true;
        }
      }
    }

    // 4. Master Coin Magnet Gathering
    if (game.collectibles) {
      game.collectibles.forEach(col => {
        if (!col.active) return;
        const dx = col.x - p2.x;
        const dy = Math.abs(col.y - (p2.y + p2.height / 2));

        // Jump for high coins if no immediate obstacle
        if (dx > 0 && dx < 180 && !closestObstacle) {
          if (col.y < p2.y - 35 && p2.isGrounded) {
            actionsP2.jump = true;
          }
        }

        // Snatch coin
        if (Math.abs(dx) < 45 && dy < 50) {
          col.active = false;
          game.coinsP2 = (game.coinsP2 || 0) + 1;
          game.scoreP2 = (game.scoreP2 || 0) + 200;
          window.audio.playCoin();
          window.particles.spawn(col.x, col.y, window.COLORS.YELLOW, 10, 'spark');
        }
      });
    }
  }
}

window.coopAi = new CoopAI();
