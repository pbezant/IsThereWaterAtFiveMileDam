import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, useReducedMotion, animate } from 'framer-motion';

// Counts up to `target`. The visible digits are hidden from assistive tech (so it never
// announces "0"); a visually-hidden copy carries the final value instead.
export default function AnimatedNumber({ target, decimals = 0 }) {
  const reduce = useReducedMotion();
  const count = useMotionValue(target ?? 0);
  const format = v => (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString());
  const display = useTransform(count, format);
  useEffect(() => {
    if (target == null) return;
    if (reduce) { count.set(target); return; }
    const ctrl = animate(count, target, { duration: 1.1, ease: 'easeOut' });
    return ctrl.stop;
  }, [target, count, reduce]);
  if (target == null) return <span>—</span>;
  return (
    <>
      <motion.span aria-hidden="true">{display}</motion.span>
      <span className="visually-hidden">{format(target)}</span>
    </>
  );
}
