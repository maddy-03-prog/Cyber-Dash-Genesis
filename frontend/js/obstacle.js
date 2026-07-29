// Obstacles Module for Cyber Dash

class Obstacle {
  constructor(canvasWidth, trackY, type) {
    this.x = canvasWidth + 100;
    this.trackY = trackY;
    this.type = type; // laser_wall, barrier, drone, mine, electric_trap, buzzsaw
    this.width = 30;
    this.height = 80;
    this.y = trackY - this.height;
    this.color = window.COLORS.RED;
    this.active = true;
    this.phase = Math.random() * Math.PI * 2;
    this.speedY = 0;
    this.canBeDestroyed = false;

    this.init();
  }

  init() {
    switch (this.type) {
      case 'laser_wall':
        this.width = 16;
        this.height = 90;
        this.y = this.trackY - this.height;
        this.color = window.COLORS.RED;
        this.canBeDestroyed = true;
        break;
      case 'barrier':
        this.width = 24;
        this.height = 42;
        this.y = this.trackY - this.height - 30;
        this.color = window.COLORS.PINK;
        break;
      case 'drone':
        this.width = 36;
        this.height = 36;
        this.y = this.trackY - 90 - Math.random() * 30;
        this.color = window.COLORS.PURPLE;
        this.speedY = 1.5;
        this.canBeDestroyed = true;
        break;
      case 'mine':
        this.width = 20;
        this.height = 14;
        this.y = this.trackY - this.height;
        this.color = window.COLORS.YELLOW;
        break;
      case 'electric_trap':
        this.width = 40;
        this.height = 80;
        this.y = this.trackY - this.height;
        this.color = window.COLORS.BLUE;
        break;
      case 'buzzsaw':
        this.width = 48;
        this.height = 48;
        this.y = this.trackY - this.height / 2;
        this.color = window.COLORS.PINK;
        break;
    }
  }

  update(worldSpeed) {
    this.x -= worldSpeed;
    this.phase += 0.05;

    if (this.type === 'drone') {
      this.y += Math.sin(this.phase) * this.speedY;
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

    switch (this.type) {
      case 'laser_wall':
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.trackY - 10, this.width, 10);
        ctx.fillRect(this.x, this.y, this.width, 10);

        const glowPulse = 2 + Math.abs(Math.sin(this.phase * 2)) * 3;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = glowPulse;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 10);
        ctx.lineTo(this.x + this.width / 2, this.trackY - 10);
        ctx.stroke();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 10);
        ctx.lineTo(this.x + this.width / 2, this.trackY - 10);
        ctx.stroke();
        break;

      case 'barrier':
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, [4]);
        ctx.fill();
        ctx.stroke();

        const scanY = this.y + Math.abs(Math.sin(this.phase)) * this.height;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, scanY);
        ctx.lineTo(this.x + this.width, scanY);
        ctx.stroke();
        break;

      case 'drone':
        ctx.fillStyle = '#222';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = window.COLORS.CYAN;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 4, this.y + this.height/2, 3, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y + 10);
        ctx.lineTo(this.x + this.width + 5, this.y + 10);
        ctx.stroke();
        break;

      case 'mine':
        ctx.fillStyle = '#222';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.trackY);
        ctx.lineTo(this.x + 4, this.y);
        ctx.lineTo(this.x + this.width - 4, this.y);
        ctx.lineTo(this.x + this.width, this.trackY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const isBlinking = Math.floor(this.phase * 3) % 2 === 0;
        ctx.fillStyle = isBlinking ? window.COLORS.RED : '#500';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y, 3, 0, Math.PI*2);
        ctx.fill();
        break;

      case 'electric_trap':
        ctx.fillStyle = '#444';
        ctx.fillRect(this.x, this.y, 8, this.height);
        ctx.fillRect(this.x + this.width - 8, this.y, 8, this.height);

        const hasArc = Math.sin(this.phase * 5) > -0.2;
        if (hasArc) {
          ctx.strokeStyle = window.COLORS.BLUE;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.x + 8, this.y + 20);
          
          let curX = this.x + 8;
          let curY = this.y + 20;
          const targetX = this.x + this.width - 8;
          
          while (curX < targetX) {
            curX += 6;
            curY += (Math.random() * 16 - 8);
            ctx.lineTo(curX, curY);
          }
          ctx.lineTo(targetX, this.y + 20);
          ctx.stroke();
        }
        break;

      case 'buzzsaw':
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.phase * 4);
        
        ctx.fillStyle = '#333';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const teeth = 12;
        const outerRad = this.width / 2;
        const innerRad = outerRad * 0.7;
        
        for (let i = 0; i < teeth * 2; i++) {
          const r = i % 2 === 0 ? outerRad : innerRad;
          const theta = (i / teeth) * Math.PI;
          ctx.lineTo(Math.cos(theta) * r, Math.sin(theta) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI*2);
        ctx.fill();
        
        ctx.restore();
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

    const oLeft = this.x;
    const oRight = this.x + this.width;
    const oTop = this.y;
    const oBottom = this.y + this.height;

    if (this.type === 'electric_trap') {
      const isArcing = Math.sin(this.phase * 5) > -0.2;
      if (!isArcing) return false;
    }

    const isOverlapping = (pRight > oLeft && pLeft < oRight && pBottom > oTop && pTop < oBottom);
    
    if (isOverlapping && this.type === 'mine') {
      this.explodeMine();
    }
    
    return isOverlapping;
  }

  explodeMine() {
    this.active = false;
    window.audio.playExplosion();
    window.particles.spawn(this.x + this.width/2, this.trackY, window.COLORS.YELLOW, 25, 'spark', 1.3);
  }

  destroy() {
    this.active = false;
    window.audio.playExplosion();
    window.particles.spawn(this.x + this.width/2, this.y + this.height/2, this.color, 18, 'explosion', 0.8);
  }
}

window.Obstacle = Obstacle;
