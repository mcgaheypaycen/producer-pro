const path = require('path');

let parseFileLoader = null;

function getParseFile() {
  if (!parseFileLoader) {
    parseFileLoader = import('music-metadata').then((mod) => mod.parseFile);
  }
  return parseFileLoader;
}

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.heic', '.heif', '.svg',
]);

function isImageMedia(filePath) {
  return IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function formatMediaLength(seconds) {
  const total = Math.round(Number(seconds) || 0);
  if (total <= 0) return '';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function getMediaLengthLabel(filePath) {
  try {
    const parseFile = await getParseFile();
    const metadata = await parseFile(filePath, { duration: true });
    const sec = metadata?.format?.duration;
    if (!sec || !Number.isFinite(sec)) return '';
    return formatMediaLength(sec);
  } catch {
    return '';
  }
}

module.exports = { isImageMedia, formatMediaLength, getMediaLengthLabel };
