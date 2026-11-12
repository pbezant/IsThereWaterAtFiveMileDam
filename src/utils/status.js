import { CFS_THRESHOLDS } from '../config.js';

export const STATUS = {
  dry: {
    key: 'dry',
    label: 'DRY',
    headline: "No — it's dry right now",
    sub: 'The Blanco runs dry here during drought. Check back after rain.',
    cssClass: 'status-dry',
    emoji: '🏜️',
    safe: true,
  },
  low: {
    key: 'low',
    label: 'LOW',
    headline: 'Barely — just a trickle',
    sub: 'Very shallow water, not suitable for swimming.',
    cssClass: 'status-low',
    emoji: '💧',
    safe: true,
  },
  good: {
    key: 'good',
    label: 'YES',
    headline: 'Yes — water is flowing!',
    sub: 'Good conditions at Five Mile Dam. Enjoy the swim.',
    cssClass: 'status-good',
    emoji: '🏊',
    safe: true,
  },
  high: {
    key: 'high',
    label: 'HIGH',
    headline: 'Yes — but the current is strong',
    sub: 'Water is flowing but the current may be dangerous. Use caution.',
    cssClass: 'status-high',
    emoji: '⚠️',
    safe: false,
  },
  flood: {
    key: 'flood',
    label: 'FLOODING',
    headline: 'DANGER — flood conditions',
    sub: 'Do not enter the water. Flash flooding is possible on the Blanco.',
    cssClass: 'status-flood',
    emoji: '🚨',
    safe: false,
  },
  unknown: {
    key: 'unknown',
    label: 'UNKNOWN',
    headline: 'Data unavailable right now',
    sub: 'Could not load water data. Please try again shortly.',
    cssClass: 'status-unknown',
    emoji: '❓',
    safe: null,
  },
};

export function classifyByCfs(cfs) {
  if (cfs == null || isNaN(cfs)) return STATUS.unknown;
  if (cfs <= CFS_THRESHOLDS.DRY) return STATUS.dry;
  if (cfs < CFS_THRESHOLDS.GOOD) return STATUS.low;
  if (cfs < CFS_THRESHOLDS.HIGH) return STATUS.good;
  if (cfs < CFS_THRESHOLDS.FLOOD) return STATUS.high;
  return STATUS.flood;
}

// Plain-English guidance per activity. `level` is ok | caution | no — the UI always
// pairs it with an icon and text, never colour alone.
export function activityAdvice(statusKey) {
  const A = (swim, paddle, fish, dog) => [
    { id: 'swim', label: 'Swim', ...swim },
    { id: 'float', label: 'Paddle / float', ...paddle },
    { id: 'fish', label: 'Fish', ...fish },
    { id: 'dog', label: 'Dogs', ...dog },
  ];
  switch (statusKey) {
    case 'dry':
      return A(
        { level: 'no', note: 'No water' },
        { level: 'no', note: 'No water' },
        { level: 'no', note: 'No water' },
        { level: 'ok', note: 'Dry bed, fine to walk' },
      );
    case 'low':
      return A(
        { level: 'no', note: 'Too shallow' },
        { level: 'no', note: 'Too shallow to float' },
        { level: 'caution', note: 'Small pools only' },
        { level: 'ok', note: 'Fine for wading' },
      );
    case 'good':
      return A(
        { level: 'ok', note: 'Good conditions' },
        { level: 'ok', note: 'Good to float' },
        { level: 'ok', note: 'Good wading' },
        { level: 'ok', note: 'Fine, watch the current' },
      );
    case 'high':
      return A(
        { level: 'no', note: 'Current too strong' },
        { level: 'caution', note: 'Experienced only' },
        { level: 'caution', note: 'Stay on the bank' },
        { level: 'caution', note: 'Keep out of the water' },
      );
    case 'flood':
      return A(
        { level: 'no', note: 'Stay out' },
        { level: 'no', note: 'Stay out' },
        { level: 'no', note: 'Stay away' },
        { level: 'no', note: 'Stay away' },
      );
    default:
      return null;
  }
}
