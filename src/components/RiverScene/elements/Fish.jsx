import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const facts = [
  'Guadalupe bass are native to the Blanco River!',
  'Sunfish love the warm, clear water here.',
  'Catfish lurk in the deep pools near the dam.',
  'The Blanco supports native freshwater mussels.',
  'Texas cichlids can be spotted in slow sections.',
];

export default function Fish({ statusKey }) {
  const [factIdx, setFactIdx] = useState(null);

  function cycle() {
    setFactIdx(i => (i == null ? 0 : (i + 1) % facts.length));
  }

  const isWater = statusKey === 'good' || statusKey === 'high' || statusKey === 'flood';
  const isDry = statusKey === 'dry';

  if (!isWater && !isDry) return null;

  const y = isDry ? 248 : 225;
  const fill = isDry ? '#8B4513' : '#FFD54F';
  const stroke = isDry ? '#5D2F0B' : '#F9A825';

  return (
    <g style={{ cursor: 'pointer' }} onClick={cycle} title="Click for fun fish fact!">
      {/* Fish body */}
      <motion.ellipse
        cx={450} cy={y}
        rx={22} ry={10}
        fill={fill} stroke={stroke} strokeWidth={1.5}
        animate={isDry
          ? { cy: [y, y - 8, y], rotate: [0, 15, 0] }
          : { cx: [430, 470, 430] }
        }
        transition={{ duration: isDry ? 1.5 : 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Tail */}
      <motion.path
        d={`M${450 - 22},${y} L${450 - 36},${y - 8} L${450 - 36},${y + 8} Z`}
        fill={fill}
        animate={isDry
          ? { cy: [y, y - 8, y] }
          : { cx: [430, 470, 430] }
        }
        transition={{ duration: isDry ? 1.5 : 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Eye */}
      <circle cx={460} cy={y - 2} r={2} fill="white" />
      <circle cx={461} cy={y - 2} r={1} fill="#333" />

      {/* Jumping arc for dry state */}
      {isDry && (
        <motion.path
          d="M 430 260 Q 450 230 470 260"
          fill="none"
          stroke="#8B4513"
          strokeWidth={1}
          strokeDasharray="3,3"
          opacity={0.4}
        />
      )}

      {/* Fact bubble */}
      <AnimatePresence>
        {factIdx != null && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ originX: '450px', originY: `${y - 30}px` }}
          >
            <rect x={310} y={y - 60} width={190} height={36} rx={8}
              fill="#1a202c" fillOpacity={0.92} />
            <text x={405} y={y - 43} fontSize={9} textAnchor="middle" fill="white">
              {facts[factIdx]}
            </text>
            <text x={405} y={y - 30} fontSize={8} textAnchor="middle" fill="#607D8B">
              Tap for another fact
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}
