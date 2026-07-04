import React, { useState } from 'react';
import { Modal } from '../ui.jsx';
import { icons } from '../assets/index.js';
import { BtnWithIcon } from './Icon.jsx';

const EXPORT_OPTIONS = [
  { id: 'none', label: 'Skip export', description: 'Close the show without exporting' },
  { id: 'download', label: 'Download CSV', description: 'Save settlement to your computer' },
  { id: 'drive', label: 'Save to Google Drive', description: 'Upload CSV to Drive' },
  { id: 'sheet', label: 'Create Google Sheet', description: 'Open as an editable spreadsheet' },
];

export default function CloseoutFinalizeModal({ showTitle, onConfirm, onCancel, busy }) {
  const [exportMode, setExportMode] = useState('download');

  return (
    <Modal
      title="Close out this show?"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <BtnWithIcon
            icon={icons.action('check')}
            className="btn primary"
            onClick={() => onConfirm(exportMode === 'none' ? null : exportMode)}
            disabled={busy}
          >
            {busy ? 'Closing…' : 'Close out show'}
          </BtnWithIcon>
        </>
      }
    >
      <p style={{ color: 'var(--on-paper-muted)', marginTop: 0 }}>
        This finalizes the settlement and archives <strong>{showTitle || 'this show'}</strong>.
        You can still view it and export again later.
      </p>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Settlement export</div>
      <div className="settlement-export-options">
        {EXPORT_OPTIONS.map((opt) => (
          <label key={opt.id} className={'settlement-export-option' + (exportMode === opt.id ? ' active' : '')}>
            <input type="radio" name="closeout-export" checked={exportMode === opt.id} onChange={() => setExportMode(opt.id)} />
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
