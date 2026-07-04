import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { Modal, SearchInput, useToast } from '../ui.jsx';
import { icons } from '../assets/index.js';
import { BtnWithIcon } from './Icon.jsx';
import { isSupabaseConfigured } from '../lib/supabaseClient.js';
import { pickLocalFile } from '../lib/mediaMeta.js';
import { uploadLocalMedia, toastDriveError } from '../lib/mediaUpload.js';
import {
  adoptDriveMediaFile,
  canBrowseDrive,
  listDriveSubfolders,
  listMediaInFolder,
  searchMediaFiles,
} from '../lib/driveMedia.js';

function fileTypeLabel(mimeType) {
  if (String(mimeType || '').startsWith('audio/')) return 'Audio';
  if (String(mimeType || '').startsWith('video/')) return 'Video';
  if (String(mimeType || '').startsWith('image/')) return 'Image';
  return 'File';
}

/**
 * Lets the user attach media from Google Drive or upload from their computer.
 * Resolves with `{ fileId, name, length, isImage, link }` via onSelect.
 */
export default function MediaPickerModal({ onClose, onSelect, getMediaFolderId }) {
  const { isConfigured, signIn } = useAuth();
  const toast = useToast();
  const driveAvailable = isConfigured && canBrowseDrive();

  const [mode, setMode] = useState(driveAvailable ? 'drive' : 'local');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folderStack, setFolderStack] = useState([]);
  const [appFolderId, setAppFolderId] = useState(null);

  const currentFolder = useMemo(
    () => folderStack[folderStack.length - 1] || null,
    [folderStack],
  );

  const loadDriveBrowse = useCallback(async () => {
    if (!driveAvailable) return;
    setBusy(true);
    setError('');
    try {
      const rootId = appFolderId || await getMediaFolderId();
      if (!appFolderId) setAppFolderId(rootId);

      const stack = folderStack.length ? folderStack : [{ id: rootId, name: 'Producer Pro' }];
      if (!folderStack.length) setFolderStack(stack);

      const activeFolderId = currentFolder?.id || stack[stack.length - 1].id;
      const atAppRoot = activeFolderId === rootId && stack.length === 1;

      const media = search.trim()
        ? await searchMediaFiles(search, atAppRoot ? null : activeFolderId)
        : await listMediaInFolder(activeFolderId);

      const subs = !search.trim() && atAppRoot
        ? await listDriveSubfolders(rootId)
        : [];

      setFiles(media);
      setFolders(subs);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }, [appFolderId, currentFolder, driveAvailable, folderStack, getMediaFolderId, search]);

  useEffect(() => {
    if (mode !== 'drive' || !driveAvailable) return;
    const timer = setTimeout(loadDriveBrowse, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [mode, driveAvailable, loadDriveBrowse, search, folderStack]);

  const selectDriveFile = async (file) => {
    setBusy(true);
    setError('');
    try {
      const folderId = appFolderId || await getMediaFolderId();
      const adopted = await adoptDriveMediaFile(file.id, folderId);
      onSelect(adopted);
      onClose();
    } catch (err) {
      toastDriveError(toast, err, signIn);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const uploadLocal = async () => {
    setBusy(true);
    setError('');
    try {
      const file = await pickLocalFile();
      if (!file) return;
      const uploaded = await uploadLocalMedia(file, getMediaFolderId);
      onSelect(uploaded);
      toast('Media uploaded', `${uploaded.name} saved to your Google Drive.`);
      onClose();
    } catch (err) {
      toastDriveError(toast, err, signIn);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const enterFolder = (folder) => {
    setFolderStack((stack) => [...stack, folder]);
    setSearch('');
  };

  const leaveFolder = () => {
    setFolderStack((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack));
    setSearch('');
  };

  return (
    <Modal
      title="Choose media"
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          {mode === 'local' && (
            <BtnWithIcon icon={icons.action('media')} className="btn primary" onClick={uploadLocal} disabled={busy}>
              {busy ? 'Uploading…' : 'Choose file from computer'}
            </BtnWithIcon>
          )}
        </>
      }
    >
      <p style={{ color: 'var(--on-paper-muted)', fontSize: 14, marginTop: 0, marginBottom: 14 }}>
        Select an existing file from Google Drive or upload from your computer.
        {isSupabaseConfigured && ' Files are stored in your Producer Pro Drive folder.'}
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {driveAvailable && (
          <button
            type="button"
            className={'filter-tab' + (mode === 'drive' ? ' active' : '')}
            onClick={() => { setMode('drive'); setError(''); }}
          >
            Google Drive
          </button>
        )}
        <button
          type="button"
          className={'filter-tab' + (mode === 'local' ? ' active' : '')}
          onClick={() => { setMode('local'); setError(''); }}
        >
          Upload from computer
        </button>
      </div>

      {error && <p style={{ color: 'var(--ledger-brick)', marginBottom: 12 }}>{error}</p>}

      {mode === 'drive' && driveAvailable && (
        <>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={folderStack.length > 1 ? 'Search in this folder…' : 'Search your Drive for media…'}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 10px' }}>
            {folderStack.length > 1 && (
              <button type="button" className="btn ghost sm" onClick={leaveFolder}>↑ Up</button>
            )}
            <span style={{ fontWeight: 600, fontSize: 13 }}>{currentFolder?.name || 'Producer Pro'}</span>
          </div>
          {folders.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 6 }}>Folders</div>
              <div className="picker-list" style={{ maxHeight: 120, marginBottom: 12 }}>
                {folders.map((f) => (
                  <button key={f.id} type="button" className="picker-item" onClick={() => enterFolder(f)}>
                    <div className="picker-name">{f.name}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="picker-list" style={{ maxHeight: 320 }}>
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                className="picker-item"
                onClick={() => selectDriveFile(file)}
                disabled={busy}
              >
                <div>
                  <div className="picker-name">{file.name}</div>
                  <div className="picker-sub">
                    {fileTypeLabel(file.mimeType)}
                    {file.sizeLabel ? ` · ${file.sizeLabel}` : ''}
                  </div>
                </div>
              </button>
            ))}
            {!busy && files.length === 0 && (
              <div style={{ color: 'var(--on-paper-muted)', padding: 12 }}>
                {search.trim() ? 'No media files match your search.' : 'No media files in this folder yet — upload from your computer.'}
              </div>
            )}
            {busy && files.length === 0 && (
              <div style={{ color: 'var(--on-paper-muted)', padding: 12 }}>Loading…</div>
            )}
          </div>
        </>
      )}

      {mode === 'drive' && !driveAvailable && (
        <div style={{ padding: '12px 0' }}>
          <p style={{ marginBottom: 10 }}>Connect Google Drive to browse files, or upload from your computer instead.</p>
          <button type="button" className="btn primary" onClick={() => signIn().catch((e) => setError(e.message))}>
            Connect Google Drive
          </button>
        </div>
      )}

      {mode === 'local' && (
        <div className="import-form-created">
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Upload from your computer</div>
          <p style={{ fontSize: 13, color: 'var(--on-paper-muted)', margin: '0 0 12px' }}>
            Choose an audio, video, or image file. It will be uploaded to your Producer Pro folder in Google Drive.
          </p>
          <BtnWithIcon icon={icons.action('media')} className="btn secondary" onClick={uploadLocal} disabled={busy}>
            {busy ? 'Uploading…' : 'Browse files…'}
          </BtnWithIcon>
        </div>
      )}
    </Modal>
  );
}
