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
import HistoryChart from './components/HistoryChart/HistoryChart.jsx';
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
      {/* Hero fills viewport — HeroBackground SVG renders inside it */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        <Hero
          status={status}
          kyle={{ discharge: kyle?.discharge, gageHeight: kyle?.gageHeight, trend: kyle?.trend }}
          weather={weather}
          loading={loading}
        />
      </div>

      <main>
        <div className="page-content">

          {/* Core metric cards */}
          <p className="section-label">Live River Data</p>
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
          <HistoryChart
            dischargeHistory={kyle?.dischargeHistory}
            gageHistory={kyle?.gageHistory}
          />

          {/* Weather + Forecast */}
          <p className="section-label">Conditions &amp; Forecast</p>
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
          <p className="section-label">River Context</p>
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
          <p className="section-label">Historical Water Quality</p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <WaterQualityCard waterQuality={waterQuality} />
          </motion.div>

          {/* About */}
          <About />

          <footer style={{
            textAlign: 'center',
            padding: '24px 0 48px',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.8,
          }}>
            <div>
              Data from <a href="https://waterservices.usgs.gov/" target="_blank" rel="noopener noreferrer" style={{ color: '#1565C0' }}>USGS Water Services</a>,{' '}
              <a href="https://api.water.noaa.gov/nwps/v1/docs/" target="_blank" rel="noopener noreferrer" style={{ color: '#1565C0' }}>NWS NWPS</a>,{' '}
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#1565C0' }}>Open-Meteo</a>, and{' '}
              <a href="https://www.waterqualitydata.us/" target="_blank" rel="noopener noreferrer" style={{ color: '#1565C0' }}>EPA Water Quality Portal</a>.
            </div>
            <div style={{ marginTop: 4 }}>
              All data is provisional. This site is not affiliated with any government agency.
              Not a substitute for official flood warnings or emergency services.
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
