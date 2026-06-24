import { motion } from 'framer-motion';

const rocks = [
  { cx: 60,  cy: 248, r: 14, fill: '#9E9E9E' },
  { cx: 100, cy: 255, r: 10, fill: '#BDBDBD' },
  { cx: 150, cy: 243, r: 18, fill: '#8D8D8D' },
  { cx: 200, cy: 252, r: 12, fill: '#757575' },
  { cx: 250, cy: 246, r: 16, fill: '#BDBDBD' },
  { cx: 380, cy: 250, r: 13, fill: '#9E9E9E' },
  { cx: 430, cy: 244, r: 19, fill: '#757575' },
  { cx: 480, cy: 253, r: 11, fill: '#BDBDBD' },
  { cx: 530, cy: 247, r: 15, fill: '#9E9E9E' },
  { cx: 570, cy: 255, r: 9,  fill: '#BDBDBD' },
];

const cracks = [
  { x1: 80, y1: 260, x2: 120, y2: 265 },
  { x1: 200, y1: 255, x2: 230, y2: 268 },
  { x1: 350, y1: 258, x2: 370, y2: 265 },
  { x1: 450, y1: 260, x2: 490, y2: 268 },
];

export default function RockyBed({ visible = true }) {
  if (!visible) return null;
  return (
    <g>
      {/* Dry riverbed floor */}
      <motion.rect
        x={0} y={250} width={600} height={30}
        fill="#C4A882"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Mud cracks */}
      {cracks.map((c, i) => (
        <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
          stroke="#A07850" strokeWidth={1} opacity={0.5} />
      ))}
      {/* Rocks */}
      {rocks.map((r, i) => (
        <ellipse key={i} cx={r.cx} cy={r.cy} rx={r.r} ry={r.r * 0.55}
          fill={r.fill} stroke="#616161" strokeWidth={0.8} />
      ))}
      {/* Small pebbles */}
      {[90, 160, 220, 290, 360, 410, 460, 510, 555].map((x, i) => (
        <circle key={i} cx={x} cy={260 + (i % 3) * 3} r={3} fill="#BDBDBD" opacity={0.7} />
      ))}
    </g>
  );
}
