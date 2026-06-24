import CardBase from './CardBase.jsx';
import { formatIn } from '../../utils/formatters.js';

export default function PrecipCard({ precip }) {
  const value = precip?.value ?? null;
  const hasRain = value != null && value > 0;

  return (
    <CardBase
      label="Precipitation (24h)"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p>Total precipitation recorded at USGS 08171300 over the rolling period.</p>
          <p style={{ marginTop: 8 }}>Rain upstream can cause the Blanco to rise rapidly — the river can flash-flood within hours of heavy upstream rainfall.</p>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <span style={{
          fontSize: '2.8rem',
          fontWeight: 800,
          lineHeight: 1,
          color: hasRain ? '#1565C0' : 'var(--color-text-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value != null ? formatIn(value) : '—'}
        </span>
        <span style={{ color: 'var(--color-text-muted)', marginBottom: 4, fontSize: '1rem' }}>in</span>
      </div>
      <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
        {value == null ? 'No data' : hasRain ? '🌧 Rain detected' : 'No recent rain at gauge'}
      </div>
      <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--color-text-muted)', opacity: 0.7 }}>
        Tap for more info
      </div>
    </CardBase>
  );
}
