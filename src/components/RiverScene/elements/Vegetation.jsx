import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ecoFacts = [
  'Bald cypress trees line the Blanco River banks.',
  'Pecan trees shade the swimming holes here.',
  'Native river cane provides habitat for wildlife.',
  'Hays County has 200+ bird species — bring binoculars!',
];

function Tree({ x, y, height, color, delay }) {
  return (
    <g>
      {/* Trunk */}
      <rect x={x - 3} y={y} width={6} height={height * 0.35} fill="#795548" />
      {/* Canopy */}
      <motion.ellipse
        cx={x} cy={y - height * 0.1}
        rx={height * 0.4} ry={height * 0.45}
        fill={color}
        animate={{ scaleX: [1, 1.03, 1], rotate: [-1, 1, -1] }}
        transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: `${x}px`, originY: `${y - height * 0.1}px` }}
      />
    </g>
  );
}

export default function Vegetation({ statusKey }) {
  const [factIdx, setFactIdx] = useState(null);

  const isDry = statusKey === 'dry' || statusKey === 'low';
  const leafColor = isDry ? '#8B7355' : '#2E7D32';
  const leafColor2 = isDry ? '#7B6345' : '#388E3C';
  const leafColor3 = isDry ? '#6B5335' : '#1B5E20';

  return (
    <g style={{ cursor: 'pointer' }} onClick={() => setFactIdx(i => (i == null ? 0 : (i + 1) % ecoFacts.length))}>
      {/* Left bank trees */}
      <Tree x={30}  y={200} height={60} color={leafColor}  delay={0} />
      <Tree x={70}  y={195} height={70} color={leafColor2} delay={0.5} />
      <Tree x={110} y={205} height={50} color={leafColor3} delay={1} />

      {/* Right bank trees */}
      <Tree x={510} y={200} height={65} color={leafColor}  delay={0.3} />
      <Tree x={550} y={193} height={75} color={leafColor2} delay={0.8} />
      <Tree x={585} y={202} height={55} color={leafColor3} delay={1.3} />

      {/* Bank grass / reeds */}
      {[140, 155, 168].map((x, i) => (
        <motion.line key={i}
          x1={x} y1={235} x2={x + (i - 1) * 3} y2={215}
          stroke={leafColor} strokeWidth={2} strokeLinecap="round"
          animate={{ x2: [x + (i-1)*3 - 3, x + (i-1)*3 + 3, x + (i-1)*3 - 3] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Eco fact tooltip */}
      <AnimatePresence>
        {factIdx != null && (
          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <rect x={130} y={145} width={200} height={46} rx={8}
              fill="#1a202c" fillOpacity={0.92} />
            <text x={230} y={165} fontSize={9} textAnchor="middle" fill="white">
              {ecoFacts[factIdx]}
            </text>
            <text x={230} y={180} fontSize={8} textAnchor="middle" fill="#607D8B">
              Tap for another fact
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}
