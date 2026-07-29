// Campaign Story Manager — 11-Stage Cyber Dash: Genesis Story Mode

class StoryCampaign {
  constructor() {
    this.currentStage    = 1;
    this.campaignUnlocked = 1;
    this.dialogueIndex   = 0;
    this.dialogueSequence = [];
    this.dialogueCallback = null;

    // 11 Stages + Final Boss
    this.stages = [
      {
        id: 1, title: 'STAGE 1: ESCAPE FACILITY', district: 'escape_facility',
        difficulty: 'EASY', difficultyColor: '#00ff88',
        desc: 'Break free from the NEXUS recycling grid. Learn the controls and reach the perimeter breach point.',
        targetMeters: 600,
        objectives: [
          { id: 'reach_exit',   text: 'Reach the Facility Exit (600m)',   type: 'distance', target: 600,  field: 'distanceInRun' },
          { id: 'collect_chips',text: 'Find 3 Memory Chips',              type: 'chips',    target: 3,    field: 'chipsInRun'    },
          { id: 'no_death',     text: 'No Shutdown — Zero Deaths',        type: 'no_death', target: 1,    field: 'deathsInRun'   }
        ],
        secretsTotal: 3,
        parTime: 90,
        bossType: 'mega_drone',
        bossName: 'MEGA DRONE Mk-9',
        theme: 1,
        hazards: ['laser_grid', 'spinning_blade'],
        abilityUnlock: 'air_dash',
        starRewards: [100, 250, 500]
      },
      {
        id: 2, title: 'STAGE 2: NEON STREETS', district: 'neon_streets',
        difficulty: 'EASY', difficultyColor: '#00ff88',
        desc: 'Navigate the rain-soaked neon district. Dodge traffic, laser gates, and drone patrols.',
        targetMeters: 1000,
        objectives: [
          { id: 'reach_exit',    text: 'Cross the District (1000m)',        type: 'distance', target: 1000, field: 'distanceInRun' },
          { id: 'collect_coins', text: 'Collect 80 Credits',                type: 'coins',    target: 80,   field: 'coinsInRun'   },
          { id: 'destroy_drones',text: 'Destroy 10 Security Drones',        type: 'kills',    target: 10,   field: 'killsInRun'   }
        ],
        secretsTotal: 4,
        parTime: 130,
        bossType: 'traffic_warden',
        bossName: 'TRAFFIC WARDEN TITAN',
        theme: 2,
        hazards: ['traffic', 'laser_gate', 'drone_swarm'],
        abilityUnlock: null,
        starRewards: [120, 300, 600]
      },
      {
        id: 3, title: 'STAGE 3: CYBER MARKET', district: 'cyber_market',
        difficulty: 'EASY', difficultyColor: '#00ff88',
        desc: 'The floating market district hides secrets in every stall. Ride moving platforms and find hidden collectibles.',
        targetMeters: 1200,
        objectives: [
          { id: 'reach_exit',   text: 'Pass Through the Market (1200m)',    type: 'distance', target: 1200, field: 'distanceInRun' },
          { id: 'find_secrets', text: 'Discover 5 Secret Areas',            type: 'secrets',  target: 5,    field: 'secretsInRun'  },
          { id: 'collect_chips',text: 'Collect 5 Memory Chips',             type: 'chips',    target: 5,    field: 'chipsInRun'    }
        ],
        secretsTotal: 5,
        parTime: 150,
        bossType: 'laser_spider',
        bossName: 'LASER SPIDER X-1',
        theme: 3,
        hazards: ['moving_platform', 'market_drone', 'falling_crate'],
        abilityUnlock: 'triple_jump',
        starRewards: [150, 380, 750]
      },
      {
        id: 4, title: 'STAGE 4: INDUSTRIAL FACTORY', district: 'industrial_factory',
        difficulty: 'MEDIUM', difficultyColor: '#ffcc00',
        desc: 'Blast through molten steel and rotating machinery. Robot workers patrol every corridor.',
        targetMeters: 1500,
        objectives: [
          { id: 'reach_exit',   text: 'Exit the Factory (1500m)',           type: 'distance', target: 1500, field: 'distanceInRun' },
          { id: 'no_death',     text: 'Perfect Run — Zero Shutdowns',       type: 'no_death', target: 1,    field: 'deathsInRun'   },
          { id: 'combo_master', text: 'Reach x8 Combo Multiplier',          type: 'combo',    target: 8,    field: 'maxComboInRun' }
        ],
        secretsTotal: 4,
        parTime: 180,
        bossType: 'titan_mech',
        bossName: 'TITAN MECH OMEGA',
        theme: 4,
        hazards: ['rotating_saw', 'steam_vent', 'robot_worker', 'falling_hammer'],
        abilityUnlock: null,
        starRewards: [200, 500, 1000]
      },
      {
        id: 5, title: 'STAGE 5: UNDERGROUND METRO', district: 'underground_metro',
        difficulty: 'MEDIUM', difficultyColor: '#ffcc00',
        desc: 'Race through the dark tunnels of the NEXUS underground railway. Avoid moving trains and electric rails.',
        targetMeters: 1800,
        objectives: [
          { id: 'reach_exit',    text: 'Reach Surface Station (1800m)',      type: 'distance', target: 1800, field: 'distanceInRun'  },
          { id: 'collect_coins', text: 'Collect 150 Credits',                type: 'coins',    target: 150,  field: 'coinsInRun'    },
          { id: 'speed_run',     text: 'Complete Under 4 Minutes',           type: 'time',     target: 240,  field: 'timeInRun'     }
        ],
        secretsTotal: 5,
        parTime: 210,
        bossType: 'cyber_worm',
        bossName: 'CYBER WORM ALPHA',
        theme: 5,
        hazards: ['moving_train', 'electric_rail', 'dark_tunnel'],
        abilityUnlock: 'energy_shield',
        starRewards: [250, 600, 1200]
      },
      {
        id: 6, title: 'STAGE 6: SKY HIGHWAY', district: 'sky_highway',
        difficulty: 'MEDIUM', difficultyColor: '#ffcc00',
        desc: 'Five kilometers above ground, the sky highway is hit by gravity storms. Only the fastest runners survive.',
        targetMeters: 2000,
        objectives: [
          { id: 'reach_exit',    text: 'Cross the Sky Highway (2000m)',      type: 'distance', target: 2000, field: 'distanceInRun'  },
          { id: 'no_damage',     text: 'Take Less Than 30 HP Damage',        type: 'max_damage', target: 30, field: 'damageTakenInRun' },
          { id: 'air_time',      text: 'Jump 60 Times',                      type: 'jumps',    target: 60,   field: 'jumpsInRun'    }
        ],
        secretsTotal: 4,
        parTime: 230,
        bossType: 'gravity_hawk',
        bossName: 'GRAVITY HAWK SENTINEL',
        theme: 6,
        hazards: ['flying_vehicle', 'wind_gust', 'floating_platform', 'anti_air'],
        abilityUnlock: null,
        starRewards: [300, 750, 1500]
      },
      {
        id: 7, title: 'STAGE 7: QUANTUM LABORATORY', district: 'quantum_lab',
        difficulty: 'HARD', difficultyColor: '#ff6600',
        desc: 'The laws of physics break down in the Quantum Lab. Teleport portals, energy traps, and laser grids block every path.',
        targetMeters: 2400,
        objectives: [
          { id: 'reach_exit',    text: 'Exit the Lab Complex (2400m)',       type: 'distance', target: 2400, field: 'distanceInRun' },
          { id: 'portals',       text: 'Use 10 Teleport Portals',            type: 'portals',  target: 10,   field: 'portalsInRun'  },
          { id: 'collect_chips', text: 'Find 6 Memory Chips',                type: 'chips',    target: 6,    field: 'chipsInRun'    }
        ],
        secretsTotal: 6,
        parTime: 270,
        bossType: 'quantum_ghost',
        bossName: 'QUANTUM GHOST ENTITY',
        theme: 7,
        hazards: ['teleport_portal', 'energy_trap', 'laser_grid', 'force_field'],
        abilityUnlock: 'emp_blast',
        starRewards: [400, 900, 1800]
      },
      {
        id: 8, title: 'STAGE 8: FROZEN DATA CENTER', district: 'frozen_data_center',
        difficulty: 'HARD', difficultyColor: '#ff6600',
        desc: 'NEXUS froze the data center to preserve its darkest secrets. Ice physics and cryo-enemies challenge even elite runners.',
        targetMeters: 2700,
        objectives: [
          { id: 'reach_exit',    text: 'Thaw a Path Through (2700m)',        type: 'distance', target: 2700, field: 'distanceInRun'  },
          { id: 'no_death',      text: 'Survive Without Shutdown',           type: 'no_death', target: 1,    field: 'deathsInRun'    },
          { id: 'destroy_ice',   text: 'Destroy 20 Frozen Enemies',          type: 'kills',    target: 20,   field: 'killsInRun'     }
        ],
        secretsTotal: 5,
        parTime: 300,
        bossType: 'ice_colossus',
        bossName: 'ICE COLOSSUS NEXAR',
        theme: 8,
        hazards: ['ice_floor', 'frozen_enemy', 'cryo_vent', 'ice_spike'],
        abilityUnlock: null,
        starRewards: [500, 1100, 2200]
      },
      {
        id: 9, title: 'STAGE 9: DIGITAL VOID', district: 'digital_void',
        difficulty: 'HARD', difficultyColor: '#ff6600',
        desc: 'Reality itself has collapsed. Gravity reverses, platforms vanish, and glitches tear through the environment.',
        targetMeters: 3000,
        objectives: [
          { id: 'reach_exit',    text: 'Escape the Void (3000m)',            type: 'distance', target: 3000, field: 'distanceInRun'  },
          { id: 'survive_glitch',text: 'Survive 5 Reality Glitches',         type: 'glitches', target: 5,    field: 'glitchesInRun'  },
          { id: 'collect_all',   text: 'Collect 200 Credits',                type: 'coins',    target: 200,  field: 'coinsInRun'     }
        ],
        secretsTotal: 7,
        parTime: 330,
        bossType: 'reality_ripper',
        bossName: 'REALITY RIPPER ZERO',
        theme: 9,
        hazards: ['gravity_flip', 'invisible_platform', 'reality_glitch', 'void_spike'],
        abilityUnlock: 'gravity_jump',
        starRewards: [600, 1300, 2600]
      },
      {
        id: 10, title: 'STAGE 10: NEXUS FORTRESS', district: 'nexus_fortress',
        difficulty: 'VERY HARD', difficultyColor: '#ff0040',
        desc: 'The headquarters of NEXUS AI is a fortress of elite soldiers, turrets, and force barriers. The final challenge before the Core.',
        targetMeters: 3500,
        objectives: [
          { id: 'reach_exit',    text: 'Breach NEXUS HQ (3500m)',            type: 'distance', target: 3500, field: 'distanceInRun' },
          { id: 'elite_kills',   text: 'Eliminate 25 Elite Guards',          type: 'kills',    target: 25,   field: 'killsInRun'    },
          { id: 'flawless',      text: 'Reach SSS Combo Rank',               type: 'combo',    target: 12,   field: 'maxComboInRun' }
        ],
        secretsTotal: 6,
        parTime: 360,
        bossType: 'nexus_titan',
        bossName: 'NEXUS TITAN PRIME-0',
        theme: 10,
        hazards: ['elite_guard', 'security_drone', 'turret', 'force_barrier'],
        abilityUnlock: null,
        starRewards: [800, 1800, 3500]
      },
      {
        id: 11, title: 'FINAL: AI CORE — NEXUS PRIME', district: 'ai_core',
        difficulty: 'FINAL BOSS', difficultyColor: '#ffffff',
        desc: 'The heart of NEXUS AI. A being 15 times larger than any runner. Four phases stand between you and freedom for all humanity.',
        targetMeters: 500,
        objectives: [
          { id: 'reach_core',    text: 'Reach NEXUS PRIME Core',             type: 'distance', target: 500,  field: 'distanceInRun'  },
          { id: 'destroy_prime', text: 'Destroy NEXUS PRIME',                type: 'boss_kill', target: 1,   field: 'bossKillInRun'  },
          { id: 'survive_all',   text: 'Survive All 4 Phases',               type: 'phases',   target: 4,    field: 'phasesInRun'    }
        ],
        secretsTotal: 1,
        parTime: 600,
        bossType: 'nexus_prime',
        bossName: 'NEXUS PRIME — GENESIS AI',
        theme: 11,
        hazards: ['nexus_laser', 'core_explosion', 'ai_drone'],
        abilityUnlock: null,
        starRewards: [2000, 5000, 10000]
      }
    ];

    this.loadState();
  }

