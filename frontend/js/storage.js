// LocalStorage Manager for Cyber Dash

const STORAGE_KEY = 'cyber_dash_save_state';

const DEFAULT_STATE = {
  profile: {
    name: '',
    avatar: 'avatar_1',
    color: '#00ffff',
    suit: 'skin_default',
    setupCompleted: false
  },
  highScore: 0,
  bestDistance: 0,
  coins: 0,
  credits: 0,
  unlockedSkins: ['skin_default'],
  equippedSkin: 'skin_default',
  unlockedTrails: ['trail_laser'],
  equippedTrail: 'trail_laser',
  unlockedAchievements: [],
  settings: {
    musicVolume: 70,
    sfxVolume: 80,
    graphicsQuality: 'medium', // low, medium, high
    difficulty: 'medium',      // easy, medium, hard
    fullscreen: false
  },
  stats: {
    totalRuns: 0,
    bestDistance: 0,
    totalCoins: 0,
    playTime: 0, // In seconds
    totalJumps: 0,
    totalDashes: 0,
    totalSlides: 0,
    bossesDefeated: 0,
    achievementsEarned: 0
  },
  dailyMissions: {
    date: '',
    missionIndices: [0, 1, 2],
    progress: [0, 0, 0],
    claimed: [false, false, false]
  },
  campaign: {
    unlockedStage: 1,
    stageData: {},
    abilitiesUnlocked: [],
    relicsFound: [],
    totalStars: 0
  },
  gameMode: 'endless'  // 'endless' or 'campaign'
};

class StorageManager {
  constructor() {
    this.state = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      
      const parsed = JSON.parse(data);
      // Merge with default state to ensure backward compatibility/no missing fields
      const merged = { ...DEFAULT_STATE, ...parsed };
      merged.profile = { ...DEFAULT_STATE.profile, ...parsed.profile };
      merged.settings = { ...DEFAULT_STATE.settings, ...parsed.settings };
      merged.stats = { ...DEFAULT_STATE.stats, ...parsed.stats };
      merged.dailyMissions = { ...DEFAULT_STATE.dailyMissions, ...parsed.dailyMissions };
      // Merge campaign with deep copy of defaults
      merged.campaign = {
        ...DEFAULT_STATE.campaign,
        ...(parsed.campaign || {}),
        abilitiesUnlocked: (parsed.campaign && parsed.campaign.abilitiesUnlocked) || [],
        relicsFound: (parsed.campaign && parsed.campaign.relicsFound) || [],
        stageData: (parsed.campaign && parsed.campaign.stageData) || {}
      };
      return merged;
    } catch (e) {
      console.error('Failed to parse local storage, loading defaults:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.backupActiveAccount();
      if (window.api && window.api.getToken()) {
        window.api.saveCloud(this.state);
      }
    } catch (e) {
      console.error('Failed to write to local storage:', e);
    }
  }

