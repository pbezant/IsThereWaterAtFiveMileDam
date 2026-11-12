import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { KYLE_STAGES } from '../../config.js';
import { weatherCodeToCondition } from '../../utils/formatters.js';

/* ------------------------------------------------------------------ *
 * Canvas hero scene.
 *
 * One <canvas>, one requestAnimationFrame loop, no per-element JS
 * animation. The loop stops when the hero is off-screen, the tab is
 * hidden, or the visitor prefers reduced motion (then a single still
 * frame is drawn). Everything eases toward a "target" derived from props,
 * so status/weather changes cross-fade instead of snapping.
 *
 * The motion is information:
 *   - water height     = gage height (springs up, with a little overshoot)
 *   - wave speed/foam  = discharge in cfs (continuous, not bucketed)
 *   - wave size        = discharge, nudged by the trend
 *   - clouds/rain/snow = current weather and rain chance
 * ------------------------------------------------------------------ */

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

const SKY_TOP = { dry: '#9A5C1A', low: '#2E6E96', good: '#0D47A1', high: '#37474F', flood: '#0D1B22', unknown: '#37505D' };
const SKY_BOT = { dry: '#E0A04A', low: '#6ABBE0', good: '#3A8FD4', high: '#546E7A', flood: '#1F3340', unknown: '#536B78' };
const W_FRONT = { dry: '#6D4C41', low: '#4BAED8', good: '#1255A8', high: '#6D4C41', flood: '#3B1A02', unknown: '#537080' };
const W_BACK  = { dry: '#4E342E', low: '#348EC0', good: '#0A3580', high: '#4E342E', flood: '#250F01', unknown: '#3D5668' };
const OVERCAST = hex('#2b3a42');

const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const clamp01 = v => Math.min(1, Math.max(0, v));

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 0 (barely moving) .. 1 (flood) — logarithmic so 50 vs 400 cfs both read clearly
const flowFactor = cfs => (cfs == null ? 0.1 : clamp01(Math.log10(1 + Math.max(0, cfs)) / Math.log10(1001)));

function levelFor(ft, statusKey) {
  if (statusKey === 'dry') return 0;
  if (ft == null) return statusKey === 'unknown' ? 0.1 : 0;
  return clamp01((ft - KYLE_STAGES.DRY_FT) / (KYLE_STAGES.DAM_OVERFLOW_FT - KYLE_STAGES.DRY_FT));
}

function targetsFrom({ statusKey, cfs, gageHeight, trendDir, weatherCode, precipProbability }) {
  const sk = statusKey ?? 'unknown';
  const cond = weatherCodeToCondition(weatherCode);
  const storm = cond === 'storm';
  const snow = cond === 'snow';
  const rain = storm ? 1 : snow ? 0 : cond === 'rain' ? 0.8 : (precipProbability ?? 0) > 50 ? 0.55 : 0;
  const overcast = storm ? 1 : rain > 0 ? 0.7 : cond === 'fog' ? 0.8 : snow ? 0.6 : cond === 'cloudy' ? 0.35 : 0;
  const f = flowFactor(cfs);
  const trendK = trendDir === 'rising' ? 1.15 : trendDir === 'falling' ? 0.9 : 1;

  const sky = (palette) => mix(hex(palette[sk] ?? palette.unknown), OVERCAST, 0.4 * overcast);
  return {
    skyTop: sky(SKY_TOP),
    skyBot: sky(SKY_BOT),
    w1: hex(W_FRONT[sk] ?? W_FRONT.unknown),
    w2: hex(W_BACK[sk] ?? W_BACK.unknown),
    level: levelFor(gageHeight, sk),
    amp: sk === 'dry' ? 0 : (3 + 22 * f) * trendK,
    speed: 26 + 300 * f,
    foam: clamp01((f - 0.45) / 0.45),
    sun: cond === 'clear' && sk !== 'flood' ? 1 : cond === 'cloudy' ? 0.3 : 0,
    cover: storm ? 1 : rain > 0 ? 0.9 : cond === 'fog' ? 1 : snow ? 0.8 : cond === 'cloudy' ? 0.65 : 0.18,
    dark: storm ? 1 : rain > 0 ? 0.55 : snow ? 0.15 : 0,
    rain,
    snow: snow ? 1 : 0,
    storm: storm ? 1 : 0,
    fog: cond === 'fog' ? 1 : 0,
    dry: sk === 'dry' ? 1 : 0,
  };
}