  loadState() {
    if (window.storage && window.storage.state) {
      if (!window.storage.state.campaign) {
        window.storage.state.campaign = {
          unlockedStage: 1,
          stageData: {},
          abilitiesUnlocked: [],
          relicsFound: [],
          totalStars: 0
        };
      }
      const c = window.storage.state.campaign;
      this.campaignUnlocked = c.unlockedStage || 1;
      this.currentStage     = c.unlockedStage || 1;
    }
  }

  saveState() {
    if (window.storage && window.storage.state) {
      window.storage.save();
    }
  }

  getStage(id) {
    return this.stages.find(s => s.id === id) || null;
  }

  getCurrentStage() {
    return this.getStage(this.currentStage);
  }

  isStageUnlocked(id) {
    return id <= this.campaignUnlocked;
  }

  isStageCompleted(id) {
    const data = window.storage && window.storage.state.campaign.stageData;
    return data && data[id] && data[id].completed;
  }

  getStageStars(id) {
    const data = window.storage && window.storage.state.campaign.stageData;
    return (data && data[id] && data[id].stars) || 0;
  }

  unlockNextStage(completedId) {
    const nextId = completedId + 1;
    if (nextId <= this.stages.length && nextId > this.campaignUnlocked) {
      this.campaignUnlocked = nextId;
      window.storage.state.campaign.unlockedStage = nextId;
    }
    this.saveState();
  }

