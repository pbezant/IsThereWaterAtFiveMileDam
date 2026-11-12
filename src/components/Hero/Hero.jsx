import { motion, AnimatePresence } from 'framer-motion';
import styles from './Hero.module.css';
import HeroCanvas from './HeroCanvas.jsx';
import Advice from './Advice.jsx';
import ShareButton from './ShareButton.jsx';
import AnimatedNumber from '../AnimatedNumber.jsx';
import StatusBadge from '../StatusBadge.jsx';
import LastUpdated from '../LastUpdated.jsx';
import { weatherCodeToEmoji, weatherCodeToLabel, relativeTime } from '../../utils/formatters.js';

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

export default function Hero({
  status, kyle, weather, loading, refresh, refreshing, stale, error, lastFetched,
}) {
  const statusKey = status?.key ?? 'unknown';
  const color = textColors[statusKey];

  const cfs = kyle?.discharge?.value ?? null;
  const ft  = kyle?.gageHeight?.value ?? null;
  const dir = kyle?.trend?.dir ?? null;
  const noData = !loading && cfs == null;

  const notice = stale
    ? `Couldn’t reach USGS. Showing the last reading from ${relativeTime(kyle?.discharge?.dateTime)}.`
    : null;

  return (
    <motion.section
      className={styles.hero}
      aria-labelledby="hero-title"
      animate={{ backgroundColor: bgColors[statusKey], color }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
    >
      <HeroCanvas
        statusKey={statusKey}
        cfs={cfs}
        gageHeight={ft}
        trendDir={dir}
        weatherCode={weather?.weatherCode}
        precipProbability={weather?.precipProbability}
      />

      <div className={styles.content}>
        {notice && (
          <div className={styles.notice} role="status">
            <span aria-hidden="true">⚠ </span>{notice}{' '}
            <button type="button" className={styles.noticeBtn} onClick={refresh} disabled={refreshing}>
              {refreshing ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        )}

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
              className={styles.headline} style={{ opacity: 0.5 }}>
              <span className={styles.shimmerText}>Checking the river…</span>
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

        {noData && (
          <button type="button" className={`${styles.pill} ${styles.retry}`} onClick={refresh} disabled={refreshing}>
            {refreshing ? 'Trying again…' : '↻ Try again'}
          </button>
        )}

        {!noData && <Advice statusKey={statusKey} />}

        {/* Three stat pills: Flow · Level · Weather */}
        <motion.div
          className={styles.stats}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className={styles.stat}>
            <div className={styles.statValue}>
              <AnimatedNumber target={cfs} decimals={0} /><span className={styles.statUnitInline}> cfs</span>
            </div>
            <div className={styles.statLabel}>River flow</div>
            <div className={styles.statTrend}>{dir ? trendLabels[dir] : ' '}</div>
          </div>

          <div className={styles.stat}>
            <div className={styles.statValue}>
              <AnimatedNumber target={ft} decimals={2} /><span className={styles.statUnitInline}> ft</span>
            </div>
            <div className={styles.statLabel}>River level</div>
            <div className={styles.statTrend}>{' '}</div>
          </div>

          <div className={styles.stat}>
            <div className={styles.statValue}>
              {weather ? (
                <span><span aria-hidden="true">{weatherCodeToEmoji(weather.weatherCode)} </span>{Math.round(weather.tempF)}°F</span>
              ) : '—'}
            </div>
            <div className={styles.statLabel}>Weather</div>
            <div className={styles.statTrend}>
              {weather ? weatherCodeToLabel(weather.weatherCode) : ' '}
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
          {!noData && <LastUpdated
            dateTime={kyle?.discharge?.dateTime}
            provisional={kyle?.discharge?.provisional}
            style={{ color, opacity: 0.9 }}
          />}
          {!noData && (
            <>
              <button type="button" className={styles.pill} onClick={refresh} disabled={refreshing}
                title={lastFetched ? `Last checked ${relativeTime(lastFetched)}` : undefined}>
                <span aria-hidden="true" className={refreshing ? styles.spin : undefined}>↻</span>{' '}
                {refreshing ? 'Checking…' : 'Refresh'}
              </button>
              <ShareButton headline={status?.headline} cfs={cfs} />
            </>
          )}
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
