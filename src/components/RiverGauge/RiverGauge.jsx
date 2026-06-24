import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

const GAUGE_MIN_FT = 1.5;
const GAUGE_MAX_FT = 12;
const HEIGHT = 200;

export default function RiverGauge({ gageHeight, statusKey }) {
  const value = gageHeight?.value ?? null;
  const clampedPct = value == null ? 0
    : Math.min(1, Math.max(0, (value - GAUGE_MIN_FT) / (GAUGE_MAX_FT - GAUGE_MIN_FT)));

  const fillPct = useMotionValue(0);
  const fillHeight = useTransform(fillPct, v => v * HEIGHT);
  const fillY = useTransform(fillPct, v => HEIGHT - v * HEIGHT);

  useEffect(() => {
    const ctrl = animate(fillPct, clampedPct, { duration: 1.4, ease: 'easeOut' });
    return ctrl.stop;
  }, [clampedPct, fillPct]);

  const waterColor = {
    dry: '#8B4513', low: '#DAA520', good: '#1976D2',
    high: '#F57C00', flood: '#B71C1C', unknown: '#607D8B',
  }[statusKey] ?? '#1976D2';

  const ticks = [2, 4, 6, 8, 10, 12];
  const W = 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={W + 48} height={HEIGHT + 20} style={{ overflow: 'visible' }}>
        {/* Tube outline */}
        <rect x={24} y={0} width={W} height={HEIGHT} rx={8}
          fill="var(--color-surface-2)" stroke="var(--color-border)" strokeWidth={2} />

        {/* Water fill */}
        <clipPath id="gauge-clip">
          <rect x={24} y={0} width={W} height={HEIGHT} rx={8} />
        </clipPath>
        <motion.rect
          x={24}
          y={fillY}
          width={W}
          height={fillHeight}
          fill={waterColor}
          fillOpacity={0.85}
          clipPath="url(#gauge-clip)"
        />

        {/* Tick marks & labels */}
        {ticks.map(t => {
          const pct = (t - GAUGE_MIN_FT) / (GAUGE_MAX_FT - GAUGE_MIN_FT);
          const y = HEIGHT - pct * HEIGHT;
          return (
            <g key={t}>
              <line x1={24} y1={y} x2={28} y2={y} stroke="var(--color-border)" strokeWidth={1.5} />
              <text x={18} y={y + 4} fontSize={9} textAnchor="end" fill="var(--color-text-muted)">{t}</text>
            </g>
          );
        })}

        {/* ft label */}
        <text x={24 + W / 2} y={HEIGHT + 16} fontSize={9} textAnchor="middle" fill="var(--color-text-muted)">ft</text>
      </svg>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Gage Height
      </div>
    </div>
  );
}
