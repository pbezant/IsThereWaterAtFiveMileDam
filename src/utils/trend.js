import { formatCfs } from './formatters.js';

// Plain-English summary of the last day or so of discharge.
// history: [{ t: Date|string, y: cfs }] oldest -> newest.
export function trendSentence(history, current) {
  if (!history || history.length < 4 || current == null) return null;
  const now = new Date(history[history.length - 1].t).getTime();
  const at = hoursAgo => {
    const cutoff = now - hoursAgo * 3600e3;
    for (let i = history.length - 1; i >= 0; i--) {
      if (new Date(history[i].t).getTime() <= cutoff) return history[i].y;
    }
    return null;
  };
  const ago3 = at(3);
  const ago24 = at(24);
  const peak = Math.max(...history.map(p => p.y));
  const rel = (a, b) => (b === 0 ? (a === 0 ? 0 : 1) : (a - b) / Math.max(b, 1));

  if (ago3 != null && rel(current, ago3) > 0.15 && current - ago3 > 5) {
    return `Rising: up ${formatCfs(current - ago3)} cfs in the last 3 hours.`;
  }
  if (ago3 != null && rel(current, ago3) < -0.15 && ago3 - current > 5) {
    return `Falling: down ${formatCfs(ago3 - current)} cfs in the last 3 hours.`;
  }
  if (ago24 != null && Math.abs(rel(current, ago24)) > 0.2 && Math.abs(current - ago24) > 5) {
    return current > ago24
      ? `Up from ${formatCfs(ago24)} cfs yesterday.`
      : `Down from ${formatCfs(ago24)} cfs yesterday.`;
  }
  if (peak > 0 && current < peak * 0.4) {
    return `Well below this week's peak of ${formatCfs(peak)} cfs.`;
  }
  return 'Holding steady over the past day.';
}