const SCALARS = ['amp', 'speed', 'foam', 'sun', 'cover', 'dark', 'rain', 'snow', 'storm', 'fog', 'dry'];
const COLORS = ['skyTop', 'skyBot', 'w1', 'w2'];

/* ---- pre-rendered cloud sprites (cheap to draw, soft edges) ---- */
function makeCloudSprite(color, seed) {
  const r = rng(seed);
  const w = 360, h = 150;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const blobs = [];
  for (let j = 0; j < 7; j++) blobs.push([46 + j * 44 + r() * 14, 88 + Math.sin(j * 1.3) * 10 + r() * 10, 34 + r() * 22]);
  for (let j = 0; j < 4; j++) blobs.push([100 + j * 62 + r() * 18, 60 + r() * 14, 30 + r() * 20]);
  for (const [x, y, rad] of blobs) {
    const grad = g.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, `rgba(${color},0.85)`);
    grad.addColorStop(0.55, `rgba(${color},0.45)`);
    grad.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  return c;
}

function makeCracks(seed) {
  const r = rng(seed);
  const lines = [];
  for (let i = 0; i < 26; i++) {
    let x = r(), y = 0.1 + r() * 0.9;
    const seg = [[x, y]];
    const n = 3 + Math.floor(r() * 4);
    for (let k = 0; k < n; k++) { x += (r() - 0.5) * 0.12; y += (r() - 0.35) * 0.1; seg.push([x, y]); }
    lines.push(seg);
  }
  return lines;
}

