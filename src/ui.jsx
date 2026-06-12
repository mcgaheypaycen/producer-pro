import React, { createContext, useCallback, useContext, useState } from 'react';

/* ---------- Status badge ---------- */

const STATUS_CONFIG = {
  draft: { label: 'Draft', detail: 'lineup editable' },
  packaged: { label: 'Packaged', detail: 'folder on disk' },
  closed: { label: 'Closed', detail: 'settled & read-only' },
};

export function StatusBadge({ status }) {
  const s = status || 'draft';
  const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.draft;
  return (
    <span className={'badge ' + s}>
      <span className="badge-dot" />
      {cfg.label} · {cfg.detail}
    </span>
  );
}

/* ---------- Payment chip ---------- */

const PAY_GLYPH = {
  Venmo: 'V',
  CashApp: '$',
  PayPal: 'P',
  Zelle: 'Z',
  Cash: '¢',
  Check: '✓',
  Other: '·',
};

export function PaymentChip({ method, info }) {
  if (!method) return null;
  return (
    <span className="pay-chip">
      <span className="pay-glyph">{PAY_GLYPH[method] || '·'}</span>
      {method}{info ? ` · ${info}` : ''}
    </span>
  );
}

/* ---------- Modal ---------- */

export function Modal({ title, children, footer, onClose, wide }) {
  return (
    <>
      <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} />
      <div className={'modal' + (wide ? ' wide' : '')}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="icon-btn" onClick={onClose} title="Close" aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </>
  );
}

/* ---------- Drawer ---------- */

export function Drawer({ title, children, footer, onClose }) {
  return (
    <>
      <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} />
      <div className="drawer">
        <div className="drawer-header">
          <div className="drawer-title">{title}</div>
          <button className="icon-btn" onClick={onClose} title="Close" aria-label="Close">✕</button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </>
  );
}

/* ---------- Form helpers ---------- */

export function Field({ label, children, full, helper }) {
  return (
    <div className={'field' + (full ? ' full' : '')}>
      <label className="field-label">{label}</label>
      {children}
      {helper && <span style={{ fontSize: 12, color: 'var(--on-paper-muted)' }}>{helper}</span>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="search-wrap">
      <span className="search-icon">⌕</span>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search…'}
      />
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="empty">
      <div className="empty-ring">◎</div>
      <div className="empty-title">{title}</div>
      <div className="empty-body">{body}</div>
      {action}
    </div>
  );
}

/* ---------- Toasts ---------- */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((title, body, kind = 'success', action) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, body, kind, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 8000 : 4500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={'toast' + (t.kind === 'error' ? ' error' : '')}>
            <div className="toast-title">{t.title}</div>
            {t.body && <div className="toast-body">{t.body}</div>}
            {t.action && (
              <button className="toast-action" onClick={() => { t.action.onClick(); setToasts((ts) => ts.filter((x) => x.id !== t.id)); }}>
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

/* ---------- Confirm dialog ---------- */

export function ConfirmDialog({ title, body, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className={'btn ' + (danger ? 'danger' : 'primary')} onClick={onConfirm}>
            {confirmLabel || 'Confirm'}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--on-paper-muted)' }}>{body}</p>
    </Modal>
  );
}

/* ---------- Formatting ---------- */

export function money(n) {
  const num = Number(n) || 0;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function moneySigned(n, positive) {
  const formatted = money(Math.abs(Number(n) || 0));
  if (positive) return '+' + formatted;
  return '−' + formatted;
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatRuntime(minutes) {
  const m = Math.round(Number(minutes) || 0);
  if (m <= 0) return '—';
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} min`;
  return `${h}:${String(r).padStart(2, '0')}`;
}

export function parseMinutes(length) {
  if (!length) return 0;
  const s = String(length).trim();
  const colon = s.match(/^(\d+):(\d{1,2})$/);
  if (colon) return Number(colon[1]) + Number(colon[2]) / 60;
  const num = parseFloat(s);
  return Number.isFinite(num) ? num : 0;
}
