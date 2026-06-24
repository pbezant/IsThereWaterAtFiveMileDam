import { motion, AnimatePresence } from 'framer-motion';
import styles from './RiverScene.module.css';
import Dam from './elements/Dam.jsx';
import Water from './elements/Water.jsx';
import RockyBed from './elements/RockyBed.jsx';
import Fish from './elements/Fish.jsx';
import Vegetation from './elements/Vegetation.jsx';

const skyColors = {
  dry:     '#D4A76A',
  low:     '#87CEEB',
  good:    '#4FC3F7',
  high:    '#546E7A',
  flood:   '#37474F',
  unknown: '#90A4AE',
};

const groundColors = {
  dry:     '#C4A060',
  low:     '#8D9E7E',
  good:    '#6D8B74',
  high:    '#546E7A',
  flood:   '#455A64',
  unknown: '#78909C',
};

export default function RiverScene({ statusKey, cfs, gageHeight }) {
  const sky = skyColors[statusKey] ?? skyColors.unknown;
  const ground = groundColors[statusKey] ?? groundColors.unknown;
  const isDry = statusKey === 'dry';
  const isFlood = statusKey === 'flood';
  const isHigh = statusKey === 'high';

  return (
    <div className={styles.wrapper} style={{ background: sky }}>
      <svg
        viewBox="0 0 600 280"
        className={styles.svg}
        role="img"
        aria-label={`Illustrated river scene showing ${statusKey} conditions at Five Mile Dam`}
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky} />
            <stop offset="100%" stopColor={sky} stopOpacity={0.6} />
          </linearGradient>
          <linearGradient id="ground-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ground} />
            <stop offset="100%" stopColor="#3E2E1E" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width={600} height={280} fill="url(#sky-grad)" />

        {/* Sun / Storm clouds */}
        <AnimatePresence mode="wait">
          {isDry ? (
            <motion.g key="sun"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <circle cx={520} cy={45} r={28} fill="#FFD54F" />
              {[0,45,90,135,180,225,270,315].map((deg, i) => {
                const rad = deg * Math.PI / 180;
                return (
                  <motion.line key={i}
                    x1={520 + Math.cos(rad) * 32} y1={45 + Math.sin(rad) * 32}
                    x2={520 + Math.cos(rad) * 42} y2={45 + Math.sin(rad) * 42}
                    stroke="#FFD54F" strokeWidth={2.5} strokeLinecap="round"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                  />
                );
              })}
            </motion.g>
          ) : isFlood ? (
            <motion.g key="storm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Dark storm clouds */}
              {[{cx:120,cy:40,rx:70,ry:30},{cx:200,cy:30,rx:55,ry:25},{cx:360,cy:45,rx:80,ry:32}].map((c,i) => (
                <motion.ellipse key={i} {...c} fill="#546E7A"
                  animate={{ cy: [c.cy, c.cy + 3, c.cy] }}
                  transition={{ duration: 3+i, repeat: Infinity }}
                />
              ))}
              {/* Lightning */}
              <motion.path d="M 300 55 L 290 80 L 300 80 L 288 105" fill="none"
                stroke="#FFD54F" strokeWidth={2.5} strokeLinecap="round"
                animate={{ opacity: [0, 1, 0, 0, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              />
            </motion.g>
          ) : (
            <motion.g key="clouds"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[{cx:100,cy:40,rx:50,ry:22},{cx:160,cy:35,rx:40,ry:18},{cx:400,cy:45,rx:60,ry:24}].map((c,i) => (
                <motion.ellipse key={i} {...c} fill="white" fillOpacity={0.7}
                  animate={{ cx: [c.cx, c.cx + 8, c.cx] }}
                  transition={{ duration: 8+i*2, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>

        {/* Ground / river banks */}
        <rect x={0} y={235} width={600} height={45} fill="url(#ground-grad)" />

        {/* Left bank */}
        <path d="M 0 235 Q 50 225 130 235 L 130 280 L 0 280 Z" fill={ground} opacity={0.7} />
        {/* Right bank */}
        <path d="M 600 235 Q 550 225 460 235 L 460 280 L 600 280 Z" fill={ground} opacity={0.7} />

        {/* Rocky riverbed (visible when dry/low) */}
        <RockyBed visible={statusKey === 'dry' || statusKey === 'low'} />

        {/* Vegetation on banks */}
        <Vegetation statusKey={statusKey} />

        {/* Dam structure */}
        <Dam />

        {/* Water */}
        <Water statusKey={statusKey} cfs={cfs} gageHeight={gageHeight} />

        {/* Warning flag on high/flood */}
        {(isHigh || isFlood) && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Flag pole */}
            <line x1={175} y1={185} x2={175} y2={220} stroke="#616161" strokeWidth={2} />
            {/* Warning flag */}
            <motion.polygon
              points="175,185 200,192 175,200"
              fill={isFlood ? '#B71C1C' : '#E65100'}
              animate={{ points: ['175,185 200,192 175,200', '175,185 198,193 175,200', '175,185 200,192 175,200'] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.g>
        )}

        {/* Swimmer silhouette for good flow */}
        {statusKey === 'good' && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.ellipse
              cx={180} cy={225} rx={10} ry={6}
              fill="#FFB74D" opacity={0.8}
              animate={{ cx: [170, 195, 170] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.g>
        )}

        {/* Fish */}
        <Fish statusKey={statusKey} />
      </svg>

      <div className={styles.hint}>Tap elements to explore</div>
    </div>
  );
}
