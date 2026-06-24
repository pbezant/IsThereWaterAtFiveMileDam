import CardBase from './CardBase.jsx';
import { formatFt, formatDateTime } from '../../utils/formatters.js';

export default function ForecastCard({ forecast }) {
  if (!forecast) {
    return (
      <CardBase label="NWS Forecast">
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No forecast available</div>
      </CardBase>
    );
  }

  const { peakStageFt, peakTime, issuedTime, points } = forecast;
  const next24h = points.filter(p => p.t <= Date.now() + 24 * 60 * 60 * 1000);
  const allSteady = next24h.length > 0 && next24h.every(p => Math.abs(p.stageFt - next24h[0].stageFt) < 0.5);

  return (
    <CardBase
      label="NWS Forecast"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p>River stage forecast from the <strong>West Gulf River Forecast Center (WGRFC)</strong> via the National Water Prediction Service.</p>
          {issuedTime && <p style={{ marginTop: 8 }}>Issued: {formatDateTime(issuedTime)}</p>}
          <p style={{ marginTop: 4 }}>
            <a href="https://water.noaa.gov/gauges/08171300" target="_blank" rel="noopener noreferrer"
               style={{ color: '#1565C0' }}>
              View on water.noaa.gov →
            </a>
          </p>
        </div>
      }
    >
      {allSteady ? (
        <>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2E7D32' }}>No notable change</div>
          <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Forecast shows steady conditions over the next 24 hours.
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1, color: '#1565C0', fontVariantNumeric: 'tabular-nums' }}>
              {formatFt(peakStageFt)}
            </span>
            <span style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>ft peak</span>
          </div>
          <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            {peakTime instanceof Date
              ? peakTime.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
              : ''}
          </div>
        </>
      )}
      {issuedTime && (
        <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
          Issued {new Date(issuedTime).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })}
          {' '}· Tap for source
        </div>
      )}
    </CardBase>
  );
}
