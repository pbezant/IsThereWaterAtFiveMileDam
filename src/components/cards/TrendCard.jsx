import { motion } from 'framer-motion';
import CardBase from './CardBase.jsx';
import { formatCfs } from '../../utils/formatters.js';

const arrows = { rising: '↑', falling: '↓', steady: '→' };
const colors  = { rising: '#1565C0', falling: '#8B4513', steady: '#607D8B' };

export default function TrendCard({ trend }) {
  const dir = trend?.dir ?? 'steady';
  const delta = trend?.delta ?? 0;

  return (
    <CardBase label="Trend (1 hr)">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <motion.span
          key={dir}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ fontSize: '2.8rem', lineHeight: 1, color: colors[dir] }}
        >
          {arrows[dir]}
        </motion.span>
        <span style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: colors[dir],
          marginBottom: 4,
          textTransform: 'capitalize',
        }}>
          {dir}
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
        {Math.abs(delta) < 0.5
          ? 'No significant change'
          : `${delta > 0 ? '+' : ''}${formatCfs(delta)} cfs in last hour`}
      </div>
      <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>
        Compared to 1 hour ago
      </div>
    </CardBase>
  );
}
