import CardBase from './CardBase.jsx';
import { formatFt } from '../../utils/formatters.js';
import { WIMBERLEY_STAGES } from '../../config.js';

export default function UpstreamCard({ wimberley }) {
  const ft = wimberley?.value ?? null;
  const stage = ft == null ? null
    : ft >= WIMBERLEY_STAGES.MAJOR   ? { label: 'MAJOR FLOOD', color: '#B71C1C' }
    : ft >= WIMBERLEY_STAGES.MODERATE ? { label: 'MODERATE FLOOD', color: '#C62828' }
    : ft >= WIMBERLEY_STAGES.MINOR    ? { label: 'MINOR FLOOD', color: '#E65100' }
    : ft >= WIMBERLEY_STAGES.ACTION   ? { label: 'ACTION STAGE', color: '#F57C00' }
    : { label: 'Below action stage', color: '#2E7D32' };

  return (
    <CardBase
      label="Upstream — Wimberley"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p>The Wimberley gauge is upstream — rising water here typically reaches Five Mile Dam within a few hours. Watch this gauge for flash flood early warning.</p>
          <p style={{ marginTop: 8 }}>
            <strong>NWS Flood Stages at Wimberley:</strong><br />
            Action: {WIMBERLEY_STAGES.ACTION} ft · Minor: {WIMBERLEY_STAGES.MINOR} ft<br />
            Moderate: {WIMBERLEY_STAGES.MODERATE} ft · Major: {WIMBERLEY_STAGES.MAJOR} ft
          </p>
          <p style={{ marginTop: 8 }}>
            <a href="https://water.noaa.gov/gauges/08171000" target="_blank" rel="noopener noreferrer" style={{ color: '#1565C0' }}>
              View Wimberley gauge →
            </a>
          </p>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <span style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          lineHeight: 1,
          color: stage?.color ?? 'var(--color-text-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {ft != null ? formatFt(ft) : '—'}
        </span>
        <span style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>ft</span>
      </div>
      {stage && (
        <div style={{ marginTop: 8, fontSize: '0.85rem', fontWeight: 700, color: stage.color }}>
          {stage.label}
        </div>
      )}
      <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
        USGS 08171000 · Blanco Rv at Wimberley · Tap for flood stages
      </div>
    </CardBase>
  );
}
