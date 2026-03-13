// Web Audio API chiptune sound effects
let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playNote(freq, duration, type = "square", volume = 0.12) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not available
  }
}

export function playDealClosed() {
  playNote(523, 0.1); // C5
  setTimeout(() => playNote(659, 0.1), 100); // E5
  setTimeout(() => playNote(784, 0.2), 200); // G5
  setTimeout(() => playNote(1047, 0.3), 350); // C6
}

export function playRejection() {
  playNote(400, 0.15);
  setTimeout(() => playNote(300, 0.15), 150);
  setTimeout(() => playNote(200, 0.3), 300);
}

export function playHomeRun() {
  const notes = [523, 659, 784, 1047, 1319, 1568];
  notes.forEach((n, i) => setTimeout(() => playNote(n, 0.15, "square", 0.1), i * 80));
}

export function playLemon() {
  playNote(300, 0.2, "sawtooth");
  setTimeout(() => playNote(250, 0.2, "sawtooth"), 200);
  setTimeout(() => playNote(200, 0.3, "sawtooth"), 400);
  setTimeout(() => playNote(150, 0.5, "sawtooth"), 600);
}

export function playSolid() {
  playNote(440, 0.15);
  setTimeout(() => playNote(554, 0.15), 150);
  setTimeout(() => playNote(659, 0.25), 300);
}

export function playGameOver() {
  playNote(440, 0.3, "triangle");
  setTimeout(() => playNote(370, 0.3, "triangle"), 350);
  setTimeout(() => playNote(330, 0.5, "triangle"), 700);
}

export function playWin() {
  const notes = [523, 587, 659, 784, 880, 988, 1047, 1319, 1568];
  notes.forEach((n, i) => setTimeout(() => playNote(n, 0.2, "square", 0.08), i * 100));
}

export function playMonthTick() {
  playNote(880, 0.05, "square", 0.06);
  setTimeout(() => playNote(1100, 0.05, "square", 0.06), 60);
}

export function playClick() {
  playNote(1200, 0.03, "square", 0.05);
}

export function playEvent() {
  playNote(660, 0.1, "triangle", 0.08);
  setTimeout(() => playNote(880, 0.1, "triangle", 0.08), 120);
}

export function playSpinTick() {
  playNote(800 + Math.random() * 400, 0.03, "square", 0.04);
}

export function playSpinResult() {
  const notes = [784, 988, 1175, 1568];
  notes.forEach((n, i) => setTimeout(() => playNote(n, 0.25, "square", 0.1), i * 150));
}
