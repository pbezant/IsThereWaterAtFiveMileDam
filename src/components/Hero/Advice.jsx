import { motion } from 'framer-motion';
import { activityAdvice } from '../../utils/status.js';
import styles from './Hero.module.css';

const ICON = { ok: '✓', caution: '!', no: '✕' };
const WORD = { ok: 'OK', caution: 'Caution', no: 'Not advised' };

// What the reading means for each activity, in plain English. Icon + word + note,
// never colour alone.
export default function Advice({ statusKey }) {
  const items = activityAdvice(statusKey);
  if (!items) return null;
  return (
    <motion.ul
      key={statusKey}
      className={styles.advice}
      aria-label="What this means for you"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {items.map(a => (
        <li key={a.id} className={`${styles.adviceItem} ${styles['advice_' + a.level]}`}>
          <span className={styles.adviceIcon} aria-hidden="true">{ICON[a.level]}</span>
          <span className={styles.adviceText}>
            <span className={styles.adviceLabel}>{a.label}</span>
            <span className={styles.adviceNote}>
              <span className="visually-hidden">{WORD[a.level]}: </span>{a.note}
            </span>
          </span>
        </li>
      ))}
    </motion.ul>
  );
}
