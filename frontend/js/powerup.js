// Collectibles Module (Coins and Power-ups)

// ==================== CYBER COIN CLASS ====================
class Coin {
  constructor(x, y, isDouble = false) {
    this.x = x;
    this.y = y;
    this.size = 14;
    this.width = this.size;
    this.height = this.size;
    this.active = true;
    this.phase = Math.random() * Math.PI * 2;
    this.color = window.COLORS.YELLOW;
    this.isDouble = isDouble;
    
    if (this.isDouble) {
      this.color = window.COLORS.PINK;
    }
  }

  update(worldSpeed, player) {
    if (!this.active) return;

    this.x -= worldSpeed;
    this.phase += 0.08;

    let pullPlayer = null;
    if (player.magnetTimer > 0 && !player.isDead) {
      pullPlayer = player;
    }
    if (window.game && window.game.isMultiplayer && window.game.player2 && !window.game.player2.isDead && window.game.player2.magnetTimer > 0) {
      if (!pullPlayer) {
        pullPlayer = window.game.player2;
      } else {
        const d1 = Math.hypot((player.x + player.width/2) - this.x, (player.y + player.height/2) - this.y);
        const d2 = Math.hypot((window.game.player2.x + window.game.player2.width/2) - this.x, (window.game.player2.y + window.game.player2.height/2) - this.y);
        if (d2 < d1) pullPlayer = window.game.player2;
      }
    }

    if (pullPlayer) {
      const dx = (pullPlayer.x + pullPlayer.width / 2) - this.x;
      const dy = (pullPlayer.y + pullPlayer.height / 2) - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        const pullSpeed = 12 * (1 - dist / 150) + 4;
        this.x += (dx / dist) * pullSpeed;
        this.y += (dy / dist) * pullSpeed;
      }
    }
  }

  draw(ctx, quality = 'medium') {
    if (!this.active) return;

    const isHighQuality = quality === 'high';
    ctx.save();

    if (isHighQuality) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }

    ctx.translate(this.x, this.y);
    
    const spinWidth = Math.cos(this.phase);
    ctx.scale(spinWidth, 1);

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(3, 3, 12, 0.7)';
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  collidesWith(player) {
    if (!this.active) return false;

    const pLeft = player.x;
    const pRight = player.x + player.width;
    const pTop = player.y;
    const pBottom = player.y + player.height;

    const isOverlapping = (this.x + this.size / 2 > pLeft && this.x - this.size / 2 < pRight &&
                           this.y + this.size / 2 > pTop && this.y - this.size / 2 < pBottom);

    if (isOverlapping) {
      this.active = false;
      window.audio.playCoin();
      window.particles.spawn(this.x, this.y, this.color, 6, 'coin');
    }

    return isOverlapping;
  }
}


