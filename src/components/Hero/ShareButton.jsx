import { useState } from 'react';
import styles from './Hero.module.css';

export default function ShareButton({ headline, cfs }) {
  const [msg, setMsg] = useState('');

  async function share() {
    const text = `${headline ?? 'Five Mile Dam conditions'}${cfs != null ? ` (${Math.round(cfs)} cfs)` : ''}`;
    const data = { title: 'Is there water at Five Mile Dam?', text, url: window.location.href };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(`${text} ${data.url}`);
      setMsg('Link copied');
    } catch (e) {
      if (e?.name === 'AbortError') return; // user closed the share sheet
      setMsg('Couldn’t share');
    }
    setTimeout(() => setMsg(''), 2200);
  }

  return (
    <>
      <button type="button" className={styles.pill} onClick={share}>
        <span aria-hidden="true">↗</span> Share
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">{msg}</span>
      {msg && <span className={styles.toast} aria-hidden="true">{msg}</span>}
    </>
  );
}