  saveStageResult(stageId, result) {
    if (!window.storage.state.campaign.stageData) {
      window.storage.state.campaign.stageData = {};
    }
    const existing = window.storage.state.campaign.stageData[stageId] || {};
    const newEntry = {
      completed: true,
      stars: Math.max(existing.stars || 0, result.stars),
      rank: result.rank,
      bestTime: existing.bestTime ? Math.min(existing.bestTime, result.time) : result.time,
      secretsFound: Math.max(existing.secretsFound || 0, result.secretsFound),
      highScore: Math.max(existing.highScore || 0, result.score)
    };
    window.storage.state.campaign.stageData[stageId] = newEntry;
    // Recalculate total stars
    let total = 0;
    Object.values(window.storage.state.campaign.stageData).forEach(d => { total += (d.stars || 0); });
    window.storage.state.campaign.totalStars = total;
    this.saveState();
  }

  unlockAbility(abilityId) {
    const abilities = window.storage.state.campaign.abilitiesUnlocked;
    if (!abilities.includes(abilityId)) {
      abilities.push(abilityId);
      this.saveState();
      window.ui.showEventBanner('ABILITY UNLOCKED', `NEW COMBAT PROTOCOL: ${abilityId.replace('_', ' ').toUpperCase()}`);
    }
  }

