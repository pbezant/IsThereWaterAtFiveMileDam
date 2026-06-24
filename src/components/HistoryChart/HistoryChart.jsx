import { useState } from 'react';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import styles from './HistoryChart.module.css';
import CardBase from '../cards/CardBase.jsx';

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
  const color = '#1565C0';

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
          color: '#718096',
          font: { size: 11 },
          callback: (val) => fmtTick(val),
        },
      },
      y: {
        min: 0,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#718096', font: { size: 11 } },
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

  return (
    <CardBase label="7-Day History">
      <div className={styles.container}>
        <div className={styles.toggleRow}>
          <button
            className={`${styles.toggle} ${mode === 'discharge' ? styles.active : ''}`}
            onClick={() => setMode('discharge')}
          >
            Discharge (cfs)
          </button>
          <button
            className={`${styles.toggle} ${mode === 'gage' ? styles.active : ''}`}
            onClick={() => setMode('gage')}
          >
            Gage Height (ft)
          </button>
        </div>
        <div className={styles.chartWrap}>
          {hasData ? (
            <Line data={chartData} options={options} />
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
