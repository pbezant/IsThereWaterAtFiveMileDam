import CardBase from './CardBase.jsx';

function QStat({ label, value, unit }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {value != null ? `${typeof value === 'number' ? value.toFixed(1) : value} ${unit}` : '—'}
      </span>
    </div>
  );
}

export default function WaterQualityCard({ waterQuality }) {
  if (!waterQuality) {
    return (
      <CardBase label="Water Quality (Historical)">
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No data available</div>
      </CardBase>
    );
  }

  const { date, waterTempC, pH, dissolvedOxygen, conductivity } = waterQuality;
  const waterTempF = waterTempC != null ? (waterTempC * 9/5 + 32) : null;

  return (
    <CardBase
      label="Water Quality (Historical)"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p>Periodic water quality monitoring by volunteer scientists at Blanco River @ Five Mile Dam (Dudley Johnson Park).</p>
          <p style={{ marginTop: 8 }}>Data from <strong>Texas Stream Team</strong> (TXSTRMTM_WQX-15019) via the EPA Water Quality Portal. Sampled approximately quarterly — this is <em>not</em> real-time data.</p>
          <p style={{ marginTop: 8 }}>
            <a href="https://www.waterqualitydata.us/provider/STORET/TXSTRMTM_WQX/TXSTRMTM_WQX-15019/" target="_blank" rel="noopener noreferrer" style={{ color: '#1565C0' }}>
              View all samples →
            </a>
          </p>
        </div>
      }
    >
      <div style={{ marginBottom: 10, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
        Last sampled: {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <QStat label="Water Temperature" value={waterTempF} unit="°F" />
      <QStat label="pH" value={pH} unit="" />
      <QStat label="Dissolved Oxygen" value={dissolvedOxygen} unit="mg/L" />
      <QStat label="Conductivity" value={conductivity} unit="µS/cm" />
      <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        Volunteer monitoring · Not real-time · Tap for source info
      </div>
    </CardBase>
  );
}
