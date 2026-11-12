import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRiverData } from './hooks/useRiverData.js';
import Hero from './components/Hero/Hero.jsx';
import DischargeCard from './components/cards/DischargeCard.jsx';
import GageHeightCard from './components/cards/GageHeightCard.jsx';
import TrendCard from './components/cards/TrendCard.jsx';
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
  const { kyle, wimberley, sanMarcos, forecast, weather, waterQuality, status, loading } = useRiverData();

  const statusKey = status?.key ?? 'unknown';
  const cfs = kyle?.discharge?.value ?? null;
  const ft  = kyle?.gageHeight?.value ?? null;

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
        />
      </div>

        <div className="page-content" id="details">

          {/* Core metric cards */}
          <h2 className="section-label">Live River Data</h2>
          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <DischargeCard discharge={kyle?.discharge} statusKey={statusKey} />
            <GageHeightCard gageHeight={kyle?.gageHeight} gageHistory={kyle?.gageHistory} />
            <TrendCard trend={kyle?.trend} />
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
            animate="visible"
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
            animate="visible"
          >
            <UpstreamCard wimberley={wimberley} />
            <DownstreamCard sanMarcos={sanMarcos} />
          </motion.div>

          {/* Water Quality (historical) */}
          <h2 className="section-label">Historical Water Quality</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <WaterQualityCard waterQuality={waterQuality} />
          </motion.div>

          {/* About */}
          <About />
        </div>
      </main>

      <footer className="page-content">
          <div style={{
            textAlign: 'center',
            padding: '0 0 24px',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.8,
          }}>
            <div>
              Data from <a href="https://waterservices.usgs.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-link)' }}>USGS Water Services</a>,{' '}
              <a href="https://api.water.noaa.gov/nwps/v1/docs/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-link)' }}>NWS NWPS</a>,{' '}
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-link)' }}>Open-Meteo</a>, and{' '}
              <a href="https://www.waterqualitydata.us/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-link)' }}>EPA Water Quality Portal</a>.
            </div>
            <div style={{ marginTop: 4 }}>
              All data is provisional. This site is not affiliated with any government agency.
              Not a substitute for official flood warnings or emergency services.
            </div>
          </div>
      </footer>
    </>
  );
}
