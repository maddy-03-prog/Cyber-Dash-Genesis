// DOM and Canvas UI Manager for Cyber Dash

class ScreenManager {
  constructor() {
    this.activeScreen = 'main-menu';
    this.screens = [
      'preloader', 'main-menu', 'settings-menu', 'customization-menu', 'howtoplay-menu',
      'achievements-menu', 'statistics-menu', 'credits-menu', 'pause-overlay',
      'gameover-menu', 'replay-overlay', 'photo-overlay', 'hq-menu',
      'skilltree-menu', 'customs-gear-menu', 'story-menu', 'companions-menu',
      'about-menu', 'multiplayer-menu', 'exit-menu', 'profile-setup-overlay', 'difficulty-select-menu',
      'campaign-world-map', 'mission-complete-overlay', 'story-dialogue-overlay', 'login-account-overlay', 'coop-mode-select-overlay', 'vs-gameover-overlay'
    ];
  }

  showScreen(screenId) {
    this.screens.forEach(s => {
      const el = document.getElementById(s);
      if (el) {
        el.classList.remove('active-screen');
        el.classList.add('hidden');
      }
    });

    const activeEl = document.getElementById(screenId);
    if (activeEl) {
      activeEl.classList.remove('hidden');
      requestAnimationFrame(() => {
        activeEl.classList.add('active-screen');
      });
      this.activeScreen = screenId;
    }
  }
}
window.screenManager = new ScreenManager();

class UIManager {
  constructor() {
    this.activeScreen = 'main-menu';
    this.graphicsQuality = window.storage.state.settings.graphicsQuality;
    this.difficulty = window.storage.state.settings.difficulty;
    
    // Bind UI Backwards Navigation buttons
    this.bindNavigation();
    this.bindSettingsPanel();
    this.bindStorePanel();
    this.bindAAAFeatures();
    this.bindProfileSetup();
    this.bindDifficultySelect();
    this.bindSettingsProfile();
  }

  // Update HUD values during gameplay
  updateHUD(player, score, distance, coins, comboCount, comboTimerRatio, activePowerups) {
    // Dynamically calculate and render hearts: 1 heart = 20 HP
    const heartsContainer = document.getElementById('hud-hearts-container');
    const totalHearts = Math.ceil(player.maxHp / 20);
    const activeHearts = Math.ceil(Math.max(0, player.hp) / 20);
    
    if (heartsContainer) {
      heartsContainer.innerHTML = '';
      for (let i = 1; i <= totalHearts; i++) {
        const heartSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        heartSvg.setAttribute('viewBox', '0 0 24 24');
        heartSvg.setAttribute('class', `hud-heart-icon ${i > activeHearts ? 'lost' : ''}`);
        heartSvg.innerHTML = '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
        heartsContainer.appendChild(heartSvg);
      }
    }
    
    document.getElementById('hp-text').innerText = `${activeHearts}/${totalHearts} HP`;

    // Dynamic viewport top XP bar updating
    const xpFill = document.getElementById('hud-xp-bar-fill');
    if (xpFill && window.progression) {
      const xpNeeded = window.progression.getXpNeeded();
      xpFill.style.width = `${(window.progression.xp / xpNeeded) * 100}%`;
    }

    // Set difficulty badge text
    const badge = document.getElementById('hud-difficulty-badge');
    const difficulty = (window.storage && window.storage.state && window.storage.state.settings.difficulty) || 'medium';
    if (badge) {
      badge.innerText = difficulty.toUpperCase();
      if (difficulty === 'easy') {
        badge.style.background = 'var(--color-green)';
        badge.style.color = '#000';
      } else if (difficulty === 'medium') {
        badge.style.background = 'var(--primary-cyan)';
        badge.style.color = '#000';
      } else {
        badge.style.background = 'var(--primary-pink)';
        badge.style.color = '#fff';
      }
    }

    document.getElementById('energy-bar').style.width = `${Math.max(0, player.energy)}%`;
    document.getElementById('energy-text').innerText = `${Math.ceil(player.energy)}/100`;

    const shieldInd = document.getElementById('shield-indicator');
    if (player.shieldTimer > 0) {
      shieldInd.classList.remove('inactive');
      document.getElementById('shield-bar').style.width = `${(player.shieldTimer / 300) * 100}%`;
      document.getElementById('shield-timer').innerText = `${(player.shieldTimer / 60).toFixed(1)}s`;
    } else {
      shieldInd.classList.add('inactive');
      document.getElementById('shield-bar').style.width = '0%';
      document.getElementById('shield-timer').innerText = '0.0s';
    }

    document.getElementById('hud-score').innerText = String(Math.floor(score)).padStart(6, '0');
    document.getElementById('hud-distance').innerText = `${Math.floor(distance)}m`;
    document.getElementById('hud-coins').innerText = String(coins);

    const comboContainer = document.getElementById('combo-container');
    if (comboCount > 1) {
      comboContainer.classList.remove('hidden');
      document.getElementById('combo-multiplier').innerText = `x${comboCount.toFixed(1)}`;
      document.getElementById('combo-bar').style.width = `${comboTimerRatio * 100}%`;
    } else {
      comboContainer.classList.add('hidden');
    }

    this.updateActivePowerupsHUD(activePowerups);
  }

  setMultiplayerHUD(active, roomCode = '') {
    const codeEl = document.getElementById('hud-mp-code');
    const valEl = document.getElementById('hud-mp-code-val');
    if (codeEl && valEl) {
      if (active && roomCode) {
        valEl.innerText = roomCode;
        codeEl.classList.remove('hidden');
      } else {
        codeEl.classList.add('hidden');
      }
    }
  }

