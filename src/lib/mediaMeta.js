/** In-browser media helpers: image detection + duration probing. */

const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'heic', 'heif', 'svg',
]);

export const MEDIA_ACCEPT = [
  'video/*', 'audio/*', 'image/*',
  '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v',
  '.mp3', '.wav', '.aiff', '.aac', '.m4a', '.flac', '.ogg', '.wma',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.heic', '.heif', '.svg',
].join(',');

export function isImageFile(file) {
  if (file.type?.startsWith('image/')) return true;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

export function formatMediaLength(seconds) {
  const total = Math.round(Number(seconds) || 0);
  if (total <= 0) return '';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Reads audio/video duration via a media element. Returns '' on failure. */
export function getMediaLengthLabel(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    // A <video> element reports duration for both audio and video sources.
    const el = document.createElement('video');
    el.preload = 'metadata';
    const done = (label) => {
      URL.revokeObjectURL(url);
      resolve(label);
    };
    el.onloadedmetadata = () => {
      done(Number.isFinite(el.duration) ? formatMediaLength(el.duration) : '');
    };
    el.onerror = () => done('');
    setTimeout(() => done(''), 10000);
    el.src = url;
  });
}

/** Opens the browser file picker and resolves with the chosen File (or null). */
export function pickLocalFile(accept = MEDIA_ACCEPT) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] || null);
    // Cancel detection: focus returns without a change event. The delay gives
    // the change event (which carries the selection) time to win the race.
    window.addEventListener('focus', () => {
      setTimeout(() => resolve(input.files?.[0] || null), 1000);
    }, { once: true });
    input.click();
  });
}
