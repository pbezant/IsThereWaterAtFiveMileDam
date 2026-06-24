import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import CardBase from './CardBase.jsx';
import { formatCfs } from '../../utils/formatters.js';

const statusLabels = {
  dry: 'No water flowing',
  low: 'Trickle only — not swimmable',
  good: 'Good for swimming',
  high: 'Strong current — use caution',
  flood: 'Dangerous — stay out',
  unknown: 'Data unavailable',
};

const accentColors = {
  dry: '#D2691E',
  low: '#DAA520',
  good: '#1976D2',
  high: '#F57C00',
  flood: '#C62828',
  unknown: '#607D8B',
};

export default function DischargeCard({ discharge, statusKey }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => formatCfs(v));
  const value = discharge?.value ?? null;

  useEffect(() => {
    if (value == null) return;
    const ctrl = animate(count, value, { duration: 1.2, ease: 'easeOut' });
    return ctrl.stop;
  }, [value, count]);

  const accent = accentColors[statusKey] ?? accentColors.unknown;

  return (
    <CardBase
      label="Discharge"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p>Discharge (streamflow) measures how much water is moving past the USGS gauge station per second.</p>
          <p style={{ marginTop: 8 }}>Source: <strong>USGS 08171300</strong> — Blanco Rv nr Kyle, TX</p>
          <p style={{ marginTop: 4 }}>Updated every ~15 minutes via satellite telemetry.</p>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <motion.span style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          lineHeight: 1,
          color: accent,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value != null ? rounded : '—'}
        </motion.span>
        <span style={{ color: 'var(--color-text-muted)', marginBottom: 4, fontSize: '1rem' }}>cfs</span>
      </div>
      <div style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
        {statusLabels[statusKey] ?? '—'}
      </div>
      {discharge?.provisional && (
        <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
          Provisional data
        </div>
      )}
      <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>
        Tap for more info
      </div>
    </CardBase>
  );
}
