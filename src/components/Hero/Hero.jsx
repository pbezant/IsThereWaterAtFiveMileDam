import { motion, AnimatePresence } from 'framer-motion';
import styles from './Hero.module.css';
import StatusBadge from '../StatusBadge.jsx';
import LastUpdated from '../LastUpdated.jsx';
import { formatCfs, formatFt } from '../../utils/formatters.js';

const bgColors = {
  dry:     '#5D2F0B',
  low:     '#6B5000',
  good:    '#0D3A7A',
  high:    '#7A2D00',
  flood:   '#5C0A0A',
  unknown: '#1C2A35',
};

const textColors = {
  dry:     '#FFF8F0',
  low:     '#FFFDE7',
  good:    '#E3F2FD',
  high:    '#FFF3E0',
  flood:   '#FFEBEE',
  unknown: '#ECEFF1',
};

export default function Hero({ status, kyle, loading }) {
  const statusKey = status?.key ?? 'unknown';
  const bg = bgColors[statusKey];
  const color = textColors[statusKey];

  const cfs = kyle?.discharge?.value;
  const ft  = kyle?.gageHeight?.value;
  const dir = kyle?.trend?.dir;
  const trendArrow = dir === 'rising' ? ' ↑' : dir === 'falling' ? ' ↓' : '';

  return (
    <motion.section
      className={styles.hero}
      animate={{ backgroundColor: bg, color }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      <motion.div
        className={styles.eyebrow}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Five Mile Dam · Blanco River · Kyle, TX
      </motion.div>

      <motion.h1
        className={styles.question}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Is there water at Five Mile Dam?
      </motion.h1>

      <AnimatePresence mode="wait">
        {loading && !status ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.headline}
            style={{ opacity: 0.4 }}
          >
            Loading…
          </motion.div>
        ) : (
          <motion.div
            key={statusKey}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.headline}>{status?.headline}</div>
            <div className={styles.subline}>{status?.sub}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {(cfs != null || ft != null) && (
        <motion.div
          className={styles.metrics}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {cfs != null && (
            <span>{formatCfs(cfs)} cfs{trendArrow}</span>
          )}
          {cfs != null && ft != null && <span className={styles.metric_divider}>·</span>}
          {ft != null && (
            <span>{formatFt(ft)} ft</span>
          )}
        </motion.div>
      )}

      <motion.div
        className={styles.meta}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <StatusBadge statusKey={statusKey} label={status?.label ?? '…'} />
        <LastUpdated
          dateTime={kyle?.discharge?.dateTime}
          provisional={kyle?.discharge?.provisional}
          style={{ color, opacity: 0.8 }}
        />
      </motion.div>

      {status && !status.safe && status.key !== 'unknown' && (
        <motion.div
          className={styles.safety_warning}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          ⚠️ Do not enter the water — dangerous conditions
        </motion.div>
      )}
    </motion.section>
  );
}
