import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const headerStyle = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  marginBottom: '0.6rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  textAlign: 'left',
};

export default function CardBase({ label, children, expandedContent, className = '', style = {} }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const expandable = Boolean(expandedContent);
  const toggle = () => setExpanded(e => !e);

  // Mouse/touch users can tap anywhere on the card; keyboard users get the header button.
  const onCardClick = expandable
    ? e => { if (!e.target.closest('a, button')) toggle(); }
    : undefined;

  const chevron = expandable && (
    <span
      aria-hidden="true"
      style={{
        fontSize: '0.8rem', opacity: 0.6, display: 'inline-block',
        transform: expanded ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.25s ease',
      }}
    >
      ▼
    </span>
  );

  return (
    <motion.div
      variants={cardVariants}
      whileHover={expandable ? { y: -4, boxShadow: 'var(--shadow-card-hover)', transition: { duration: 0.2 } } : undefined}
      onClick={onCardClick}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--color-border)',
        cursor: expandable ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {label && (expandable ? (
        <button
          type="button"
          className="card-header-btn"
          style={headerStyle}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={toggle}
        >
          {label}
          {chevron}
        </button>
      ) : (
        <div style={headerStyle}>{label}</div>
      ))}
      {children}
      <AnimatePresence initial={false}>
        {expanded && expandable && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}
          >
            {expandedContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
