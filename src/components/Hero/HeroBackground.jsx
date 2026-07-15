import { motion, AnimatePresence } from 'framer-motion';
import { KYLE_STAGES } from '../../config.js';
import { weatherCodeToCondition } from '../../utils/formatters.js';

const SKY_TOP = {
  dry:     '#9A5C1A',
  low:     '#2E6E96',
  good:    '#0D47A1',
  high:    '#37474F',
  flood:   '#0D1B22',
  unknown: '#37505D',
};

const SKY_BOT = {
  dry:     '#C98C35',
  low:     '#6ABBE0',
  good:    '#3A8FD4',
  high:    '#546E7A',
  flood:   '#1F3340',
  unknown: '#536B78',
};

const W_FRONT = {
  low:     '#4BAED8',
  good:    '#1255A8',
  high:    '#6D4C41',
  flood:   '#3B1A02',
  unknown: '#537080',
};

const W_BACK = {
  low:     '#348EC0',
  good:    '#0A3580',
  high:    '#4E342E',
  flood:   '#250F01',
  unknown: '#3D5668',
};

const SVG_WATER_TOP = 50;   // Y when 100% full (water over the dam)
const SVG_WATER_BOT = 960;  // Y when 0% (dry — below viewport)

// Percentage of how full the dam is: 0% = dry bed, 100% = flowing over the dam
function gageToY(ft) {
  if (ft == null) return SVG_WATER_BOT;
  const pct = Math.min(1, Math.max(0,
    (ft - KYLE_STAGES.DRY_FT) / (KYLE_STAGES.DAM_OVERFLOW_FT - KYLE_STAGES.DRY_FT)
  ));
  return SVG_WATER_BOT - pct * (SVG_WATER_BOT - SVG_WATER_TOP);
}

const W_AMP   = { dry: 0, low: 8, good: 20, high: 32, flood: 50, unknown: 5 };
const W_SPEED = { dry: 0, low: 5.5, good: 3.5, high: 2.0, flood: 1.1, unknown: 6.5 };

const SEG = 360; // wave segment width in SVG units

// Build a water wave path: tiles from -SEG to (n*SEG), then closes to bottom
function buildWave(y, amp, segments = 7) {
  let d = `M -${SEG} ${y}`;
  for (let i = 0; i < segments; i++) {
    const x = -SEG + i * SEG;
    d += ` C ${x + SEG * 0.25} ${y - amp} ${x + SEG * 0.75} ${y + amp} ${x + SEG} ${y}`;
  }
  const endX = -SEG + segments * SEG;
  d += ` L ${endX} 1000 L -${SEG} 1000 Z`;
  return d;
}

