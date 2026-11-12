import CardBase from './CardBase.jsx';
import AnimatedNumber from '../AnimatedNumber.jsx';
import ThresholdScale from '../ThresholdScale.jsx';
import { trendSentence } from '../../utils/trend.js';

const statusLabels = {
  dry: 'No water flowing',
  low: 'A trickle, not swimmable',
  good: 'Good for swimming',
  high: 'Strong current, use caution',
  flood: 'Dangerous, stay out',
  unknown: 'Data unavailable',
};

const accentColors = {
  dry: '#9c4a14', low: '#8a6508', good: '#1565C0', high: '#C24500', flood: '#B71C1C', unknown: '#546E7A',
};

const arrows = { rising: '↑', falling: '↓', steady: '→' };

export default function FlowCard({ discharge, gageHeight, gageHistory, dischargeHistory, trend, statusKey, loading }) {
  const value = discharge?.value ?? null;
  const ft = gageHeight?.value ?? null;
  const accent = accentColors[statusKey] ?? accentColors.unknown;

  // 24h change in river level
  let change24h = null;
  if (gageHistory?.length >= 2) {
    const now = gageHistory[gageHistory.length - 1].y;
    const cutoff = Date.now() - 24 * 3600e3;
    const old = [...gageHistory].reverse().find(p => new Date(p.t).getTime() < cutoff);
    if (old) change24h = now - old.y;
  }

  const sentence = trendSentence(dischargeHistory, value);
  const dir = trend?.dir ?? 'steady';

  if (loading && value == null) {
    return (
      <CardBase label="River flow" className="flow-span">
        <div className="skeleton" style={{ height: 44, width: 150 }} />
        <div className="skeleton" style={{ height: 14, width: 180, marginTop: 12 }} />
        <div className="skeleton" style={{ height: 10, width: '100%', marginTop: 28 }} />
      </CardBase>
    );
  }

  return (
    <CardBase
      label="River flow"
      className="flow-span"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p><strong>Flow (cfs)</strong> is how many cubic feet of water pass the USGS gauge every second. It's the best single measure of whether the river is swimmable.</p>
          <p style={{ marginTop: 8 }}><strong>River level (ft)</strong> is the height of the water surface at the gauge, measured above the gauge's own zero point. It is not the water depth at the dam, and the gauge is about 2 miles upstream.</p>
          <p style={{ marginTop: 8 }}>Source: <strong>USGS 08171300</strong>, Blanco Rv nr Kyle, TX. Updated about every 15 minutes.
            {discharge?.provisional && ' Provisional means USGS hasn’t reviewed the reading yet, so it may be revised.'}</p>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: accent, fontVariantNumeric: 'tabular-nums',
        }}>
          <AnimatedNumber target={value} />
        </span>
        <span style={{ color: 'var(--color-text-secondary)', marginBottom: 5, fontSize: '1rem', fontWeight: 600 }}>cfs</span>
        <span style={{ color: 'var(--color-text-muted)', marginBottom: 6, fontSize: '0.75rem' }}>
          cubic feet of water per second
        </span>
      </div>

      <div style={{ marginTop: 8, fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
        {statusLabels[statusKey] ?? '—'}
      </div>

      <ThresholdScale cfs={value} statusKey={statusKey} />

      <div style={{ marginTop: 16, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
        {trend || sentence ? (
          <span>
            <span aria-hidden="true" style={{ fontWeight: 800, marginRight: 6 }}>{arrows[dir]}</span>
            {sentence ?? `Trend over the last hour: ${dir}.`}
          </span>
        ) : '—'}
      </div>

      {ft != null && (
        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
          fontSize: '0.85rem', color: 'var(--color-text-secondary)',
        }}>
          <span>River level <strong style={{ color: 'var(--color-text-primary)' }}>{ft.toFixed(2)} ft</strong></span>
          {change24h != null && (
            <span>
              {change24h > 0.05 ? '↑' : change24h < -0.05 ? '↓' : '→'} {Math.abs(change24h).toFixed(2)} ft in 24h
            </span>
          )}
        </div>
      )}
    </CardBase>
  );
}
