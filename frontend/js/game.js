// Central Game Engine and Loop Controller for Cyber Dash

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Core Managers
    this.player = new window.Player(this.canvas);
    this.world = new window.World(this.canvas);
    
    // Game Entities Lists
    this.obstacles = [];
    this.collectibles = [];
    this.enemies = [];
    this.enemyProjectiles = [];
    this.boss = null;
    
    // Timing and Game States
    this.state = 'menu'; // menu, playing, paused, gameover, replay, photo_mode
    this.timeScale = 1.0;
    this.lastTime = 0;
    this.distance = 0;
    this.score = 0;
    this.coinsCollectedThisRun = 0;
    this.playTimeThisRun = 0;
    this.frameCount = 0;

    // Campaign & Glitches registers
    this.storyModeActive = false;
    this.activeChapter = 1;
    this.chapterTargetMeters = 1000;
    this.activeGlitch = 'none';
    this.glitchTimer = 0;

    // Spawning ticks
    this.spawnTimer = 0;
    this.bossAlertTimer = 0;
    this.scoreMultiplier = 1.0;
    this.nearMissCool = 0;

    // Screen Polish Visuals
    this.shakeAmount = 0;
    this.screenFlashActive = false;

    // Boss fight checkpoints tracker
    this.nextBossDist = 2000;
    this.nextEventDist = 1000;

    // Replay mode playback state
    this.replayFrameIndex = 0;

    // Photo Mode camera parameters
    this.photoFilter = 'none';
    this.photoZoom = 1.0;
    this.photoPanY = 0;
    this.photoRenderHUD = true;

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.initCanvasSize(), 200);
    });
    
    this.initMissions();
  }

  initCanvasSize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Setup/Refresh Daily missions
  initMissions() {
    const today = new Date().toDateString();
    if (window.storage.state.dailyMissions.date !== today) {
      window.storage.state.dailyMissions.date = today;
      window.storage.state.dailyMissions.claimed = [false, false, false];
      window.storage.state.dailyMissions.progress = [0, 0, 0];
      
      const pool = Array.from({ length: window.MISSIONS.length }, (_, i) => i);
      const chosen = [];
      for (let i = 0; i < 3; i++) {
        const randIdx = Math.floor(Math.random() * pool.length);
        chosen.push(pool.splice(randIdx, 1)[0]);
      }
      window.storage.state.dailyMissions.missionIndices = chosen;
      window.storage.save();
    }
    
    window.ui.updateDailyMissionsHUD(window.storage.state.dailyMissions);
  }

  trackMissionProgress(field, incrementValue) {
    const indices = window.storage.state.dailyMissions.missionIndices;
    const progress = window.storage.state.dailyMissions.progress;

    indices.forEach((missionIdx, i) => {
      const mission = window.MISSIONS[missionIdx];
      if (mission.field === field && !window.storage.state.dailyMissions.claimed[i]) {
        progress[i] += incrementValue;
        if (progress[i] >= mission.target) {
          progress[i] = mission.target;
          window.storage.state.dailyMissions.claimed[i] = true;
          window.storage.addCoins(mission.reward);
          window.ui.showAchievementToast('ach_first_run');
          window.ui.showEventBanner('MISSION INSTRUCTION RESOLVED', `+${mission.reward} CREDITS REWARDED!`);
        }
      }
    });
    window.storage.save();
    window.ui.updateDailyMissionsHUD(window.storage.state.dailyMissions);
  }

  startNewGame() {
    this.difficulty = (window.storage && window.storage.state && window.storage.state.settings.difficulty) || 'medium';
    this.checkpointsReached = 0;
    this.checkpointUsedThisSegment = false;
    this.bossXPGranted = false;

    this.player.reset();
    this.player.equippedSkin = window.storage.state.equippedSkin;
    this.player.equippedTrail = window.storage.state.equippedTrail;

    this.world.reset();
    
    this.obstacles = [];
    this.collectibles = [];
    this.enemies = [];
    this.enemyProjectiles = [];
    this.boss = null;
    
    this.distance = 0;
    this.score = 0;
    this.coinsCollectedThisRun = 0;
    this.playTimeThisRun = 0;
    this.frameCount = 0;
    this.spawnTimer = 0;
    this.bossAlertTimer = 0;
    this.nextBossDist = 2000;
    this.nextEventDist = 1000;
    this.scoreMultiplier = 1.0;
    this.timeScale = 1.0;
    this.shakeAmount = 0;
    this.activeGlitch = 'none';
    this.glitchTimer = 0;

    this.state = 'playing';
    this.isMultiplayer = false;
    this.isAiPartner = false;
    if (window.ui) {
      window.ui.setMultiplayerHUD(false);
      window.ui.switchScreen('playing');
    }

    window.audio.startMusic();
  }

  startMultiplayerGame() {
    this.isMultiplayer = true;
    if (!this.isAiPartner) this.isAiPartner = false;
    
    // Player 1 (Blue Runner)
    this.player.reset();
    this.player.equippedSkin = 'skin_cyan';
    this.player.equippedTrail = 'trail_cyan';
    
    // Player 2 (Red Runner)
    this.player2 = new window.Player(this.canvas);
    this.player2.reset();
    this.player2.equippedSkin = 'skin_pink';
    this.player2.equippedTrail = 'trail_pink';
    this.player2.x = 220; // offset spawning
    
    this.world.reset();
    
    this.obstacles = [];
    this.collectibles = [];
    this.enemies = [];
    this.enemyProjectiles = [];
    this.boss = null;
    
    this.distance = 0;
    this.score = 0;
    this.scoreP2 = 0;
    this.coinsP2 = 0;
    this.coinsCollectedThisRun = 0;
    this.playTimeThisRun = 0;
    this.frameCount = 0;
    this.spawnTimer = 0;
    this.bossAlertTimer = 0;
    this.nextBossDist = 2000;
    this.nextEventDist = 1000;
    this.scoreMultiplier = 1.0;
    this.timeScale = 1.0;
    this.shakeAmount = 0;
    this.activeGlitch = 'none';
    this.glitchTimer = 0;

    this.state = 'playing';
    if (window.ui) {
      window.ui.setMultiplayerHUD(true, window.multiplayer.roomCode);
      window.ui.switchScreen('playing');
    }

    window.audio.startMusic();
  }

  startAiCoopGame() {
    this.isAiPartner = true;
    this.startMultiplayerGame();
    if (window.ui) {
      window.ui.setMultiplayerHUD(true, 'CYBERBOT AI');
    }
  }

  startCampaignStage(stage) {
    if (!stage) return;
    this.campaignMode = true;
    this.currentCampaignStage = stage;
    this.campaignRunData = {
      distance: 0, coins: 0, kills: 0, deaths: 0,
      secretsFound: 0, jumps: 0, dashes: 0, slides: 0,
      maxCombo: 0, damageTaken: 0, bossKilled: false,
      phasesDefeated: 0, portalsUsed: 0, glitchesSurvived: 0,
      time: 0, score: 0
    };

    // Set visual theme
    const theme = window.STAGE_THEMES && window.STAGE_THEMES[stage.id];
    if (theme) this.world.setTheme(theme);

    // Set boss distance trigger based on stage target
    this.nextBossDist = stage.targetMeters * 0.75;
    this.campaignBossType = stage.bossType;
    this.stageTargetDist  = stage.targetMeters;
    this.stageComplete    = false;

    // Init NPC encounters for this stage
    if (window.npcManager) {
      window.npcManager.initForStage(stage.id, stage.targetMeters);
    }

    this.startNewGame();

    // Show HUD stage info
    const stageNumEl = document.getElementById('hud-stage-label');
    if (stageNumEl) stageNumEl.innerText = `STAGE ${stage.id}`;

    window.ui.showEventBanner(`STAGE ${stage.id}`, stage.title.split(':')[1]?.trim() || stage.name);
  }

  // Called when campaign stage distance target is reached (before boss)
  onStageTargetReached() {
    if (!this.campaignMode || this.stageComplete) return;
    try {
      if (!this.boss || !this.boss.active) {
        const bossType = this.campaignBossType || 'mega_drone';
        const BossClass = window.CampaignBoss || window.Boss;
        this.boss = new BossClass(this.canvas.width, this.world.trackY, bossType);
        this.boss.triggerBossEntrance();
      }
    } catch (err) {
      console.error('Boss spawn error:', err);
    }
  }

  // Called from triggerGameOver/boss victory in campaign mode
  completeCampaignStage() {
    if (!this.campaignMode || this.stageComplete) return;
    this.stageComplete = true;

    const stage = this.currentCampaignStage;
    if (!stage) return;

    // Compile final run data
    this.campaignRunData.distance    = this.distance;
    this.campaignRunData.coins       = this.coinsCollectedThisRun;
    this.campaignRunData.kills       = this.player.stats.kills || 0;
    this.campaignRunData.deaths      = this.player.isDead ? 1 : 0;
    this.campaignRunData.jumps       = this.player.stats.jumps;
    this.campaignRunData.dashes      = this.player.stats.dashes;
    this.campaignRunData.maxCombo    = this.maxComboReached || 0;
    this.campaignRunData.damageTaken = this.player.stats.damageTaken || 0;
    this.campaignRunData.time        = this.playTimeThisRun;
    this.campaignRunData.score       = this.score;

    // Save stats
    window.storage.recordRun(
      this.distance, this.coinsCollectedThisRun, this.score,
      this.player.stats.jumps, this.player.stats.dashes, this.player.stats.slides,
      1, this.playTimeThisRun, this.player.stats.hits
    );

    window.audio.stopMusic();
    this.state = 'gameover';

    // Show victory dialogue then grade screen
    window.story.triggerVictory(stage.id, () => {
      window.gradeSystem.showMissionComplete(stage.id, this.campaignRunData);
    });
  }

  completeStoryChapter() {
    // Legacy shim — redirect to campaign system
    if (this.campaignMode) { this.completeCampaignStage(); return; }
    this.state = 'menu';
    window.audio.stopMusic();
    window.ui.switchScreen('main-menu');
  }

  pauseGame() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    window.ui.switchScreen('pause-overlay');
    window.audio.stopMusic();
  }

  resumeGame() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    window.ui.switchScreen('playing');
    window.audio.startMusic();
  }

  triggerGameOver() {
    this.state = 'gameover';
    window.audio.stopMusic();

    window.storage.recordRun(
      this.distance,
      this.coinsCollectedThisRun,
      this.score,
      this.player.stats.jumps,
      this.player.stats.dashes,
      this.player.stats.slides,
      this.boss && this.boss.state === 'defeated' ? 1 : 0,
      this.playTimeThisRun,
      this.player.stats.hits
    );

    this.trackMissionProgress('coinsInRun', this.coinsCollectedThisRun);
    this.trackMissionProgress('distanceInRun', Math.floor(this.distance));
    this.trackMissionProgress('dashesInRun', this.player.stats.dashes);
    this.trackMissionProgress('jumpsInRun', this.player.stats.jumps);
    if (this.boss && this.boss.state === 'defeated') {
      this.trackMissionProgress('bossesDefeatedInRun', 1);
    }

    const currentRunStats = {
      distanceInRun: this.distance,
      hitsInRun: this.player.stats.hits,
      dashesInRun: this.player.stats.dashes,
      lasersDodgedInRun: this.player.stats.hits === 0 ? 30 : 5
    };
    
    const baseSpeed = window.CONFIG.BASE_SPEED + (this.distance * window.CONFIG.SPEED_ACCEL);
    if (baseSpeed >= window.CONFIG.MAX_SPEED - 2) {
      window.storage.state.stats.speedDemonAchieved = true;
    }

    const newlyUnlocked = window.storage.checkAchievementsProgress(currentRunStats);
    newlyUnlocked.forEach(achId => {
      window.ui.showAchievementToast(achId);
    });

    if (this.isMultiplayer && window.ui && window.ui.showVSGameOver) {
      window.ui.showVSGameOver({
        p1Name: (window.storage && window.storage.state.profile.name) || 'PLAYER 1',
        p1Score: Math.floor(this.score),
        p1Dist: Math.floor(this.distance),
        p1Coins: this.coinsCollectedThisRun,
        p2Name: this.isAiPartner ? 'CYBERBOT AI' : 'PLAYER 2',
        p2Avatar: this.isAiPartner ? '🤖' : '🔻',
        p2Score: Math.floor(this.scoreP2 || 0),
        p2Dist: Math.floor(this.distance),
        p2Coins: this.coinsP2 || 0,
        isAi: this.isAiPartner
      });
    } else {
      window.ui.showGameOver(this.distance, this.coinsCollectedThisRun, this.score, newlyUnlocked);
    }
  }

  handleSpawning() {
    if (this.boss && this.boss.active) return;

    this.spawnTimer--;
    if (this.spawnTimer <= 0) {
      const speedMult = 1.0 + (this.distance * window.CONFIG.SPEED_ACCEL);
      const minInterval = 60;
      
      let difficultySpawnMult = 1.0;
      if (this.difficulty === 'easy') difficultySpawnMult = 1.6;
      else if (this.difficulty === 'hard') difficultySpawnMult = 0.7;

      this.spawnTimer = Math.max(minInterval, (window.CONFIG.SPAWN_INTERVAL - speedMult * 3) * difficultySpawnMult);

      const spawnType = Math.random();
      let coinWeight = 0.25;
      let obstacleWeight = 0.90;
      
      if (this.difficulty === 'easy') {
        coinWeight = 0.35;
        obstacleWeight = 0.80;
      } else if (this.difficulty === 'hard') {
        coinWeight = 0.15;
        obstacleWeight = 0.95;
      }

      if (spawnType < coinWeight) {
        this.spawnCoinsWave();
      } else if (spawnType < obstacleWeight) {
        this.spawnObstacle();
      } else {
        this.spawnPowerup();
      }
    }
  }

  spawnCoinsWave() {
    const waveType = Math.random();
    const startX = this.canvas.width + 100;
    
    if (waveType < 0.5) {
      const count = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const coinX = startX + i * 45;
        const coinY = (this.world.trackY - 60) + Math.sin(i * 0.8) * 35;
        this.collectibles.push(new window.Coin(coinX, coinY, Math.random() > 0.85));
      }
    } else {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        this.collectibles.push(new window.Coin(startX + i * 40, this.world.trackY - 30));
        this.collectibles.push(new window.Coin(startX + i * 40, this.world.trackY - 70));
      }
    }
  }

  spawnObstacle() {
    const types = ['laser_wall', 'barrier', 'drone', 'mine', 'electric_trap', 'buzzsaw'];
    let pool = types;
    if (this.distance < 400) {
      pool = ['laser_wall', 'mine'];
    } else if (this.distance < 1000) {
      pool = ['laser_wall', 'mine', 'barrier', 'drone'];
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    this.obstacles.push(new window.Obstacle(this.canvas.width, this.world.trackY, pick));
  }

  spawnPowerup() {
    const powerups = ['shield', 'magnet', 'slow_motion', 'speed_boost', 'double_coins', 'extra_life', 'invincibility'];
    let pool = powerups;
    if (this.player.hp >= 100) {
      pool = powerups.filter(p => p !== 'extra_life');
    }
    
    const pick = pool[Math.floor(Math.random() * pool.length)];
    this.collectibles.push(new window.Powerup(this.canvas.width + 50, this.world.trackY - 50 - Math.random() * 60, pick));
  }

  handleCollisions() {
    // Player 1 collisions
    if (!this.player.isDead) {
      this.obstacles.forEach(o => {
        if (o.active && o.collidesWith(this.player)) {
          if (this.player.dashTimer > 0 && o.canBeDestroyed) {
            o.destroy();
            this.score += 250;
            this.shakeAmount = 6;
            if (window.progression) window.progression.gainXp(25);
          } else {
            const isFatal = this.player.takeDamage(20);
            if (isFatal) {
              this.player.isDead = true;
            } else {
              this.shakeAmount = 15;
              window.ui.flash('red');
            }
          }
        }
      });

      this.collectibles.forEach(c => {
        if (c.active && c.collidesWith(this.player)) {
          if (c instanceof window.Coin) {
            let difficultyCoinMult = 1.0;
            if (this.difficulty === 'medium') difficultyCoinMult = 1.5;
            else if (this.difficulty === 'hard') difficultyCoinMult = 2.0;

            let yieldVal = Math.round((c.isDouble ? 2 : 1) * difficultyCoinMult);
            if (this.player.doubleCoinsTimer > 0) yieldVal *= 2;
            
            this.coinsCollectedThisRun += yieldVal;
            this.score += yieldVal * 100 * this.scoreMultiplier;
            c.active = false;
            if (window.progression) window.progression.gainXp(10);
          } else if (c instanceof window.Powerup) {
            this.player.applyPowerup(c.type, 300);
            c.active = false;
            
            if (c.type === 'slow_motion') {
              this.timeScale = 0.45;
              window.ui.showEventBanner('TIMESTREAM OVERFLOW', 'TIME DILATION BUFFER INITIATED');
            }
            if (c.type === 'speed_boost') {
              window.ui.showEventBanner('CORE OVERLOAD ACTIVATED', 'THRUST BOOST & INVINCIBILITY');
            }
          }
        }
      });
    }

    // Player 2 collisions
    if (this.isMultiplayer && this.player2 && !this.player2.isDead) {
      this.obstacles.forEach(o => {
        if (o.active && o.collidesWith(this.player2)) {
          if (this.player2.dashTimer > 0 && o.canBeDestroyed) {
            o.destroy();
            this.scoreP2 += 250;
            this.shakeAmount = 6;
            if (window.progression) window.progression.gainXp(25);
          } else {
            const isFatal = this.player2.takeDamage(20);
            if (isFatal) {
              this.player2.isDead = true;
            } else {
              this.shakeAmount = 15;
              window.ui.flash('red');
            }
          }
        }
      });

      this.collectibles.forEach(c => {
        if (c.active && c.collidesWith(this.player2)) {
          if (c instanceof window.Coin) {
            let difficultyCoinMult = 1.0;
            if (this.difficulty === 'medium') difficultyCoinMult = 1.5;
            else if (this.difficulty === 'hard') difficultyCoinMult = 2.0;

            let yieldVal = Math.round((c.isDouble ? 2 : 1) * difficultyCoinMult);
            if (this.player2.doubleCoinsTimer > 0) yieldVal *= 2;
            
            this.coinsCollectedThisRun += yieldVal;
            this.scoreP2 += yieldVal * 100;
            c.active = false;
            if (window.progression) window.progression.gainXp(10);
          } else if (c instanceof window.Powerup) {
            this.player2.applyPowerup(c.type, 300);
            c.active = false;
          }
        }
      });
    }

    // Near miss checks
    if (this.nearMissCool > 0) {
      this.nearMissCool--;
    } else if (!this.player.isDead) {
      this.obstacles.forEach(o => {
        if (o.active && o.x < this.player.x) {
          const dx = Math.abs(this.player.x - o.x);
          const dy = Math.abs(this.player.y - o.y);
          
          if (dx < window.CONFIG.COMBO_NEAR_MISS_PX && dy < 90) {
            this.scoreMultiplier = Math.min(5.0, this.scoreMultiplier + 0.5);
            this.nearMissCool = 30;
            window.particles.spawn(this.player.x, this.player.y, window.COLORS.CYAN, 8, 'laser');
            window.ui.showEventBanner('NEAR MISS DETECTED', `COMBO MULTIPLIER INCREASED [x${this.scoreMultiplier.toFixed(1)}]`);
          }
        }
      });
    }
  }

  run(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(delta);
    this.draw();

    requestAnimationFrame((t) => this.run(t));
  }

  update(delta) {
    if (this.state === 'menu') {
      this.world.update(2.5);
      window.particles.update(2.5);
      return;
    }

    if (this.state === 'playing') {
      this.playTimeThisRun += 1 / 60;
      this.frameCount++;

      // Campaign target breaker check
      if (this.storyModeActive && this.distance >= this.chapterTargetMeters) {
        this.completeStoryChapter();
        return;
      }

      // Glitch visual decay countdown
      if (this.glitchTimer > 0) {
        this.glitchTimer--;
        if (this.glitchTimer === 0) {
          this.activeGlitch = 'none';
          window.ui.showEventBanner('MATRIX RESTORED', 'REALITY COHERENCE STABILIZED');
        }
      }

      let speedMult = 1.0 + (this.distance * window.CONFIG.SPEED_ACCEL);
      speedMult = Math.min(speedMult, window.CONFIG.MAX_SPEED / window.CONFIG.BASE_SPEED);

      // Difficulty base speed modifier
      let diffSpeedBonus = 0.0;
      if (this.difficulty === 'easy') diffSpeedBonus = -0.15;
      else if (this.difficulty === 'hard') diffSpeedBonus = 0.25;
      speedMult = Math.max(0.5, speedMult + diffSpeedBonus);

      if (this.player.speedBoostTimer > 0) {
        speedMult *= 2.0;
      }
      
      const frameSpeed = window.CONFIG.BASE_SPEED * speedMult * this.timeScale;
      
      // RPG Pet Wolf multipliers boosts XP
      const petMultiplier = (window.companions && window.companions.equippedPet === 'wolf') ? 1.15 : 1.0;
      const hqMultiplier = window.hq ? window.hq.getXpBonusMultiplier() : 1.0;
      
      this.distance += (frameSpeed * 0.05) * this.timeScale;
      this.score += (frameSpeed * 0.1) * this.scoreMultiplier * this.timeScale;

      // Gain XP gradually as distance increases
      if (this.frameCount % 30 === 0 && window.progression) {
        window.progression.gainXp(Math.round(5 * petMultiplier * hqMultiplier));
      }

      this.scoreMultiplier = Math.max(1.0, this.scoreMultiplier - window.CONFIG.COMBO_DECAY * this.timeScale);

      if (this.player.slowMotionTimer > 0) {
        this.player.slowMotionTimer--;
      } else {
        if (this.timeScale < 1.0 && !this.collectibles.some(c => c.active && c.type === 'slow_motion')) {
          this.timeScale = Math.min(1.0, this.timeScale + 0.02);
        }
      }
      
      const trackHeight = this.world.getFloorHeightAt(this.player.x, this.player.width);
      this.player.update(trackHeight, speedMult, this.graphicsQuality);
      
      if (this.player.y > this.canvas.height + 50) {
        this.player.hp = 0;
        this.player.isDead = true;
      }

      if (this.isMultiplayer && this.player2) {
        if (this.isAiPartner && window.coopAi) {
          window.coopAi.update(this);
        }
        const trackHeightP2 = this.world.getFloorHeightAt(this.player2.x, this.player2.width);
        this.player2.update(trackHeightP2, speedMult, this.graphicsQuality);
        
        if (this.player2.y > this.canvas.height + 50) {
          this.player2.hp = 0;
          this.player2.isDead = true;
        }

        if (this.player.isDead && this.player2.isDead) {
          this.triggerGameOver();
        }
      } else {
        if (this.player.isDead) {
          this.triggerGameOver();
        }
      }

      this.world.update(frameSpeed);
      
      // Developer Mode panel check: emit particles toggle
      const canEmitPart = window.devmode ? window.devmode.emitParticles : true;
      if (canEmitPart) {
        window.particles.update(frameSpeed);
      }

      this.obstacles.forEach(o => o.update(frameSpeed));
      this.obstacles = this.obstacles.filter(o => o.x > -150 && o.active);

      this.collectibles.forEach(c => c.update(frameSpeed, this.player));
      this.collectibles = this.collectibles.filter(c => c.x > -100 && c.active);

      // Update Cooperating Hostile AI units
      this.enemies.forEach(e => e.update(frameSpeed, this.player, this.enemyProjectiles));
      this.enemies = this.enemies.filter(e => e.x > -150 && e.active);

      // Update active combat weapon systems and player fired projectiles
      if (window.combat) {
        window.combat.updateProjectiles(this.enemies, this.boss, frameSpeed);
      }

      // Update Sniper fired bullets
      this.enemyProjectiles.forEach(p => {
        p.x -= p.vx;
        p.y += p.vy;
        
        if (p.active && Math.abs(p.x - this.player.x) < this.player.width && p.y > this.player.y && p.y < this.player.y + this.player.height) {
          p.active = false;
          const isFatal = this.player.takeDamage(12);
          if (isFatal && (!this.isMultiplayer || (this.player2 && this.player2.isDead))) this.triggerGameOver();
        }

        if (this.isMultiplayer && this.player2 && p.active && Math.abs(p.x - this.player2.x) < this.player2.width && p.y > this.player2.y && p.y < this.player2.y + this.player2.height) {
          p.active = false;
          const isFatal = this.player2.takeDamage(12);
          if (isFatal && this.player.isDead) this.triggerGameOver();
        }
      });
      this.enemyProjectiles = this.enemyProjectiles.filter(p => p.x > -50 && p.active);

      // Companion Drones and robotic pets action loop
      if (window.companions) {
        window.companions.updatePassives(this.player, this.collectibles, this.enemies, this.frameCount);
      }

      this.handleSpawning();
      this.handleCollisions();

      // Update NPC encounters (campaign mode)
      if (window.npcManager && this.campaignMode) {
        window.npcManager.update(frameSpeed, this.distance, this.world.trackY, this.canvas.width);
      }

      // Track max combo for grading
      if (this.comboCount > (this.maxComboReached || 0)) {
        this.maxComboReached = this.comboCount;
      }

      if (this.distance > this.nextEventDist) {
        this.nextEventDist += 1300 + Math.random() * 600;
        // Skip random events in campaign mode (theme handles weather)
        if (!this.campaignMode) {
          const events = ['emp', 'rain', 'meteors', 'gravity_shift'];
          const pick = events[Math.floor(Math.random() * events.length)];
          this.world.triggerEvent(pick, 650);
          window.ui.showEventBanner('GRID PROTOCOL OVERLOAD', `${pick.toUpperCase().replace('_', ' ')} DETECTED`);
        }
      }

      // Boss spawn logic (campaign vs endless)
      if (this.campaignMode) {
        // Campaign: spawn boss when stage target distance is hit
        if (this.distance >= this.stageTargetDist && (!this.boss || !this.boss.active) && !this.stageComplete) {
          this.onStageTargetReached();
          window.ui.showEventBanner('TARGET REACHED', `${this.currentCampaignStage.bossName} INCOMING`);
        }
      } else {
        // Endless mode: spawn random boss every 2500m
        if (this.distance > this.nextBossDist && (!this.boss || !this.boss.active)) {
          this.nextBossDist += 2500;
          this.boss = new window.Boss(this.canvas.width, this.world.trackY, Math.random() > 0.5 ? 'drone_boss' : 'tank_boss');
          this.boss.triggerBossEntrance();
          window.ui.showEventBanner('CRITICAL SECURITY DETECTED', 'BOSS INTERCEPT IN PROGRESS');
        }
      }

      if (this.boss && this.boss.active) {
        const status = this.boss.update(this.player, frameSpeed);
        window.ui.updateBossHUD(this.boss);
        
        if (status === 'victory') {
          this.score += 5000;
          this.coinsCollectedThisRun += 100;
          window.ui.showEventBanner('SECURITY CHASSIS TERMINATED', 'GRID BLOCK CODE CLEARED [+100 CR]');
          // Campaign mode: trigger stage completion after boss dies
          if (this.campaignMode) {
            setTimeout(() => this.completeCampaignStage(), 2000);
          }
        }
      }

      if (this.shakeAmount > 0) {
        this.shakeAmount *= 0.9;
        if (this.shakeAmount < 0.1) this.shakeAmount = 0;
      }

      const activePowerups = {
        shield: this.player.shieldTimer,
        magnet: this.player.magnetTimer,
        speed_boost: this.player.speedBoostTimer,
        double_coins: this.player.doubleCoinsTimer,
        invincibility: this.player.invincibilityTimer,
        slow_motion: this.timeScale < 1.0 ? 180 : 0
      };
      
      const ratio = this.scoreMultiplier > 1.0 ? (this.scoreMultiplier - 1.0) / 4.0 : 0;
      
      if (this.isMultiplayer) {
        // Send state packet mock synchronizer
        if (this.frameCount % 2 === 0) {
          window.multiplayer.receiveStatePacket({
            x: this.player2.x,
            y: this.player2.y,
            vx: this.player2.vx,
            vy: this.player2.vy,
            slideTimer: this.player2.slideTimer,
            dashTimer: this.player2.dashTimer,
            isGrounded: this.player2.isGrounded,
            jumpCount: this.player2.jumpCount,
            score: this.scoreP2,
            isDead: this.player2.isDead
          });
        }
        
        // Update multiplayer scores HUD
        const p1ScoreEl = document.getElementById('hud-score');
        const p2ScoreEl = document.getElementById('hud-score-p2');
        const distEl = document.getElementById('hud-distance');
        const pingEl = document.getElementById('hud-mp-ping');

        if (p1ScoreEl) p1ScoreEl.innerText = String(Math.floor(this.score)).padStart(6, '0');
        if (p2ScoreEl) p2ScoreEl.innerText = String(Math.floor(this.scoreP2)).padStart(6, '0');
        if (distEl) distEl.innerText = `${Math.floor(this.distance)}m`;
        if (pingEl) pingEl.innerText = `${window.multiplayer.latency}ms`;
      } else {
        window.ui.updateHUD(this.player, this.score, this.distance, this.coinsCollectedThisRun, this.scoreMultiplier, ratio, activePowerups);
      }

      // Dev Mode Panel Diagnostic values update
      const devDist = document.getElementById('dev-dist-val');
      if (devDist) {
        devDist.innerText = `${Math.floor(this.distance)}m`;
      }

      if (window.input.activeActions.pause) {
        window.input.clearActions();
        this.pauseGame();
      }
    }

    if (this.state === 'replay') {
      const buffer = this.player.replayBuffer;
      if (buffer.length > 0) {
        this.replayFrameIndex = (this.replayFrameIndex + 1) % buffer.length;
        this.world.update(2.5);
        window.particles.update(2.5);
      }
      
      if (window.input.activeActions.pause) {
        window.input.clearActions();
        this.exitReplay();
      }
    }
  }

  draw() {
    this.ctx.save();

    // 1. Reality matrix glitches translations
    if (this.activeGlitch === 'mirror') {
      this.ctx.translate(this.canvas.width, 0);
      this.ctx.scale(-1, 1);
    } else if (this.activeGlitch === 'inverse_gravity') {
      this.ctx.translate(0, this.canvas.height);
      this.ctx.scale(1, -1);
    }

    if (this.shakeAmount > 0) {
      const shakeX = (Math.random() * 2 - 1) * this.shakeAmount;
      const shakeY = (Math.random() * 2 - 1) * this.shakeAmount;
      this.ctx.translate(shakeX, shakeY);
    }

    if (this.state === 'photo_mode') {
      const zoomPivotX = this.player.x + this.player.width / 2;
      const zoomPivotY = this.player.y + this.player.height / 2;
      
      this.ctx.translate(zoomPivotX, zoomPivotY + this.photoPanY);
      this.ctx.scale(this.photoZoom, this.photoZoom);
      this.ctx.translate(-zoomPivotX, -zoomPivotY);
    }

    // 2. Draw World, Obstacles, and Powerups
    this.world.draw(this.ctx, this.graphicsQuality);
    this.obstacles.forEach(o => o.draw(this.ctx, this.graphicsQuality));
    this.collectibles.forEach(c => c.draw(this.ctx, this.graphicsQuality));
    
    const canEmitPart = window.devmode ? window.devmode.emitParticles : true;
    if (canEmitPart) {
      window.particles.draw(this.ctx, this.graphicsQuality);
    }

    // 3. Draw Cooperating Enemy AI units
    this.enemies.forEach(e => e.draw(this.ctx, this.graphicsQuality));

    // 3b. Draw NPC holographic characters (campaign mode)
    if (window.npcManager && this.campaignMode) {
      window.npcManager.draw(this.ctx, this.graphicsQuality);
    }

    // 4. Draw combat player weapons / grapple lines
    if (window.combat) {
      window.combat.draw(this.ctx, this.player, this.graphicsQuality);
      if (this.isMultiplayer && this.player2) {
        window.combat.draw(this.ctx, this.player2, this.graphicsQuality);
      }
    }

    // 5. Draw enemy projectiles (Sniper laser rounds)
    this.ctx.save();
    this.ctx.fillStyle = window.COLORS.RED;
    this.enemyProjectiles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size || 5, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();

    // 6. Draw AI companion drones & pets
    if (window.companions) {
      window.companions.draw(this.ctx, this.player, this.world.trackY, this.graphicsQuality);
      if (this.isMultiplayer && this.player2) {
        window.companions.draw(this.ctx, this.player2, this.world.trackY, this.graphicsQuality);
      }
    }

    if (this.boss && this.boss.active) {
      this.boss.draw(this.ctx, this.graphicsQuality);
    }

    if (this.state === 'replay') {
      const buffer = this.player.replayBuffer;
      if (buffer.length > 0) {
        const frame = buffer[this.replayFrameIndex];
        this.player.x = frame.x;
        this.player.y = frame.y;
        this.player.height = frame.slideTimer > 0 ? this.player.slideHeight : this.player.baseHeight;
        this.player.runCycle = frame.runCycle;
        this.player.shieldTimer = frame.shieldTimer;
        this.player.damagedTimer = frame.damagedTimer;
        this.player.equippedSkin = frame.equippedSkin;
        this.player.draw(this.ctx, this.graphicsQuality);
      }
    } else {
      this.player.draw(this.ctx, this.graphicsQuality);
      if (this.isMultiplayer && this.player2) {
        this.player2.draw(this.ctx, this.graphicsQuality);
      }
    }

    // 7. Render Debug Hitbox Outlines (Developer panel utility)
    if (window.devmode && window.devmode.drawHitboxes) {
      window.devmode.renderHitbox(this.ctx, this.player.x, this.player.y, this.player.width, this.player.height, window.COLORS.CYAN);
      if (this.isMultiplayer && this.player2) {
        window.devmode.renderHitbox(this.ctx, this.player2.x, this.player2.y, this.player2.width, this.player2.height, window.COLORS.PINK);
      }
      this.obstacles.forEach(o => window.devmode.renderHitbox(this.ctx, o.x, o.y, o.width, o.height, window.COLORS.RED));
      this.enemies.forEach(e => window.devmode.renderHitbox(this.ctx, e.x, e.y, e.width, e.height, window.COLORS.PINK));
    }

    this.ctx.restore();

    if (this.state === 'photo_mode' || this.state === 'replay') {
      this.applyPostProcessFilters(this.photoFilter);
    }

    // Reality glitch post process filters (compost layer)
    if (this.activeGlitch === 'pixel') {
      this.applyPostProcessFilters('glitch');
    }
  }

  applyPostProcessFilters(filter) {
    if (filter === 'none') return;

    this.ctx.save();
    
    if (filter === 'neon') {
      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.globalAlpha = 0.15;
      this.ctx.drawImage(this.canvas, 2, 2);
      this.ctx.drawImage(this.canvas, -2, -2);
    } else if (filter === 'crt') {
      this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let y = 0; y < this.canvas.height; y += 4) {
        this.ctx.fillRect(0, y, this.canvas.width, 2);
      }
    } else if (filter === 'vhs') {
      this.ctx.fillStyle = 'rgba(0, 243, 255, 0.05)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 50; i++) {
        const gx = Math.random() * this.canvas.width;
        const gy = Math.random() * this.canvas.height;
        this.ctx.fillRect(gx, gy, 2, 2);
      }
    } else if (filter === 'monochrome') {
      const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const grayscale = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        data[i] = grayscale;
        data[i + 1] = grayscale;
        data[i + 2] = grayscale;
      }
      this.ctx.putImageData(imgData, 0, 0);
    } else if (filter === 'glitch') {
      const sliceCount = 8;
      for (let i = 0; i < sliceCount; i++) {
        if (Math.random() > 0.4) {
          const sy = Math.random() * this.canvas.height;
          const sh = 20 + Math.random() * 40;
          const shiftX = Math.random() * 20 - 10;
          
          this.ctx.drawImage(this.canvas, 0, sy, this.canvas.width, sh, shiftX, sy, this.canvas.width, sh);
        }
      }
    }

    this.ctx.restore();
  }

  startReplay() {
    if (this.player.replayBuffer.length === 0) {
      alert('REPLAY ERROR: No flight data stored.');
      return;
    }
    this.state = 'replay';
    this.replayFrameIndex = 0;
    window.ui.switchScreen('replay-overlay');
  }

  exitReplay() {
    this.state = 'gameover';
    window.ui.switchScreen('gameover-menu');
  }

  startPhotoMode() {
    this.state = 'photo_mode';
    this.photoFilter = 'none';
    this.photoZoom = 1.0;
    this.photoPanY = 0;
    this.photoRenderHUD = true;

    window.ui.switchScreen('photo-overlay');
  }
}

window.game = new GameEngine();
