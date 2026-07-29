// Progression & Skill Tree Module for Cyber Dash: Genesis

class ProgressionManager {
  constructor() {
    this.xp = 0;
    this.level = 1;
    this.skillPoints = 0;
    this.purchasedSkills = []; // List of unlocked skill IDs

    this.skills = {
      combat: [
        { id: 'blade_dmg', name: 'PLASMA BLADE OVERCLOCK', desc: 'Increases Energy Sword base damage by 15%', cost: 1, unlocked: false },
        { id: 'teleport_slash', name: 'TELEPORT DASH SLASH', desc: 'Unlock Teleport Slash. Dashes deal massive radial core damage.', cost: 2, unlocked: false },
        { id: 'crit_exponent', name: 'CRITICAL CORE ANALYSIS', desc: 'Grants +10% Critical Hit Chance on snipers/drones.', cost: 1, unlocked: false }
      ],
      movement: [
        { id: 'wall_run', name: 'KINETIC WALL RUNNING', desc: 'Enables Wall Running on vertical building surfaces.', cost: 1, unlocked: false },
        { id: 'grapple_hook', name: 'MAGNETIC GRAPPLING HOOK', desc: 'Unlock Grappling Hook to swing from green glowing nodes.', cost: 2, unlocked: false },
        { id: 'air_dash', name: 'THRUSTER AIR DASH', desc: 'Allows executing a Dash trigger while in mid-air.', cost: 1, unlocked: false }
      ],
      tech: [
        { id: 'magnet_pulse', name: 'RESONATOR MAGNET PULSE', desc: 'Doubles the pull radius of the credit coin magnet.', cost: 1, unlocked: false },
        { id: 'shield_matrix', name: 'SHIELD OVERLOAD CAPACITORS', desc: 'Shield powerups absorb 2 hits instead of 1.', cost: 2, unlocked: false },
        { id: 'time_freeze', name: 'CHRONOS TIME MATRIX', desc: 'Slow motion powerup duration extended by 50%.', cost: 2, unlocked: false }
      ]
    };

    this.loadState();
  }

  loadState() {
    // Read from window.storage state
    if (window.storage && window.storage.state) {
      if (!window.storage.state.progression) {
        window.storage.state.progression = {
          xp: 0,
          level: 1,
          skillPoints: 0,
          purchasedSkills: []
        };
      }
      const data = window.storage.state.progression;
      this.xp = data.xp || 0;
      this.level = data.level || 1;
      this.skillPoints = data.skillPoints || 0;
      this.purchasedSkills = data.purchasedSkills || [];

      // Update local skills lists
      for (let branch in this.skills) {
        this.skills[branch].forEach(node => {
          if (this.purchasedSkills.includes(node.id)) {
            node.unlocked = true;
          }
        });
      }

      // Restore milestone flags based on current level
      if (this.level >= 15 && !window.storage.state.doubleJumpUnlocked) {
        window.storage.state.doubleJumpUnlocked = true;
      }
    }
  }

  saveState() {
    if (window.storage && window.storage.state) {
      window.storage.state.progression = {
        xp: this.xp,
        level: this.level,
        skillPoints: this.skillPoints,
        purchasedSkills: this.purchasedSkills
      };
      window.storage.save();
    }
  }

  getXpNeeded() {
    return 25 * this.level * this.level + 75 * this.level;
  }

  gainXp(amount) {
    // Apply difficulty multiplier to XP gain
    let difficultyMult = 1.0;
    if (window.game) {
      const diff = window.storage.state.settings.difficulty || 'medium';
      if (diff === 'medium') difficultyMult = 1.5;
      if (diff === 'hard') difficultyMult = 2.0;
    }
    const finalAmount = amount * difficultyMult;

    this.xp += finalAmount;
    let needed = this.getXpNeeded();
    let leveledUp = false;
    
    while (this.xp >= needed) {
      this.xp -= needed;
      this.level++;
      this.skillPoints++;
      leveledUp = true;
      needed = this.getXpNeeded();

      // RPG Rewards: +50 credits per level, +1 skill point, and milestone unlocks
      const creditReward = this.level * 50;
      if (window.storage && window.storage.state) {
        window.storage.state.credits = (window.storage.state.credits || 0) + creditReward;
        
        // Milestone triggers
        if (this.level === 5) {
          if (!window.storage.state.unlockedSkins.includes('skin_neon_grid')) {
            window.storage.state.unlockedSkins.push('skin_neon_grid');
          }
        }
        if (this.level === 10 && window.companions) {
          for (let k in window.companions.droneLevels) {
            window.companions.droneLevels[k] += 1;
          }
          window.companions.saveState();
        }
        if (this.level === 15) {
          window.storage.state.doubleJumpUnlocked = true;
        }
        if (this.level === 20) {
          if (!window.storage.state.unlockedTrails.includes('trail_rainbow')) {
            window.storage.state.unlockedTrails.push('trail_rainbow');
          }
        }
        if (this.level === 25) {
          window.storage.state.districtUnlocked = true;
        }
        if (this.level === 30) {
          window.storage.state.specialAbilityUnlocked = true;
        }
      }
    }

    if (leveledUp) {
      this.saveState();
      
      // Update HUD and stats UI immediately
      if (window.ui && window.ui.updateProfileHUD) {
        window.ui.updateProfileHUD();
      }

      // Visual Level Up Flash Banner
      const banner = document.createElement('div');
      banner.className = 'level-up-banner';
      banner.style.position = 'fixed';
      banner.style.top = '45%';
      banner.style.left = '50%';
      banner.style.transform = 'translate(-50%, -50%)';
      banner.style.color = 'var(--primary-cyan)';
      banner.style.fontFamily = "'Orbitron', sans-serif";
      banner.style.fontWeight = '900';
      banner.style.fontSize = '3.8rem';
      banner.style.textAlign = 'center';
      banner.style.zIndex = '999999';
      banner.style.pointerEvents = 'none';
      banner.style.textShadow = '0 0 15px var(--primary-cyan), 0 0 35px var(--primary-purple)';
      banner.innerHTML = `LEVEL UP!<br><span style="font-size:1.6rem; color:var(--primary-purple); font-weight:bold; letter-spacing:1px;">SYSTEM LEVEL ${this.level}</span>`;
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 2500);

      // Play level-up sound sequence
      window.audio.playAchievement();
      setTimeout(() => window.audio.playAchievement(), 200);

      window.ui.showEventBanner('LEVEL CORE UPGRADED', `REACHED SYSTEM LEVEL ${this.level} [+${this.level * 50} CREDITS]`);
      
      if (window.storage.state.stats) {
        window.storage.state.stats.highestLevel = this.level;
      }
    } else {
      this.saveState();
      if (window.ui && window.ui.updateProfileHUD) {
        window.ui.updateProfileHUD();
      }
    }
  }

  hasSkill(skillId) {
    return this.purchasedSkills.includes(skillId);
  }

  unlockSkill(skillId) {
    let skillFound = null;
    let branchFound = null;
    
    for (let branch in this.skills) {
      const node = this.skills[branch].find(s => s.id === skillId);
      if (node) {
        skillFound = node;
        branchFound = branch;
        break;
      }
    }

    if (!skillFound) return false;
    if (skillFound.unlocked) return false;

    if (this.skillPoints >= skillFound.cost) {
      this.skillPoints -= skillFound.cost;
      skillFound.unlocked = true;
      this.purchasedSkills.push(skillId);
      this.saveState();
      
      // Play unlock alert sfx
      window.audio.playAchievement();
      return true;
    }
    
    return false;
  }
}

window.progression = new ProgressionManager();