export default function HeroCanvas({
  statusKey, cfs, gageHeight, trendDir, weatherCode, precipProbability,
}) {
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();
  const stateRef = useRef(null);

  // Props -> animation targets (read by the loop every frame)
  useEffect(() => {
    const S = stateRef.current;
    const t = targetsFrom({ statusKey, cfs, gageHeight, trendDir, weatherCode, precipProbability });
    if (S) { S.target = t; S.redraw?.(); }
    else stateRef.current = { target: t };
  }, [statusKey, cfs, gageHeight, trendDir, weatherCode, precipProbability]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const S = stateRef.current ?? (stateRef.current = { target: targetsFrom({}) });

    // current (eased) values start at the "empty" state and settle toward target
    const t0 = S.target;
    const cur = { ...t0, level: 0, vel: 0 };
    for (const k of SCALARS) cur[k] = t0[k];
    for (const k of COLORS) cur[k] = [...t0[k]];
    cur.sun = 0; cur.cover = 0; cur.rain = 0; cur.snow = 0; cur.storm = 0; cur.fog = 0;

    let W = 0, H = 0, dpr = 1;
    let t = 0, raf = 0, last = 0;
    let inView = true, tabVisible = !document.hidden;
    let slow = 0, lowQ = false;
    let flash = 0, nextBolt = 3, bolt = null;

    const sprites = {
      light: [makeCloudSprite('255,255,255', 11), makeCloudSprite('255,255,255', 23), makeCloudSprite('255,255,255', 37)],
      dark: [makeCloudSprite('58,74,84', 11), makeCloudSprite('58,74,84', 23), makeCloudSprite('58,74,84', 37)],
      storm: [makeCloudSprite('26,38,46', 11), makeCloudSprite('26,38,46', 23), makeCloudSprite('26,38,46', 37)],
    };
    const R = rng(7);
    const clouds = Array.from({ length: 8 }, (_, i) => ({
      x: R(), y: 0.03 + R() * 0.24, s: 0.8 + R() * 0.9, v: 5 + R() * 11, k: i % 3, a: 0.55 + R() * 0.4,
    }));
    const cracks = makeCracks(5);
    const rocks = Array.from({ length: 9 }, () => ({ x: R(), y: R(), r: 14 + R() * 26 }));
    const MAXP = 150;
    const parts = Array.from({ length: MAXP }, () => ({ x: R(), y: R(), z: 0.5 + R() * 0.5, p: R() * 6 }));
    const ripples = [];

    function resize() {
      const box = canvas.parentElement.getBoundingClientRect();
      W = Math.max(1, Math.round(box.width));
      H = Math.max(1, Math.round(box.height));
      const cap = W < 600 ? 1.5 : 2;
      dpr = Math.min(window.devicePixelRatio || 1, cap) * (lowQ ? 0.75 : 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function step(dt) {
      const T = S.target;
      const k = 1 - Math.exp(-dt * 2.2);
      for (const key of SCALARS) cur[key] = lerp(cur[key], T[key], k);
      for (const key of COLORS) cur[key] = mix(cur[key], T[key], k);
      // water level: slightly under-damped spring -> rises with a little overshoot
      const acc = (T.level - cur.level) * 22 - cur.vel * 6.5;
      cur.vel += acc * dt;
      cur.level += cur.vel * dt;
    }

    function snap() {
      const T = S.target;
      for (const key of SCALARS) cur[key] = T[key];
      for (const key of COLORS) cur[key] = [...T[key]];
      cur.level = T.level; cur.vel = 0;
    }

    function waterTop() {
      return H * (1.04 - clamp01(cur.level) * 0.58);
    }

    function waveY(x, base, amp, lambda, speed, phase) {
      const k = (Math.PI * 2) / lambda;
      const p = (x + speed * t) * k + phase;
      return base + Math.sin(p) * amp + Math.sin(p * 2.3 + 1.7) * amp * 0.28;
    }

    function drawSky() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgb(cur.skyTop));
      g.addColorStop(1, rgb(cur.skyBot));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      if (cur.sun > 0.01) {
        const cx = W * 0.78, cy = H * 0.17, base = Math.min(W, H) * 0.34;
        const pulse = 1 + Math.sin(t * 0.5) * 0.04;
        const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * pulse);
        g2.addColorStop(0, `rgba(255,236,160,${0.55 * cur.sun})`);
        g2.addColorStop(0.4, `rgba(255,214,120,${0.18 * cur.sun})`);
        g2.addColorStop(1, 'rgba(255,214,120,0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = `rgba(255,246,205,${0.92 * clamp01((cur.sun - 0.5) * 2)})`;
        ctx.beginPath(); ctx.arc(cx, cy, base * 0.16, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawClouds() {
      const visible = Math.round(clouds.length * clamp01(cur.cover));
      for (let i = 0; i < visible; i++) {
        const c = clouds[i];
        const spriteW = 360 * c.s;
        const span = W + spriteW * 2;
        const x = ((c.x * span + t * c.v) % span) - spriteW;
        const y = c.y * H;
        const h = 150 * c.s;
        const a = c.a * clamp01(cur.cover);
        const dark = clamp01(cur.dark);
        const storm = clamp01(cur.storm);
        ctx.globalAlpha = a * (1 - dark);
        if (ctx.globalAlpha > 0.01) ctx.drawImage(sprites.light[c.k], x, y, spriteW, h);
        ctx.globalAlpha = a * dark * (1 - storm);
        if (ctx.globalAlpha > 0.01) ctx.drawImage(sprites.dark[c.k], x, y, spriteW, h);
        ctx.globalAlpha = a * storm;
        if (ctx.globalAlpha > 0.01) ctx.drawImage(sprites.storm[c.k], x, y, spriteW, h);
      }
      ctx.globalAlpha = 1;
      if (cur.fog > 0.02) {
        ctx.fillStyle = `rgba(226,234,238,${0.3 * cur.fog})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    function drawGroundAndDry(yTop) {
      // river banks / bed
      const gy = H * 0.9;
      const g = ctx.createLinearGradient(0, gy - 40, 0, H);
      g.addColorStop(0, 'rgba(93,64,55,0.55)');
      g.addColorStop(1, 'rgba(62,39,35,0.9)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, gy);
      ctx.bezierCurveTo(W * 0.25, gy - 40, W * 0.45, gy + 10, W * 0.62, gy - 8);
      ctx.bezierCurveTo(W * 0.8, gy - 30, W * 0.92, gy - 6, W, gy + 6);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      if (cur.dry > 0.02) {
        const top = H * 0.8;
        const bh = H - top;
        const bed = ctx.createLinearGradient(0, top, 0, H);
        bed.addColorStop(0, `rgba(150,104,60,${0.9 * cur.dry})`);
        bed.addColorStop(1, `rgba(88,58,40,${0.95 * cur.dry})`);
        ctx.fillStyle = bed;
        ctx.fillRect(0, top, W, bh);
        ctx.strokeStyle = `rgba(48,28,16,${0.5 * cur.dry})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (const seg of cracks) {
          ctx.moveTo(seg[0][0] * W, top + seg[0][1] * bh);
          for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i][0] * W, top + seg[i][1] * bh);
        }
        ctx.stroke();
        for (const rk of rocks) {
          const x = rk.x * W, y = top + (0.25 + rk.y * 0.7) * bh;
          ctx.fillStyle = `rgba(170,160,150,${0.7 * cur.dry})`;
          ctx.beginPath(); ctx.ellipse(x, y, rk.r, rk.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${0.14 * cur.dry})`;
          ctx.beginPath(); ctx.ellipse(x - rk.r * 0.2, y - rk.r * 0.15, rk.r * 0.5, rk.r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
        }
        // heat shimmer: faint wobbling bands over the bed
        ctx.strokeStyle = `rgba(255,236,200,${0.1 * cur.dry})`;
        ctx.lineWidth = 2;
        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          const y0 = top - 14 - b * 16;
          for (let x = 0; x <= W; x += 14) {
            const y = y0 + Math.sin(x * 0.03 + t * 1.6 + b) * 3;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    }

    function layerPath(base, amp, lambda, speed, phase) {
      ctx.beginPath();
      ctx.moveTo(0, H + 2);
      for (let x = 0; x <= W + 8; x += 8) ctx.lineTo(x, waveY(x, base, amp, lambda, speed, phase));
      ctx.lineTo(W + 8, H + 2);
      ctx.closePath();
    }

    function drawWater(yTop) {
      if (yTop >= H + 4) return;
      const lambda = Math.min(360, Math.max(180, W * 0.25));
      const amp = cur.amp * (H / 900);
      const sp = cur.speed;

      // back layer
      ctx.fillStyle = rgb(cur.w2, 0.75);
      layerPath(yTop + amp * 0.9, amp * 0.6, lambda * 1.4, sp * 0.6, 0);
      ctx.fill();
      // mid layer
      if (!lowQ) {
        ctx.fillStyle = rgb(mix(cur.w2, cur.w1, 0.5), 0.85);
        layerPath(yTop + amp * 0.45, amp * 0.8, lambda * 1.1, sp * 0.82, 2);
        ctx.fill();
      }
      // front layer, with a lighter surface fading into depth
      const g = ctx.createLinearGradient(0, yTop - amp, 0, H);
      g.addColorStop(0, rgb(mix(cur.w1, [255, 255, 255], 0.3)));
      g.addColorStop(0.4, rgb(mix(cur.w1, [255, 255, 255], 0.08)));
      g.addColorStop(1, rgb(cur.w2));
      ctx.fillStyle = g;
      layerPath(yTop, amp, lambda * 0.8, sp, 4);
      ctx.fill();

      // crest highlight + foam (more foam the faster the river)
      const crestA = 0.16 + 0.5 * cur.foam;
      ctx.strokeStyle = `rgba(255,255,255,${crestA})`;
      ctx.lineWidth = 1.5 + 2 * cur.foam;
      ctx.beginPath();
      for (let x = 0; x <= W + 8; x += 8) {
        const y = waveY(x, yTop, amp, lambda * 0.8, sp, 4);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      if (cur.foam > 0.05 && !lowQ) {
        ctx.fillStyle = `rgba(255,255,255,${0.35 * cur.foam})`;
        for (let x = 6; x < W; x += 22) {
          const y = waveY(x, yTop, amp, lambda * 0.8, sp, 4);
          const r = 1 + ((x * 7) % 3);
          ctx.fillRect(x + Math.sin(t * 3 + x) * 3, y + 2 + ((x * 13) % 5), r, r);
        }
      }
    }

    function drawPrecip(dt, yTop) {
      const rainN = Math.round(MAXP * (lowQ || W < 600 ? 0.5 : 1) * clamp01(cur.rain));
      const snowN = Math.round(MAXP * 0.45 * clamp01(cur.snow));
      if (rainN > 1) {
        const fall = (cur.storm > 0.5 ? 1100 : 760);
        ctx.strokeStyle = 'rgba(190,222,248,0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < rainN; i++) {
          const p = parts[i];
          p.y += fall * p.z * dt / H;
          p.x -= 0.0001 * fall * p.z * dt * 60;
          const len = 16 + 22 * p.z;
          if (p.y * H > Math.max(yTop, H * 0.55) + p.z * 40) {
            if (ripples.length < 18 && yTop < H) ripples.push({ x: p.x * W, y: Math.max(yTop, H * 0.55) + p.z * 40, a: 0.5, r: 2 });
            p.y = -0.05; p.x = Math.random() * 1.1;
          }
          if (p.x < -0.05) p.x += 1.1;
          const x = p.x * W, y = p.y * H;
          ctx.moveTo(x, y);
          ctx.lineTo(x - len * 0.16, y + len);
        }
        ctx.stroke();
      }
      if (snowN > 1) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        for (let i = 0; i < snowN; i++) {
          const p = parts[i];
          p.y += (48 * p.z * dt) / H * 1.2;
          if (p.y > 1.02) { p.y = -0.02; p.x = Math.random(); }
          const x = p.x * W + Math.sin(t * 0.8 + p.p) * 18;
          const y = p.y * H;
          const r = 1.2 + p.z * 2.2;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }

    function drawRipples(dt) {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 26 * dt; r.a -= 0.9 * dt;
        if (r.a <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(255,255,255,${r.a * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }

    function drawLightning(dt) {
      if (cur.storm < 0.5) { flash = 0; return; }
      nextBolt -= dt;
      if (nextBolt <= 0) {
        nextBolt = 3.5 + Math.random() * 6;
        flash = 1;
        const x0 = W * (0.2 + Math.random() * 0.6);
        bolt = [[x0, H * 0.12]];
        let x = x0, y = H * 0.12;
        while (y < H * 0.55) { x += (Math.random() - 0.5) * 50; y += 24 + Math.random() * 28; bolt.push([x, y]); }
      }
      if (flash > 0.01) {
        ctx.fillStyle = `rgba(235,240,255,${flash * 0.3})`;
        ctx.fillRect(0, 0, W, H);
        if (bolt && flash > 0.45) {
          ctx.strokeStyle = `rgba(255,250,210,${flash})`;
          ctx.lineWidth = 3;
          ctx.lineJoin = 'round';
          ctx.beginPath();
          bolt.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.stroke();
        }
        flash *= Math.exp(-dt * 7);
      }
    }

    function draw(dt, still) {
      const yTop = waterTop();
      drawSky();
      drawClouds();
      if (!still) drawPrecip(dt, yTop);
      drawGroundAndDry(yTop);
      drawWater(yTop);
      if (!still) { drawRipples(dt); drawLightning(dt); }
      // bottom vignette keeps lower content readable
      const v = ctx.createLinearGradient(0, H * 0.6, 0, H);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.38)');
      ctx.fillStyle = v;
      ctx.fillRect(0, H * 0.6, W, H * 0.4);
    }

    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      t += dt;
      step(dt);
      draw(dt, false);
      // adaptive quality: sustained slow frames -> lighter rendering
      if (!lowQ) {
        slow = dt > 0.03 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 45) { lowQ = true; resize(); }
      }
      if (running()) raf = requestAnimationFrame(frame);
    }

    const running = () => !reduce && inView && tabVisible;
    function sync() {
      if (running()) { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    function still() { if (reduce) { snap(); draw(0, true); } }
    S.redraw = still;

    resize();
    if (reduce) still(); else sync();

    const ro = new ResizeObserver(() => { resize(); if (reduce) still(); });
    ro.observe(canvas.parentElement);
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); });
    io.observe(canvas);
    const onVis = () => { tabVisible = !document.hidden; sync(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      S.redraw = null;
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, zIndex: 0, width: '100%', height: '100%' }}
    />
  );
}