// ==================== POWER-UP ITEM CLASS ====================
class Powerup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // shield, magnet, slow_motion, speed_boost, double_coins, extra_life, invincibility
    this.size = 28;
    this.width = this.size;
    this.height = this.size;
    this.active = true;
    this.phase = Math.random() * Math.PI;
    this.color = window.COLORS.CYAN;

    this.init();
  }

  init() {
    switch (this.type) {
      case 'shield':
        this.color = window.COLORS.CYAN;
        break;
      case 'magnet':
        this.color = window.COLORS.BLUE;
        break;
      case 'slow_motion':
        this.color = window.COLORS.PURPLE;
        break;
      case 'speed_boost':
        this.color = window.COLORS.GREEN;
        break;
      case 'double_coins':
        this.color = window.COLORS.PINK;
        break;
      case 'extra_life':
        this.color = window.COLORS.RED;
        break;
      case 'invincibility':
        this.color = window.COLORS.YELLOW;
        break;
    }
  }

  update(worldSpeed, player) {
    if (!this.active) return;

    this.x -= worldSpeed;
    this.phase += 0.05;
    this.y += Math.sin(this.phase) * 0.25;

    let pullPlayer = null;
    if (player.magnetTimer > 0 && !player.isDead) {
      pullPlayer = player;
    }
    if (window.game && window.game.isMultiplayer && window.game.player2 && !window.game.player2.isDead && window.game.player2.magnetTimer > 0) {
      if (!pullPlayer) {
        pullPlayer = window.game.player2;
      } else {
        const d1 = Math.hypot((player.x + player.width/2) - this.x, (player.y + player.height/2) - this.y);
        const d2 = Math.hypot((window.game.player2.x + window.game.player2.width/2) - this.x, (window.game.player2.y + window.game.player2.height/2) - this.y);
        if (d2 < d1) pullPlayer = window.game.player2;
      }
    }

    if (pullPlayer) {
      const dx = (pullPlayer.x + pullPlayer.width / 2) - this.x;
      const dy = (pullPlayer.y + pullPlayer.height / 2) - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const pullSpeed = 4 * (1 - dist / 100);
        this.x += (dx / dist) * pullSpeed;
        this.y += (dy / dist) * pullSpeed;
      }
    }
  }

  draw(ctx, quality = 'medium') {
    if (!this.active) return;

    const isHighQuality = quality === 'high';
    ctx.save();

    if (isHighQuality) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
    }

    ctx.fillStyle = 'rgba(10, 10, 26, 0.8)';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    const cx = this.x + this.size / 2;
    const cy = this.y + this.size / 2;

    switch (this.type) {
      case 'shield':
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 6);
        ctx.lineTo(cx + 6, cy - 6);
        ctx.lineTo(cx + 6, cy);
        ctx.quadraticCurveTo(cx, cy + 8, cx - 6, cy);
        ctx.closePath();
        ctx.fill();
        break;

      case 'magnet':
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 5, Math.PI, 0, true);
        ctx.lineTo(cx + 5, cy + 5);
        ctx.moveTo(cx - 5, cy - 2);
        ctx.lineTo(cx - 5, cy + 5);
        ctx.stroke();
        ctx.fillStyle = window.COLORS.RED;
        ctx.fillRect(cx - 6.5, cy + 4, 3, 2);
        ctx.fillRect(cx + 3.5, cy + 4, 3, 2);
        break;

      case 'slow_motion':
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy - 4);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 3, cy);
        ctx.stroke();
        break;

      case 'speed_boost':
        ctx.beginPath();
        ctx.moveTo(cx + 3, cy - 8);
        ctx.lineTo(cx - 4, cy);
        ctx.lineTo(cx + 1, cy);
        ctx.lineTo(cx - 3, cy + 8);
        ctx.lineTo(cx + 4, cy);
        ctx.lineTo(cx - 1, cy);
        ctx.closePath();
        ctx.fill();
        break;

      case 'double_coins':
        ctx.font = 'bold 12px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2X', cx, cy);
        break;

      case 'extra_life':
        ctx.fillStyle = window.COLORS.RED;
        ctx.fillRect(cx - 2, cy - 7, 4, 14);
        ctx.fillRect(cx - 7, cy - 2, 14, 4);
        break;

      case 'invincibility':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angleOuter = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const outerX = cx + Math.cos(angleOuter) * 7;
          const outerY = cy + Math.sin(angleOuter) * 7;
          ctx.lineTo(outerX, outerY);
        }
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  collidesWith(player) {
    if (!this.active) return false;

    const pLeft = player.x;
    const pRight = player.x + player.width;
    const pTop = player.y;
    const pBottom = player.y + player.height;

    const isOverlapping = (this.x + this.size > pLeft && this.x < pRight &&
                           this.y + this.size > pTop && this.y < pBottom);

    if (isOverlapping) {
      this.active = false;
      window.audio.playAchievement();
      window.particles.spawn(this.x + this.size/2, this.y + this.size/2, this.color, 12, 'spark');
    }

    return isOverlapping;
  }
}

window.Coin = Coin;
window.Powerup = Powerup;
