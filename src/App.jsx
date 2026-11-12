import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRiverData } from './hooks/useRiverData.js';
import Hero from './components/Hero/Hero.jsx';
import FlowCard from './components/cards/FlowCard.jsx';
import CardBase from './components/cards/CardBase.jsx';
import PrecipCard from './components/cards/PrecipCard.jsx';
import WeatherCard from './components/cards/WeatherCard.jsx';
import ForecastCard from './components/cards/ForecastCard.jsx';
import UpstreamCard from './components/cards/UpstreamCard.jsx';
import DownstreamCard from './components/cards/DownstreamCard.jsx';
import WaterQualityCard from './components/cards/WaterQualityCard.jsx';
const HistoryChart = lazy(() => import('./components/HistoryChart/HistoryChart.jsx'));
import About from './components/About/About.jsx';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

export default function App() {
  const {
    kyle, wimberley, sanMarcos, forecast, weather, waterQuality, status, loading,
    refresh, refreshing, stale, error, lastFetched,
  } = useRiverData();

  const statusKey = status?.key ?? 'unknown';
  const noData = !loading && !kyle;

  return (
    <>
      <a className="skip-link" href="#details">Skip to river details</a>
      <main>
      {/* Hero fills viewport — HeroBackground SVG renders inside it */}
      <div className="hero-wrap">
        <Hero
          status={status}
          kyle={{ discharge: kyle?.discharge, gageHeight: kyle?.gageHeight, trend: kyle?.trend }}
          weather={weather}
          loading={loading}
          refresh={refresh}
          refreshing={refreshing}
          stale={stale}
          error={error}
          lastFetched={lastFetched}
        />
      </div>

        <div className="page-content" id="details">

          {noData ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ marginBottom: '1.5rem' }}>
              <CardBase label="Data unavailable">
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                  We couldn&apos;t reach the USGS river gauge, so there&apos;s nothing reliable to show yet.
                  Your connection may be down, or USGS may be having trouble.
                </p>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={refreshing}
                  style={{
                    marginTop: 14, minHeight: 44, padding: '8px 20px', borderRadius: 999,
                    background: 'var(--color-link)', color: 'var(--color-surface)', fontWeight: 700,
                    opacity: refreshing ? 0.7 : 1,
                  }}
                >
                  {refreshing ? 'Trying again…' : 'Try again'}
                </button>
              </CardBase>
            </motion.div>
          ) : (
            <>
          {/* Core metric cards */}
          <h2 className="section-label">Live River Data</h2>
          <motion.div
            className="card-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          >
            <FlowCard
              discharge={kyle?.discharge}
              gageHeight={kyle?.gageHeight}
              gageHistory={kyle?.gageHistory}
              dischargeHistory={kyle?.dischargeHistory}
              trend={kyle?.trend}
              statusKey={statusKey}
              loading={loading}
            />
            <PrecipCard precip={kyle?.precip} />
          </motion.div>

          {/* 7-day history chart */}
          <Suspense fallback={<div style={{ minHeight: 330 }} aria-hidden="true" />}>
            <HistoryChart
              dischargeHistory={kyle?.dischargeHistory}
              gageHistory={kyle?.gageHistory}
            />
          </Suspense>

          {/* Weather + Forecast */}
          <h2 className="section-label">Conditions &amp; Forecast</h2>
          <motion.div
            className="card-grid-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          >
            <WeatherCard weather={weather} />
            <ForecastCard forecast={forecast} />
          </motion.div>

          {/* Upstream + Downstream context */}
          <h2 className="section-label">River Context</h2>
          <motion.div
            className="card-grid-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          >
            <UpstreamCard wimberley={wimberley} />
            <DownstreamCard sanMarcos={sanMarcos} />
          </motion.div>

          {/* Water Quality (historical) */}
          <h2 className="section-label">Historical Water Quality</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          >
            <WaterQualityCard waterQuality={waterQuality} />
          </motion.div>

            </>
          )}

          {/* About */}
          <About />
        </div>
      </main>

      <footer className="page-content" style={{ textAlign: 'center', padding: '0 var(--space-4) 48px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
        Not a substitute for official flood warnings or emergency services.
      </footer>
    </>
  );
}
