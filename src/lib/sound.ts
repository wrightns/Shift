let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(frequency: number, startAt: number, durationSec: number, volume: number): void {
  const audio = getContext();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, audio.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, audio.currentTime + startAt + 0.02);
  gain.gain.setValueAtTime(volume, audio.currentTime + startAt + durationSec - 0.05);
  gain.gain.linearRampToValueAtTime(0, audio.currentTime + startAt + durationSec);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + startAt);
  osc.stop(audio.currentTime + startAt + durationSec + 0.02);
}

/** Unlocks the AudioContext; must be called from a user gesture (e.g. the Start button). */
export function primeAudio(): void {
  getContext();
}

/** Short tick heard on the final 3 seconds of a segment countdown. */
export function playTick(): void {
  beep(880, 0, 0.08, 0.15);
}

/** Alarm played when a segment ends and the runner advances. */
export function playSegmentAlarm(): void {
  beep(660, 0, 0.18, 0.25);
  beep(880, 0.22, 0.18, 0.25);
}

/** Bigger fanfare played when the whole practice plan is complete. */
export function playPracticeComplete(): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    beep(freq, i * 0.16, 0.3, 0.28);
  });
}
