import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Dam({ onClick }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <g style={{ cursor: 'pointer' }} onClick={() => setShowTip(v => !v)}>
      {/* Dam face */}
      <motion.rect
        x={300} y={190} width={60} height={80} rx={3}
        fill="#8D8070" stroke="#6D6050" strokeWidth={2}
        whileHover={{ fill: '#A09080' }}
      />
      {/* Stone texture */}
      {[0, 1, 2, 3].map(row =>
        [0, 1].map(col => (
          <rect
            key={`${row}-${col}`}
            x={304 + col * 26} y={198 + row * 18}
            width={22} height={14} rx={1}
            fill="none" stroke="#6D6050" strokeWidth={0.8} opacity={0.6}
          />
        ))
      )}
      {/* Dam crest */}
      <motion.rect
        x={295} y={182} width={70} height={12} rx={2}
        fill="#A09080" stroke="#6D6050" strokeWidth={1.5}
        whileHover={{ fill: '#B0A090' }}
      />
      {/* 1931 text */}
      <text x={330} y={248} fontSize={8} textAnchor="middle" fill="#5D4E40" fontWeight="600">1931</text>

      {/* Tooltip */}
      <AnimatePresence>
        {showTip && (
          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <rect x={180} y={130} width={160} height={48} rx={8}
              fill="#1a202c" fillOpacity={0.92} />
            <text x={260} y={150} fontSize={10} textAnchor="middle" fill="white" fontWeight="700">
              Five Mile Dam
            </text>
            <text x={260} y={165} fontSize={9} textAnchor="middle" fill="#90A4AE">
              Built 1931 · Stone &amp; concrete
            </text>
            <text x={260} y={176} fontSize={8} textAnchor="middle" fill="#607D8B">
              Tap to dismiss
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}