  // Multi-account Backup & Authentication System
  getAccounts() {
    try {
      const data = localStorage.getItem('cyber_dash_accounts');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveAccounts(accounts) {
    try {
      localStorage.setItem('cyber_dash_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts backup:', e);
    }
  }

  getCurrentUser() {
    return localStorage.getItem('cyber_dash_current_user') || '';
  }

  setCurrentUser(username) {
    localStorage.setItem('cyber_dash_current_user', username);
  }

  registerAccount(username, password) {
    const user = username.trim().toLowerCase();
    if (!user || user.length < 3) return { success: false, msg: 'Username must be at least 3 characters' };
    if (!password || password.length < 3) return { success: false, msg: 'Password must be at least 3 characters' };

    const accounts = this.getAccounts();
    if (accounts[user]) return { success: false, msg: 'Account already exists! Please log in.' };

    const newState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    newState.profile.name = username.trim();
    newState.profile.setupCompleted = true;

    accounts[user] = {
      username: username.trim(),
      password,
      created: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      state: newState,
      history: []
    };

    this.saveAccounts(accounts);
    this.setCurrentUser(user);
    this.state = newState;
    this.save();
    return { success: true, msg: `Account ${username} registered successfully!` };
  }

  loginAccount(username, password) {
    const user = username.trim().toLowerCase();
    const accounts = this.getAccounts();
    const acc = accounts[user];

    if (!acc) return { success: false, msg: 'Account not found. Please register first.' };
    if (acc.password !== password) return { success: false, msg: 'Invalid password!' };

    acc.lastLogin = new Date().toISOString();
    this.saveAccounts(accounts);
    this.setCurrentUser(user);
    this.state = JSON.parse(JSON.stringify(acc.state));
    this.save();
    return { success: true, msg: `Welcome back, ${acc.username}!` };
  }

  backupActiveAccount() {
    const user = this.getCurrentUser();
    if (!user) return;
    const accounts = this.getAccounts();
    if (accounts[user]) {
      accounts[user].state = JSON.parse(JSON.stringify(this.state));
      accounts[user].lastLogin = new Date().toISOString();
      this.saveAccounts(accounts);
    }
  }

  getRunHistory() {
    const user = this.getCurrentUser();
    const accounts = this.getAccounts();
    return (user && accounts[user] && accounts[user].history) || [];
  }

  recordRunHistoryEntry(entry) {
    const user = this.getCurrentUser();
    if (!user) return;
    const accounts = this.getAccounts();
    if (accounts[user]) {
      if (!accounts[user].history) accounts[user].history = [];
      accounts[user].history.unshift(entry);
      // Keep last 20 runs
      if (accounts[user].history.length > 20) accounts[user].history.pop();
      this.saveAccounts(accounts);
    }
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }

  // Currency & Unlocks
  addCoins(amount) {
    this.state.coins += amount;
    this.state.stats.totalCoins += amount;
    this.save();
    return this.state.coins;
  }

  spendCoins(amount) {
    if (this.state.coins >= amount) {
      this.state.coins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  unlockSkin(skinId) {
    if (!this.state.unlockedSkins.includes(skinId)) {
      this.state.unlockedSkins.push(skinId);
      this.save();
    }
  }

  equipSkin(skinId) {
    if (this.state.unlockedSkins.includes(skinId)) {
      this.state.equippedSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  unlockTrail(trailId) {
    if (!this.state.unlockedTrails.includes(trailId)) {
      this.state.unlockedTrails.push(trailId);
      this.save();
    }
  }

  equipTrail(trailId) {
    if (this.state.unlockedTrails.includes(trailId)) {
      this.state.equippedTrail = trailId;
      this.save();
      return true;
    }
    return false;
  }

  // Achievements
  unlockAchievement(achId) {
    if (!this.state.unlockedAchievements.includes(achId)) {
      this.state.unlockedAchievements.push(achId);
      this.state.stats.achievementsEarned = this.state.unlockedAchievements.length;
      this.save();
      return true; // Newly unlocked
    }
    return false;
  }

  checkAchievementsProgress(gameStats) {
    const newlyUnlocked = [];
    
    // Check specific conditions
    if (this.state.stats.totalRuns >= 1) {
      if (this.unlockAchievement('ach_first_run')) newlyUnlocked.push('ach_first_run');
    }
    if (this.state.stats.totalCoins >= 100) {
      if (this.unlockAchievement('ach_100_coins')) newlyUnlocked.push('ach_100_coins');
    }
    if (this.state.stats.totalCoins >= 1000) {
      if (this.unlockAchievement('ach_1000_coins')) newlyUnlocked.push('ach_1000_coins');
    }
    if (this.state.stats.bestDistance >= 10000) {
      if (this.unlockAchievement('ach_10k_dist')) newlyUnlocked.push('ach_10k_dist');
    }
    if (gameStats) {
      if (gameStats.distanceInRun >= 1500 && gameStats.hitsInRun === 0) {
        if (this.unlockAchievement('ach_perfect_run')) newlyUnlocked.push('ach_perfect_run');
      }
      if (gameStats.dashesInRun >= 50) {
        if (this.unlockAchievement('ach_dash_master')) newlyUnlocked.push('ach_dash_master');
      }
      if (gameStats.lasersDodgedInRun >= 20) {
        if (this.unlockAchievement('ach_laser_dodger')) newlyUnlocked.push('ach_laser_dodger');
      }
    }
    
    // Check if max speed achieved is maximum allowed
    if (this.state.stats.speedDemonAchieved) {
      if (this.unlockAchievement('ach_speed_demon')) newlyUnlocked.push('ach_speed_demon');
    }

    // Check completionist: if unlocked other 8
    if (this.state.unlockedAchievements.length === window.ACHIEVEMENTS.length - 1 && !this.state.unlockedAchievements.includes('ach_completionist')) {
      if (this.unlockAchievement('ach_completionist')) newlyUnlocked.push('ach_completionist');
    }

    return newlyUnlocked;
  }

  // Update Game Stats at end of run
  recordRun(runDistance, runCoins, runScore, runJumps, runDashes, runSlides, runBosses, playSeconds, hits) {
    this.state.stats.totalRuns += 1;
    this.state.stats.playTime += playSeconds;
    this.state.stats.totalJumps += runJumps;
    this.state.stats.totalDashes += runDashes;
    this.state.stats.totalSlides += runSlides;
    this.state.stats.bossesDefeated += runBosses;
    
    this.addCoins(runCoins);

    if (runDistance > this.state.stats.bestDistance) {
      this.state.stats.bestDistance = Math.floor(runDistance);
      this.state.bestDistance = Math.floor(runDistance);
    }
    if (runScore > this.state.highScore) {
      this.state.highScore = Math.floor(runScore);
    }
    
    // Append to account run history log
    this.recordRunHistoryEntry({
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      distance: Math.floor(runDistance),
      score: Math.floor(runScore),
      coins: runCoins,
      mode: this.state.gameMode || 'endless'
    });

    this.save();
  }
}

window.storage = new StorageManager();