  updateProfileHUD() {
    const profile = window.storage.state.profile;
    const levelInfo = window.progression;
    if (!profile || !levelInfo) return;
    
    const avatars = {
      avatar_1: '🧑‍🎤',
      avatar_2: '🤖',
      avatar_3: '🕵️',
      avatar_4: '👾'
    };
    const avatarChar = avatars[profile.avatar] || '🧑‍🎤';

    // Main menu top bar
    const menuAvatar = document.getElementById('menu-profile-avatar');
    const menuName = document.getElementById('menu-profile-name');
    const menuLevel = document.getElementById('menu-profile-level');
    const menuXpText = document.getElementById('menu-profile-xp-text');
    const menuXpBar = document.getElementById('menu-profile-xp-bar');

    if (menuAvatar) menuAvatar.innerText = avatarChar;
    if (menuName) menuName.innerText = profile.name || 'RUNNER';
    if (menuLevel) menuLevel.innerText = levelInfo.level;
    
    const xpNeeded = levelInfo.getXpNeeded();
    if (menuXpText) menuXpText.innerText = `${Math.floor(levelInfo.xp)}/${xpNeeded} XP`;
    if (menuXpBar) menuXpBar.style.width = `${(levelInfo.xp / xpNeeded) * 100}%`;

    // Statistics panel profile card
    const statAvatar = document.getElementById('stat-profile-avatar');
    const statName = document.getElementById('stat-profile-name');
    const statLevel = document.getElementById('stat-profile-level');
    const statXp = document.getElementById('stat-profile-xp');

    if (statAvatar) statAvatar.innerText = avatarChar;
    if (statName) statName.innerText = profile.name || 'RUNNER';
    if (statLevel) statLevel.innerText = levelInfo.level;
    if (statXp) statXp.innerText = `${Math.floor(levelInfo.xp)}/${xpNeeded}`;
    
    // Favorite difficulty calculation
    const favDiff = window.storage.state.settings.difficulty || 'medium';
    const diffEl = document.getElementById('stat-favorite-difficulty');
    if (diffEl) {
      diffEl.innerText = favDiff.toUpperCase();
      if (favDiff === 'easy') {
        diffEl.style.color = 'var(--color-green)';
      } else if (favDiff === 'medium') {
        diffEl.style.color = 'var(--primary-cyan)';
      } else {
        diffEl.style.color = 'var(--primary-pink)';
      }
    }

    // HUD panel card
    const hudAvatar = document.getElementById('hud-profile-avatar');
    const hudName = document.getElementById('hud-profile-name');
    const hudLevel = document.getElementById('hud-profile-level');

    if (hudAvatar) hudAvatar.innerText = avatarChar;
    if (hudName) hudName.innerText = profile.name || 'RUNNER';
    if (hudLevel) hudLevel.innerText = levelInfo.level;

    // Game Over screen codename slot
    const goName = document.getElementById('go-profile-name');
    if (goName) goName.innerText = profile.name || 'RUNNER';

    // Pause menu codename slot
    const pauseName = document.getElementById('pause-profile-name');
    const pauseLevel = document.getElementById('pause-profile-level');
    if (pauseName) pauseName.innerText = profile.name || 'RUNNER';
    if (pauseLevel) pauseLevel.innerText = levelInfo.level;

    // Multiplayer awaits name slot
    const mpName = document.getElementById('mp-p1-name');
    if (mpName) mpName.innerText = profile.name || 'RUNNER';
  }

  renderAccountInfo() {
    const profile = window.storage.state.profile;
    const levelInfo = window.progression;
    const currentUser = window.storage.getCurrentUser();
    
    const nameEl = document.getElementById('acc-display-name');
    const levelEl = document.getElementById('acc-display-level');
    const avatarEl = document.getElementById('acc-display-avatar');
    const scoreEl = document.getElementById('acc-stat-score');
    const distEl = document.getElementById('acc-stat-dist');
    const starsEl = document.getElementById('acc-stat-stars');

    const avatars = { avatar_1: '🧑‍🎤', avatar_2: '🤖', avatar_3: '🕵️', avatar_4: '👾' };
    
    if (nameEl) nameEl.innerText = profile.name || (currentUser ? currentUser.toUpperCase() : 'GUEST RUNNER');
    if (levelEl) levelEl.innerText = `LEVEL ${levelInfo ? levelInfo.level : 1} RUNNER`;
    if (avatarEl) avatarEl.innerText = avatars[profile.avatar] || '🧑‍🎤';
    if (scoreEl) scoreEl.innerText = window.storage.state.highScore || 0;
    if (distEl) distEl.innerText = `${window.storage.state.bestDistance || 0}m`;
    if (starsEl) starsEl.innerText = `★ ${window.storage.state.campaign ? window.storage.state.campaign.totalStars : 0} / 33`;
  }

