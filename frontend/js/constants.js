// Cyber Dash Game Constants

const CONFIG = {
  // Gameplay physics
  GRAVITY: 0.75,
  BASE_SPEED: 7,
  MAX_SPEED: 18,
  SPEED_ACCEL: 0.0008, // Speed acceleration factor
  JUMP_FORCE: -13.5,
  DOUBLE_JUMP_FORCE: -11.5,
  SLIDE_DURATION: 40,  // Frames
  DASH_DURATION: 18,   // Frames
  DASH_COOLDOWN: 120,  // Frames
  DASH_SPEED_MULT: 2.2,
  ENERGY_REGEN: 0.25,   // Energy regenerated per frame
  DASH_ENERGY_COST: 35,

  // Track & Spawning
  GRID_LINES: 15,
  LANE_WIDTH: 200,      // Lane spacing in drawing coords
  SPAWN_INTERVAL: 110,  // Frames between obstacles
  MIN_SPAWN_DIST: 350,  // Pixels

  // Score multiplier
  COMBO_NEAR_MISS_PX: 75,
  COMBO_DECAY: 0.015,   // Decay per frame
};

// Cyberpunk Neon Themes
const COLORS = {
  CYAN: '#00f3ff',
  PINK: '#ff007f',
  PURPLE: '#bd00ff',
  YELLOW: '#ffcc00',
  BLUE: '#3399ff',
  GREEN: '#00ff66',
  RED: '#ff3333',
  WHITE: '#ffffff',
  DARK_BG: '#03030c',
};

// Store items definitions
const SHOP_SKINS = [
  { id: 'skin_default', name: 'CYBER RUNNER', desc: 'Standard chassis with basic light grids.', cost: 0, owned: true, color: COLORS.CYAN },
  { id: 'skin_phantom', name: 'NEON PHANTOM', desc: 'Sleek stealth build reflecting violet glow.', cost: 150, owned: false, color: COLORS.PURPLE },
  { id: 'skin_overlord', name: 'CRIMSON OVERLORD', desc: 'Aggressive heavy mainframe model.', cost: 400, owned: false, color: COLORS.PINK },
  { id: 'skin_hazard', name: 'GOLD HAZARD', desc: 'Gold plated high-tier system intruder.', cost: 900, owned: false, color: COLORS.YELLOW }
];

const SHOP_TRAILS = [
  { id: 'trail_laser', name: 'LASER WAKE', desc: 'Solid glowing cyber trail.', cost: 0, owned: true, type: 'laser' },
  { id: 'trail_sparks', name: 'SPARK BURST', desc: 'Emits falling electric dust nodes.', cost: 100, owned: false, type: 'sparks' },
  { id: 'trail_rainbow', name: 'SPECTRAL RAINBOW', desc: 'Shifts dynamic colors as you move.', cost: 300, owned: false, type: 'rainbow' },
  { id: 'trail_glitch', name: 'GLITCH MATRIX', desc: 'Visual matrix block distortion.', cost: 600, owned: false, type: 'glitch' }
];

// Achievements Definitions
const ACHIEVEMENTS = [
  { id: 'ach_first_run', title: 'FIRST INTRUSION', desc: 'Completed first run sequence.', icon: '⚡' },
  { id: 'ach_100_coins', title: 'CREDIT MINER', desc: 'Acquired 100 total credits.', icon: '🪙' },
  { id: 'ach_1000_coins', title: 'CREDIT TYCOON', desc: 'Acquired 1,000 total credits.', icon: '💰' },
  { id: 'ach_10k_dist', title: 'GRID EXPLORER', desc: 'Ran 10,000 meters in total.', icon: '🏃' },
  { id: 'ach_perfect_run', title: 'FLAWLESS SEQUENCE', desc: 'Completed a run over 1,500m with no hits.', icon: '🏆' },
  { id: 'ach_dash_master', title: 'VELOCITY BLUR', desc: 'Dashed 50 times in a single run.', icon: '🌀' },
  { id: 'ach_laser_dodger', title: 'GRID DODGER', desc: 'Survived 20 laser obstacles in one run.', icon: '🛡️' },
  { id: 'ach_speed_demon', title: 'LIGHTSPEED', desc: 'Reached maximum runner speed multiplier.', icon: '🔥' },
  { id: 'ach_completionist', title: 'MASTER EXPLOITER', desc: 'Unlocked all other achievements.', icon: '👑' }
];

// Daily Missions Pool
const MISSIONS = [
  { id: 'm_coins', text: 'Collect 100 credits in a single run', target: 100, field: 'coinsInRun', reward: 50 },
  { id: 'm_dist', text: 'Run 1,500 meters in a single session', target: 1500, field: 'distanceInRun', reward: 60 },
  { id: 'm_dash', text: 'Execute Dash overload 15 times', target: 15, field: 'dashesInRun', reward: 40 },
  { id: 'm_jump', text: 'Perform 40 jumps over grid threats', target: 40, field: 'jumpsInRun', reward: 30 },
  { id: 'm_boss', text: 'Deactivate 1 security boss core', target: 1, field: 'bossesDefeatedInRun', reward: 100 }
];

// Attach variables to window to ensure global accessibility in all scripts
window.CONFIG = CONFIG;
window.COLORS = COLORS;
window.SHOP_SKINS = SHOP_SKINS;
window.SHOP_TRAILS = SHOP_TRAILS;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.MISSIONS = MISSIONS;
