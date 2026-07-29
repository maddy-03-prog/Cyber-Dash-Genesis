// Grade System — Level Completion Scoring, Rank Calculation, and Mission Complete Overlay

class GradeSystem {
  constructor() {
    this.currentResult = null;
  }

  // Calculate a 0-100 score based on run performance vs stage par values
  calculateScore(stage, runData) {
    let score = 0;

    // 1. Time component (max 25 pts)
    const timeRatio = stage.parTime / Math.max(runData.time, 1);
    score += Math.min(25, Math.round(25 * Math.min(timeRatio, 1.5)));

    // 2. Coins component (max 20 pts)
    const coinTarget = (stage.objectives.find(o => o.type === 'coins') || {}).target || 50;
    const coinRatio = Math.min(runData.coins / coinTarget, 1);
    score += Math.round(20 * coinRatio);

    // 3. Secrets found component (max 20 pts)
    const secretRatio = stage.secretsTotal > 0 ? Math.min(runData.secretsFound / stage.secretsTotal, 1) : 0;
    score += Math.round(20 * secretRatio);

    // 4. Damage component (max 20 pts) — less damage = more points
    const dmgPenalty = Math.min(runData.damageTaken / 60, 1); // 60 HP = full penalty
    score += Math.round(20 * (1 - dmgPenalty));

    // 5. Combo component (max 15 pts)
    const comboTarget = 8;
    const comboRatio = Math.min((runData.maxCombo || 0) / comboTarget, 1);
    score += Math.round(15 * comboRatio);

    return Math.min(100, Math.max(0, score));
  }

  // Map numeric score to rank string
  getrank(score) {
    const thresholds = window.GRADE_THRESHOLDS || [
      { score: 95, rank: 'SSS' }, { score: 88, rank: 'SS' },
      { score: 75, rank: 'S' },   { score: 60, rank: 'A' },
      { score: 40, rank: 'B' },   { score: 20, rank: 'C' },
      { score: 0,  rank: 'D' }
    ];
    for (const t of thresholds) {
      if (score >= t.score) return t.rank;
    }
    return 'D';
  }

  // Calculate star count (1-3)
  getStars(rank) {
    if (rank === 'SSS' || rank === 'SS' || rank === 'S') return 3;
    if (rank === 'A' || rank === 'B') return 2;
    return 1;
  }

  // Get rank color for display
  getRankColor(rank) {
    const colors = {
      'SSS': '#ffd700', 'SS': '#ffaa00', 'S': '#ff8800',
      'A': '#00ff88', 'B': '#00ccff', 'C': '#aaaaaa', 'D': '#ff4444'
    };
    return colors[rank] || '#aaaaaa';
  }

  // Check objectives completion
  checkObjectives(stage, runData) {
    return stage.objectives.map(obj => {
      let completed = false;
      switch (obj.type) {
        case 'distance':   completed = (runData.distance    || 0) >= obj.target; break;
        case 'coins':      completed = (runData.coins       || 0) >= obj.target; break;
        case 'chips':      completed = (runData.secretsFound|| 0) >= obj.target; break;
        case 'secrets':    completed = (runData.secretsFound|| 0) >= obj.target; break;
        case 'kills':      completed = (runData.kills       || 0) >= obj.target; break;
        case 'no_death':   completed = (runData.deaths      || 0) === 0;         break;
        case 'combo':      completed = (runData.maxCombo    || 0) >= obj.target; break;
        case 'time':       completed = (runData.time        || 999) <= obj.target; break;
        case 'jumps':      completed = (runData.jumps       || 0) >= obj.target; break;
        case 'boss_kill':  completed = (runData.bossKilled  || false);            break;
        case 'phases':     completed = (runData.phasesDefeated || 0) >= obj.target; break;
        case 'portals':    completed = (runData.portalsUsed || 0) >= obj.target; break;
        case 'glitches':   completed = (runData.glitchesSurvived || 0) >= obj.target; break;
        case 'max_damage': completed = (runData.damageTaken || 999) <= obj.target; break;
        default:           completed = false;
      }
      return { ...obj, completed };
    });
  }