  bindProfileSetup() {
    const setupNameInput = document.getElementById('setup-player-name');
    const avatarOptions = document.querySelectorAll('#setup-avatar-grid .avatar-option');
    const colorDots = document.querySelectorAll('#setup-color-grid .color-dot');
    const suitOptions = document.querySelectorAll('#setup-suit-grid .suit-option');
    const saveBtn = document.getElementById('btn-setup-save');
    const nameError = document.getElementById('setup-name-error');

    if (!saveBtn) return;

    let selectedAvatar = 'avatar_1';
    let selectedColor = '#00ffff';
    let selectedSuit = 'skin_default';

    avatarOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        avatarOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedAvatar = opt.dataset.avatar;
        window.audio.playCoin();
      });
    });

    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        selectedColor = dot.dataset.color;
        window.audio.playCoin();
      });
    });

    suitOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        suitOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedSuit = opt.dataset.suit;
        window.audio.playCoin();
      });
    });

    saveBtn.addEventListener('click', () => {
      const nameVal = setupNameInput.value.trim();
      const nameRegex = /^[A-Za-z0-9_]{3,15}$/;
      
      if (!nameRegex.test(nameVal)) {
        nameError.style.display = 'block';
        window.audio.playHit();
        return;
      }

      nameError.style.display = 'none';

      // Save profile config
      window.storage.state.profile.name = nameVal;
      window.storage.state.profile.avatar = selectedAvatar;
      window.storage.state.profile.color = selectedColor;
      window.storage.state.profile.suit = selectedSuit;
      window.storage.state.profile.setupCompleted = true;
      
      // Equip skin
      window.storage.state.equippedSkin = selectedSuit;
      if (!window.storage.state.unlockedSkins.includes(selectedSuit)) {
        window.storage.state.unlockedSkins.push(selectedSuit);
      }
      
      window.storage.save();
      window.audio.playAchievement();

      this.updateProfileHUD();
      
      const overlay = document.getElementById('profile-setup-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
      }
      
      this.switchScreen('main-menu');
      window.ui.showEventBanner('PROFILE ESTABLISHED', `WELCOME PROTOCOL ${nameVal.toUpperCase()}`);
    });
  }

  bindDifficultySelect() {
    const diffCards = document.querySelectorAll('.difficulty-card');
    const backBtn = document.getElementById('btn-difficulty-back');
    const startBtn = document.getElementById('btn-difficulty-start');

    if (!startBtn) return;

    let chosenDifficulty = 'medium';

    diffCards.forEach(card => {
      card.addEventListener('click', () => {
        diffCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        chosenDifficulty = card.dataset.difficulty;
        window.audio.playCoin();
      });
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.switchScreen('main-menu');
      });
    }

    startBtn.addEventListener('click', () => {
      window.storage.state.settings.difficulty = chosenDifficulty;
      window.storage.save();
      
      const diffDropdown = document.getElementById('select-difficulty');
      if (diffDropdown) diffDropdown.value = chosenDifficulty;

      this.switchScreen('playing');
      
      if (window.game) {
        window.game.startNewGame();
      }
    });
  }

  bindSettingsProfile() {
    const editNameInput = document.getElementById('edit-player-name');
    const avatarOptions = document.querySelectorAll('#edit-avatar-grid .avatar-option');
    const colorDots = document.querySelectorAll('#edit-color-grid .color-dot');
    const commitBtn = document.getElementById('btn-save-settings-profile');

    if (!editNameInput) return;

    // Load values when editing
    const profile = window.storage.state.profile;
    
    // Set active class wrappers
    avatarOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        avatarOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        window.audio.playCoin();
      });
    });

    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        window.audio.playCoin();
      });
    });

    if (commitBtn) {
      commitBtn.addEventListener('click', () => {
        const nameVal = editNameInput.value.trim();
        const nameRegex = /^[A-Za-z0-9_]{3,15}$/;
        if (!nameRegex.test(nameVal)) {
          alert('Codename must be 3-15 characters, alphanumeric & underscore only.');
          window.audio.playHit();
          return;
        }

        const selectedAvatar = document.querySelector('#edit-avatar-grid .avatar-option.selected');
        const selectedColor = document.querySelector('#edit-color-grid .color-dot.selected');

        profile.name = nameVal;
        if (selectedAvatar) profile.avatar = selectedAvatar.dataset.avatar;
        if (selectedColor) profile.color = selectedColor.dataset.color;

        window.storage.save();
        window.audio.playAchievement();
        this.updateProfileHUD();
        window.ui.showEventBanner('CODENAME UPDATED', 'PROFILE LOG MODIFIED IN GRID SYSTEM');
      });
    }
  }

  updateActivePowerupsHUD(activePowerups) {
    const container = document.getElementById('active-powerups');
    container.innerHTML = '';

    for (let key in activePowerups) {
      const frames = activePowerups[key];
      if (frames <= 0) continue;

      const pill = document.createElement('div');
      pill.className = 'hud-powerup-pill';
      
      const dot = document.createElement('div');
      dot.className = 'hud-powerup-color-dot';
      dot.style.backgroundColor = this.getPowerupColor(key);

      const name = document.createElement('span');
      name.className = 'hud-powerup-name';
      name.innerText = key.replace('_', ' ');

      const time = document.createElement('span');
      time.className = 'hud-powerup-time';
      time.innerText = `${(frames / 60).toFixed(1)}s`;

      pill.appendChild(dot);
      pill.appendChild(name);
      pill.appendChild(time);
      container.appendChild(pill);
    }
  }

  getPowerupColor(type) {
    switch (type) {
      case 'shield': return window.COLORS.CYAN;
      case 'magnet': return window.COLORS.BLUE;
      case 'slow_motion': return window.COLORS.PURPLE;
      case 'speed_boost': return window.COLORS.GREEN;
      case 'double_coins': return window.COLORS.PINK;
      case 'invincibility': return window.COLORS.YELLOW;
      default: return '#fff';
    }
  }

  flash(colorType = 'white') {
    const flashEl = document.getElementById('screen-flash');
    if (!flashEl) return;

    flashEl.className = colorType === 'white' ? 'screen-flash-active-white' : 'screen-flash-active-red';
    setTimeout(() => {
      flashEl.className = 'screen-flash-hide';
    }, 120);
  }

  showEventBanner(title, desc) {
    const banner = document.getElementById('event-banner');
    document.getElementById('event-title').innerText = title;
    document.getElementById('event-desc').innerText = desc;
    
    banner.className = 'event-banner-show';
    setTimeout(() => {
      banner.className = 'event-banner-hide';
    }, 3500);
  }

  updateBossHUD(boss) {
    const bossHud = document.getElementById('boss-hud');
    if (boss.active && boss.state !== 'defeated') {
      bossHud.classList.remove('hidden');
      document.getElementById('boss-name').innerText = boss.type.replace('_', ' ');
      document.getElementById('boss-hp-bar').style.width = `${(boss.hp / boss.maxHp) * 100}%`;
    } else {
      bossHud.classList.add('hidden');
    }
  }

  showAchievementToast(achId) {
    const ach = window.ACHIEVEMENTS.find(a => a.id === achId);
    if (!ach) return;

    const container = document.getElementById('achievement-popup-container');
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';

    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.innerText = ach.icon;

    const body = document.createElement('div');
    body.className = 'toast-body';
    
    const title = document.createElement('div');
    title.className = 'toast-title';
    title.innerText = 'GRID ACCOMPLISHMENT UNLOCKED';

    const name = document.createElement('div');
    name.className = 'toast-name';
    name.innerText = ach.title;

    body.appendChild(title);
    body.appendChild(name);
    toast.appendChild(icon);
    toast.appendChild(body);
    container.appendChild(toast);

    window.audio.playAchievement();

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  switchScreen(screenId) {
    if (window.screenManager) {
      window.screenManager.showScreen(screenId);
    }

    // Save hierarchy history
    if (this.activeScreen && this.activeScreen !== screenId && screenId !== 'pause-overlay') {
      this.previousScreen = this.activeScreen;
    }
    this.activeScreen = screenId;

    const hud = document.getElementById('game-hud');
    const mobileControls = document.getElementById('mobile-controls');
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (hud) {
      if (screenId === 'playing') {
        hud.classList.remove('hidden');
        hud.style.opacity = 1;
        if (mobileControls) {
          if (isTouchDevice) {
            mobileControls.classList.remove('hidden');
          } else {
            mobileControls.classList.add('hidden');
          }
        }
      } else if (screenId === 'main-menu' || screenId === 'gameover-menu' || screenId === 'photo-overlay' || 
                 screenId === 'exit-menu' || screenId === 'multiplayer-menu' || 
                 screenId === 'difficulty-select-menu' || screenId === 'profile-setup-overlay') {
        hud.classList.add('hidden');
        if (mobileControls) mobileControls.classList.add('hidden');
      }
    }

    if (screenId === 'achievements-menu') this.renderAchievementsList();
    if (screenId === 'statistics-menu') this.renderStatistics();
    if (screenId === 'customization-menu') this.renderStoreItems();
    if (screenId === 'main-menu' || screenId === 'statistics-menu') this.updateProfileHUD();
    if (screenId === 'howtoplay-menu') this.updateHowToPlayControls();
  }

  updateHowToPlayControls() {
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
    const desktopBlock = document.getElementById('howtoplay-desktop-controls');
    const mobileBlock = document.getElementById('howtoplay-mobile-controls');
    if (desktopBlock && mobileBlock) {
      if (isMobile) {
        desktopBlock.classList.add('hidden');
        mobileBlock.classList.remove('hidden');
      } else {
        desktopBlock.classList.remove('hidden');
        mobileBlock.classList.add('hidden');
      }
    }
  }

  bindNavigation() {
    const binds = [
      { id: 'btn-howtoplay', target: 'howtoplay-menu' },
      { id: 'btn-howtoplay-back', target: 'main-menu' },
      { id: 'btn-settings', target: 'settings-menu' },
      { id: 'btn-achievements', target: 'achievements-menu' },
      { id: 'btn-achievements-back', target: 'main-menu' },
      { id: 'btn-statistics', target: 'statistics-menu' },
      { id: 'btn-statistics-back', target: 'main-menu' },
      { id: 'btn-credits', target: 'credits-menu' },
      { id: 'btn-credits-back', target: 'main-menu' },
      { id: 'btn-customization', target: 'customization-menu' },
      { id: 'btn-store-back', target: 'main-menu' },
      { id: 'btn-photo-exit', target: 'gameover-menu' }
    ];

    binds.forEach(({ id, target }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.switchScreen(target);
          window.audio.playCoin();
        });
      }
    });

    // Back buttons with dynamic targets
    const settingsBack = document.getElementById('btn-settings-back');
    if (settingsBack) {
      settingsBack.addEventListener('click', () => {
        const target = this.previousScreen || 'main-menu';
        this.switchScreen(target);
        window.audio.playCoin();
      });
    }
  }

  bindSettingsPanel() {
    const sliderMusic = document.getElementById('slider-music');
    const sliderSfx = document.getElementById('slider-sfx');
    const valMusic = document.getElementById('val-music');
    const valSfx = document.getElementById('val-sfx');

    if (sliderMusic && valMusic) {
      sliderMusic.value = window.storage.state.settings.musicVolume;
      valMusic.innerText = `${sliderMusic.value}%`;
      sliderMusic.addEventListener('input', (e) => {
        const val = e.target.value;
        valMusic.innerText = `${val}%`;
        window.storage.state.settings.musicVolume = val;
        window.storage.save();
        window.audio.setMusicVolume(val);
      });
    }

    if (sliderSfx && valSfx) {
      sliderSfx.value = window.storage.state.settings.sfxVolume;
      valSfx.innerText = `${sliderSfx.value}%`;
      sliderSfx.addEventListener('input', (e) => {
        const val = e.target.value;
        valSfx.innerText = `${val}%`;
        window.storage.state.settings.sfxVolume = val;
        window.storage.save();
        window.audio.setSfxVolume(val);
      });
    }

    const graphicsSelect = document.getElementById('select-graphics');
    if (graphicsSelect) {
      graphicsSelect.value = window.storage.state.settings.graphicsQuality;
      graphicsSelect.addEventListener('change', (e) => {
        this.graphicsQuality = e.target.value;
        window.storage.state.settings.graphicsQuality = this.graphicsQuality;
        window.storage.save();
      });
    }

    const difficultySelect = document.getElementById('select-difficulty');
    if (difficultySelect) {
      difficultySelect.value = window.storage.state.settings.difficulty;
      difficultySelect.addEventListener('change', (e) => {
        this.difficulty = e.target.value;
        window.storage.state.settings.difficulty = this.difficulty;
        window.storage.save();
      });
    }

    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error enabling fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      });
    }

    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('CRITICAL: Purge runner core data logs? This resets coins, skins, and high scores.')) {
        window.storage.reset();
        alert('Cache purged. Restarting console emulation.');
        window.location.reload();
      }
    });
  }

  bindStorePanel() {
    this.storeTab = 'skins';

    const tabSkins = document.getElementById('tab-skins');
    const tabTrails = document.getElementById('tab-trails');

    if (tabSkins && tabTrails) {
      tabSkins.addEventListener('click', () => {
        this.storeTab = 'skins';
        tabSkins.classList.add('active');
        tabTrails.classList.remove('active');
        this.renderStoreItems();
        window.audio.playCoin();
      });

      tabTrails.addEventListener('click', () => {
        this.storeTab = 'trails';
        tabTrails.classList.add('active');
        tabSkins.classList.remove('active');
        this.renderStoreItems();
        window.audio.playCoin();
      });
    }
  }

  renderStoreItems() {
    const container = document.getElementById('store-items-container');
    if (container) {
      container.innerHTML = '';
    }

    const storeCredits = document.getElementById('store-credits-count');
    if (storeCredits) {
      storeCredits.innerText = window.storage.state.coins;
    }
    const menuCredits = document.getElementById('menu-credits-count');
    if (menuCredits) {
      menuCredits.innerText = window.storage.state.coins;
    }

    const list = this.storeTab === 'skins' ? window.SHOP_SKINS : window.SHOP_TRAILS;
    const unlockedList = this.storeTab === 'skins' ? window.storage.state.unlockedSkins : window.storage.state.unlockedTrails;
    const equippedItem = this.storeTab === 'skins' ? window.storage.state.equippedSkin : window.storage.state.equippedTrail;

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'store-item-card';

      const isOwned = unlockedList.includes(item.id);
      const isEquipped = equippedItem === item.id;

      if (isEquipped) card.classList.add('equipped');
      if (isOwned) card.classList.add('owned');

      const preview = document.createElement('div');
      preview.className = 'store-preview-icon';
      if (this.storeTab === 'skins') {
        preview.style.backgroundColor = '#181828';
        preview.style.border = `3px solid ${item.color || window.COLORS.CYAN}`;
        preview.style.boxShadow = `inset 0 0 10px ${item.color || window.COLORS.CYAN}`;
      } else {
        preview.style.backgroundColor = '#181828';
        preview.style.border = '2px dashed #ff007f';
        preview.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;">WAKE</div>`;
      }

      const title = document.createElement('div');
      title.className = 'store-item-title';
      title.innerText = item.name;

      const desc = document.createElement('div');
      desc.className = 'store-item-desc';
      desc.innerText = item.desc;

      const buyBtn = document.createElement('button');
      buyBtn.className = 'store-buy-btn';

      if (isEquipped) {
        buyBtn.innerText = 'ACTIVE SHELL';
      } else if (isOwned) {
        buyBtn.innerText = 'EQUIP CORE';
        buyBtn.addEventListener('click', () => {
          if (this.storeTab === 'skins') {
            window.storage.equipSkin(item.id);
          } else {
            window.storage.equipTrail(item.id);
          }
          window.audio.playAchievement();
          this.renderStoreItems();
        });
      } else {
        buyBtn.innerText = `UNLOCK [${item.cost} CR]`;
        buyBtn.classList.add('locked-price');
        buyBtn.addEventListener('click', () => {
          if (window.storage.spendCoins(item.cost)) {
            if (this.storeTab === 'skins') {
              window.storage.unlockSkin(item.id);
              window.storage.equipSkin(item.id);
            } else {
              window.storage.unlockTrail(item.id);
              window.storage.equipTrail(item.id);
            }
            window.audio.playAchievement();
            this.renderStoreItems();
          } else {
            alert('SECURITY ERROR: Insufficient credit cores.');
            window.audio.playHit();
          }
        });
      }

      card.appendChild(preview);
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(buyBtn);
      container.appendChild(card);
    });
  }

  renderAchievementsList() {
    const listEl = document.getElementById('achievements-list');
    listEl.innerHTML = '';

    window.ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = window.storage.state.unlockedAchievements.includes(ach.id);
      
      const row = document.createElement('div');
      row.className = 'achievement-row';
      if (isUnlocked) row.classList.add('unlocked');

      const badge = document.createElement('div');
      badge.className = 'achievement-badge-ico';
      badge.innerText = ach.icon;

      const info = document.createElement('div');
      info.className = 'achievement-info';

      const title = document.createElement('div');
      title.className = 'achievement-name';
      title.innerText = ach.title;

      const desc = document.createElement('div');
      desc.className = 'achievement-desc';
      desc.innerText = ach.desc;

      const status = document.createElement('div');
      status.className = 'achievement-status-tag';
      status.innerText = isUnlocked ? 'SECURED' : 'LOCKED';

      info.appendChild(title);
      info.appendChild(desc);
      row.appendChild(badge);
      row.appendChild(info);
      row.appendChild(status);

      listEl.appendChild(row);
    });
  }

  renderStatistics() {
    document.getElementById('stat-total-runs').innerText = window.storage.state.stats.totalRuns;
    document.getElementById('stat-best-dist').innerText = `${window.storage.state.stats.bestDistance}m`;
    document.getElementById('stat-total-coins').innerText = window.storage.state.stats.totalCoins;
    
    const sec = window.storage.state.stats.playTime;
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    document.getElementById('stat-play-time').innerText = `${hrs}h ${mins}m ${secs}s`;

    document.getElementById('stat-jumps').innerText = window.storage.state.stats.totalJumps;
    document.getElementById('stat-dashes').innerText = window.storage.state.stats.totalDashes;
    document.getElementById('stat-slides').innerText = window.storage.state.stats.totalSlides;
    document.getElementById('stat-bosses').innerText = window.storage.state.stats.totalBosses || window.storage.state.stats.bossesDefeated;
    document.getElementById('stat-achievements').innerText = `${window.storage.state.stats.achievementsEarned}/${window.ACHIEVEMENTS.length}`;
  }

  updateDailyMissionsHUD(dailyMissions) {
    const listContainer = document.getElementById('daily-missions-list');
    listContainer.innerHTML = '';

    const indices = dailyMissions.missionIndices;
    const progress = dailyMissions.progress;

    indices.forEach((missionIdx, i) => {
      const mission = window.MISSIONS[missionIdx];
      const currentProgress = progress[i];
      const isCompleted = currentProgress >= mission.target;

      const row = document.createElement('div');
      row.className = 'daily-mission-item';

      const desc = document.createElement('span');
      desc.innerText = mission.text;

      const right = document.createElement('span');
      right.className = 'mission-progress-text';

      if (isCompleted) {
        right.innerHTML = `<span class="mission-complete">RESOLVED [+${mission.reward} CR]</span>`;
      } else {
        right.innerText = `[${currentProgress}/${mission.target}]`;
      }

      row.appendChild(desc);
      row.appendChild(right);
      listContainer.appendChild(row);
    });
  }

  showGameOver(runDist, runCoins, runScore, unlockedAchsThisRun) {
    this.switchScreen('gameover-menu');
    
    document.getElementById('go-distance').innerText = `${Math.floor(runDist)}m`;
    document.getElementById('go-coins').innerText = `+${runCoins}`;
    document.getElementById('go-score').innerText = Math.floor(runScore);

    const hsEl = document.getElementById('go-highscore');
    if (hsEl && window.storage) {
      hsEl.innerText = Math.floor(window.storage.state.highScore);
    }

    // Update profile name on game over screen
    const goName = document.getElementById('go-profile-name');
    if (goName && window.storage.state.profile) {
      goName.innerText = window.storage.state.profile.name || 'RUNNER';
    }

    const badge = document.getElementById('go-achievements-unlocked');
    if (unlockedAchsThisRun.length > 0) {
      badge.classList.remove('hidden');
      badge.innerHTML = `🏆 UNLOCKED ${unlockedAchsThisRun.length} SECURE LEVEL DECRYPTIONS!`;
    } else {
      badge.classList.add('hidden');
    }

    // Update menu credits count
    const menuCredits = document.getElementById('menu-credits-count');
    const storeCredits = document.getElementById('store-credits-count');
    const totalCredits = (window.storage.state.credits || 0) + (window.storage.state.coins || 0);
    if (menuCredits) menuCredits.innerText = totalCredits;
    if (storeCredits) storeCredits.innerText = totalCredits;
  }

  showVSGameOver(data) {
    this.switchScreen('vs-gameover-overlay');

    const winnerBanner = document.getElementById('vs-winner-banner');
    const p1Card = document.getElementById('vs-card-p1');
    const p2Card = document.getElementById('vs-card-p2');

    const p1Score = data.p1Score || 0;
    const p2Score = data.p2Score || 0;

    document.getElementById('vs-p1-name').innerText = data.p1Name || 'PLAYER 1';
    document.getElementById('vs-p1-score').innerText = p1Score;
    document.getElementById('vs-p1-dist').innerText = `${data.p1Dist || 0}m`;
    document.getElementById('vs-p1-coins').innerText = data.p1Coins || 0;

    document.getElementById('vs-p2-avatar').innerText = data.p2Avatar || (data.isAi ? '🤖' : '🔻');
    document.getElementById('vs-p2-name').innerText = data.p2Name || 'PLAYER 2';
    document.getElementById('vs-p2-score').innerText = p2Score;
    document.getElementById('vs-p2-dist').innerText = `${data.p2Dist || 0}m`;
    document.getElementById('vs-p2-coins').innerText = data.p2Coins || 0;

    if (p1Score >= p2Score) {
      if (winnerBanner) {
        winnerBanner.innerText = `🏆 ${data.p1Name.toUpperCase()} VICTORIOUS!`;
        winnerBanner.style.color = 'var(--primary-cyan)';
        winnerBanner.style.borderColor = 'var(--primary-cyan)';
      }
      if (p1Card) p1Card.classList.add('winner');
      if (p2Card) p2Card.classList.remove('winner');
    } else {
      if (winnerBanner) {
        winnerBanner.innerText = `🤖 ${data.p2Name.toUpperCase()} VICTORIOUS!`;
        winnerBanner.style.color = 'var(--primary-pink)';
        winnerBanner.style.borderColor = 'var(--primary-pink)';
      }
      if (p2Card) p2Card.classList.add('winner');
      if (p1Card) p1Card.classList.remove('winner');
    }
  }

  bindAAAFeatures() {
     const safeBind = (id, callback) => {
       const el = document.getElementById(id);
       if (el) el.addEventListener('click', callback);
     };

     // Menu screen triggers
     safeBind('btn-hq', () => {
       this.switchScreen('hq-menu');
       this.renderHQ();
     });
     safeBind('btn-hq-back', () => {
       this.switchScreen('main-menu');
     });

     // HQ Upgrades click handlers
     safeBind('btn-upgrade-research', () => {
       window.hq.upgradeRoom('research');
     });
     safeBind('btn-upgrade-drones', () => {
       window.hq.upgradeRoom('drones');
     });
     safeBind('btn-upgrade-workshop', () => {
       window.hq.upgradeRoom('workshop');
     });

     // Skill Tree
     safeBind('btn-skilltree', () => {
       this.switchScreen('skilltree-menu');
       this.activeSkillsTab = 'combat';
       this.renderSkillTree();
     });
     safeBind('btn-skilltree-back', () => {
       this.switchScreen('main-menu');
     });

     // Skill Tabs
     const bindSkillsTab = (tabId, branch) => {
       const el = document.getElementById(tabId);
       if (el) {
         el.addEventListener('click', (e) => {
           document.querySelectorAll('#skilltree-menu .tab-btn').forEach(btn => btn.classList.remove('active'));
           e.target.classList.add('active');
           this.activeSkillsTab = branch;
           this.renderSkillTree();
         });
       }
     };
     bindSkillsTab('tab-skills-combat', 'combat');
     bindSkillsTab('tab-skills-movement', 'movement');
     bindSkillsTab('tab-skills-tech', 'tech');

     // Gear Customizer
     safeBind('btn-customs-gear', () => {
       this.switchScreen('customs-gear-menu');
       this.activeGearTab = 'helmet';
       this.renderCustomsGear();
     });
     safeBind('btn-customs-gear-back', () => {
       this.switchScreen('main-menu');
     });

     // Gear Tabs
     const bindGearTab = (tabId, slot) => {
       const el = document.getElementById(tabId);
       if (el) {
         el.addEventListener('click', (e) => {
           document.querySelectorAll('#customs-gear-menu .tab-btn').forEach(btn => btn.classList.remove('active'));
           e.target.classList.add('active');
           this.activeGearTab = slot;
           this.renderCustomsGear();
         });
       }
     };
     bindGearTab('tab-gear-helmet', 'helmet');
     bindGearTab('tab-gear-armor', 'armor');
     bindGearTab('tab-gear-weapon', 'weapon');

     // Companions
     safeBind('btn-companions', () => {
       this.switchScreen('companions-menu');
       this.activeCompanionsTab = 'drones';
       this.renderCompanions();
     });
     safeBind('btn-companions-back', () => {
       this.switchScreen('main-menu');
     });

     // Companions Tabs
     const bindCompTab = (tabId, type) => {
       const el = document.getElementById(tabId);
       if (el) {
         el.addEventListener('click', (e) => {
           document.querySelectorAll('#companions-menu .tab-btn').forEach(btn => btn.classList.remove('active'));
           e.target.classList.add('active');
           this.activeCompanionsTab = type;
           this.renderCompanions();
         });
       }
     };
     bindCompTab('tab-companions-drones', 'drones');
     bindCompTab('tab-companions-pets', 'pets');

      // Story / Campaign Mode → World Map
      safeBind('btn-story-mode', () => {
        this.switchScreen('campaign-world-map');
        // Initialize world map canvas
        if (window.worldMap) {
          setTimeout(() => {
            window.worldMap.init('wm-canvas');
          }, 100);
        }
      });
      safeBind('btn-story-back', () => {
        this.switchScreen('main-menu');
        if (window.worldMap) window.worldMap.hideBriefing();
      });
      safeBind('wm-btn-back', () => {
        this.switchScreen('main-menu');
        if (window.worldMap) window.worldMap.hideBriefing();
      });
      safeBind('wm-btn-close-briefing', () => {
        if (window.worldMap) window.worldMap.hideBriefing();
      });

      // Story Dialogue Continue trigger
      safeBind('btn-story-next', () => {
        window.story.advanceDialogue();
      });

      // Mission Complete screen buttons
      safeBind('mc-btn-retry', () => {
        const stage = window.story && window.story.currentCampaignStage || window.story.getCurrentStage();
        if (stage) window.worldMap && window.worldMap.launchStage(stage);
      });
      safeBind('mc-btn-map', () => {
        this.switchScreen('campaign-world-map');
        setTimeout(() => { if (window.worldMap) window.worldMap.init('wm-canvas'); }, 100);
      });

      // Player Account Login & Backup System Bindings
      safeBind('btn-menu-account', () => {
        this.switchScreen('login-account-overlay');
        this.renderAccountInfo();
      });

      safeBind('tab-acc-login', () => {
        document.getElementById('tab-acc-login')?.classList.add('active');
        document.getElementById('tab-acc-register')?.classList.remove('active');
        document.getElementById('form-acc-login')?.classList.remove('hidden');
        document.getElementById('form-acc-register')?.classList.add('hidden');
      });

      safeBind('tab-acc-register', () => {
        document.getElementById('tab-acc-register')?.classList.add('active');
        document.getElementById('tab-acc-login')?.classList.remove('active');
        document.getElementById('form-acc-register')?.classList.remove('hidden');
        document.getElementById('form-acc-login')?.classList.add('hidden');
      });

      safeBind('btn-acc-login-submit', () => {
        const user = document.getElementById('acc-login-username')?.value || '';
        const pass = document.getElementById('acc-login-password')?.value || '';
        const msgEl = document.getElementById('acc-login-msg');
        
        const res = window.storage.loginAccount(user, pass);
        if (msgEl) {
          msgEl.innerText = res.msg;
          msgEl.style.color = res.success ? '#00ff88' : '#ff3366';
          msgEl.classList.remove('hidden');
        }
        if (res.success) {
          window.audio.playAchievement();
          this.renderAccountInfo();
          this.updateProfileHUD();
        } else {
          window.audio.playHit();
        }
      });

      safeBind('btn-acc-reg-submit', () => {
        const user = document.getElementById('acc-reg-username')?.value || '';
        const pass = document.getElementById('acc-reg-password')?.value || '';
        const msgEl = document.getElementById('acc-reg-msg');

        const res = window.storage.registerAccount(user, pass);
        if (msgEl) {
          msgEl.innerText = res.msg;
          msgEl.style.color = res.success ? '#00ff88' : '#ff3366';
          msgEl.classList.remove('hidden');
        }
        if (res.success) {
          window.audio.playAchievement();
          this.renderAccountInfo();
          this.updateProfileHUD();
        } else {
          window.audio.playHit();
        }
      });

      safeBind('btn-acc-continue', () => {
        this.switchScreen('main-menu');
        window.audio.startLobbyMusic();
      });


     // About Developer Screen
     safeBind('btn-about-dev', () => {
       this.switchScreen('about-menu');
     });
     safeBind('btn-about-back', () => {
       this.switchScreen('main-menu');
     });

     // Exit Emulation screen
     safeBind('btn-exit', () => {
       this.switchScreen('exit-menu');
     });
     safeBind('btn-reboot', () => {
       window.audio.playAchievement();
       this.switchScreen('main-menu');
     });

      // VS Match Result Screen Binds
      safeBind('vs-btn-retry', () => {
        if (window.game) {
          if (window.game.isAiPartner) window.game.startAiCoopGame();
          else window.game.startMultiplayerGame();
        }
      });
      safeBind('vs-btn-main', () => {
        if (window.game) window.game.state = 'menu';
        this.switchScreen('main-menu');
        window.audio.startLobbyMusic();
      });

      safeBind('btn-mp-sim-join', () => {
        if (window.multiplayer) window.multiplayer.connectSimulatedPlayer2();
      });

      // Multiplayer / Co-Op Mode Select
      safeBind('btn-mp', () => {
        this.switchScreen('coop-mode-select-overlay');
      });
      safeBind('btn-coop-close', () => {
        this.switchScreen('main-menu');
      });
      safeBind('btn-launch-ai', () => {
        if (window.game) window.game.startAiCoopGame();
      });
      safeBind('btn-launch-mp', () => {
        this.switchScreen('multiplayer-menu');
        const homeView = document.getElementById('mp-home-view');
        if (homeView) homeView.classList.remove('hidden');
        const joinView = document.getElementById('mp-join-view');
        if (joinView) joinView.classList.add('hidden');
        const lobbyView = document.getElementById('mp-lobby-view');
        if (lobbyView) lobbyView.classList.add('hidden');
        const disconnectView = document.getElementById('mp-disconnect-view');
        if (disconnectView) disconnectView.classList.add('hidden');
      });

     safeBind('btn-mp-back', () => {
       this.switchScreen('main-menu');
     });

     // Lobby create
     safeBind('btn-mp-create', () => {
       const code = window.multiplayer.createRoom();
       window.audio.playAchievement();
     });

     // Join view initializers
     safeBind('btn-mp-join-init', () => {
       const homeView = document.getElementById('mp-home-view');
       if (homeView) homeView.classList.add('hidden');
       const joinView = document.getElementById('mp-join-view');
       if (joinView) joinView.classList.remove('hidden');
       window.audio.playCoin();
     });

     safeBind('btn-mp-join-back', () => {
       const joinView = document.getElementById('mp-join-view');
       if (joinView) joinView.classList.add('hidden');
       const homeView = document.getElementById('mp-home-view');
       if (homeView) homeView.classList.remove('hidden');
       window.audio.playCoin();
     });

     safeBind('btn-mp-join-submit', () => {
       const codeInput = document.getElementById('input-mp-code');
       if (codeInput) {
         const code = codeInput.value;
         if (code.length === 6) {
           const success = window.multiplayer.joinRoom(code);
           if (success) {
             const joinView = document.getElementById('mp-join-view');
             if (joinView) joinView.classList.add('hidden');
             const lobbyView = document.getElementById('mp-lobby-view');
             if (lobbyView) lobbyView.classList.remove('hidden');
             window.audio.playAchievement();
           } else {
             alert('DECRYPTION FAILURE: Secure key mismatch.');
           }
         } else {
           alert('INVALID KEY: Key must contain exactly 6 nodes.');
         }
       }
     });

     // Lobby copy commands
     safeBind('btn-mp-copy-code', () => {
       if (window.multiplayer && window.multiplayer.roomCode) {
         navigator.clipboard.writeText(window.multiplayer.roomCode).then(() => {
           this.showEventBanner('KEY COPIED', 'LOBBY ROOM CODE WRITTEN TO CLIPBOARD');
           window.audio.playAchievement();
         });
       }
     });

     safeBind('btn-mp-copy-link', () => {
       if (window.multiplayer && window.multiplayer.roomCode) {
         const inviteLink = window.location.origin + window.location.pathname + '?room=' + window.multiplayer.roomCode;
         navigator.clipboard.writeText(inviteLink).then(() => {
           this.showEventBanner('LINK COPIED', 'INVITATION LINK WRITTEN TO TERMINAL CLIPBOARD');
           window.audio.playAchievement();
         });
       }
     });

     // Ready status toggles
     safeBind('btn-mp-ready', () => {
       window.multiplayer.setReady(1, !window.multiplayer.p1Ready);
     });

     // Disconnect simulation triggers
     safeBind('btn-mp-disconnect-debug', () => {
       window.multiplayer.simulateDisconnect();
     });

     safeBind('btn-mp-lobby-leave', () => {
       window.multiplayer.disconnect();
       this.switchScreen('main-menu');
     });

     // Reconnect buttons inside lost menu
     safeBind('btn-mp-reconnect', () => {
       window.multiplayer.reconnect.triggerAutoReconnect();
     });

     safeBind('btn-mp-disconnect-main', () => {
       window.multiplayer.disconnect();
       this.switchScreen('main-menu');
     });

     // Chat send buttons
     const chatInput = document.getElementById('mp-chat-input');
     const chatSend = document.getElementById('btn-mp-chat-send');
     
     const sendAction = () => {
       if (chatInput) {
         const msg = chatInput.value;
         if (msg.trim()) {
           window.multiplayer.sendChatMessage(msg);
           chatInput.value = '';
           window.audio.playCoin();
         }
       }
     };

     if (chatSend) {
       chatSend.addEventListener('click', sendAction);
     }
     if (chatInput) {
       chatInput.addEventListener('keydown', (e) => {
         if (e.key === 'Enter') sendAction();
       });
     }

     // Register connection/lobby callbacks
     window.multiplayer.onConnectionChange((state) => {
       const statusEl = document.getElementById('mp-lobby-status');
       const codeEl = document.getElementById('mp-room-code-display');
       
       if (state === 'waiting') {
         if (statusEl) statusEl.innerText = 'WAITING FOR FRIEND TO JOIN...';
         if (codeEl) codeEl.innerText = window.multiplayer.roomCode;
         
         const homeView = document.getElementById('mp-home-view');
         if (homeView) homeView.classList.add('hidden');
         const lobbyView = document.getElementById('mp-lobby-view');
         if (lobbyView) lobbyView.classList.remove('hidden');
         window.multiplayer.triggerLobbyUpdate();
       } else if (state === 'connected') {
         if (statusEl) statusEl.innerText = 'PEER CONNECTED: SECURE CO-OP SYNCHRONIZED';
         if (codeEl) codeEl.innerText = window.multiplayer.roomCode;
         window.multiplayer.triggerLobbyUpdate();

         // Auto P2 ready after 1.8s co-op simulation
         setTimeout(() => {
           window.multiplayer.setReady(2, true);
         }, 1800);
       }
     });

     window.multiplayer.onChatUpdate((log) => {
       const logsContainer = document.getElementById('mp-chat-logs');
       if (logsContainer) {
         logsContainer.innerHTML = '';
         log.forEach(msg => {
           const div = document.createElement('div');
           div.style.marginBottom = '4px';
           if (msg.sender === 'SYSTEM') {
             div.style.color = '#ffcc00';
             div.innerText = `[SYSTEM]: ${msg.text}`;
           } else {
             const isP1 = (msg.sender === 'P1_HOST' || msg.sender === 'HOST_P1');
             div.style.color = isP1 ? window.COLORS.CYAN : window.COLORS.PINK;
             div.innerText = `${isP1 ? 'P1' : 'P2'}: ${msg.text}`;
           }
           logsContainer.appendChild(div);
         });
         logsContainer.scrollTop = logsContainer.scrollHeight;
       }
     });
  }

  renderHQ() {
     window.hq.updateHQRoomUI('research');
     window.hq.updateHQRoomUI('workshop');
  }

  renderSkillTree() {
     const branch = this.activeSkillsTab || 'combat';
     const container = document.getElementById('skills-container');
     container.innerHTML = '';
     
     // Update current skill credits info
     document.getElementById('skill-points-val').innerText = window.progression.skillPoints;
     document.getElementById('player-level-val').innerText = window.progression.level;

     const list = window.progression.skills[branch];
     list.forEach(node => {
       const isUnlocked = window.progression.hasSkill(node.id);
       const card = document.createElement('div');
       card.className = 'store-item-card' + (isUnlocked ? ' unlocked' : '');
       
       card.innerHTML = `
         <div class="store-item-title">${node.name}</div>
         <div class="store-item-desc">${node.desc}</div>
         <button class="store-buy-btn ${isUnlocked ? 'equipped' : ''}" id="btn-skill-${node.id}">
           ${isUnlocked ? 'ACTIVE NODE' : `UNLOCK [${node.cost} SP]`}
         </button>
       `;
       container.appendChild(card);

       if (!isUnlocked) {
         document.getElementById(`btn-skill-${node.id}`).addEventListener('click', () => {
           if (window.progression.unlockSkill(node.id)) {
             this.renderSkillTree();
           } else {
             alert('INSUFFICIENT SKILL POINTS: Infiltrate sectors to earn XP levels.');
           }
         });
       }
     });
  }

  renderCustomsGear() {
     const slot = this.activeGearTab || 'helmet';
     const container = document.getElementById('gear-items-container');
     container.innerHTML = '';

     const items = window.customizer.gear[slot];
     const equipped = window.customizer.equippedGear[slot];

     items.forEach(item => {
       const isEquipped = (equipped === item.id);
       const card = document.createElement('div');
       card.className = 'store-item-card' + (isEquipped ? ' unlocked' : '');
       
       let actionBtn = '';
       if (isEquipped) {
         actionBtn = `<button class="store-buy-btn equipped">ACTIVE INJECTION</button>`;
       } else if (item.owned) {
         actionBtn = `<button class="store-buy-btn" id="btn-equip-gear-${item.id}">EQUIP MODULE</button>`;
       } else {
         actionBtn = `<button class="store-buy-btn primary-glow" id="btn-buy-gear-${item.id}">ACQUIRE [${item.cost} CR]</button>`;
       }

       card.innerHTML = `
         <div class="store-item-title">${item.name}</div>
         <div class="store-item-desc">${item.desc}</div>
         ${actionBtn}
       `;
       container.appendChild(card);

       if (!isEquipped) {
         if (item.owned) {
           document.getElementById(`btn-equip-gear-${item.id}`).addEventListener('click', () => {
             window.customizer.equipGear(slot, item.id);
             this.renderCustomsGear();
           });
         } else {
           document.getElementById(`btn-buy-gear-${item.id}`).addEventListener('click', () => {
             window.customizer.buyGear(slot, item.id);
             this.renderCustomsGear();
           });
         }
       }
     });
  }

  renderCompanions() {
     const tab = this.activeCompanionsTab || 'drones';
     const container = document.getElementById('companions-grid-container');
     container.innerHTML = '';

     if (tab === 'drones') {
       const drones = [
         { id: 'medic', name: 'N-4 CORE MEDIC DRONE', desc: 'Regenerates +1 HP runner frame charge cycles.' },
         { id: 'collector', name: 'R-7 KINETIC VACUUM DRONE', desc: 'Passively pulls floating credit nodes closer.' },
         { id: 'attack', name: 'Z-9 AUTO PLASMA SENTRY', desc: 'Fires tracking laser pulses at snipers and obstacles.' }
       ];

       drones.forEach(d => {
         const isEquipped = (window.companions.equippedDrone === d.id);
         const lvl = window.companions.droneLevels[d.id];
         const upgradeCost = lvl * 120;
         const card = document.createElement('div');
         card.className = 'store-item-card' + (isEquipped ? ' unlocked' : '');

         card.innerHTML = `
           <div class="store-item-title">${d.name} [LVL ${lvl}]</div>
           <div class="store-item-desc">${d.desc}</div>
           <div style="display:flex; gap:10px; margin-top:10px;">
             <button class="store-buy-btn ${isEquipped ? 'equipped' : ''}" style="flex:1;" id="btn-equip-dr-${d.id}">
               ${isEquipped ? 'ACTIVE DRONE' : 'EQUIP'}
             </button>
             <button class="store-buy-btn primary-glow" style="flex:1;" id="btn-up-dr-${d.id}">
               UPGRADE [${upgradeCost} CR]
             </button>
           </div>
         `;
         container.appendChild(card);

         document.getElementById(`btn-equip-dr-${d.id}`).addEventListener('click', () => {
           window.companions.equipDrone(d.id);
           this.renderCompanions();
         });
         
         document.getElementById(`btn-up-dr-${d.id}`).addEventListener('click', () => {
           if (window.companions.upgradeDrone(d.id)) {
             this.renderCompanions();
           } else {
             alert('INSUFFICIENT FUNDS: Collect credit cells in runners.');
           }
         });
       });
     } else {
       const pets = [
         { id: 'wolf', name: 'ROB-CYBER WOLF HOUND', desc: 'Boosts XP levels gains by 15% in district tracks.', cost: 150 },
         { id: 'fox', name: 'INFRARED NEON FOX', desc: 'Credit nodes collected yield +10% cash value.', cost: 200 },
         { id: 'phoenix', name: 'PHOENIX BOT DUMMY', desc: 'Shield revival matrix checks. Resurrects player at 35% HP once.', cost: 350 }
       ];

       pets.forEach(p => {
         const isEquipped = (window.companions.equippedPet === p.id);
         const isOwned = (window.storage.state.unlockedPets && window.storage.state.unlockedPets.includes(p.id)) || false;
         const card = document.createElement('div');
         card.className = 'store-item-card' + (isEquipped ? ' unlocked' : '');

         let btn = '';
         if (isEquipped) {
           btn = `<button class="store-buy-btn equipped">ACTIVE COMPANION</button>`;
         } else if (isOwned) {
           btn = `<button class="store-buy-btn" id="btn-equip-pet-${p.id}">EQUIP PET</button>`;
         } else {
           btn = `<button class="store-buy-btn primary-glow" id="btn-buy-pet-${p.id}">UNLOCK [${p.cost} CR]</button>`;
         }

         card.innerHTML = `
           <div class="store-item-title">${p.name}</div>
           <div class="store-item-desc">${p.desc}</div>
           ${btn}
         `;
         container.appendChild(card);

         if (!isEquipped) {
           if (isOwned) {
             document.getElementById(`btn-equip-pet-${p.id}`).addEventListener('click', () => {
               window.companions.equipPet(p.id);
               this.renderCompanions();
             });
           } else {
             document.getElementById(`btn-buy-pet-${p.id}`).addEventListener('click', () => {
               if (window.storage.spendCoins(p.cost)) {
                 if (!window.storage.state.unlockedPets) window.storage.state.unlockedPets = [];
                 window.storage.state.unlockedPets.push(p.id);
                 window.companions.equipPet(p.id);
                 this.renderCompanions();
               } else {
                 alert('INSUFFICIENT CREDITS: Accumulate core cash cells.');
               }
             });
           }
         }
       });
     }
  }

  renderStoryChapters() {
     const container = document.getElementById('story-chapters-list');
     container.innerHTML = '';

     const unlocked = window.story.campaignUnlocked;
     
     window.story.chapters.forEach(chap => {
       const isLocked = chap.id > unlocked;
       const card = document.createElement('div');
       card.className = 'story-chapter-card' + (isLocked ? ' locked' : '');
       
       let statusText = '';
       if (isLocked) {
         statusText = `<button class="store-buy-btn equipped" style="background:#222; border-color:#333; color:#777;">LOCKED SECTOR</button>`;
       } else {
         statusText = `<button class="store-buy-btn primary-glow" id="btn-deploy-chap-${chap.id}">DEPLOY CYBER RUNNER</button>`;
       }

       card.innerHTML = `
         <div style="font-family:var(--font-cyber); font-size:1.1rem; color:var(--primary-cyan);">${chap.title}</div>
         <div style="font-size:0.85rem; margin:8px 0; color:#aaa; font-family:var(--font-body);">${chap.desc}</div>
         ${statusText}
       `;
       container.appendChild(card);

       if (!isLocked) {
         document.getElementById(`btn-deploy-chap-${chap.id}`).addEventListener('click', () => {
           window.story.triggerChapterIntro(chap.id, () => {
             window.game.startStoryChapter(chap.id);
           });
         });
       }
     });
  }
}

window.ui = new UIManager();
