// Dynamic Particle System for Cyber Dash

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.color = '#fff';
    this.size = 2;
    this.maxLife = 30;
    this.life = 0;
    this.gravity = 0;
    this.alpha = 1;
    this.type = 'dust'; // dust, spark, coin, explosion, rain, meteor, dash_ghost, laser
    this.glow = false;
    this.extra = null;
  }
}

class ParticleSystem {
  constructor() {
    this.pool = [];
    this.maxParticles = 400;
    // Pre-populate pool
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push(new Particle());
    }
  }

  getFreeParticle() {
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.pool[i].active) {
        return this.pool[i];
      }
    }
    // Force reclaim oldest active if pool is exhausted
    let oldest = this.pool[0];
    for (let i = 1; i < this.maxParticles; i++) {
      if (this.pool[i].life > oldest.life) {
        oldest = this.pool[i];
      }
    }
    return oldest;
  }

  spawn(x, y, color, count = 1, type = 'dust', speedFactor = 1, extra = null) {
    for (let i = 0; i < count; i++) {
      const p = this.getFreeParticle();
      p.reset();
      p.active = true;
      p.x = x;
      p.y = y;
      p.color = color;
      p.type = type;
      p.extra = extra;

      switch (type) {
        case 'dust':
          p.vx = -Math.random() * 2 - 1;
          p.vy = -Math.random() * 1.5;
          p.size = Math.random() * 4 + 2;
          p.maxLife = Math.random() * 20 + 20;
          p.gravity = -0.05; // float up slightly
          break;
        case 'spark':
          const ang = Math.random() * Math.PI * 2;
          const spd = Math.random() * 4 + 2;
          p.vx = Math.cos(ang) * spd;
          p.vy = Math.sin(ang) * spd - 1;
          p.size = Math.random() * 2 + 1;
          p.maxLife = Math.random() * 15 + 10;
          p.gravity = 0.2; // fall
          p.glow = true;
          break;
        case 'coin':
          p.vx = (Math.random() * 2 - 1) * 3;
          p.vy = -Math.random() * 4 - 2;
          p.size = Math.random() * 3 + 3;
          p.maxLife = Math.random() * 20 + 15;
          p.gravity = 0.15;
          p.glow = true;
          break;
        case 'explosion':
          const angle = Math.random() * Math.PI * 2;
          const speed = (Math.random() * 6 + 4) * speedFactor;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.size = Math.random() * 6 + 3;
          p.maxLife = Math.random() * 30 + 25;
          p.gravity = 0.05;
          p.glow = true;
          break;
        case 'laser':
          p.vx = (Math.random() * 2 - 1) * 1.5;
          p.vy = (Math.random() * 2 - 1) * 1.5;
          p.size = Math.random() * 2 + 2;
          p.maxLife = Math.random() * 15 + 10;
          p.glow = true;
          break;
        case 'rain':
          p.vx = -4 - Math.random() * 2; // blow left
          p.vy = 12 + Math.random() * 5;  // fall fast
          p.size = Math.random() * 1.5 + 0.5;
          p.maxLife = 90;
          break;
        case 'meteor':
          p.vx = -6 - Math.random() * 3;
          p.vy = 8 + Math.random() * 4;
          p.size = Math.random() * 6 + 4;
          p.maxLife = 120;
          p.glow = true;
          break;
        case 'dash_ghost':
          p.vx = 0;
          p.vy = 0;
          p.size = 1; // Used for drawing logic
          p.maxLife = 18;
          p.glow = true;
          break;
      }
    }
  }

  update(worldSpeed) {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life++;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      // Move particle
      if (p.type === 'rain' || p.type === 'meteor') {
        p.x += p.vx;
        p.y += p.vy;
      } else {
        p.x += p.vx - worldSpeed;
        p.y += p.vy;
      }

      p.vy += p.gravity;
      p.alpha = 1 - (p.life / p.maxLife);
    }
  }

  draw(ctx, quality = 'medium') {
    const isHighQuality = quality === 'high';
    
    ctx.save();
    
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      ctx.globalAlpha = p.alpha;

      if (isHighQuality && p.glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
      } else {
        ctx.shadowBlur = 0;
      }

      if (p.type === 'dash_ghost') {
        if (p.extra && typeof p.extra.drawGhost === 'function') {
          p.extra.drawGhost(ctx, p.x, p.y, p.alpha, p.color);
        }
      } else if (p.type === 'rain') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 0.8, p.y + p.vy * 0.8);
        ctx.stroke();
      } else if (p.type === 'meteor') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();
      } else if (p.type === 'spark') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  clear() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool[i].active = false;
    }
  }
}

window.particles = new ParticleSystem();
