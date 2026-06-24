import CardBase from './CardBase.jsx';
import { weatherCodeToLabel, weatherCodeToEmoji } from '../../utils/formatters.js';

export default function WeatherCard({ weather }) {
  if (!weather) {
    return (
      <CardBase label="Weather at Dam">
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Unavailable</div>
      </CardBase>
    );
  }

  return (
    <CardBase
      label="Weather at Dam"
      expandedContent={
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          <p>Current weather conditions near Five Mile Dam (29.94°N, 97.90°W).</p>
          <p style={{ marginTop: 8 }}>Source: <strong>Open-Meteo</strong> — free, no API key, ~15-min updates.</p>
          <p style={{ marginTop: 4 }}>Hot days + dry riverbed = extremely unpleasant. Check the flow before you go!</p>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <span style={{ fontSize: '2.4rem' }}>{weatherCodeToEmoji(weather.weatherCode)}</span>
        <span style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          lineHeight: 1,
          color: weather.tempF > 90 ? '#E65100' : weather.tempF < 60 ? '#1565C0' : '#2E7D32',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {Math.round(weather.tempF)}°F
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
        {weatherCodeToLabel(weather.weatherCode)}
      </div>
      <div style={{ marginTop: 4, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
        Humidity: {weather.humidity}%
      </div>
    </CardBase>
  );
}
