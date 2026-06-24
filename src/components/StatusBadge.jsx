import { motion } from 'framer-motion';

const colors = {
  dry:     { bg: '#8B4513', text: '#FFF8F0' },
  low:     { bg: '#B8860B', text: '#FFFDE7' },
  good:    { bg: '#1565C0', text: '#E3F2FD' },
  high:    { bg: '#E65100', text: '#FFF3E0' },
  flood:   { bg: '#B71C1C', text: '#FFEBEE' },
  unknown: { bg: '#37474F', text: '#ECEFF1' },
};

export default function StatusBadge({ statusKey, label }) {
  const c = colors[statusKey] ?? colors.unknown;
  return (
    <motion.span
      layoutId="status-badge"
      animate={{ backgroundColor: c.bg, color: c.text }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontWeight: 800,
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        backgroundColor: c.bg,
        color: c.text,
      }}
    >
      {label}
    </motion.span>
  );
}
