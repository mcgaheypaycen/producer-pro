/**
 * Lightweight UI sound-effects manager.
 *
 * Sounds are generated via fal.ai (Stable Audio 3 SFX) and live under
 * /assets/audio/sfx. They are preloaded on first user gesture and played
 * through a shared pool of <audio> elements to avoid per-clip overhead.
 *
 * Respects a stored mute preference and the browser's reduced-motion hint
 * (when reduced motion is requested, SFX are also silenced by default).
 */

import { asset } from '../assets/index.js';

const CLIPS = {
  click: 'audio/sfx/click.wav',
  hover: 'audio/sfx/hover.wav',
  success: 'audio/sfx/success.wav',
  error: 'audio/sfx/error.wav',
  navigate: 'audio/sfx/navigate.wav',
  modalOpen: 'audio/sfx/modal-open.wav',
};

const MUTE_KEY = 'producer-pro-sfx-muted';

let muted = (() => {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  return localStorage.getItem(MUTE_KEY) === '1';
})();

const pool = [];
const POOL_SIZE = 4;
let warmed = false;

function getFromPool() {
  for (const a of pool) {
    if (a.paused || a.ended) return a;
  }
  if (pool.length < POOL_SIZE) {
    const a = new Audio();
    a.preload = 'auto';
    pool.push(a);
    return a;
  }
  return pool[0];
}

/** Preload clips after the first user gesture (autoplay policies). */
function warm() {
  if (warmed) return;
  warmed = true;
  for (const path of Object.values(CLIPS)) {
    const url = asset(path);
    if (url) {
      const a = new Audio();
      a.src = url;
      a.preload = 'auto';
      a.load();
    }
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = !!value;
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch {}
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

/**
 * Play a named clip. Safe to call anywhere — no-ops when muted or before
 * the first user gesture (browsers will simply not play).
 */
export function playSfx(name, volume = 0.4) {
  if (muted) return;
  const path = CLIPS[name];
  if (!path) return;
  const url = asset(path);
  if (!url) return;
  const a = getFromPool();
  a.src = url;
  a.volume = Math.max(0, Math.min(1, volume));
  a.currentTime = 0;
  const p = a.play();
  if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay blocked */ });
}

if (typeof window !== 'undefined') {
  const start = () => { warm(); window.removeEventListener('pointerdown', start); window.removeEventListener('keydown', start); };
  window.addEventListener('pointerdown', start, { once: true });
  window.addEventListener('keydown', start, { once: true });
}
