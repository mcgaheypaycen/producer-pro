import React, { useState } from 'react';
import { Modal, useToast } from '../ui.jsx';
import { icons } from '../assets/index.js';
import { BtnWithIcon } from './Icon.jsx';
import { exportSettlement, settlementFilename } from '../lib/closeoutCsv.js';
import { toastDriveError } from '../lib/mediaUpload.js';
import { useAuth } from '../auth.jsx';

const EXPORT_OPTIONS = [
  { id: 'download', label: 'Download CSV', description: 'Save a copy to your computer' },
  { id: 'drive', label: 'Save to Google Drive', description: 'Upload CSV to your Producer Pro or show folder' },
  { id: 'sheet', label: 'Create Google Sheet', description: 'Convert settlement into an editable spreadsheet' },
];

export default function SettlementExportModal({ show, closeout, performersById, onClose }) {
  const toast = useToast();
  const { signIn, ensureDriveFolderId } = useAuth();
  const [mode, setMode] = useState('download');
  const [busy, setBusy] = useState(false);

  const runExport = async () => {
    setBusy(true);
    try {
      const result = await exportSettlement(
        show,
        closeout,
        performersById,
        { mode, folderId: show.driveFolderId, getAppFolderId: ensureDriveFolderId },
      );
      const filename = settlementFilename(show);
      if (result.mode === 'download') {
        toast('Settlement downloaded', filename);
      } else if (result.webViewLink) {
        toast('Settlement exported', filename, 'success', {
          label: 'Open in Drive',
          icon: icons.action('folder-open'),
          onClick: () => window.open(result.webViewLink, '_blank', 'noopener'),
        });
      } else {
        toast('Settlement exported', filename);
      }
      onClose();
    } catch (err) {
      toastDriveError(toast, err, signIn);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Export settlement"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <BtnWithIcon icon={icons.action('export')} className="btn primary" onClick={runExport} disabled={busy}>
            {busy ? 'Exporting…' : 'Export'}
          </BtnWithIcon>
        </>
      }
    >
      <p style={{ color: 'var(--on-paper-muted)', marginTop: 0, marginBottom: 16, fontSize: 14 }}>
        Choose how to save the settlement for <strong>{show.title || 'this show'}</strong>.
      </p>
      <div className="settlement-export-options">
        {EXPORT_OPTIONS.map((opt) => (
          <label key={opt.id} className={'settlement-export-option' + (mode === opt.id ? ' active' : '')}>
            <input type="radio" name="export-mode" checked={mode === opt.id} onChange={() => setMode(opt.id)} />
            <div>
              <div className="settlement-export-option-title">{opt.label}</div>
              <div className="settlement-export-option-desc">{opt.description}</div>
            </div>
          </label>
        ))}
      </div>
    </Modal>
  );
}