export default function HeroBackground({ statusKey, gageHeight, weatherCode, precipProbability }) {
  const sk = statusKey ?? 'unknown';
  const isDry = sk === 'dry';

  const condition = weatherCodeToCondition(weatherCode);
  const isSnowy  = condition === 'snow';
  const isStormy = condition === 'storm';
  // Show rain based on forecast chance of precipitation, not just the current-instant weather code
  const isRainy  = !isStormy && !isSnowy && (precipProbability ?? 0) > 50;
  const isSunny  = !isRainy && condition === 'clear';
  const isCloudy = !isRainy && (condition === 'cloudy' || condition === 'fog' || condition === 'rain');

  const wl  = gageToY(gageHeight);
  const amp = W_AMP[sk]   ?? 5;
  const spd = W_SPEED[sk] ?? 4;

  const frontWave = buildWave(wl, amp);
  const backWave  = buildWave(wl + amp * 0.45, amp * 0.6);

  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hbg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={SKY_TOP[sk]} />
          <stop offset="100%" stopColor={SKY_BOT[sk]} />
        </linearGradient>
        <linearGradient id="hbg-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={W_FRONT[sk] ?? 'transparent'} />
          <stop offset="100%" stopColor={W_BACK[sk]  ?? 'transparent'} />
        </linearGradient>
        <linearGradient id="hbg-vignette" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="black" stopOpacity="0.0" />
          <stop offset="75%"  stopColor="black" stopOpacity="0.15" />
          <stop offset="100%" stopColor="black" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width={1440} height={900} fill="url(#hbg-sky)" />

      <AnimatePresence mode="sync">

        {/* Sun — clear weather */}
        {isSunny && (
          <motion.g key="sun"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.circle cx={1080} cy={155} r={135} fill="#FFD54F" fillOpacity={0.13}
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
            <motion.circle cx={1080} cy={155} r={95} fill="#FFD54F" fillOpacity={0.9}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.g>
        )}

        {/* Clouds — cloudy/foggy weather */}
        {isCloudy && (
          <motion.g key="clouds"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {[
              { cx: 180, cy: 100, rx: 140, ry: 55 },
              { cx: 360, cy:  78, rx:  90, ry: 38 },
              { cx: 820, cy: 118, rx: 120, ry: 48 },
              { cx: 1220, cy: 90, rx: 130, ry: 52 },
            ].map((c, i) => (
              <motion.ellipse key={i} {...c} fill="white" fillOpacity={condition === 'fog' ? 0.8 : 0.62}
                animate={{ cx: [c.cx, c.cx + 18, c.cx] }}
                transition={{ duration: 10 + i * 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </motion.g>
        )}

        {/* Rain clouds — rainy weather (no thunder) */}
        {isRainy && (
          <motion.g key="rain-clouds"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {[
              { cx: 180,  cy: 80,  rx: 170, ry: 62 },
              { cx: 520,  cy: 65,  rx: 150, ry: 55 },
              { cx: 900,  cy: 88,  rx: 190, ry: 68 },
              { cx: 1240, cy: 70,  rx: 160, ry: 60 },
            ].map((c, i) => (
              <motion.ellipse key={i} {...c} fill="#78909C" fillOpacity={0.78}
                animate={{ cy: [c.cy, c.cy + 8, c.cy] }}
                transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </motion.g>
        )}

        {/* Storm clouds — thunderstorms */}
        {isStormy && (
          <motion.g key="storm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {[
              { cx: 180,  cy: 70,  rx: 190, ry: 72 },
              { cx: 520,  cy: 55,  rx: 165, ry: 62 },
              { cx: 900,  cy: 80,  rx: 210, ry: 78 },
              { cx: 1240, cy: 60,  rx: 175, ry: 68 },
            ].map((c, i) => (
              <motion.ellipse key={i} {...c}
                fill="#1E2D35"
                fillOpacity={0.92}
                animate={{ cy: [c.cy, c.cy + 10, c.cy] }}
                transition={{ duration: 3.5 + i * 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}

            <motion.path
              d="M 700 45 L 680 135 L 702 135 L 675 235"
              stroke="#FFD54F" strokeWidth={3.5} fill="none" strokeLinecap="round"
              animate={{ opacity: [0, 0, 0, 1, 0, 0, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            />
          </motion.g>
        )}

      </AnimatePresence>

      {/* Precipitation overlay — drawn last so it falls in front of the whole scene */}
      <AnimatePresence>
        {(isRainy || isStormy) && (
          <motion.g key={`precip-${condition}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {Array.from({ length: isStormy ? 26 : 16 }).map((_, i) => {
              const count = isStormy ? 26 : 16;
              const x1 = i * (1440 / count);
              return (
                <motion.g key={i}
                  initial={{ y: -75 }}
                  animate={{ y: 880 }}
                  transition={{
                    duration: isStormy ? 0.8 : 1.3, repeat: Infinity, ease: 'linear',
                    delay: ((i * 0.06) % 0.8),
                  }}
                >
                  <line x1={x1} y1={0} x2={x1 - 18} y2={75}
                    stroke="rgba(140, 195, 240, 0.45)" strokeWidth={1.5} />
                </motion.g>
              );
            })}
          </motion.g>
        )}

        {isSnowy && (
          <motion.g key="snow"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {Array.from({ length: 40 }).map((_, i) => {
              const x = (i * 37) % 1440;
              const r = 2 + (i % 3);
              return (
                <motion.circle key={i} cx={x} r={r}
                  fill="white" fillOpacity={0.85}
                  initial={{ cy: -20 }}
                  animate={{ cy: 900, cx: [x, x + 30, x - 20, x] }}
                  transition={{
                    cy: { duration: 8 + (i % 5), repeat: Infinity, ease: 'linear', delay: (i * 0.2) % 8 },
                    cx: { duration: 4 + (i % 3), repeat: Infinity, ease: 'easeInOut' },
                  }}
                />
              );
            })}
          </motion.g>
        )}
      </AnimatePresence>

      {/* River banks / ground silhouette */}
      <motion.path
        d="M -20 840 Q 300 790 560 818 Q 780 842 1000 810 Q 1220 782 1460 820 L 1460 960 L -20 960 Z"
        fill="#5D4037"
        animate={{ opacity: isDry ? 0.92 : 0.45, fillOpacity: isDry ? 0.92 : 0.45 }}
        transition={{ duration: 1 }}
      />

      {/* Dry riverbed rocks */}
      <AnimatePresence>
        {isDry && (
          <motion.g key="rocks"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {[280, 450, 600, 720, 870, 1020, 1160, 1300].map((x, i) => (
              <ellipse key={i}
                cx={x} cy={870 + (i % 3) * 8}
                rx={20 + (i % 4) * 7} ry={11 + (i % 3) * 4}
                fill="#9E9E9E" fillOpacity={0.65}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>

      {/* Back water wave */}
      <AnimatePresence>
        {!isDry && (
          <motion.g key={`back-${sk}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.g
              animate={{ x: [0, -SEG] }}
              transition={{ duration: spd * 1.55, repeat: Infinity, ease: 'linear' }}
            >
              <path d={backWave} fill={W_BACK[sk]} fillOpacity={0.72} />
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Front water wave */}
      <AnimatePresence>
        {!isDry && (
          <motion.g key={`front-${sk}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.g
              animate={{ x: [0, -SEG] }}
              transition={{ duration: spd, repeat: Infinity, ease: 'linear' }}
            >
              <path d={frontWave} fill="url(#hbg-water)" />
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Bottom vignette for text legibility */}
      <rect width={1440} height={900} fill="url(#hbg-vignette)" pointerEvents="none" />
    </svg>
  );
}
