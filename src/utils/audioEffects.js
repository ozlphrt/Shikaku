/**
 * Web Audio API procedurally synthesized sound effects.
 * zero-weight, 100% offline, highly performant, low latency.
 */

let audioCtx = null;

// Lazy initialization of AudioContext to satisfy browser autoplay policies
const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play a tactile digital tick/click sound when exploring/dragging onto new cells
export const playClickSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    // Fast frequency drop to create a crisp "tick" sound
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02);

    // Fast volume envelope decay
    gainNode.gain.setValueAtTime(0.025, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch (e) {
    console.warn('Audio click effect failed', e);
  }
};

// Play a bouncy popping sound when a valid shape is successfully committed
export const playBounceSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine'; // Smooth pure tone for a soft organic touch
    // Soft wooden pop: clean rapid downward sweep
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.start();
    osc.stop(now + 0.1);
  } catch (e) {
    console.warn('Audio bounce effect failed', e);
  }
};

// Play a soft, minimalist Zen double-chime on level victory (ultra-short, whisper-quiet version)
export const playVictorySound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Soothing perfect-fourth glass chime (B5 & E6)
    const chimes = [
      { freq: 987.77, delay: 0 },      // B5
      { freq: 1318.51, delay: 0.04 }    // E6 (delayed slightly for an ultra-fast double-ping)
    ];

    chimes.forEach((chime) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.type = 'sine'; // Pure crystalline tone
      osc.frequency.setValueAtTime(chime.freq, now + chime.delay);

      // Volume envelope: ultra-fast soft swell then a whisper-quiet 200ms decay
      gainNode.gain.setValueAtTime(0, now + chime.delay);
      gainNode.gain.linearRampToValueAtTime(0.008, now + chime.delay + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + chime.delay + 0.2);

      osc.start(now + chime.delay);
      osc.stop(now + chime.delay + 0.2);
    });
  } catch (e) {
    console.warn('Audio victory effect failed', e);
  }
};