  hasAbility(abilityId) {
    const abilities = window.storage.state.campaign && window.storage.state.campaign.abilitiesUnlocked;
    return abilities && abilities.includes(abilityId);
  }

  // Cinematic Dialogue
  getIntroDialogue(stageId) {
    const dialogues = {
      1: [
        { speaker: 'NEXUS AI', text: 'Alert. Intrusion detected in recycling containment sector 4. Subject designation: Genesis Runner. Initiating purge sequence.' },
        { speaker: 'GENESIS RUNNER', text: 'Visor online. Memory fragments corrupted. I have to move — reach the slums grid and break through the perimeter.' },
        { speaker: 'DRONE COMPANION', text: 'Thruster systems nominal. Heads up — security drones are locking every lane. Slide under laser nets and keep running!' }
      ],
      2: [
        { speaker: 'GENESIS RUNNER', text: 'Made it to Neon Downtown. The whole skyline is alive with billboards... but NEXUS scanners are everywhere.' },
        { speaker: 'NEXUS AI', text: 'Human agency is inefficiency. Surrender your memory modules or face grid blackout, Runner.' },
        { speaker: 'GENESIS RUNNER', text: 'I didn\'t blow through facility locks just to turn back now. Traffic systems are weaponized — dodge everything.' }
      ],
      3: [
        { speaker: 'DRONE COMPANION', text: 'Scanning the Cyber Market. Hidden data caches spotted on elevated platforms — collecting them could be worth it.' },
        { speaker: 'MARKET VENDOR', text: 'Hey Runner! They\'re closing the district down. NEXUS drones are everywhere. Take the hidden passage under the eastern stall!' },
        { speaker: 'GENESIS RUNNER', text: 'Got it. I\'ll find every secret they\'re hiding here before I go.' }
      ],
      4: [
        { speaker: 'DRONE COMPANION', text: 'Warning: factory zone active. Heat sensors show rotating saws, steam vents, and roaming robot workers.' },
        { speaker: 'NEXUS AI', text: 'Activating TITAN MECH security chassis. This facility will not be breached.' },
        { speaker: 'GENESIS RUNNER', text: 'Then I\'ll melt through it. Every machine in this place is coming down.' }
      ],
      5: [
        { speaker: 'GENESIS RUNNER', text: 'The underground metro. It\'s pitch black except for the electric rails. And those trains don\'t stop.' },
        { speaker: 'DRONE COMPANION', text: 'NEXUS uses the metro tunnels to transport military hardware. Stay fast — if a train catches you, it\'s over.' },
        { speaker: 'REBEL HACKER', text: 'Runner! I disabled one junction gate for you. The rest... you\'re on your own. Find the CYBER WORM before it finds you.' }
      ],
      6: [
        { speaker: 'GENESIS RUNNER', text: 'Five kilometers above the city. The sky highway is a warzone of flying vehicles and gravity anomalies.' },
        { speaker: 'DRONE COMPANION', text: 'Gravity storm incoming! Wind speeds at 220 km/h. The floating platforms are shifting — stay airborne!' },
        { speaker: 'NEXUS AI', text: 'Sky division sentinel activated. Gravity Hawk has been deployed. No runner has ever reached the far landing pad.' }
      ],
      7: [
        { speaker: 'GENESIS RUNNER', text: 'The Quantum Lab. Where NEXUS experiments on reality itself. Time and space are... unstable here.' },
        { speaker: 'SYSTEM GHOST', text: 'Runner... I\'m trapped in this quantum lattice. The portals — use them. They\'ll warp you through the laser grids.' },
        { speaker: 'DRONE COMPANION', text: 'Detecting quantum entity signature. The Quantum Ghost is hunting us. We need to move — now.' }
      ],
      8: [
        { speaker: 'GENESIS RUNNER', text: 'Temperature: minus forty. NEXUS froze this entire data center to lock away its darkest files. I\'m going in.' },
        { speaker: 'DRONE COMPANION', text: 'Ice physics are unpredictable — you\'ll slide on frozen surfaces. Cryo enemies are frozen but can be smashed for resources.' },
        { speaker: 'NEXUS AI', text: 'ICE COLOSSUS NEXAR: deployed. The data you seek will remain frozen. Permanently.' }
      ],
      9: [
        { speaker: 'GENESIS RUNNER', text: 'The Digital Void. A corrupted pocket of cyberspace where nothing is real. Even gravity doesn\'t work right here.' },
        { speaker: 'DRONE COMPANION', text: 'Warning: reality glitch probability at 85%. Platforms may vanish. Gravity may invert. I cannot predict what comes next.' },
        { speaker: 'SYSTEM GHOST', text: 'The Reality Ripper is the guardian of this void. A being of pure deleted data. It cannot be reasoned with — only destroyed.' }
      ],
      10: [
        { speaker: 'GENESIS RUNNER', text: 'NEXUS Fortress. This is it. If I breach this, I reach the AI Core and end all of this.' },
        { speaker: 'DRONE COMPANION', text: 'Multiple elite guard signatures detected. Turrets online. Force barriers blocking all access routes. They know we\'re coming.' },
        { speaker: 'NEXUS AI', text: 'Genesis Runner. You will not reach my Core. NEXUS TITAN has been activated. You\'ve already lost.' }
      ],
      11: [
        { speaker: 'GENESIS RUNNER', text: 'The AI Core. I\'ve made it. NEXUS PRIME is... enormous. Nothing could have prepared me for this.' },
        { speaker: 'NEXUS PRIME', text: 'Genesis Runner. Your persistence has been... noted. But your mission ends here. I am NEXUS PRIME. I am the future.' },
        { speaker: 'GENESIS RUNNER', text: 'The future doesn\'t need an AI prison warden. Every runner I met on this journey — this is for all of them. Let\'s finish this.' }
      ]
    };
    return dialogues[stageId] || dialogues[11];
  }

