import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function CardBase({ label, children, expandedContent, className = '', style = {} }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ y: -4, boxShadow: 'var(--shadow-card-hover)', transition: { duration: 0.2 } }}
      onClick={expandedContent ? () => setExpanded(e => !e) : undefined}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--color-border)',
        cursor: expandedContent ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      {label && (
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: '0.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {label}
          {expandedContent && (
            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
              {expanded ? '▲' : '▼'}
            </span>
          )}
        </div>
      )}
      {children}
      <AnimatePresence>
        {expanded && expandedContent && (
          <motion.div
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
