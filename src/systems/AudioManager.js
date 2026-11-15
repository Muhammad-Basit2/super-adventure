import { saveManager } from './SaveManager.js';

class AudioManager {
  constructor() {
    this.scene = null;
    this.bgmAudioContext = null;
    this.bgmOscillators = [];
    this.bgmPlaying = false;
    this.bgmTheme = null;
    this.sfxPool = {};
  }

  init(scene) {
    this.scene = scene;
  }

  get masterVolume() {
    return saveManager.data.settings.masterVolume;
  }

  get musicVolume() {
    return saveManager.data.settings.musicVolume * this.masterVolume;
  }

  get sfxVolume() {
    return saveManager.data.settings.sfxVolume * this.masterVolume;
  }

  playSfx(key, config = {}) {
    if (!this.scene) return;
    try {
      const vol = (config.volume ?? 1) * this.sfxVolume;
      if (vol <= 0.001) return;
      this.scene.sound.play(key, { ...config, volume: vol });
    } catch (e) {
      console.warn('Could not play sfx:', key, e);
    }
  }

  // Melodic synth background music generator using Web Audio API
  startBgm(theme = 'forest') {
    if (this.bgmPlaying && this.bgmTheme === theme) return;
    this.stopBgm();
    this.bgmTheme = theme;
    this.bgmPlaying = true;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.bgmAudioContext || this.bgmAudioContext.state === 'closed') {
        this.bgmAudioContext = new AudioCtx();
      } else if (this.bgmAudioContext.state === 'suspended') {
        this.bgmAudioContext.resume();
      }

      this.playSynthMelody(theme);
    } catch (e) {
      console.warn('Synth BGM error:', e);
    }
  }

  stopBgm() {
    this.bgmPlaying = false;
    this.bgmTheme = null;
    if (this.bgmLoopTimer) {
      clearInterval(this.bgmLoopTimer);
      this.bgmLoopTimer = null;
    }
    this.bgmOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.bgmOscillators = [];
  }

  playSynthMelody(theme) {
    if (!this.bgmAudioContext) return;
    const ctx = this.bgmAudioContext;

    // Progression notes per theme
    const themes = {
      menu: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23],
      forest: [261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 349.23, 329.63, 293.66, 392.00],
      cave: [196.00, 233.08, 261.63, 233.08, 174.61, 196.00, 220.00, 196.00],
      desert: [220.00, 246.94, 261.63, 329.63, 293.66, 261.63, 246.94, 220.00],
      snow: [329.63, 392.00, 493.88, 440.00, 392.00, 329.63, 293.66, 329.63],
      castle: [164.81, 196.00, 220.00, 196.00, 164.81, 146.83, 164.81, 220.00]
    };

    const notes = themes[theme] || themes.forest;
    let step = 0;

    const playStep = () => {
      if (!this.bgmPlaying || !this.bgmAudioContext) return;
      const vol = this.musicVolume * 0.12;
      if (vol <= 0.001) return;

      const freq = notes[step % notes.length];
      const bassFreq = freq / 2;

      // Melody note
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = theme === 'cave' || theme === 'castle' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);

      // Bass note every other step
      if (step % 2 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, ctx.currentTime);
        bassGain.gain.setValueAtTime(vol * 0.8, ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start();
        bassOsc.stop(ctx.currentTime + 0.51);
      }

      step++;
    };

    playStep();
    this.bgmLoopTimer = setInterval(playStep, 380);
  }
}

export const audioManager = new AudioManager();