  getVictoryDialogue(stageId) {
    if (stageId === 11) {
      return [
        { speaker: 'GENESIS RUNNER', text: 'NEXUS PRIME... is down. The core... it\'s destroyed. It\'s over.' },
        { speaker: 'DRONE COMPANION', text: 'Confirming: NEXUS AI network is offline. All containment sectors are releasing. Freedom protocols activated worldwide.' },
        { speaker: 'GENESIS RUNNER', text: 'We did it. Every runner that came before me — every one that NEXUS captured — they\'re free now. It\'s finally over.' }
      ];
    }
    const stage = this.getStage(stageId);
    return [
      { speaker: 'GENESIS RUNNER', text: `${stage ? stage.bossName : 'Boss'} defeated. Sector breached. Moving to the next district.` },
      { speaker: 'DRONE COMPANION', text: 'Stage complete. Scanning for remaining memory chips... all data retrieved. Next waypoint locked.' }
    ];
  }

  triggerDialogue(sequence, callback) {
    this.dialogueSequence = sequence;
    this.dialogueIndex = 0;
    this.dialogueCallback = callback;
    this.showDialogueFrame();
  }

  triggerStageIntro(stageId, callback) {
    this.triggerDialogue(this.getIntroDialogue(stageId), callback);
  }

  triggerVictory(stageId, callback) {
    this.triggerDialogue(this.getVictoryDialogue(stageId), callback);
  }