  // Main entry — call after boss defeat / stage end
  showMissionComplete(stageId, runData) {
    const stage = window.story.getStage(stageId);
    if (!stage) return;

    const score     = this.calculateScore(stage, runData);
    const rank      = this.getrank(score);
    const stars     = this.getStars(rank);
    const rankColor = this.getRankColor(rank);
    const objectives = this.checkObjectives(stage, runData);
    const xpReward  = stage.starRewards[stars - 1] || 100;

    this.currentResult = { stageId, score, rank, stars, xpReward, runData, objectives };

    // Save result
    window.story.completeStage(stageId, {
      stars, rank, time: runData.time,
      secretsFound: runData.secretsFound || 0,
      score
    });

    // Award XP
    if (window.progression) {
      window.progression.gainXp(xpReward);
    }

    // Award coins
    if (window.storage) {
      window.storage.addCoins(runData.coins || 0);
    }

    // Render and show the screen
    this.renderMissionComplete(stage, rank, rankColor, stars, objectives, xpReward, runData);

    if (window.ui) window.ui.switchScreen('mission-complete-overlay');
    if (window.audio) window.audio.playAchievement();
  }

  renderMissionComplete(stage, rank, rankColor, stars, objectives, xpReward, runData) {
    const el = id => document.getElementById(id);

    if (el('mc-stage-title'))    el('mc-stage-title').innerText    = stage.title;
    if (el('mc-rank-display'))   { el('mc-rank-display').innerText = rank; el('mc-rank-display').style.color = rankColor; el('mc-rank-display').style.textShadow = `0 0 30px ${rankColor}, 0 0 60px ${rankColor}`; }
    if (el('mc-time-val'))       el('mc-time-val').innerText       = this.formatTime(runData.time || 0);
    if (el('mc-coins-val'))      el('mc-coins-val').innerText      = `+${runData.coins || 0}`;
    if (el('mc-secrets-val'))    el('mc-secrets-val').innerText    = `${runData.secretsFound || 0} / ${stage.secretsTotal}`;
    if (el('mc-distance-val'))   el('mc-distance-val').innerText   = `${Math.floor(runData.distance || 0)}m`;
    if (el('mc-xp-val'))         el('mc-xp-val').innerText        = `+${xpReward} XP`;
    if (el('mc-score-val'))      el('mc-score-val').innerText      = runData.score ? Math.floor(runData.score) : 0;

    // Stars
    const starsContainer = el('mc-stars');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 1; i <= 3; i++) {
        const star = document.createElement('span');
        star.className = `mc-star ${i <= stars ? 'earned' : 'empty'}`;
        star.innerText = '★';
        star.style.animationDelay = `${(i - 1) * 0.2}s`;
        starsContainer.appendChild(star);
      }
    }

    // Objectives
    const objContainer = el('mc-objectives');
    if (objContainer) {
      objContainer.innerHTML = '';
      objectives.forEach(obj => {
        const row = document.createElement('div');
        row.className = `mc-obj-row ${obj.completed ? 'done' : 'fail'}`;
        row.innerHTML = `<span class="mc-obj-icon">${obj.completed ? '✅' : '❌'}</span><span class="mc-obj-text">${obj.text}</span>`;
        objContainer.appendChild(row);
      });
    }

    // Next stage button
    const nextStageId = stage.id + 1;
    const nextStage   = window.story && window.story.getStage(nextStageId);
    const nextBtn     = el('mc-btn-next');
    if (nextBtn) {
      if (nextStage && window.story.isStageUnlocked(nextStageId)) {
        nextBtn.innerText = `NEXT: ${nextStage.title.split(':')[0].trim()} ›`;
        nextBtn.style.display = '';
        nextBtn.onclick = () => {
          window.story.currentStage = nextStageId;
          if (window.ui) window.ui.switchScreen('campaign-world-map');
        };
      } else if (!nextStage) {
        nextBtn.innerText = '🏆 CREDITS ROLL';
        nextBtn.style.display = '';
        nextBtn.onclick = () => { if (window.ui) window.ui.switchScreen('main-menu'); };
      } else {
        nextBtn.style.display = 'none';
      }
    }
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

window.gradeSystem = new GradeSystem();
