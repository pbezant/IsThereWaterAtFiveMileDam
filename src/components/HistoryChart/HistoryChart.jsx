import { useEffect, useState } from 'react';
import {
  Chart as ChartJS, LineController, LineElement, PointElement,
  LinearScale, Filler, Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from './HistoryChart.module.css';
import CardBase from '../cards/CardBase.jsx';

// Register only what the line chart needs (keeps the chart.js bundle small)
ChartJS.register(LineController, LineElement, PointElement, LinearScale, Filler, Tooltip);

function useDarkMode() {
  const [dark, setDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = e => setDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return dark;
}

function fmtTick(ms) {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtTooltipTitle(ms) {
  return new Date(ms).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function HistoryChart({ dischargeHistory, gageHistory }) {
  const [mode, setMode] = useState('discharge');

  const points = mode === 'discharge' ? dischargeHistory : gageHistory;
  const label = mode === 'discharge' ? 'Discharge (cfs)' : 'Gage Height (ft)';
  const unit = mode === 'discharge' ? 'cfs' : 'ft';
  const dark = useDarkMode();
  const color = dark ? '#64B5F6' : '#1565C0';
  const tickColor = dark ? '#a0aec0' : '#5a6678';

  // Use numeric timestamps for x — no date adapter needed
  const chartData = {
    datasets: [{
      label,
      data: (points ?? []).map(p => ({ x: new Date(p.t).getTime(), y: p.y })),
      borderColor: color,
      backgroundColor: `${color}22`,
      fill: true,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.3,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        grid: { display: false },
        ticks: {
          maxTicksLimit: 7,
          color: tickColor,
          font: { size: 11 },
          callback: (val) => fmtTick(val),
        },
      },
      y: {
        min: 0,
        grid: { color: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: tickColor, font: { size: 11 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: ctx => `${ctx.parsed.y.toFixed(2)} ${unit}`,
          title: ctxArr => fmtTooltipTitle(ctxArr[0].parsed.x),
        },
      },
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  const hasData = points?.length > 0;

  // Text alternative for the canvas
  let summary = 'No history data available';
  if (hasData) {
    const ys = points.map(p => p.y);
    const f = v => v.toFixed(unit === 'cfs' ? 0 : 2);
    summary = `${label} over the last 7 days: latest ${f(ys[ys.length - 1])} ${unit}, ` +
      `low ${f(Math.min(...ys))} ${unit}, high ${f(Math.max(...ys))} ${unit}.`;
  }

  return (
    <CardBase label="7-Day History">
      <div className={styles.container}>
        <div className={styles.toggleRow}>
          <button
            type="button"
            aria-pressed={mode === 'discharge'}
            className={`${styles.toggle} ${mode === 'discharge' ? styles.active : ''}`}
            onClick={() => setMode('discharge')}
          >
            Discharge (cfs)
          </button>
          <button
            type="button"
            aria-pressed={mode === 'gage'}
            className={`${styles.toggle} ${mode === 'gage' ? styles.active : ''}`}
            onClick={() => setMode('gage')}
          >
            Gage Height (ft)
          </button>
        </div>
        <div className={styles.chartWrap}>
          {hasData ? (
            <Line data={chartData} options={options} role="img" aria-label={summary} />
          ) : (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem',
            }}>
              No history data available
            </div>
          )}
        </div>
      </div>
    </CardBase>
  );
}
