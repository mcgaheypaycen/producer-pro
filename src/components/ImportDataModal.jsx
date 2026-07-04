import React, { useState } from 'react';
import { Modal, useToast } from '../ui.jsx';
import { useData } from '../data.jsx';
import { api } from '../lib/api.js';

const COLLECTIONS = ['performers', 'venues', 'acts', 'shows'];
const LABELS = { performers: 'performers', venues: 'venues', acts: 'acts', shows: 'shows' };

/**
 * One-time importer for the desktop app's producer-pro-data.json.
 * Local file paths (act media, show folders) don't exist on the web, so they
 * are stripped — media gets re-uploaded to Google Drive as you go.
 */
export default function ImportDataModal({ onClose }) {
  const toast = useToast();
  const { reloadAll } = useData();
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    setError('');
    setParsed(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      const data = {};
      let total = 0;
      for (const c of COLLECTIONS) {
        data[c] = Array.isArray(raw[c]) ? raw[c].filter((item) => item && typeof item === 'object') : [];
        total += data[c].length;
      }
      if (total === 0) {
        setError('No Producer Pro records found in that file. Pick the producer-pro-data.json exported by the desktop app.');
        return;
      }
      setParsed(data);
    } catch {
      setError('That file is not valid JSON. Pick the producer-pro-data.json from the desktop app.');
    }
  };

  const runImport = async () => {
    setBusy(true);
    try {
      for (const c of COLLECTIONS) {
        for (const item of parsed[c]) {
          // Local desktop paths are meaningless in the cloud version.
          const { mediaPath, folderPath, ...rest } = item;
          if (c === 'shows' && Array.isArray(rest.lineup)) {
            rest.lineup = rest.lineup.map(({ mediaPath: _mp, ...entry }) => entry);
          }
          await api.save(c, rest);
        }
      }
      await reloadAll();
      toast('Import complete', 'Your desktop data is now in your account. Re-upload act media to attach files.');
      onClose();
    } catch (err) {
      setError('Import failed: ' + err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Import desktop data"
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn primary" onClick={runImport} disabled={!parsed || busy}>
            {busy ? 'Importing…' : 'Import'}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12 }}>
        Moving from the desktop app? Import your <strong>producer-pro-data.json</strong> file
        (found in <span className="data">%APPDATA%\producer-pro</span> on Windows).
      </p>
      <input type="file" accept=".json,application/json" onChange={handleFile} disabled={busy} />
      {error && <p style={{ color: 'var(--ledger-brick)', marginTop: 12 }}>{error}</p>}
      {parsed && (
        <div style={{ marginTop: 14 }}>
          <p style={{ marginBottom: 8 }}>Ready to import:</p>
          <ul style={{ paddingLeft: 20, color: 'var(--on-paper-muted)' }}>
            {COLLECTIONS.map((c) => (
              <li key={c}>{parsed[c].length} {LABELS[c]}</li>
            ))}
          </ul>
          <p style={{ fontSize: 13, color: 'var(--on-paper-muted)', marginTop: 10 }}>
            Media file attachments can't move automatically — re-upload them to
            Google Drive from each act after importing. Records with matching ids
            will be overwritten.
          </p>
        </div>
      )}
    </Modal>
  );
}
