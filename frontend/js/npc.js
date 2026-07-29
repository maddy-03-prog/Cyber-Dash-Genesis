// NPC Encounter System — Holographic Characters That Appear Mid-Level

class NPCManager {
  constructor() {
    this.npcs        = [];    // active on-screen NPCs
    this.spawnQueue  = [];    // upcoming NPC triggers by distance
    this.lastSpawnDist = 0;
    this.dialogueCooldown = 0;
    this.stageNpcs   = {};
    this.buildNpcPool();
  }

  buildNpcPool() {
    this.npcTypes = {
      intel_broker: { name: 'INTEL BROKER', icon: '🕵️', color: '#ffcc00', w: 30, h: 58 },
      rebel_hacker: { name: 'REBEL HACKER', icon: '💻', color: '#00ff88', w: 28, h: 55 },
      system_ghost: { name: 'SYSTEM GHOST', icon: '👻', color: '#bd00ff', w: 26, h: 50 },
      vendor:       { name: 'MARKET VENDOR', icon: '🏪', color: '#ff6600', w: 32, h: 60 }
    };

    // Per-stage NPC dialogue hints and lore
    this.stageLines = {
      1: [
        { type: 'intel_broker', text: 'Psst! Runner — there\'s a Memory Chip hidden behind the second laser grid. Slide under the gap!' },
        { type: 'rebel_hacker', text: 'I hacked the emergency exits. The boss is ahead — hit its glowing weak point on the underbelly!' }
      ],
      2: [
        { type: 'intel_broker', text: 'NEXUS rerouted all traffic systems as weapons. The gaps between cars are your only path forward.' },
        { type: 'system_ghost', text: 'I died here three runs ago. The laser gate pattern repeats every 4 seconds. Learn it and live.' }
      ],
      3: [
        { type: 'vendor',       text: 'Hey! Free chip for you — check under the middle market stall. Don\'t tell NEXUS I helped you!' },
        { type: 'rebel_hacker', text: 'Every secret room in this district has a hidden door behind a glowing amber panel. Slide into it!' }
      ],
      4: [
        { type: 'intel_broker', text: 'The Titan Mech has a cooldown window after each slam. That\'s your opening — attack immediately!' },
        { type: 'system_ghost', text: 'The steam vents follow a timer. Count to three after each burst and you\'ll make it through safely.' }
      ],
      5: [
        { type: 'rebel_hacker', text: 'I disabled the tunnel lights on line 9. Use the blue rail glow to navigate in the dark sections.' },
        { type: 'system_ghost', text: 'The Cyber Worm surfaces every 30 seconds. When you hear the rumble, jump immediately.' }
      ],
      6: [
        { type: 'intel_broker', text: 'The gravity storm hits in waves. When the wind indicator turns red, JUMP and hold — you\'ll glide.' },
        { type: 'rebel_hacker', text: 'Gravity Hawk telegraphs every dive with a screech. One second of warning — use your shield!' }
      ],
      7: [
        { type: 'system_ghost', text: 'I\'m trapped in this quantum lattice. Runner — the portals will warp you ahead. Trust the light!' },
        { type: 'intel_broker', text: 'The energy traps only fire when you\'re within sensor range. Run at full speed to avoid their lock.' }
      ],
      8: [
        { type: 'intel_broker', text: 'The Ice Colossus\'s weak point is the glowing core on its chest. Hit it 8 times to break the armor.' },
        { type: 'rebel_hacker', text: 'Cryo-frozen enemies can be destroyed with one hit. Smash them for bonus credits and XP!' }
      ],
      9: [
        { type: 'system_ghost', text: 'I can barely maintain form here. The void erases platforms at random — never stop moving forward!' },
        { type: 'system_ghost', text: 'The Reality Ripper copies your movement one second delayed. Use that pattern against it!' }
      ],
      10: [
        { type: 'rebel_hacker', text: 'I\'ve been running resistance ops for years. This fortress... is their last line. You can do this.' },
        { type: 'intel_broker', text: 'NEXUS Titan has three weak points. Left shoulder, right knee, and the exposed reactor on its back.' }
      ],
      11: [
        { type: 'system_ghost', text: 'Every runner that ever fell... we\'re all here in this core. Watching. Rooting for you. Finish it.' },
        { type: 'rebel_hacker', text: 'NEXUS PRIME cycles phases every time its HP hits 75%, 50%, and 25%. Watch for the color shift!' }
      ]
    };
  }

