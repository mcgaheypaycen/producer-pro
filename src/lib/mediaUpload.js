import { isSupabaseConfigured } from './supabaseClient.js';
import { pickLocalFile, isImageFile, getMediaLengthLabel } from './mediaMeta.js';
import { uploadFile } from './drive.js';

/**
 * Web replacement for the desktop file picker: choose a local file, probe its
 * duration in-browser, then upload it to the user's Google Drive media folder.
 *
 * Resolves with `{ fileId, name, length, isImage, link }` or null if the user
 * cancels. Throws DriveAuthError when Drive needs to be (re)connected.
 */
/** Standard toast for Drive failures, with a reconnect action on auth errors. */
export function toastDriveError(toast, err, reconnect) {
  if (err?.name === 'DriveAuthError') {
    toast('Google Drive needs access', err.message, 'error', reconnect
      ? { label: 'Connect Google Drive', onClick: reconnect }
      : undefined);
  } else {
    toast('Google Drive error', err?.message || 'Something went wrong.', 'error');
  }
}

export async function uploadLocalMedia(file, getMediaFolderId, { onUploadStart } = {}) {
  const image = isImageFile(file);
  const length = image ? '' : await getMediaLengthLabel(file);

  if (!isSupabaseConfigured) {
    return { fileId: 'demo-' + crypto.randomUUID(), name: file.name, length, isImage: image, link: '' };
  }

  onUploadStart?.(file);
  const folderId = await getMediaFolderId();
  const uploaded = await uploadFile(file, file.name, folderId);
  return {
    fileId: uploaded.id,
    name: file.name,
    length,
    isImage: image,
    link: uploaded.webViewLink || '',
  };
}

export async function pickAndUploadMedia(getMediaFolderId, { onUploadStart } = {}) {
  const file = await pickLocalFile();
  if (!file) return null;
  return uploadLocalMedia(file, getMediaFolderId, { onUploadStart });
}
