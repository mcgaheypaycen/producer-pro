import React, { useMemo, useState, useRef, useEffect } from 'react';

export default function FontPicker({ value, onChange, fonts, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = fonts && fonts.length ? fonts : ['Arial', 'Georgia', 'Times New Roman'];
    if (!q) return list;
    return list.filter((f) => f.toLowerCase().includes(q));
  }, [fonts, query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="font-picker" ref={wrapRef}>
      <button
        type="button"
        className="font-picker-trigger"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        style={{ fontFamily: value || 'inherit' }}
      >
        {value || 'Select font…'}
      </button>
      {open && (
        <div className="font-picker-menu">
          <input
            className="input"
            placeholder="Search fonts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="font-picker-list">
            {filtered.map((font) => (
              <button
                key={font}
                type="button"
                className={'font-picker-option' + (font === value ? ' selected' : '')}
                style={{ fontFamily: font }}
                onClick={() => { onChange(font); setOpen(false); setQuery(''); }}
              >
                {font}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="font-picker-empty">No fonts match</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
