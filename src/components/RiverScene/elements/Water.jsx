import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Water wave path helpers
function wavePath(y, amplitude, phase, w = 600) {
  const pts = [];
  for (let x = 0; x <= w; x += 10) {
    const wy = y + Math.sin((x / w) * Math.PI * 4 + phase) * amplitude;
    pts.push(`${x},${wy}`);
  }
  return `M0,${y + amplitude} Q${pts.join(' ')} L${w},280 L0,280 Z`;
}

export default function Water({ statusKey, cfs, gageHeight }) {
  const [showTip, setShowTip] = useState(false);

  const waterLevels = {
    dry: null,
    low: 245,
    good: 215,
    high: 200,
    flood: 180,
    unknown: null,
  };

  const waterColors = {
    low:   ['#8BC8E8', '#6EB0D4'],
    good:  ['#2196F3', '#1565C0'],
    high:  ['#1565C0', '#0D47A1'],
    flood: ['#0D47A1', '#0a3572'],
  };

  const baseY = waterLevels[statusKey];
  const colors = waterColors[statusKey] ?? waterColors.good;
  const amplitude = statusKey === 'flood' ? 8 : statusKey === 'high' ? 5 : 3;

  if (!baseY) return null;

  return (
    <g style={{ cursor: 'pointer' }} onClick={() => setShowTip(v => !v)}>
      {/* Back wave */}
      <motion.path
        d={wavePath(baseY + 6, amplitude * 0.7, 0)}
        fill={colors[1]}
        fillOpacity={0.6}
        animate={{ d: [
          wavePath(baseY + 6, amplitude * 0.7, 0),
          wavePath(baseY + 6, amplitude * 0.7, Math.PI),
          wavePath(baseY + 6, amplitude * 0.7, Math.PI * 2),
        ]}}
        transition={{ duration: statusKey === 'flood' ? 1.5 : statusKey === 'high' ? 2 : 3.5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Front wave */}
      <motion.path
        d={wavePath(baseY, amplitude, 0)}
        fill={colors[0]}
        fillOpacity={0.85}
        animate={{ d: [
          wavePath(baseY, amplitude, 0),
          wavePath(baseY, amplitude, Math.PI),
          wavePath(baseY, amplitude, Math.PI * 2),
        ]}}
        transition={{ duration: statusKey === 'flood' ? 1.2 : statusKey === 'high' ? 1.8 : 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Ripple effects for good/high flow */}
      {(statusKey === 'good' || statusKey === 'high') && (
        <>
          {[80, 200, 420].map((x, i) => (
            <motion.circle
              key={i}
              cx={x} cy={baseY + 20}
              r={0}
              stroke="white"
              strokeWidth={1}
              fill="none"
              strokeOpacity={0.5}
              animate={{ r: [0, 20], strokeOpacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}
        </>
      )}

      {/* Flood particles */}
      {statusKey === 'flood' && (
        <>
          {[60, 150, 280, 400, 520].map((x, i) => (
            <motion.circle
              key={i}
              cx={x} cy={baseY + 15}
              r={2}
              fill="white"
              fillOpacity={0.6}
              animate={{
                cx: [x, x + 40],
                cy: [baseY + 15, baseY + 25],
                opacity: [0.6, 0],
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.25, ease: 'linear' }}
            />
          ))}
        </>
      )}

      {/* Info tooltip */}
      <AnimatePresence>
        {showTip && (
          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <rect x={160} y={130} width={180} height={52} rx={8}
              fill="#1a202c" fillOpacity={0.92} />
            <text x={250} y={150} fontSize={10} textAnchor="middle" fill="white" fontWeight="700">
              Blanco River at Five Mile Dam
            </text>
            <text x={250} y={165} fontSize={9} textAnchor="middle" fill="#90A4AE">
              {cfs != null ? `${Math.round(cfs)} cfs` : '—'}{gageHeight != null ? ` · ${gageHeight.toFixed(2)} ft` : ''}
            </text>
            <text x={250} y={178} fontSize={8} textAnchor="middle" fill="#607D8B">
              Tap to dismiss
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}
