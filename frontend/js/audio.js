// Web Audio API Synthesizer and Music Sequencer for Cyber Dash

class AudioEngine {
  constructor() {
    this.ctx = null;
    
    // Volume Control Nodes
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    // Music Sequencer state
    this.isPlayingMusic = false;
    this.tempo = 120; // BPM
    this.lookahead = 25.0; // Milliseconds to look ahead
    this.scheduleAheadTime = 0.1; // Seconds of scheduling buffer
    this.nextNoteTime = 0.0;
    this.currentStep = 0;
    this.schedulerTimerId = null;

    // Volume levels (0 to 1) - fetched from global window.storage
    this.musicVolume = window.storage.state.settings.musicVolume / 100;
    this.sfxVolume = window.storage.state.settings.sfxVolume / 100;
    
    // Cyberpunk chord progression (A minor, C major, G major, D minor)
    this.bassNotes = [
      55.00, 55.00, 55.00, 55.00, // A1
      65.41, 65.41, 65.41, 65.41, // C2
      49.00, 49.00, 49.00, 49.00, // G1
      73.42, 73.42, 73.42, 73.42  // D2
    ];
    
    this.leadMelody = [
      440.00, 0, 440.00, 523.25, 0, 587.33, 440.00, 0,
      392.00, 0, 392.00, 493.88, 0, 587.33, 392.00, 0
    ];

    // Binding interactions for browser auto-play policy
    document.addEventListener('click', () => this.initContext(), { once: true });
    document.addEventListener('keydown', () => this.initContext(), { once: true });
    document.addEventListener('touchstart', () => this.initContext(), { once: true });
  }

  initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Create Gaining Network
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.masterGain.connect(this.ctx.destination);
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);

    // Apply saved levels
    const settings = window.storage && window.storage.state && window.storage.state.settings;
    this.setMusicVolume(settings ? settings.musicVolume : 70);
    this.setSfxVolume(settings ? settings.sfxVolume : 80);
    
    // Automatically start synth music on first interaction
    this.startLobbyMusic();
  }

  startMusic() {
    this.isPlayingMusic = true;
    if (!this.ctx) this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.ctx && !this.schedulerTimerId) {
      this.startMusicLoop();
    }
  }

  startLobbyMusic() {
    this.tempo = 100;
    this.startMusic();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.schedulerTimerId) {
      clearTimeout(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
  }

  startMusicLoop() {
    if (!this.ctx) return;
    if (this.schedulerTimerId) clearTimeout(this.schedulerTimerId);
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.currentStep = 0;
    this.scheduler();
  }

  scheduler() {
    if (!this.isPlayingMusic || !this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceNote();
    }
    this.schedulerTimerId = setTimeout(() => this.scheduler(), this.lookahead);
  }

  setMusicVolume(volPercent) {
    this.musicVolume = volPercent / 100;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, this.ctx.currentTime + 0.1);
    }
  }

  setSfxVolume(volPercent) {
    this.sfxVolume = volPercent / 100;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.linearRampToValueAtTime(this.sfxVolume, this.ctx.currentTime + 0.1);
    }
  }

  // Helper: Noise Buffer generator for drums/dashes
  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // ==================== SFX GENERATORS ====================
  
  playJump() {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(580, this.ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
    
    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playDash() {
    if (!this.ctx) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.25);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.3);
  }

  playCoin() {
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    
    const playTone = (freq, startTime, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Classic arcade coin double chime
    playTone(987.77, time, 0.08); // B5
    playTone(1318.51, time + 0.07, 0.2); // E6
  }

  playLaser() {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.35);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.35);

    gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playExplosion() {
    if (!this.ctx) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.8);
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.6, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.95);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    noise.start();
    noise.stop(this.ctx.currentTime + 1.0);

    // Add extra low rumble oscillator
    const rumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(80, this.ctx.currentTime);
    rumble.frequency.linearRampToValueAtTime(10, this.ctx.currentTime + 0.7);
    
    rumbleGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);
    
    rumble.connect(rumbleGain);
    rumbleGain.connect(this.sfxGain);
    rumble.start();
    rumble.stop(this.ctx.currentTime + 0.7);
  }

  playHit() {
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(155, this.ctx.currentTime);

    gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gainNode.gain.setValueAtTime(0.05, this.ctx.currentTime + 0.08);
    gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.25);
    osc2.stop(this.ctx.currentTime + 0.25);
  }

  playAchievement() {
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    const playBeep = (freq, offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + offset);
      gain.gain.setValueAtTime(0.12, time + offset);
      gain.gain.exponentialRampToValueAtTime(0.005, time + offset + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time + offset);
      osc.stop(time + offset + 0.2);
    };

    // Ascending arpeggio C major chord progression
    playBeep(261.63, 0.0);  // C4
    playBeep(329.63, 0.06); // E4
    playBeep(392.00, 0.12); // G4
    playBeep(523.25, 0.18); // C5
    playBeep(659.25, 0.26); // E5
  }

  playBossWarning() {
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    
    // Play a dual discordant sweeping alarm pulse
    const playAlarm = (startOffset) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(180, time + startOffset);
      osc1.frequency.linearRampToValueAtTime(320, time + startOffset + 0.3);
      osc1.frequency.linearRampToValueAtTime(180, time + startOffset + 0.6);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(185, time + startOffset);
      osc2.frequency.linearRampToValueAtTime(325, time + startOffset + 0.3);
      osc2.frequency.linearRampToValueAtTime(185, time + startOffset + 0.6);

      gain.gain.setValueAtTime(0.25, time + startOffset);
      gain.gain.linearRampToValueAtTime(0.25, time + startOffset + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, time + startOffset + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(time + startOffset);
      osc2.start(time + startOffset);
      osc1.stop(time + startOffset + 0.6);
      osc2.stop(time + startOffset + 0.6);
    };

    playAlarm(0.0);
    playAlarm(0.75);
    playAlarm(1.50);
  }

  // ==================== MUSIC LOOP SYNTHESIZER ====================

  startMusic() {
    this.isPlayingMusic = true;
    if (this.ctx) {
      this.startMusicLoop();
    }
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.schedulerTimerId) {
      clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
  }

  startMusicLoop() {
    if (this.schedulerTimerId) return;

    this.nextNoteTime = this.ctx.currentTime;
    this.schedulerTimerId = setInterval(() => this.scheduler(), this.lookahead);
  }

  scheduler() {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceNote();
    }
  }

  advanceNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    const stepDuration = 0.25 * secondsPerBeat; // 16th note step
    this.nextNoteTime += stepDuration;
    
    // Cycle steps 0-15
    this.currentStep = (this.currentStep + 1) % 16;
  }

  scheduleNote(step, time) {
    // 1. Kick Drum: steps 0, 4, 8, 12 (Quarter note beats)
    if (step % 4 === 0) {
      this.synthKick(time);
    }

    // 2. Snare: steps 4, 12
    if (step === 4 || step === 12) {
      this.synthSnare(time);
    }

    // 3. Hi-Hat: off-beats, steps 2, 6, 10, 14, and some fillers
    if (step % 2 === 2 || step % 4 === 2) {
      this.synthHat(time, 0.04);
    } else if (Math.random() > 0.6) {
      this.synthHat(time, 0.02); // ghost hat
    }

    // 4. Bassline: 16th notes
    const bassIndex = Math.floor(step / 1) % 16;
    const bassFreq = this.bassNotes[bassIndex];
    this.synthBass(bassFreq, step, time);

    // 5. Lead Arpeggio Melody
    if (step % 2 === 0) {
      const melodyFreq = this.leadMelody[step];
      if (melodyFreq > 0) {
        this.synthLead(melodyFreq, time);
      }
    }
  }

  synthKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  synthSnare(time) {
    // Low bandpass noise burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    // Sine snap
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(180, time);
    snapGain.gain.setValueAtTime(0.15, time);
    snapGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    snap.connect(snapGain);
    snapGain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.16);
    snap.start(time);
    snap.stop(time + 0.1);
  }

  synthBass(freq, step, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    // Modulate filter frequency based on step for acid bass feel
    const filterFreq = 300 + Math.sin(step / 2) * 150;
    filter.frequency.setValueAtTime(filterFreq, time);

    // Envelope
    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.13);
  }

  synthHat(time, duration) {
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.02, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + duration + 0.01);
  }

  synthLead(freq, time) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(freq, time);
    
    // Detune osc2 for fat sound
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.005, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    filter.frequency.exponentialRampToValueAtTime(500, time + 0.2);

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.25);
    osc2.stop(time + 0.25);
  }
}

window.audio = new AudioEngine();
