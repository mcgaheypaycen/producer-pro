import React from 'react';
import FontPicker from './FontPicker.jsx';
import { ELEMENT_LABELS, RUN_SHEET_FIELD_LABELS } from '../../shared/runSheetConfig.cjs';

function ElementStyleRow({ label, style, onChange, fonts, disabled }) {
  const patch = (key, val) => onChange({ ...style, [key]: val });

  return (
    <div className="style-element-row">
      <div className="style-element-head">
        <span className="style-element-label">{label}</span>
      </div>
      <div className="style-element-controls">
        <FontPicker value={style.fontFamily} fonts={fonts} disabled={disabled} onChange={(v) => patch('fontFamily', v)} />
        <input
          className="input style-size-input"
          type="number"
          min={8}
          max={72}
          value={style.fontSize}
          disabled={disabled}
          onChange={(e) => patch('fontSize', Number(e.target.value))}
          title="Size (pt)"
        />
        <label className="style-toggle">
          <input type="checkbox" checked={style.bold} disabled={disabled} onChange={(e) => patch('bold', e.target.checked)} />
          Bold
        </label>
        <label className="style-toggle">
          <input type="checkbox" checked={style.italic} disabled={disabled} onChange={(e) => patch('italic', e.target.checked)} />
          Italic
        </label>
      </div>
    </div>
  );
}

export default function RunSheetStylePanel({ options, onChange, fonts, disabled }) {
  const setTypography = (key, style) => {
    onChange({
      ...options,
      typography: { ...options.typography, [key]: style },
    });
  };

  const toggleField = (key) => {
    onChange({
      ...options,
      fields: options.fields.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)),
    });
  };

  const moveField = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= options.fields.length) return;
    const next = options.fields.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ ...options, fields: next });
  };

  return (
    <div className="run-sheet-style-panel">
      <h3 className="h2" style={{ fontSize: 17, marginBottom: 8 }}>Typography</h3>
      <p className="page-lead" style={{ marginBottom: 16 }}>Adjust fonts and sizes — the page preview updates live as you edit.</p>

      <div className="style-section">
        <div className="eyebrow" style={{ marginBottom: 10 }}>Show header</div>
        {['showTitle', 'showMeta', 'positionNumber'].map((key) => (
          <ElementStyleRow
            key={key}
            label={ELEMENT_LABELS[key]}
            style={options.typography[key]}
            fonts={fonts}
            disabled={disabled}
            onChange={(s) => setTypography(key, s)}
          />
        ))}
      </div>

      <div className="style-section">
        <div className="eyebrow" style={{ marginBottom: 10 }}>Acts</div>
        {['performerName', 'actName', 'tagline'].map((key) => (
          <ElementStyleRow
            key={key}
            label={ELEMENT_LABELS[key]}
            style={options.typography[key]}
            fonts={fonts}
            disabled={disabled}
            onChange={(s) => setTypography(key, s)}
          />
        ))}
      </div>

      <div className="style-section">
        <div className="eyebrow" style={{ marginBottom: 10 }}>Segments</div>
        {['segmentTitle', 'segmentLength', 'segmentNotes'].map((key) => (
          <ElementStyleRow
            key={key}
            label={ELEMENT_LABELS[key]}
            style={options.typography[key]}
            fonts={fonts}
            disabled={disabled}
            onChange={(s) => setTypography(key, s)}
          />
        ))}
      </div>

      <div className="style-section">
        <div className="eyebrow" style={{ marginBottom: 10 }}>Act details on run sheet</div>
        <ElementStyleRow
          label={ELEMENT_LABELS.fieldLabel}
          style={options.typography.fieldLabel}
          fonts={fonts}
          disabled={disabled}
          onChange={(s) => setTypography('fieldLabel', s)}
        />
        <div className="run-sheet-fields" style={{ marginTop: 12 }}>
          {options.fields.map((field, i) => (
            <div key={field.key} className="run-sheet-field-row">
              <label className="run-sheet-field-label">
                <input type="checkbox" checked={field.enabled} disabled={disabled} onChange={() => toggleField(field.key)} />
                <span style={{ opacity: field.enabled ? 1 : 0.5 }}>{RUN_SHEET_FIELD_LABELS[field.key]}</span>
              </label>
              {!disabled && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="icon-btn" title="Move up" disabled={i === 0} onClick={() => moveField(i, -1)}>▲</button>
                  <button className="icon-btn" title="Move down" disabled={i === options.fields.length - 1} onClick={() => moveField(i, 1)}>▼</button>
                </div>
              )}
            </div>
          ))}
        </div>
        {['aesthetic', 'length', 'lighting', 'stage'].map((key) => (
          <ElementStyleRow
            key={key}
            label={ELEMENT_LABELS[key]}
            style={options.typography[key]}
            fonts={fonts}
            disabled={disabled}
            onChange={(s) => setTypography(key, s)}
          />
        ))}
      </div>
    </div>
  );
}