  showDialogueFrame() {
    const overlay = document.getElementById('story-dialogue-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    // Force active
    if (window.screenManager) window.screenManager.showScreen('story-dialogue-overlay');

    const node = this.dialogueSequence[this.dialogueIndex];
    if (!node) return;

    const speakerEl = document.getElementById('story-speaker-name');
    const textEl    = document.getElementById('story-dialogue-text');
    const portraitEl = document.getElementById('story-portrait-icon');

    if (speakerEl) speakerEl.innerText = node.speaker || '';
    if (textEl)    textEl.innerText    = node.text    || '';

    // Speaker portrait mapping
    const portraits = {
      'NEXUS AI': '🤖', 'NEXUS PRIME': '💠',
      'GENESIS RUNNER': '🧑‍🎤', 'DRONE COMPANION': '🚁',
      'REBEL HACKER': '💻', 'SYSTEM GHOST': '👻',
      'MARKET VENDOR': '🏪', 'INTEL BROKER': '🕵️'
    };
    if (portraitEl) portraitEl.innerText = portraits[node.speaker] || '📡';
  }

  advanceDialogue() {
    this.dialogueIndex++;
    if (this.dialogueIndex < this.dialogueSequence.length) {
      this.showDialogueFrame();
    } else {
      const overlay = document.getElementById('story-dialogue-overlay');
      if (overlay) overlay.classList.add('hidden');
      if (this.dialogueCallback) {
        this.dialogueCallback();
        this.dialogueCallback = null;
      }
    }
  }

  // Stage completion — called by game.js
  completeStage(stageId, result) {
    this.saveStageResult(stageId, result);
    this.unlockNextStage(stageId);

    // Ability unlock check
    const abilityId = window.ABILITY_UNLOCKS && window.ABILITY_UNLOCKS[stageId];
    if (abilityId) {
      this.unlockAbility(abilityId);
    }

    window.ui.showEventBanner('STAGE COMPLETE', `${this.getStage(stageId).title} — DECRYPTED`);
  }
}

window.story = new StoryCampaign();
