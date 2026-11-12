import { motion } from 'framer-motion';
import { CFS_THRESHOLDS } from '../config.js';

// Visual legend for the flow bands, with a marker for today's reading.
const ZONES = [
  { key: 'dry',   name: 'Dry',   range: '0',                                   from: 0,  to: 8,   color: '#8B4513' },
  { key: 'low',   name: 'Low',   range: `1–${CFS_THRESHOLDS.GOOD - 1}`,        from: 8,  to: 30,  color: '#B8860B' },
  { key: 'good',  name: 'Good',  range: `${CFS_THRESHOLDS.GOOD}–${CFS_THRESHOLDS.HIGH - 1}`, from: 30, to: 60, color: '#1565C0' },
  { key: 'high',  name: 'High',  range: `${CFS_THRESHOLDS.HIGH}–${CFS_THRESHOLDS.FLOOD - 1}`, from: 60, to: 82, color: '#E65100' },
  { key: 'flood', name: 'Flood', range: `${CFS_THRESHOLDS.FLOOD}+`,            from: 82, to: 100, color: '#B71C1C' },
];

function position(cfs) {
  if (cfs == null) return null;
  const { GOOD, HIGH, FLOOD } = CFS_THRESHOLDS;
  const frac = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  if (cfs <= 0) return 4;
  if (cfs < GOOD) return 8 + 22 * frac(cfs, 1, GOOD);
  if (cfs < HIGH) return 30 + 30 * frac(cfs, GOOD, HIGH);
  if (cfs < FLOOD) return 60 + 22 * frac(cfs, HIGH, FLOOD);
  return 82 + 18 * frac(cfs, FLOOD, FLOOD * 2);
}

export default function ThresholdScale({ cfs, statusKey }) {
  const pos = position(cfs);
  const zone = ZONES.find(z => z.key === statusKey);
  const label = cfs == null
    ? 'Flow scale: dry, low, good, high, flood'
    : `${Math.round(cfs)} cfs, in the ${zone?.name ?? ''} range`;

  return (
    <div role="img" aria-label={label} style={{ marginTop: 18 }}>
      <div style={{ position: 'relative', display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
        {ZONES.map(z => (
          <div key={z.key} style={{
            width: `${z.to - z.from}%`,
            background: z.color,
            opacity: z.key === statusKey ? 1 : 0.32,
            transition: 'opacity 0.4s',
          }} />
        ))}
      </div>
      <div style={{ position: 'relative', height: 0 }}>
        {pos != null && (
          <motion.div
            initial={false}
            animate={{ left: `${pos}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            style={{
              position: 'absolute', top: -17, width: 0, height: 0, marginLeft: -6,
              borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
              borderTop: '8px solid var(--color-text-primary)',
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', gap: 2, marginTop: 6 }} aria-hidden="true">
        {ZONES.map(z => (
          <div key={z.key} style={{
            width: `${z.to - z.from}%`, textAlign: 'center', lineHeight: 1.25,
            color: z.key === statusKey ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            fontWeight: z.key === statusKey ? 700 : 500,
          }}>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{z.name}</div>
            <div style={{ fontSize: '0.62rem' }}>{z.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
