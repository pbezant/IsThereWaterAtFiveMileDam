import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import CardBase from './CardBase.jsx';
import { formatFt } from '../../utils/formatters.js';

export default function GageHeightCard({ gageHeight, gageHistory }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => v.toFixed(2));
  const value = gageHeight?.value ?? null;

  // Compute 24h change
  let change24h = null;
  if (gageHistory?.length >= 2) {
    const now = gageHistory[gageHistory.length - 1].y;
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const oldPoint = [...gageHistory].reverse().find(p => new Date(p.t).getTime() < cutoff);
    if (oldPoint) change24h = now - oldPoint.y;
  }

  useEffect(() => {
    if (value == null) return;
    const ctrl = animate(count, value, { duration: 1.2, ease: 'easeOut' });
    return ctrl.stop;
  }, [value, count]);

  return (
    <CardBase
      label="Gage Height"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p>Gage height is the water surface elevation at the USGS gauge, measured in feet above the gauge datum (620.12 ft NGVD29).</p>
          <p style={{ marginTop: 8 }}>This is not the same as water depth at the dam — it's the river stage at the gauge ~2 miles upstream.</p>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <motion.span style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          lineHeight: 1,
          color: 'var(--color-water-mid)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value != null ? rounded : '—'}
        </motion.span>
        <span style={{ color: 'var(--color-text-muted)', marginBottom: 4, fontSize: '1rem' }}>ft</span>
      </div>
      {change24h != null && (
        <div style={{
          marginTop: 8,
          fontSize: '0.85rem',
          fontWeight: 600,
          color: change24h > 0.05 ? '#1565C0' : change24h < -0.05 ? '#C62828' : 'var(--color-text-muted)',
        }}>
          {change24h > 0.05 ? '↑' : change24h < -0.05 ? '↓' : '→'} {Math.abs(change24h).toFixed(2)} ft in 24h
        </div>
      )}
      <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>
        Tap for more info
      </div>
    </CardBase>
  );
}