  // Initialize for a specific stage — sets up spawn triggers
  initForStage(stageId, stageTargetMeters) {
    this.npcs = [];
    this.spawnQueue = [];
    this.lastSpawnDist = 0;

    const lines = this.stageLines[stageId] || [];
    const interval = stageTargetMeters / (lines.length + 1);
    lines.forEach((line, i) => {
      this.spawnQueue.push({
        triggerDistance: interval * (i + 1),
        npcDef: line,
        triggered: false
      });
    });
  }

  // Called every game frame from game.js update
  update(worldSpeed, distance, trackY, canvasWidth) {
    // Check spawn triggers
    this.spawnQueue.forEach(entry => {
      if (!entry.triggered && distance >= entry.triggerDistance) {
        entry.triggered = true;
        this.spawnNPC(entry.npcDef, canvasWidth, trackY);
      }
    });

    // Update active NPCs
    this.npcs.forEach(npc => {
      npc.x -= worldSpeed * 0.85; // Scroll slightly slower than world
      npc.bubbleTimer--;
      if (npc.bubbleTimer <= 0) npc.active = false;
    });

    this.npcs = this.npcs.filter(n => n.active && n.x > -100);

    if (this.dialogueCooldown > 0) this.dialogueCooldown--;
  }

  spawnNPC(def, canvasWidth, trackY) {
    const typeData = this.npcTypes[def.type] || this.npcTypes.system_ghost;
    this.npcs.push({
      x:    canvasWidth + 60,
      y:    trackY - typeData.h,
      w:    typeData.w,
      h:    typeData.h,
      type: def.type,
      icon: typeData.icon,
      color: typeData.color,
      name: typeData.name,
      text: def.text,
      bubbleTimer: 420, // 7 seconds at 60fps
      active: true,
      phase: 0
    });
  }

  draw(ctx, quality) {
    const isHigh = quality === 'high';
    this.npcs.forEach(npc => {
      if (!npc.active) return;
      npc.phase += 0.05;
      const bobY = Math.sin(npc.phase) * 3;
      this.drawNPC(ctx, npc, bobY, isHigh);
    });
  }

  drawNPC(ctx, npc, bobY, isHigh) {
    ctx.save();
    const y = npc.y + bobY;
    const bubbleProgress = Math.min(1, (420 - npc.bubbleTimer) / 30); // Fade in

    // Hologram flicker effect
    ctx.globalAlpha = 0.75 + Math.sin(npc.phase * 3) * 0.08;

    if (isHigh) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = npc.color;
    }

    // Body — holographic silhouette
    ctx.fillStyle = `${npc.color}22`;
    ctx.strokeStyle = npc.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(npc.x, y, npc.w, npc.h, [4]);
    ctx.fill();
    ctx.stroke();

    // Scan line effect
    ctx.fillStyle = `${npc.color}15`;
    for (let sy = y; sy < y + npc.h; sy += 4) {
      ctx.fillRect(npc.x, sy, npc.w, 2);
    }

    // Icon label
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.icon, npc.x + npc.w / 2, y + npc.h * 0.55);

    // Name tag
    ctx.font = 'bold 7px Orbitron';
    ctx.fillStyle = npc.color;
    ctx.shadowBlur = 4;
    ctx.fillText(npc.name, npc.x + npc.w / 2, y + npc.h + 12);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Dialogue bubble
    if (bubbleProgress > 0 && npc.bubbleTimer > 60) {
      this.drawBubble(ctx, npc, y, bubbleProgress, isHigh);
    }

    ctx.restore();
  }

  drawBubble(ctx, npc, y, alpha, isHigh) {
    const bw    = 220;
    const bh    = 54;
    const bx    = npc.x - bw - 14;
    const by    = y - 10;
    const bxR   = Math.max(bx, 4); // clamp to canvas left

    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha * 1.2);

    if (isHigh) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = npc.color;
    }

    // Bubble background
    ctx.fillStyle = 'rgba(4, 4, 18, 0.92)';
    ctx.strokeStyle = npc.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bxR, by, bw, bh, [6]);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Speaker name
    ctx.font = 'bold 8px Orbitron';
    ctx.fillStyle = npc.color;
    ctx.textAlign = 'left';
    ctx.fillText(npc.name, bxR + 8, by + 14);

    // Dialogue text — wrap at 30 chars
    ctx.font = '8px Orbitron';
    ctx.fillStyle = '#ccd8ee';
    const words = npc.text.split(' ');
    let line = '';
    let lineY = by + 26;
    words.forEach(word => {
      const test = line + word + ' ';
      if (test.length > 32 && line) {
        ctx.fillText(line.trim(), bxR + 8, lineY);
        line = word + ' ';
        lineY += 12;
      } else { line = test; }
    });
    if (line) ctx.fillText(line.trim(), bxR + 8, lineY);

    ctx.restore();
  }
}

window.npcManager = new NPCManager();
