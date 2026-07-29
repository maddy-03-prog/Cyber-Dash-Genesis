// Cyber Dash: Genesis - AAA Official Website & 30-Sec AI Teaser Controller

class LandingPage {
  constructor() {
    this.audioPlaying = false;
    this.preloaderPercent = 0;
    this.teaserVideo = null;
    this.init();
  }

  init() {
    document.body.classList.add('landing-active');

    const start = () => {
      this.initPreloader();
      this.initHeroCanvas();
      this.initTeaserVideo();
      this.initScrollObservers();
      this.initNavigation();
      this.initCharacterModals();
      this.initFaqAccordion();
      this.initLeaderboardTabs();
      this.initMultiplayerMesh();
      this.initCustomCursor();
      this.initBackToTop();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  }

  // ==================== 0. PRELOADER ====================
  initPreloader() {
    const fill = document.getElementById('preloader-bar-fill');
    const pct = document.getElementById('preloader-percent');
    const tipEl = document.getElementById('preloader-tip-text');
    const preloader = document.getElementById('landing-preloader');

    if (!preloader) return;

    const dismiss = () => {
      if (fill) fill.style.width = '100%';
      if (pct) pct.innerText = '100%';
      preloader.classList.add('preloader-done');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 300);
    };

    // Click anywhere on preloader to force dismiss instantly
    preloader.addEventListener('click', dismiss);

    const tips = [
      "PRO-TIP: Double jump at the leap apex to reach hidden rooftop credits.",
      "SYSTEM LOG: NEXUS PRIME defense matrices unlock at Stage 10.",
      "TACTICAL ADVICE: Activate Energy Shield right before entering laser nets.",
      "CYBER ARSENAL: Upgrade your dash cooldown in the Skill Tree for speed runs."
    ];
    let tipIdx = 0;

    const interval = setInterval(() => {
      this.preloaderPercent += Math.floor(Math.random() * 25) + 15;
      if (this.preloaderPercent >= 100) {
        this.preloaderPercent = 100;
        clearInterval(interval);
        dismiss();
      }

      if (fill) fill.style.width = `${this.preloaderPercent}%`;
      if (pct) pct.innerText = `${this.preloaderPercent}%`;

      if (this.preloaderPercent % 30 === 0 && tipEl) {
        tipIdx = (tipIdx + 1) % tips.length;
        tipEl.innerText = tips[tipIdx];
      }
    }, 40);

    // Fallback safety: force dismiss after 1 second max
    setTimeout(() => {
      clearInterval(interval);
      dismiss();
    }, 1000);
  }

