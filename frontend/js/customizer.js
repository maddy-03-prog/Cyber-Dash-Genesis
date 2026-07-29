// Custom Gear Armament & Customizer Deck for Cyber Dash: Genesis

class CustomizerManager {
  constructor() {
    this.activeTab = 'helmet'; // helmet, armor, weapon
    
    this.gear = {
      helmet: [
        { id: 'helm_scout', name: 'Z-4 INFRARED SCOUT MASK', desc: 'Standard visor. Gives +10 base Shield rating.', cost: 0, stat: 'shield', val: 10, owned: true },
        { id: 'helm_heavy', name: 'MARK-IV BATTLE HELMET', desc: 'Reinforced plate armor. Gives +20 base Shield rating.', cost: 180, stat: 'shield', val: 20, owned: false }
      ],
      armor: [
        { id: 'suit_light', name: 'KINETIC SLUMS LIGHT SUIT', desc: 'Scout model. Gives +10 base HP rating.', cost: 0, stat: 'hp', val: 10, owned: true },
        { id: 'suit_stealth', name: 'VIOLET PHANTOM METALLIC PLATFORM', desc: 'Stealth plating. Gives +25 base HP rating.', cost: 250, stat: 'hp', val: 25, owned: false }
      ],
      weapon: [
        { id: 'sword', name: 'Z-1 ENERGY SABER', desc: 'Melee focus. Slash sweeps break physical barriers.', cost: 0, stat: 'dmg', val: 25, owned: true },
        { id: 'pistols', name: 'DUAL NEON REVOLVERS', desc: 'Ranged focus. Fires cyan bullets consuming Energy.', cost: 150, stat: 'dmg', val: 12, owned: false },
        { id: 'bow', name: 'APEX DIGITAL BOW', desc: 'Heavy bow charge. Pierce lasers dealing major damage.', cost: 320, stat: 'dmg', val: 45, owned: false }
      ]
    };

    this.equippedGear = {
      helmet: 'helm_scout',
      armor: 'suit_light',
      weapon: 'sword'
    };

    this.loadState();
  }

  loadState() {
    if (window.storage && window.storage.state) {
      if (!window.storage.state.equippedGear) {
        window.storage.state.equippedGear = {
          helmet: 'helm_scout',
          armor: 'suit_light',
          weapon: 'sword'
        };
      }
      this.equippedGear = window.storage.state.equippedGear;

      // Unlock owned status
      if (window.storage.state.unlockedGear) {
        window.storage.state.unlockedGear.forEach(gearId => {
          for (let slot in this.gear) {
            const item = this.gear[slot].find(g => g.id === gearId);
            if (item) item.owned = true;
          }
        });
      } else {
        window.storage.state.unlockedGear = ['helm_scout', 'suit_light', 'sword'];
      }
    }
  }

  saveState() {
    if (window.storage && window.storage.state) {
      window.storage.state.equippedGear = this.equippedGear;
      
      const owned = [];
      for (let slot in this.gear) {
        this.gear[slot].forEach(item => {
          if (item.owned) owned.push(item.id);
        });
      }
      window.storage.state.unlockedGear = owned;
      window.storage.save();
    }
  }

  equipGear(slot, gearId) {
    const list = this.gear[slot];
    const item = list.find(g => g.id === gearId);

    if (item && item.owned) {
      this.equippedGear[slot] = gearId;
      this.saveState();
      
      if (slot === 'weapon' && window.combat) {
        window.combat.equippedWeapon = gearId;
        window.combat.saveState();
      }
      
      window.audio.playAchievement();
      return true;
    }
    return false;
  }

  buyGear(slot, gearId) {
    const list = this.gear[slot];
    const item = list.find(g => g.id === gearId);

    if (item && !item.owned) {
      if (window.storage.spendCoins(item.cost)) {
        item.owned = true;
        this.equippedGear[slot] = gearId;
        this.saveState();
        
        if (slot === 'weapon' && window.combat) {
          window.combat.equippedWeapon = gearId;
          window.combat.saveState();
        }
        
        window.audio.playAchievement();
        return true;
      } else {
        alert('SECURITY ERROR: Insufficient credit cores.');
        window.audio.playHit();
      }
    }
    return false;
  }

  // Get active gear buff benefits
  getHPModifier() {
    const equipped = this.equippedGear.armor;
    const item = this.gear.armor.find(a => a.id === equipped);
    return item ? item.val : 0;
  }

  getShieldModifier() {
    const equipped = this.equippedGear.helmet;
    const item = this.gear.helmet.find(h => h.id === equipped);
    return item ? item.val : 0;
  }
}

window.customizer = new CustomizerManager();
