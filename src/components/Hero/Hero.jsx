import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion, animate } from 'framer-motion';
import { useEffect } from 'react';
import styles from './Hero.module.css';
import HeroBackground from './HeroBackground.jsx';
import StatusBadge from '../StatusBadge.jsx';
import LastUpdated from '../LastUpdated.jsx';
import { formatCfs, formatFt, weatherCodeToEmoji, weatherCodeToLabel } from '../../utils/formatters.js';

const bgColors = {
  dry:     'rgba(93, 47, 11, 0.62)',
  low:     'rgba(107, 80, 0, 0.62)',
  good:    'rgba(13, 58, 122, 0.62)',
  high:    'rgba(122, 45, 0, 0.65)',
  flood:   'rgba(92, 10, 10, 0.72)',
  unknown: 'rgba(28, 42, 53, 0.62)',
};

const textColors = {
  dry:     '#FFF8F0',
  low:     '#FFFDE7',
  good:    '#E3F2FD',
  high:    '#FFF3E0',
  flood:   '#FFEBEE',
  unknown: '#ECEFF1',
};

const trendLabels = { rising: '↑ Rising', falling: '↓ Falling', steady: '→ Steady' };

function AnimatedNumber({ target, decimals = 0 }) {
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const format = v => (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString());
  const display = useTransform(count, format);
  useEffect(() => {
    if (target == null) return;
    if (reduce) { count.set(target); return; }
    const ctrl = animate(count, target, { duration: 1.2, ease: 'easeOut' });
    return ctrl.stop;
  }, [target, count, reduce]);
  if (target == null) return <span>—</span>;
  // The counting number is hidden from assistive tech so it never announces "0"; the final value is.
  return (
    <>
      <motion.span aria-hidden="true">{display}</motion.span>
      <span className="visually-hidden">{format(target)}</span>
    </>
  );
}

export default function Hero({ status, kyle, weather, loading }) {
  const statusKey = status?.key ?? 'unknown';
  const bg = bgColors[statusKey];
  const color = textColors[statusKey];

  const cfs = kyle?.discharge?.value ?? null;
  const ft  = kyle?.gageHeight?.value ?? null;
  const dir = kyle?.trend?.dir ?? 'steady';

  return (
    <motion.section
      className={styles.hero}
      aria-labelledby="hero-title"
      animate={{ backgroundColor: bg, color }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      <HeroBackground
        statusKey={statusKey}
        gageHeight={ft}
        weatherCode={weather?.weatherCode}
        precipProbability={weather?.precipProbability}
      />

      <div className={styles.content}>
      <motion.div
        className={styles.eyebrow}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Five Mile Dam · Blanco River · Kyle, TX
      </motion.div>

      <motion.h1
        id="hero-title"
        className={styles.question}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Is there water at Five Mile Dam?
      </motion.h1>

      <AnimatePresence mode="wait">
        {loading && !status ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={styles.headline} style={{ opacity: 0.4 }}>
            Loading…
          </motion.div>
        ) : (
          <motion.div key={statusKey}
            role="status" aria-live="polite" aria-atomic="true"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.headline}>{status?.headline}</div>
            <div className={styles.subline}>{status?.sub}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Three stat pills: Flow · Depth · Weather */}
      <motion.div
        className={styles.stats}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {/* Flow */}
        <div className={styles.stat}>
          <div className={styles.statValue}>
            <AnimatedNumber target={cfs} decimals={0} />
          </div>
          <div className={styles.statUnit}>cfs</div>
          <div className={styles.statLabel}>Flow</div>
          <div className={styles.statTrend}>{trendLabels[dir]}</div>
        </div>

        {/* Depth */}
        <div className={styles.stat}>
          <div className={styles.statValue}>
            <AnimatedNumber target={ft} decimals={2} />
          </div>
          <div className={styles.statUnit}>ft</div>
          <div className={styles.statLabel}>Gage Height</div>
          <div className={styles.statTrend} style={{ opacity: 0 }} aria-hidden="true">—</div>
        </div>

        {/* Weather */}
        <div className={styles.stat}>
          <div className={styles.statValue} style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)' }}>
            {weather ? (
              <span><span aria-hidden="true">{weatherCodeToEmoji(weather.weatherCode)} </span>{Math.round(weather.tempF)}°F</span>
            ) : '—'}
          </div>
          <div className={styles.statUnit}>{weather ? weatherCodeToLabel(weather.weatherCode) : ""}</div>
          <div className={styles.statLabel}>Weather</div>
          <div className={styles.statTrend}>
            {weather ? `${weather.humidity}% humidity` : ''}
          </div>
        </div>
      </motion.div>

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
          style={{ color, opacity: 0.75 }}
        />
      </motion.div>

      {status && !status.safe && status.key !== 'unknown' && (
        <motion.div
          className={styles.safetyWarning}
          role="alert"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span aria-hidden="true">⚠️ </span>Do not enter the water — dangerous conditions
        </motion.div>
      )}
      </div>
    </motion.section>
  );
}
