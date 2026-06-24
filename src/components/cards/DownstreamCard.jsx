import CardBase from './CardBase.jsx';
import { formatCfs, formatFt } from '../../utils/formatters.js';

export default function DownstreamCard({ sanMarcos }) {
  const cfs = sanMarcos?.discharge?.value ?? null;
  const ft  = sanMarcos?.gageHeight?.value ?? null;

  return (
    <CardBase
      label="Downstream — San Marcos"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p>The San Marcos gauge is downstream of Five Mile Dam where the Blanco meets the San Marcos River.</p>
          <p style={{ marginTop: 8 }}>Updates every ~5 minutes. Operated in cooperation with the Guadalupe-Blanco River Authority (GBRA).</p>
          <p style={{ marginTop: 8 }}>
            <a href="https://waterdata.usgs.gov/monitoring-location/USGS-08171350/" target="_blank" rel="noopener noreferrer" style={{ color: '#1565C0' }}>
              USGS 08171350 →
            </a>
          </p>
        </div>
      }
    >
      {cfs != null ? (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <span style={{
            fontSize: '2.4rem', fontWeight: 800, lineHeight: 1,
            color: '#607D8B', fontVariantNumeric: 'tabular-nums',
          }}>
            {formatCfs(cfs)}
          </span>
          <span style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>cfs</span>
        </div>
      ) : (
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Unavailable</div>
      )}
      {ft != null && (
        <div style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Stage: {formatFt(ft)} ft
        </div>
      )}
      <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
        USGS 08171350 · Blanco Rv at San Marcos · 5-min updates · Tap for info
      </div>
    </CardBase>
  );
}
