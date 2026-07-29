// Headquarters Blueprint Rooms Upgrades Module for Cyber Dash: Genesis

class HeadquartersManager {
  constructor() {
    this.rooms = {
      research: 1, // boosts XP gain
      drones: 1,   // boosts drone collector radius
      workshop: 1  // boosts weapon damages
    };

    this.loadState();
  }

  loadState() {
    if (window.storage && window.storage.state) {
      if (!window.storage.state.hqRooms) {
        window.storage.state.hqRooms = {
          research: 1,
          drones: 1,
          workshop: 1
        };
      }
      this.rooms = window.storage.state.hqRooms;
    }
  }

  saveState() {
    if (window.storage && window.storage.state) {
      window.storage.state.hqRooms = this.rooms;
      window.storage.save();
    }
  }

  getUpgradeCost(roomType) {
    const level = this.rooms[roomType];
    if (level >= 5) return null; // Max Level

    switch (roomType) {
      case 'research': return level * 150;
      case 'drones': return level * 200;
      case 'workshop': return level * 250;
      default: return 9999;
    }
  }

  upgradeRoom(roomType) {
    const cost = this.getUpgradeCost(roomType);
    if (!cost) return false; // Already maxed

    if (window.storage.spendCoins(cost)) {
      this.rooms[roomType]++;
      this.saveState();
      
      // Upgrade feedback
      window.audio.playAchievement();
      this.updateHQRoomUI(roomType);
      return true;
    }
    return false;
  }

  // Get active bonuses
  getXpBonusMultiplier() {
    // 5% additional XP per level
    return 1.0 + (this.rooms.research - 1) * 0.05;
  }

  getDroneCollectorBonusRatio() {
    // 10% pull range boost per level
    return 1.0 + (this.rooms.drones - 1) * 0.10;
  }

  getWeaponDamageBonusRatio() {
    // 5% extra weapon damage per level
    return 1.0 + (this.rooms.workshop - 1) * 0.05;
  }

  updateHQRoomUI(roomType) {
    const level = this.rooms[roomType];
    const cost = this.getUpgradeCost(roomType);
    const descEl = document.getElementById(`hq-desc-${roomType}`);
    const btnEl = document.getElementById(`btn-upgrade-${roomType}`);

    if (roomType === 'research') {
      descEl.innerText = `Level ${level}: Boosts XP gains by ${Math.round((level - 1)*5 + 5)}%. Unlocks diagnostics.`;
    } else if (roomType === 'drones') {
      descEl.innerText = `Level ${level}: AI companion holds collectors. Pulls coins +${Math.round((level - 1)*10 + 10)}% closer.`;
    } else if (roomType === 'workshop') {
      descEl.innerText = `Level ${level}: Calibrates blade damage. Weapons deal +${Math.round((level - 1)*5 + 5)}% base damage.`;
    }

    if (level >= 5) {
      btnEl.innerText = 'MAX LEVEL';
      btnEl.classList.add('equipped');
    } else {
      btnEl.innerText = `UPGRADE [${cost} CR]`;
      btnEl.classList.remove('equipped');
    }

    // Refresh HQ title text
    const hqRating = this.rooms.research + this.rooms.drones + this.rooms.workshop - 2;
    document.getElementById('hq-rating-val').innerText = `LEVEL ${hqRating + 1}`;
    document.getElementById('hq-cells-count').innerText = window.storage.state.coins;
  }
}

window.hq = new HeadquartersManager();
