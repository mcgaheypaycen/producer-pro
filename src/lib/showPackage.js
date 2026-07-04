import { isSupabaseConfigured } from './supabaseClient.js';
import { buildRunSheetRtf, sanitizeFilename } from './runSheetRtf.js';
import { availableFolderName, copyFile, createFolder, uploadFile } from './drive.js';

/**
 * Web port of the desktop show-package export: creates a show folder in the
 * user's Google Drive, copies each lineup entry's media into it named
 * "[POSITION] [PERFORMER] [ACT]" (server-side Drive copy — no re-upload),
 * and uploads the styled RTF run sheet.
 *
 * Returns { folderId, folderLink, folderName, copied, missing }.
 */
export async function createShowPackageInDrive({ show, lineup, runSheet, appFolderId }) {
  const baseName = sanitizeFilename(
    `${show.title || 'Untitled Show'}${show.dateLabel ? ' - ' + show.dateLabel : ''}`
  ) || 'Untitled Show';

  const rtf = buildRunSheetRtf(show, lineup, runSheet);
  const rtfName = sanitizeFilename(`${show.title || 'Show'} - Run Sheet`) + '.rtf';

  if (!isSupabaseConfigured) {
    // Demo mode: no Drive; pretend the package was created.
    return {
      folderId: 'demo-folder',
      folderLink: '',
      folderName: baseName,
      copied: lineup.filter((e) => e.mediaFileId).map((e, i) => `${i + 1} ${e.actName || e.title || ''}`),
      missing: [],
    };
  }

  const folderName = await availableFolderName(baseName, appFolderId);
  const folder = await createFolder(folderName, appFolderId);

  const copied = [];
  const missing = [];
  for (let i = 0; i < lineup.length; i++) {
    const entry = lineup[i];
    if (!entry.mediaFileId) continue;
    const pos = i + 1;
    const ext = entry.mediaName && entry.mediaName.includes('.')
      ? '.' + entry.mediaName.split('.').pop()
      : '';
    const base = entry.type === 'segment'
      ? `${pos} ${entry.title || 'Segment'}`
      : `${pos} ${entry.performerName || ''} ${entry.actName || ''}`;
    const name = sanitizeFilename(base.trim()) + ext;
    try {
      await copyFile(entry.mediaFileId, name, folder.id);
      copied.push(name);
    } catch (err) {
      if (err.name === 'DriveAuthError') throw err;
      missing.push({ position: pos, file: entry.mediaName || entry.mediaFileId });
    }
  }

  await uploadFile(new Blob([rtf], { type: 'application/rtf' }), rtfName, folder.id, 'application/rtf');

  return {
    folderId: folder.id,
    folderLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
    folderName,
    copied,
    missing,
  };
}
