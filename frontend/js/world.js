// Procedural World, Track, Parallax Background, and Weather Events Manager

class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.trackY = 430; // standard floor height
    this.ceilY = 130;  // ceiling height for gravity shift
    
    // Background parallax layers
    this.stars = [];
    this.backBuildings = [];
    this.midBuildings = [];
    this.hoverCars = [];
    this.holograms = [];

    // Tracks: segments of platforms
    this.platforms = [];
    
    // Grid horizontal lines scroll tracking
    this.gridScroll = 0;

    // Weather / Event States
    this.activeEvent = null; // emp, rain, meteors, gravity_shift
    this.eventTimer = 0;
    this.hologramGlowFactor = 1.0;
    this.lightsOn = true;

    this.initBackgrounds();
    this.resetPlatforms();
  }

  reset() {
    this.activeEvent = null;
    this.eventTimer  = 0;
    this.lightsOn    = true;
    this.resetPlatforms();
    // Re-apply theme if one is set
    if (this.currentTheme) this.applyTheme(this.currentTheme);
  }

  setTheme(theme) {
    if (!theme) return;
    this.currentTheme = theme;
    this.applyTheme(theme);
  }

  applyTheme(theme) {
    this.themeAccent  = theme.accentColor  || '#00f3ff';
    this.themeBg      = theme.bgColor      || '#020208';
    this.themeFog     = theme.fogColor     || 'rgba(0,243,255,0.04)';
    this.themeFloor   = theme.floorGlow    || '#00f3ff';
    this.themeBuildHue = theme.buildingHue || 240;
    this.themeWeather  = theme.weather     || 'none';
    this.themeVoidGlitch = theme.voidGlitch || false;
    this.themeSnowChance = theme.snowChance || 0;
    this.themeRainIntensity = theme.rainIntensity || 0;
    this.themeFogDensity = theme.fogDensity || 0.3;
    this.themeLightning  = theme.lightningChance || 0;
    this.themeStyle      = theme.trackStyle || 'concrete';

    // Rebuild hologram billboard texts from theme
    if (theme.holograms && theme.holograms.length > 0) {
      const cols = [this.themeAccent, '#ffcc00', '#ff007f'];
      this.holograms = theme.holograms.map((text, i) => ({
        x: 300 + i * 500 + Math.random() * 200,
        y: 80 + Math.random() * 80,
        text,
        color: cols[i % cols.length],
        size: 18 + Math.random() * 8,
        textGlow: cols[i % cols.length]
      }));
    }

    // Rebuild buildings with theme hue
    this.backBuildings.forEach(b => { b.hue = this.themeBuildHue + Math.random() * 30 - 15; });
    this.midBuildings.forEach(b  => { b.hue = this.themeBuildHue + Math.random() * 20; });

    // Start appropriate weather event
    if (this.themeWeather === 'rain')   this.triggerEvent('rain', 99999);
    else if (this.themeWeather === 'steam') this.triggerEvent('emp', 99999);
    else if (this.themeWeather === 'snow')  { /* handled in draw */ }
    else if (this.themeWeather === 'glitch') this.triggerEvent('emp', 99999);
    else { this.activeEvent = null; this.lightsOn = true; this.hologramGlowFactor = 1.0; }
  }

  initBackgrounds() {
    // 1. Generate Stars
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * (this.trackY - 150),
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    // 2. Generate Distant Background Buildings
    for (let i = 0; i < 15; i++) {
      this.backBuildings.push({
        x: i * 160 + Math.random() * 40,
        width: 120 + Math.random() * 80,
        height: 180 + Math.random() * 120,
        hue: 240 + Math.random() * 40 // violet-blues
      });
    }

    // 3. Generate Midground Buildings (closer, detailed windows)
    for (let i = 0; i < 8; i++) {
      this.midBuildings.push({
        x: i * 280 + Math.random() * 60,
        width: 140 + Math.random() * 80,
        height: 240 + Math.random() * 150,
        hue: 280 + Math.random() * 60, // purple-magenta
        windows: this.generateWindows()
      });
    }

    // 4. Generate Hovering cars
    for (let i = 0; i < 12; i++) {
      this.hoverCars.push({
        x: Math.random() * this.canvas.width,
        y: 80 + Math.random() * 180,
        speed: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1),
        color: Math.random() > 0.5 ? window.COLORS.CYAN : window.COLORS.PINK,
        size: Math.random() * 3 + 2
      });
    }

    // 5. Generate Hologram adverts
    this.holograms.push({
      x: 300, y: 150, text: 'CYBERPUNK', color: window.COLORS.PINK, size: 24, textGlow: window.COLORS.PINK
    });
    this.holograms.push({
      x: 800, y: 80, text: 'AI CORE V9', color: window.COLORS.CYAN, size: 20, textGlow: window.COLORS.CYAN
    });
    this.holograms.push({
      x: 1200, y: 120, text: 'GLITCH.SYS', color: window.COLORS.YELLOW, size: 18, textGlow: window.COLORS.YELLOW
    });
  }

  generateWindows() {
    const list = [];
    const rows = 12;
    const cols = 5;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.6) {
          list.push({ r, c, active: true });
        }
      }
    }
    return list;
  }

  resetPlatforms() {
    this.platforms = [];
    this.platforms.push({
      x: 0,
      width: this.canvas.width + 200,
      gap: false
    });
  }

  generateNextSegment(worldSpeed) {
    if (this.platforms.length === 0) return;

    const last = this.platforms[this.platforms.length - 1];
    
    if (last.x + last.width < this.canvas.width + 400) {
      const isGap = Math.random() > 0.70; // 30% chance of a gap jump
      const minPlatformWidth = 400;
      const nextWidth = minPlatformWidth + Math.random() * 600;
      const nextX = last.x + last.width + (isGap ? 100 + Math.random() * 120 : 0);

      this.platforms.push({
        x: nextX,
        width: nextWidth,
        gap: isGap
      });
    }
  }

  triggerEvent(eventType, duration = 600) {
    this.activeEvent = eventType;
    this.eventTimer = duration;

    if (eventType === 'emp') {
      this.lightsOn = false;
      this.hologramGlowFactor = 0.15;
    } else {
      this.lightsOn = true;
      this.hologramGlowFactor = 1.0;
    }
  }

  update(worldSpeed) {
    this.gridScroll = (this.gridScroll - worldSpeed) % 40;

    this.backBuildings.forEach(b => {
      b.x -= worldSpeed * 0.08;
      if (b.x + b.width < 0) {
        b.x = this.canvas.width + Math.random() * 100;
      }
    });

    this.midBuildings.forEach(b => {
      b.x -= worldSpeed * 0.18;
      if (b.x + b.width < 0) {
        b.x = this.canvas.width + Math.random() * 150;
        b.windows = this.generateWindows();
      }
    });

    this.holograms.forEach(h => {
      h.x -= worldSpeed * 0.25;
      if (h.x < -150) {
        h.x = this.canvas.width + Math.random() * 400;
      }
    });

    this.hoverCars.forEach(c => {
      c.x += c.speed - worldSpeed * 0.35;
      if (c.x < -50) c.x = this.canvas.width + 50;
      if (c.x > this.canvas.width + 50) c.x = -50;
    });

    this.platforms.forEach(p => {
      p.x -= worldSpeed;
    });

    this.platforms = this.platforms.filter(p => p.x + p.width > -100);
    this.generateNextSegment(worldSpeed);

    if (this.activeEvent) {
      this.eventTimer--;
      if (this.eventTimer <= 0) {
        this.activeEvent = null;
        this.lightsOn = true;
        this.hologramGlowFactor = 1.0;
      }

      if (this.activeEvent === 'rain') {
        if (Math.random() > 0.4) {
          window.particles.spawn(Math.random() * this.canvas.width, 0, window.COLORS.CYAN, 1, 'rain');
        }
      }

      if (this.activeEvent === 'meteors') {
        if (Math.random() > 0.96) {
          window.particles.spawn(Math.random() * this.canvas.width + 100, 0, window.COLORS.RED, 1, 'meteor');
        }
      }

      if (this.activeEvent === 'emp') {
        if (Math.random() > 0.95) {
          this.lightsOn = !this.lightsOn;
          this.hologramGlowFactor = this.lightsOn ? 0.8 : 0.05;
        }
      }
    }
  }

  getFloorHeightAt(playerX, playerWidth) {
    const pxCenter = playerX + playerWidth / 2;
    
    for (let p of this.platforms) {
      if (pxCenter >= p.x && pxCenter <= p.x + p.width) {
        return this.activeEvent === 'gravity_shift' ? this.ceilY : this.trackY;
      }
    }
    return 9999;
  }

  draw(ctx, quality = 'medium') {
    const isHighQuality = quality === 'high';
    const isGravity = this.activeEvent === 'gravity_shift';
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Theme-aware sky gradient
    const bgColor = this.themeBg || '#020208';
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, bgColor);
    skyGrad.addColorStop(0.6, this.themeBg || '#020208');
    skyGrad.addColorStop(1, '#000004');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Void glitch effect (Stage 9)
    if (this.themeVoidGlitch && isHighQuality && Math.random() > 0.92) {
      const glitchH = 2 + Math.random() * 12;
      const glitchY = Math.random() * H;
      ctx.fillStyle = `rgba(180, 0, 255, ${Math.random() * 0.3})`;
      ctx.fillRect(0, glitchY, W, glitchH);
      ctx.fillStyle = `rgba(0, 243, 255, ${Math.random() * 0.2})`;
      ctx.fillRect(Math.random() * 20, glitchY, W, glitchH * 0.5);
    }

    // Snow effect (Stage 8)
    if (this.themeSnowChance > 0 && Math.random() < this.themeSnowChance * 0.5) {
      window.particles && window.particles.spawn(Math.random() * W, -5, '#cce8ff', 0.7, 'rain');
    }

    // Lightning flash (storm stages)
    if (this.themeLightning > 0 && Math.random() < this.themeLightning) {
      ctx.fillStyle = 'rgba(200, 220, 255, 0.08)';
      ctx.fillRect(0, 0, W, H);
    }

    // Volumetric fog layer
    if (this.themeFogDensity > 0 && this.themeFog) {
      const fogGrad = ctx.createLinearGradient(0, H * 0.5, 0, H);
      fogGrad.addColorStop(0, 'transparent');
      fogGrad.addColorStop(1, this.themeFog.replace('0.04', String(this.themeFogDensity * 0.12)));
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, W, H);
    }

    // Stars (dimmed or hidden on bright themes like Stage 11)
    const starAlphaMult = this.themeBg && this.themeBg.startsWith('#f') ? 0.1 : 1.0;
    ctx.fillStyle = '#fff';
    this.stars.forEach(s => {
      ctx.globalAlpha = s.alpha * starAlphaMult;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1.0;

    this.backBuildings.forEach(b => {
      ctx.fillStyle = this.lightsOn ? `hsla(${b.hue}, 40%, 10%, 0.9)` : '#030307';
      ctx.fillRect(b.x, this.canvas.height - b.height - 120, b.width, b.height);
      ctx.strokeStyle = this.lightsOn ? `hsla(${b.hue}, 60%, 15%, 0.4)` : '#050508';
      ctx.strokeRect(b.x, this.canvas.height - b.height - 120, b.width, b.height);
    });

    this.midBuildings.forEach(b => {
      const topY = this.canvas.height - b.height - 120;
      ctx.fillStyle = this.lightsOn ? `hsla(${b.hue}, 45%, 8%, 0.95)` : '#010103';
      ctx.fillRect(b.x, topY, b.width, b.height);
      ctx.strokeStyle = this.lightsOn ? `hsla(${b.hue}, 50%, 12%, 0.8)` : '#020204';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x, topY, b.width, b.height);

      if (this.lightsOn) {
        ctx.fillStyle = `hsla(${b.hue}, 100%, 75%, 0.65)`;
        const wWidth = 6;
        const wHeight = 8;
        const spacingX = (b.width - 20) / 5;
        const spacingY = (b.height - 30) / 12;

        b.windows.forEach(w => {
          ctx.fillRect(b.x + 10 + w.c * spacingX, topY + 15 + w.r * spacingY, wWidth, wHeight);
        });
      }
    });

    this.holograms.forEach(h => {
      ctx.save();
      ctx.globalAlpha = this.hologramGlowFactor * 0.85;
      
      if (isHighQuality && this.hologramGlowFactor > 0.5) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = h.textGlow;
      }
      
      ctx.fillStyle = h.color;
      ctx.font = `bold ${h.size}px Orbitron`;
      ctx.textAlign = 'center';
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeRect(h.x - 70, h.y - 20, 140, 30);
      
      ctx.fillText(h.text, h.x, h.y);
      ctx.restore();

      // Draw Grappling hook node ring around hologram coordinates
      ctx.save();
      ctx.strokeStyle = window.COLORS.GREEN;
      ctx.lineWidth = 2.5;
      if (isHighQuality) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = window.COLORS.GREEN;
      }
      ctx.beginPath();
      const pulseSize = 18 + Math.sin(Date.now() / 150) * 4;
      ctx.arc(h.x, h.y - 5, pulseSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    this.hoverCars.forEach(c => {
      ctx.fillStyle = this.lightsOn ? c.color : '#222';
      ctx.fillRect(c.x, c.y, c.size * 3, c.size);
      
      if (this.lightsOn) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(c.speed > 0 ? c.x + c.size * 3 - 2 : c.x, c.y, 2, c.size);
      }
    });

    ctx.save();
    
    if (isHighQuality) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.themeFloor || window.COLORS.CYAN;
    }

    const currentTrackY = isGravity ? this.ceilY : this.trackY;

    this.platforms.forEach(p => {
      ctx.fillStyle = '#06060f';
      ctx.strokeStyle = this.themeFloor || window.COLORS.CYAN;
      ctx.lineWidth = 3.5;

      ctx.beginPath();
      if (isGravity) {
        ctx.roundRect(p.x, 0, p.width, currentTrackY, [0, 0, 8, 8]);
      } else {
        ctx.roundRect(p.x, currentTrackY, p.width, this.canvas.height - currentTrackY, [8, 8, 0, 0]);
      }
      ctx.fill();
      ctx.stroke();

      const accentRgb = this.themeAccent || '#00f3ff';
      ctx.strokeStyle = `${accentRgb}33`;
      ctx.lineWidth = 1;
      
      const gridInterval = 40;
      const startGridX = Math.ceil(p.x / gridInterval) * gridInterval;
      
      for (let gx = startGridX; gx < p.x + p.width; gx += gridInterval) {
        ctx.beginPath();
        if (isGravity) {
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, currentTrackY - 4);
        } else {
          ctx.moveTo(gx, currentTrackY + 4);
          ctx.lineTo(gx, this.canvas.height);
        }
        ctx.stroke();
      }

      // Draw overhead yellow Grind Rail
      if (!isGravity) {
        ctx.save();
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3.5;
        if (isHighQuality) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffcc00';
        }
        ctx.beginPath();
        ctx.moveTo(p.x, 280);
        ctx.lineTo(p.x + p.width, 280);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2.0;
        for (let rx = p.x + 40; rx < p.x + p.width - 20; rx += 160) {
          ctx.beginPath();
          ctx.moveTo(rx, 280);
          ctx.lineTo(rx, currentTrackY);
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    ctx.strokeStyle = window.COLORS.CYAN;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(0, currentTrackY);
    ctx.lineTo(this.canvas.width, currentTrackY);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let gx = this.gridScroll; gx < this.canvas.width; gx += 40) {
      ctx.beginPath();
      if (isGravity) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, currentTrackY);
      } else {
        ctx.moveTo(gx, currentTrackY);
        ctx.lineTo(gx, this.canvas.height);
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}

window.World = World;