  // ==================== 1. HERO CYBER CITY CANVAS ====================
  initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Rain particles
    const rain = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * 20 + 10,
      speed: Math.random() * 12 + 8
    }));

    // Flying Cyber Cars
    const cars = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.6) + 50,
      speed: (Math.random() * 3 + 1.5) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.5 ? '#00f3ff' : '#ff007f',
      length: Math.random() * 40 + 20
    }));

    const render = () => {
      ctx.fillStyle = '#03020c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Cyber Skyscrapers
      const bCount = 16;
      const bWidth = canvas.width / bCount;
      for (let i = 0; i < bCount; i++) {
        const bHeight = 200 + (Math.sin(i * 99) * 100 + 150);
        const bx = i * bWidth;
        const by = canvas.height - bHeight;

        ctx.fillStyle = '#060517';
        ctx.fillRect(bx + 4, by, bWidth - 8, bHeight);

        // Neon outline top
        ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 243, 255, 0.3)' : 'rgba(189, 0, 255, 0.3)';
        ctx.fillRect(bx + 4, by, bWidth - 8, 2);

        // Window lights
        ctx.fillStyle = 'rgba(0, 243, 255, 0.15)';
        for (let wy = by + 20; wy < canvas.height - 20; wy += 25) {
          for (let wx = bx + 12; wx < bx + bWidth - 20; wx += 16) {
            if ((i + wy + wx) % 3 === 0) {
              ctx.fillRect(wx, wy, 6, 10);
            }
          }
        }
      }

      // Draw Flying Cyber Traffic
      cars.forEach(car => {
        car.x += car.speed;
        if (car.x > canvas.width + 50) car.x = -50;
        if (car.x < -50) car.x = canvas.width + 50;

        ctx.fillStyle = car.color;
        ctx.shadowColor = car.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(car.x, car.y, car.length, 3);
        ctx.shadowBlur = 0;
      });

      // Draw Rain Drops
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      rain.forEach(r => {
        r.y += r.speed;
        if (r.y > canvas.height) {
          r.y = -20;
          r.x = Math.random() * canvas.width;
        }
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.len);
      });
      ctx.stroke();

      requestAnimationFrame(render);
    };

    render();
  }

  // ==================== 2. 1-MINUTE (60-SEC) ANIMATED AAA GAMEPLAY TRAILER ====================
  initTeaserVideo() {
    const canvas = document.getElementById('teaser-video-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let currentTime = 0; // 0 to 60.0 seconds (1 Minute)
    let isPlaying = true;
    let audioOn = true;

    const playBtn = document.getElementById('btn-video-play');
    const audioBtn = document.getElementById('btn-video-audio');
    const timerDisplay = document.getElementById('video-timer-display');
    const scrubberFill = document.getElementById('video-scrubber-fill');
    const scrubberBg = document.getElementById('video-scrubber-bg');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playBtn.innerText = isPlaying ? '⏸ PAUSE' : '▶ PLAY TRAILER';
      });
    }

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        audioOn = !audioOn;
        audioBtn.innerText = audioOn ? '🔊 AUDIO ON' : '🔇 AUDIO OFF';
      });
    }

    if (scrubberBg) {
      scrubberBg.addEventListener('click', (e) => {
        const rect = scrubberBg.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        currentTime = ratio * 60.0;
      });
    }

    let lastTimestamp = performance.now();

    const renderTeaserFrame = (timestamp) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        currentTime += delta;
        if (currentTime >= 60.0) currentTime = 0; // Loop 60s trailer
      }

      // Update Scrubber & Timer
      const progressPct = (currentTime / 60.0) * 100;
      if (scrubberFill) scrubberFill.style.width = `${progressPct}%`;

      const secVal = Math.floor(currentTime);
      const minStr = Math.floor(secVal / 60).toString().padStart(2, '0');
      const secStr = (secVal % 60).toString().padStart(2, '0');
      if (timerDisplay) timerDisplay.innerText = `${minStr}:${secStr} / 01:00`;

      // Canvas dimensions
      canvas.width = canvas.parentElement.clientWidth || 960;
      canvas.height = canvas.parentElement.clientHeight || 480;

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#020108';
      ctx.fillRect(0, 0, w, h);

      // SCENE LOGIC (60 SECONDS TOTAL / 4 SCENES @ 15 SECONDS EACH)
      
      // SCENE 1 (0:00 - 0:15): SECTOR 1 BREACH & MEGACITY PAN
      if (currentTime < 15.0) {
        const progress = currentTime / 15.0;
        const panY = progress * 80;

        ctx.fillStyle = 'rgba(0, 243, 255, 0.06)';
        ctx.fillRect(0, 0, w, h);

        // Skyscraper outlines
        for (let i = 0; i < 12; i++) {
          const bx = i * (w / 12);
          const bh = 220 + Math.sin(i * 15) * 90 + panY;
          ctx.fillStyle = '#05041a';
          ctx.fillRect(bx, h - bh, w / 12 - 6, bh);
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, h - bh, w / 12 - 6, bh);
        }

        ctx.font = '900 2.2rem Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 20;
        ctx.textAlign = 'center';
        ctx.fillText('SCENE 1: SECTOR 1 ESCAPE FACILITY BREACH', w / 2, h / 2 - 20);

        ctx.font = '1rem "Share Tech Mono", monospace';
        ctx.fillStyle = '#ff007f';
        ctx.fillText('[ YEAR 2149: NEXUS MATRIX AUTOMATED SYSTEM WARNING ]', w / 2, h / 2 + 25);
        ctx.shadowBlur = 0;
      }
      
      // SCENE 2 (0:15 - 0:30): HIGH-SPEED OPERATIVE GAMEPLAY RUN
      else if (currentTime < 30.0) {
        const progress = (currentTime - 15.0) / 15.0;
        const runX = progress * (w * 0.85);

        // Sky Highway Floor
        ctx.fillStyle = '#080624';
        ctx.fillRect(0, h * 0.72, w, 12);
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(0, h * 0.72, w, 3);

        // Velocity (Cyan)
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(100 + runX, h * 0.72 - 30, 18, 0, Math.PI * 2);
        ctx.fill();

        // Titan (Purple)
        ctx.fillStyle = '#bd00ff';
        ctx.shadowColor = '#bd00ff';
        ctx.beginPath();
        ctx.arc(50 + runX, h * 0.72 - 30, 22, 0, Math.PI * 2);
        ctx.fill();

        // Ghost (Pink)
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.beginPath();
        ctx.arc(runX, h * 0.72 - 30, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Laser obstacle net
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(w * 0.65, h * 0.25);
        ctx.lineTo(w * 0.65, h * 0.72);
        ctx.stroke();

        ctx.font = '900 2rem Orbitron, sans-serif';
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.textAlign = 'center';
        ctx.fillText('SCENE 2: HIGH-SPEED GAMEPLAY GLIMPSE', w / 2, 70);

        ctx.font = '1rem "Share Tech Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('OPERATIVES: VELOCITY, TITAN & GHOST DODGING LASER TRAPS', w / 2, 105);
        ctx.shadowBlur = 0;
      }

      // SCENE 3 (0:30 - 0:45): KINETIC OVERDRIVE & POWERUP SHOWCASE
      else if (currentTime < 45.0) {
        const pulse = Math.sin(currentTime * 10) * 50;

        ctx.fillStyle = 'rgba(255, 204, 0, 0.08)';
        ctx.fillRect(0, 0, w, h);

        // Nova Magnet Ring
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 120 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Phoenix Flame Aura
        ctx.fillStyle = '#ff3300';
        ctx.shadowColor = '#ff3300';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.arc(w / 3, h / 2, 40, 0, Math.PI * 2);
        ctx.fill();

        // Volt Chain Lightning
        ctx.fillStyle = '#00ff66';
        ctx.shadowColor = '#00ff66';
        ctx.beginPath();
        ctx.arc((w * 2) / 3, h / 2, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '900 2rem Orbitron, sans-serif';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 20;
        ctx.textAlign = 'center';
        ctx.fillText('SCENE 3: KINETIC OVERDRIVE & POWERUP ABILITIES', w / 2, 70);

        ctx.font = '1rem "Share Tech Mono", monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('NOVA (SOLAR MAGNET) • PHOENIX (FLAME REBIRTH) • VOLT (CHAIN LIGHTNING)', w / 2, 105);
        ctx.shadowBlur = 0;
      }

      // SCENE 4 (0:45 - 1:00): EPIC BOSS BATTLE & OUTRO
      else {
        // Boss NEXUS PRIME
        const bossPulse = Math.sin(currentTime * 12) * 15;
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 85 + bossPulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '900 2.4rem Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 25;
        ctx.textAlign = 'center';
        ctx.fillText('SCENE 4: BOSS BATTLE VS NEXUS PRIME', w / 2, h * 0.78);

        ctx.font = '1.2rem Orbitron, sans-serif';
        ctx.fillStyle = '#00f3ff';
        ctx.fillText('CYBER DASH: GENESIS — BREACH THE MATRIX NOW', w / 2, h * 0.88);
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(renderTeaserFrame);
    };

    requestAnimationFrame(renderTeaserFrame);
  }

  // ==================== 3. SCROLL REVEALS & PROGRESS ====================
  initScrollObservers() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          if (entry.target.classList.contains('stat-counter-card')) {
            this.animateCounter(entry.target);
          }
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // Scroll Progress bar & Header scroll styling
    window.addEventListener('scroll', () => {
      const totalH = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalH) * 100;
      const progressBar = document.getElementById('scroll-progress-bar');
      if (progressBar) progressBar.style.width = `${progress}%`;

      const header = document.querySelector('.landing-header');
      if (header) {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      }

      const backToTop = document.getElementById('back-to-top-btn');
      if (backToTop) {
        if (window.scrollY > 500) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
      }
    });
  }

  // Counter animation
  animateCounter(cardEl) {
    const numEl = cardEl.querySelector('.counter-num');
    if (!numEl || numEl.dataset.animated) return;
    numEl.dataset.animated = 'true';

    const target = parseInt(numEl.dataset.target || '100', 10);
    let count = 0;
    const step = Math.ceil(target / 40);

    const timer = setInterval(() => {
      count += step;
      if (count >= target) {
        count = target;
        clearInterval(timer);
      }
      numEl.innerText = `${count}+`;
    }, 30);
  }

  // ==================== 4. NAVIGATION & GAME LAUNCH ====================
  initNavigation() {
    // Smooth scroll for nav links & hero CTAs
    document.querySelectorAll('.nav-links a, .hero-cta-grid a, a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    // PLAY NOW Buttons Launch Game
    document.querySelectorAll('.btn-launch-game').forEach(btn => {
      btn.addEventListener('click', () => this.launchGame());
    });
  }

  launchGame() {
    const landing = document.getElementById('website-landing-page');
    const gameContainer = document.getElementById('game-container');

    document.body.classList.remove('landing-active');

    if (landing) landing.classList.add('fade-out');
    
    setTimeout(() => {
      if (landing) landing.style.display = 'none';
      if (gameContainer) {
        gameContainer.style.display = 'flex';
        gameContainer.style.visibility = 'visible';
      }

      if (window.ui) {
        window.ui.switchScreen('main-menu');
      }
      if (window.audio) {
        window.audio.startLobbyMusic();
      }
    }, 600);
  }

  returnToLandingPage() {
    const landing = document.getElementById('website-landing-page');
    const gameContainer = document.getElementById('game-container');

    document.body.classList.add('landing-active');

    if (gameContainer) gameContainer.style.display = 'none';
    if (landing) {
      landing.style.display = 'block';
      setTimeout(() => {
        landing.classList.remove('fade-out');
      }, 50);
    }
  }

  // ==================== 5. CHARACTER MODALS ====================
  initCharacterModals() {
    const modal = document.getElementById('character-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    document.querySelectorAll('.character-card').forEach(card => {
      card.addEventListener('click', () => {
        const name = card.dataset.name || 'VELOCITY';
        const role = card.dataset.role || 'SPEEDSTER OPERATIVE';
        const passive = card.dataset.passive || 'Kinetic Momentum';
        const ultimate = card.dataset.ultimate || 'Time Dilation Surge';
        const avatar = card.dataset.avatar || '🧑‍🎤';

        document.getElementById('modal-char-name').innerText = name;
        document.getElementById('modal-char-role').innerText = role;
        document.getElementById('modal-char-passive').innerText = passive;
        document.getElementById('modal-char-ultimate').innerText = ultimate;
        document.getElementById('modal-char-avatar').innerText = avatar;

        if (modal) modal.classList.add('modal-open');
      });
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('modal-open'));
    }
  }

  // ==================== 6. FAQ ACCORDION ====================
  initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(qBtn => {
      qBtn.addEventListener('click', () => {
        const item = qBtn.parentElement;
        item.classList.toggle('active');
      });
    });
  }

  // ==================== 7. LEADERBOARD TABS ====================
  initLeaderboardTabs() {
    document.querySelectorAll('.lb-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  }

  // ==================== 8. MULTIPLAYER MESH CANVAS ====================
  initMultiplayerMesh() {
    const canvas = document.getElementById('multiplayer-mesh-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const nodes = Array.from({ length: 18 }, () => ({
      x: Math.random() * 500,
      y: Math.random() * 300,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2
    }));

    const drawMesh = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 320;

      ctx.fillStyle = '#040310';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        ctx.fillStyle = '#00f3ff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.strokeStyle = `rgba(0, 243, 255, ${1 - dist / 120})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawMesh);
    };

    drawMesh();
  }

  // ==================== 9. CUSTOM CURSOR & BACK TO TOP ====================
  initCustomCursor() {
    const spotlight = document.getElementById('cursor-spotlight');
    if (!spotlight) return;

    document.addEventListener('mousemove', (e) => {
      spotlight.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });
  }

  initBackToTop() {
    const btn = document.getElementById('back-to-top-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
}

window.landingPage = new LandingPage();
