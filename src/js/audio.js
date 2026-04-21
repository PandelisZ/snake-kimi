// ==================== AUDIO ====================
let soundEnabled = true;
let audioCtx = null;

export function isSoundEnabled() { return soundEnabled; }
export function setSoundEnabled(v) { soundEnabled = v; }

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

export function getAudioCtx() { return audioCtx; }

export function playTone(freq, duration, type = 'square', volume = 0.1) {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playEatSound(combo) {
  const baseFreq = 440 + combo * 50;
  playTone(baseFreq, 0.1, 'sine', 0.15);
  setTimeout(() => playTone(baseFreq * 1.5, 0.1, 'sine', 0.1), 50);
}

export function playCrashSound() {
  playTone(100, 0.3, 'sawtooth', 0.2);
  playTone(80, 0.4, 'sawtooth', 0.15);
}

export function playGoldenSound() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 'sine', 0.2), i * 80);
  });
}

export function playLevelUpSound() {
  playTone(880, 0.15, 'sine', 0.2);
}
