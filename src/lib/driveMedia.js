import { googleFetch, copyFile, DriveAuthError, isDriveConnected } from './drive.js';

export { DriveAuthError };

const API = 'https://www.googleapis.com/drive/v3';
const FOLDER_MIME = 'application/vnd.google-apps.folder';

const MEDIA_MIME_CLAUSE = [
  "mimeType contains 'audio/'",
  "mimeType contains 'video/'",
  "mimeType contains 'image/'",
].join(' or ');

function escapeDriveQuery(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function isImageMime(mimeType) {
  return String(mimeType || '').startsWith('image/');
}

export function isMediaMime(mimeType) {
  const m = String(mimeType || '');
  return m.startsWith('audio/') || m.startsWith('video/') || m.startsWith('image/');
}

function formatFileSize(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeDriveFile(file) {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    modifiedTime: file.modifiedTime,
    webViewLink: file.webViewLink || '',
    sizeLabel: formatFileSize(file.size),
    isImage: isImageMime(file.mimeType),
  };
}

/** Lists audio/video/image files in a Drive folder. */
export async function listMediaInFolder(folderId) {
  const clauses = [
    `(${MEDIA_MIME_CLAUSE})`,
    'trashed = false',
    `'${folderId}' in parents`,
  ];
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size)',
    orderBy: 'modifiedTime desc',
    pageSize: '100',
  });
  const body = await googleFetch(`${API}/files?${params}`);
  return (body.files || []).map(normalizeDriveFile);
}

/** Searches media files across Drive, optionally scoped to a folder. */
export async function searchMediaFiles(query = '', folderId = null) {
  const clauses = [`(${MEDIA_MIME_CLAUSE})`, 'trashed = false'];
  if (query.trim()) {
    clauses.push(`name contains '${escapeDriveQuery(query.trim())}'`);
  }
  if (folderId) {
    clauses.push(`'${folderId}' in parents`);
  }
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size)',
    orderBy: 'modifiedTime desc',
    pageSize: '50',
  });
  const body = await googleFetch(`${API}/files?${params}`);
  return (body.files || []).map(normalizeDriveFile);
}

/** Lists subfolders inside a folder (for optional browsing). */
export async function listDriveSubfolders(parentId) {
  const clauses = [
    `mimeType = '${FOLDER_MIME}'`,
    'trashed = false',
    `'${parentId}' in parents`,
  ];
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id, name, modifiedTime)',
    orderBy: 'name',
    pageSize: '50',
  });
  const body = await googleFetch(`${API}/files?${params}`);
  return body.files || [];
}

/**
 * Adopts a Drive file for use as act/segment media.
 * Copies into the Producer Pro folder when needed so packaging keeps working.
 */
export async function adoptDriveMediaFile(fileId, mediaFolderId) {
  const params = new URLSearchParams({
    fields: 'id, name, parents, webViewLink, mimeType',
  });
  const file = await googleFetch(`${API}/files/${fileId}?${params}`);

  if (file.parents?.includes(mediaFolderId)) {
    return {
      fileId: file.id,
      name: file.name,
      link: file.webViewLink || '',
      length: '',
      isImage: isImageMime(file.mimeType),
    };
  }

  const copied = await copyFile(file.id, file.name, mediaFolderId);
  return {
    fileId: copied.id,
    name: copied.name,
    link: copied.webViewLink || '',
    length: '',
    isImage: isImageMime(file.mimeType),
  };
}

export function canBrowseDrive() {
  return isDriveConnected();
}
