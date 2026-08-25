export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatMinutesLabel(totalMinutes: number): string {
  if (totalMinutes < 1) {
    return `${Math.round(totalMinutes * 60)}s`;
  }
  if (Number.isInteger(totalMinutes)) {
    return `${totalMinutes} min`;
  }
  const m = Math.floor(totalMinutes);
  const s = Math.round((totalMinutes - m) * 60);
  return s === 0 ? `${m} min` : `${m}m ${s}s`;
}
