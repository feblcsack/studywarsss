// lib/heatmapUtils.ts
export type DayMap = Record<string, number>; // "YYYY-MM-DD" -> totalSeconds

export function toYYYYMMDD(d: Date) {
  return d.toISOString().slice(0,10);
}

export function aggregateSessions(sessions: { ts: string | Date | null, durationMs: number }[]) {
  const map: DayMap = {};
  sessions.forEach(s => {
    const date = s.ts ? (typeof s.ts === "string" ? s.ts.slice(0,10) : toYYYYMMDD(new Date(s.ts))) : toYYYYMMDD(new Date());
    const sec = Math.round(s.durationMs / 1000);
    map[date] = (map[date] || 0) + sec;
  });
  return map;
}

/** return intensity 0..1 given seconds and maxSec (e.g. goalSec) */
export function intensityFor(seconds: number, maxSec: number) {
  if (!seconds) return 0;
  const v = seconds / maxSec;
  return Math.min(1, v);
}

/** color builder: from muted gray -> teal/green; intensity 0..1 */
export function colorFor(intensity: number) {
  if (intensity <= 0) return "#1f2937"; // dark gray
  // interpolate between two hex (approx)
  // light green: #34d399, deep: #065f46
  // We'll compute simple lerp on RGB
  const start = [31,41,55]; // #1f2937
  const end = [6,95,70]; // #065f46
  const r = Math.round(start[0] + (end[0]-start[0])*intensity);
  const g = Math.round(start[1] + (end[1]-start[1])*intensity);
  const b = Math.round(start[2] + (end[2]-start[2])*intensity);
  return `rgb(${r},${g},${b})`;
}
