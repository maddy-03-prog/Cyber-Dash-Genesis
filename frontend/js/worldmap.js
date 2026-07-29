// World Map — Interactive Canvas Campaign Map for Cyber Dash: Genesis

class WorldMap {
  constructor() {
    this.canvas   = null;
    this.ctx      = null;
    this.nodes    = [];
    this.paths    = [];
    this.hoveredNode = null;
    this.animFrame   = 0;
    this.selectedNode = null;
    this.initialized  = false;
  }

  // Node positions on the 1200×520 map canvas
  buildNodes() {
    const defs = [
      { id: 1,  x: 90,   y: 440, label: 'STAGE 1',  name: 'Escape Facility',   difficulty: 'EASY',      color: '#00f3ff' },
      { id: 2,  x: 240,  y: 380, label: 'STAGE 2',  name: 'Neon Streets',      difficulty: 'EASY',      color: '#ff007f' },
      { id: 3,  x: 370,  y: 310, label: 'STAGE 3',  name: 'Cyber Market',      difficulty: 'EASY',      color: '#ffcc00' },
      { id: 4,  x: 500,  y: 380, label: 'STAGE 4',  name: 'Industrial Factory',difficulty: 'MEDIUM',    color: '#ff6600' },
      { id: 5,  x: 610,  y: 440, label: 'STAGE 5',  name: 'Underground Metro', difficulty: 'MEDIUM',    color: '#3399ff' },
      { id: 6,  x: 730,  y: 360, label: 'STAGE 6',  name: 'Sky Highway',       difficulty: 'MEDIUM',    color: '#00ccff' },
      { id: 7,  x: 840,  y: 280, label: 'STAGE 7',  name: 'Quantum Laboratory',difficulty: 'HARD',      color: '#00ff88' },
      { id: 8,  x: 950,  y: 360, label: 'STAGE 8',  name: 'Frozen Data Center',difficulty: 'HARD',      color: '#88ccff' },
      { id: 9,  x: 1020, y: 440, label: 'STAGE 9',  name: 'Digital Void',      difficulty: 'HARD',      color: '#bd00ff' },
      { id: 10, x: 1080, y: 340, label: 'STAGE 10', name: 'NEXUS Fortress',    difficulty: 'VERY HARD', color: '#ff0040' },
      { id: 11, x: 1100, y: 200, label: 'FINAL',    name: 'AI Core',           difficulty: 'BOSS ONLY', color: '#ffffff' }
    ];

    this.nodes = defs.map(d => ({
      ...d,
      unlocked:  window.story ? window.story.isStageUnlocked(d.id) : d.id === 1,
      completed: window.story ? window.story.isStageCompleted(d.id) : false,
      stars:     window.story ? window.story.getStageStars(d.id) : 0,
      pulsePhase: Math.random() * Math.PI * 2
    }));

    // Paths connecting nodes in order
    this.paths = [];
    for (let i = 0; i < this.nodes.length - 1; i++) {
      this.paths.push({ from: i, to: i + 1 });
    }
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Responsive canvas sizing
    this.canvas.width  = this.canvas.offsetWidth  || 1200;
    this.canvas.height = this.canvas.offsetHeight || 520;

    this.buildNodes();
    this.bindEvents();
    this.initialized = true;
    this.draw();
  }

  refresh() {
    if (!this.initialized) return;
    this.buildNodes();
    this.draw();
  }

  bindEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width  / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top)  * scaleY;

      this.hoveredNode = null;
      this.nodes.forEach(n => {
        const dist = Math.hypot(mx - n.x, my - n.y);
        if (dist < 32) { this.hoveredNode = n; }
      });
      this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', e => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width  / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top)  * scaleY;

      this.nodes.forEach(n => {
        const dist = Math.hypot(mx - n.x, my - n.y);
        if (dist < 32 && n.unlocked) {
          this.selectNode(n);
        }
      });
    });

    // Touch support
    this.canvas.addEventListener('touchend', e => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = this.canvas.getBoundingClientRect();
      const mx = (touch.clientX - rect.left) * (this.canvas.width  / rect.width);
      const my = (touch.clientY - rect.top)  * (this.canvas.height / rect.height);
      this.nodes.forEach(n => {
        if (Math.hypot(mx - n.x, my - n.y) < 36 && n.unlocked) {
          this.selectNode(n);
        }
      });
    });
  }

  selectNode(node) {
    this.selectedNode = node;
    if (window.story) window.story.currentStage = node.id;
    this.showStageBriefing(node);
    if (window.audio) window.audio.playCoin();
  }

  showStageBriefing(node) {
    const stage  = window.story && window.story.getStage(node.id);
    if (!stage) return;

    const panel = document.getElementById('wm-briefing-panel');
    if (!panel) return;

    const el = id => document.getElementById(id);
    if (el('wm-stage-num'))    el('wm-stage-num').innerText    = node.label;
    if (el('wm-stage-name'))   el('wm-stage-name').innerText   = stage.title.split(':')[1]?.trim() || stage.name;
    if (el('wm-stage-diff'))   { el('wm-stage-diff').innerText = stage.difficulty; el('wm-stage-diff').style.color = stage.difficultyColor || node.color; }
    if (el('wm-stage-desc'))   el('wm-stage-desc').innerText   = stage.desc;

    // Objectives list
    const objList = el('wm-objectives-list');
    if (objList) {
      objList.innerHTML = '';
      stage.objectives.forEach(obj => {
        const li = document.createElement('li');
        li.innerText = obj.text;
        objList.appendChild(li);
      });
    }

    // Stars display
    const starsEl = el('wm-stars');
    if (starsEl) {
      starsEl.innerHTML = '';
      for (let i = 1; i <= 3; i++) {
        const s = document.createElement('span');
        s.className = i <= node.stars ? 'wm-star earned' : 'wm-star empty';
        s.innerText = '★';
        starsEl.appendChild(s);
      }
    }

    // Launch button
    const launchBtn = el('wm-btn-launch');
    if (launchBtn) {
      launchBtn.style.background = `linear-gradient(135deg, ${node.color}33, ${node.color}66)`;
      launchBtn.style.borderColor = node.color;
      launchBtn.style.color = node.color;
      launchBtn.style.textShadow = `0 0 10px ${node.color}`;
      launchBtn.onclick = () => this.launchStage(stage);
    }

    panel.classList.remove('wm-panel-hidden');
    panel.classList.add('wm-panel-visible');
  }

  hideBriefing() {
    const panel = document.getElementById('wm-briefing-panel');
    if (panel) {
      panel.classList.remove('wm-panel-visible');
      panel.classList.add('wm-panel-hidden');
    }
    this.selectedNode = null;
  }

  launchStage(stage) {
    if (!stage) return;
    window.story.currentStage = stage.id;
    // Set the stage theme for the world renderer
    if (window.world && window.STAGE_THEMES) {
      window.world.setTheme(window.STAGE_THEMES[stage.id]);
    }
    this.hideBriefing();

    // Trigger intro dialogue then start game
    window.story.triggerStageIntro(stage.id, () => {
      window.storage.state.gameMode = 'campaign';
      window.storage.state.currentCampaignStage = stage.id;
      window.game.startCampaignStage(stage);
    });
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;
    this.animFrame++;

    // Background gradient — dark city skyline
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#020518');
    bgGrad.addColorStop(0.6, '#030a20');
    bgGrad.addColorStop(1, '#000208');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // City silhouette layer
    this.drawCitySilhouette(ctx, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Draw paths between nodes
    this.paths.forEach(p => {
      const fromNode = this.nodes[p.from];
      const toNode   = this.nodes[p.to];
      const isUnlocked = fromNode.unlocked && toNode.unlocked;

      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = isUnlocked ? 2.5 : 1.5;
      ctx.strokeStyle = isUnlocked ? `rgba(0, 243, 255, 0.5)` : `rgba(80, 80, 120, 0.3)`;
      if (isUnlocked) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#00f3ff';
      }
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });

    // Draw nodes
    this.nodes.forEach(node => {
      this.drawNode(ctx, node);
    });

    // Tooltip for hovered node
    if (this.hoveredNode && !this.selectedNode) {
      this.drawTooltip(ctx, this.hoveredNode);
    }

    // Total stars display
    const totalStars = window.storage && window.storage.state.campaign.totalStars || 0;
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 14px Orbitron';
    ctx.textAlign = 'right';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffcc00';
    ctx.fillText(`★ ${totalStars} / 33`, W - 20, 30);
    ctx.shadowBlur = 0;

    // Continuously animate
    requestAnimationFrame(() => {
      if (document.getElementById('campaign-world-map') &&
          !document.getElementById('campaign-world-map').classList.contains('hidden')) {
        this.draw();
      }
    });
  }

  drawNode(ctx, node) {
    const t    = this.animFrame;
    const pulse = Math.sin(t * 0.05 + node.pulsePhase) * 0.5 + 0.5;
    const isCurrent  = window.story && window.story.currentStage === node.id;
    const isHovered  = this.hoveredNode === node;
    const isSelected = this.selectedNode === node;

    ctx.save();

    // Outer ring glow for unlocked nodes
    if (node.unlocked) {
      const ringR = isHovered || isSelected ? 34 : 28 + pulse * 4;
      const alpha = node.completed ? 0.6 : 0.35 + pulse * 0.2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `${node.color}`;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = node.color;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // Current stage pulsing ring
    if (isCurrent) {
      const bigRing = 40 + pulse * 8;
      ctx.beginPath();
      ctx.arc(node.x, node.y, bigRing, 0, Math.PI * 2);
      ctx.strokeStyle = node.color;
      ctx.globalAlpha = 0.25 + pulse * 0.3;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
    if (node.completed) {
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 22);
      grad.addColorStop(0, `${node.color}44`);
      grad.addColorStop(1, `${node.color}22`);
      ctx.fillStyle = grad;
    } else if (node.unlocked) {
      ctx.fillStyle = '#080820';
    } else {
      ctx.fillStyle = '#050510';
    }
    ctx.fill();

    ctx.strokeStyle = node.unlocked ? node.color : '#334';
    ctx.lineWidth = node.unlocked ? 2 : 1;
    ctx.shadowBlur  = node.unlocked ? 12 : 0;
    ctx.shadowColor = node.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner icon
    ctx.font = `bold ${node.completed ? 14 : 12}px Orbitron`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (node.completed) {
      ctx.fillStyle = node.color;
      ctx.fillText('✓', node.x, node.y);
    } else if (node.unlocked) {
      ctx.fillStyle = node.color;
      ctx.fillText(node.id, node.x, node.y);
    } else {
      ctx.fillStyle = '#445';
      ctx.fillText('🔒', node.x, node.y - 1);
    }

    // Stage label below node
    ctx.font = `bold 9px Orbitron`;
    ctx.fillStyle = node.unlocked ? node.color : '#334';
    ctx.globalAlpha = 0.85;
    ctx.fillText(node.label, node.x, node.y + 36);
    ctx.globalAlpha = 1;

    // Stars below label (if any earned)
    if (node.stars > 0) {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText('★'.repeat(node.stars), node.x, node.y + 48);
    }

    ctx.restore();
  }

  drawTooltip(ctx, node) {
    const tx = Math.min(node.x + 40, this.canvas.width - 160);
    const ty = Math.max(node.y - 60, 10);
    ctx.save();
    ctx.fillStyle = 'rgba(5, 5, 20, 0.92)';
    ctx.strokeStyle = node.color;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = node.color;
    ctx.beginPath();
    ctx.roundRect(tx, ty, 155, 50, [6]);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = node.color;
    ctx.font = 'bold 10px Orbitron';
    ctx.textAlign = 'left';
    ctx.fillText(node.label, tx + 10, ty + 16);
    ctx.fillStyle = '#ccddee';
    ctx.font = '9px Orbitron';
    ctx.fillText(node.name, tx + 10, ty + 30);
    ctx.fillStyle = node.unlocked ? '#00ff88' : '#ff4444';
    ctx.fillText(node.unlocked ? '▶ CLICK TO SELECT' : '🔒 LOCKED', tx + 10, ty + 44);
    ctx.restore();
  }

  drawCitySilhouette(ctx, W, H) {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 8, 25, 0.9)';
    // Simple building skyline
    const buildings = [
      [0, 60, 80, 300], [80, 100, 60, 260], [140, 40, 100, 320], [240, 80, 70, 280],
      [310, 20, 90, 340], [400, 60, 60, 300], [460, 30, 80, 320], [540, 80, 50, 270],
      [590, 10, 70, 360], [660, 50, 90, 310], [750, 70, 60, 280], [810, 20, 80, 350],
      [890, 60, 100, 300], [990, 40, 70, 330], [1060, 80, 80, 270], [1140, 30, 60, 320]
    ];
    buildings.forEach(([x, y, w, h]) => {
      ctx.fillRect(x, H - h, w, h);
    });
    // Neon accents on buildings
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.12)';
    ctx.lineWidth = 1;
    buildings.forEach(([x, y, w, h]) => {
      ctx.strokeRect(x, H - h, w, h);
    });
    ctx.restore();
  }
}

window.worldMap = new WorldMap();
