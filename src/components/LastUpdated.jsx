import { useState, useEffect } from 'react';
import { relativeTime, formatDateTime } from '../utils/formatters.js';
import { STALE_MS } from '../config.js';

export default function LastUpdated({ dateTime, provisional, style }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!dateTime) return;
    setLabel(relativeTime(dateTime));
    const id = setInterval(() => setLabel(relativeTime(dateTime)), 30000);
    return () => clearInterval(id);
  }, [dateTime]);

  const isStale = dateTime && (Date.now() - new Date(dateTime).getTime() > STALE_MS);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', ...style }}>
      {dateTime && (
        <span
          title={formatDateTime(dateTime)}
          style={{ fontSize: '0.8rem', opacity: 0.75 }}
        >
          Updated {label}
        </span>
      )}
      {provisional && (
        <span style={{
          fontSize: '0.7rem',
          padding: '1px 7px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.15)',
          fontWeight: 600,
        }}>
          Provisional
        </span>
      )}
      {isStale && (
        <span style={{
          fontSize: '0.7rem',
          padding: '1px 7px',
          borderRadius: 999,
          background: 'rgba(255,150,0,0.3)',
          fontWeight: 600,
        }}>
          ⚠ Data may be delayed
        </span>
      )}
    </div>
  );
}
