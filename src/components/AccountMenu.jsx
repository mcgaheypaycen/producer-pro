import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useToast } from '../ui.jsx';
import { openBillingPortal } from '../lib/billing.js';
import { isDriveConnected } from '../lib/drive.js';
import ImportDataModal from './ImportDataModal.jsx';
import { useGoogleImport } from '../googleImport.jsx';

const STATUS_LABELS = {
  trialing: 'Free trial',
  active: 'Subscribed',
  past_due: 'Payment past due',
};

export default function AccountMenu() {
  const { user, profile, signOut, signIn, isConfigured } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const openGoogleImport = useGoogleImport();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const driveConnected = isConfigured && isDriveConnected();
  const initial = (user?.email || '?')[0].toUpperCase();

  const handleBilling = async () => {
    setOpen(false);
    try {
      await openBillingPortal();
    } catch (err) {
      toast('Billing error', err.message, 'error');
    }
  };

  const handleReconnectDrive = async () => {
    setOpen(false);
    try {
      await signIn();
    } catch (err) {
      toast('Google Drive', err.message, 'error');
    }
  };

  return (
    <div className="account-menu" ref={ref}>
      <button className="account-avatar" title={user?.email || 'Account'} onClick={() => setOpen((o) => !o)}>
        {initial}
      </button>
      {open && (
        <div className="account-dropdown">
          <div className="account-dropdown-header">
            <div className="account-email">{user?.email}</div>
            <div className="account-status">
              {isConfigured
                ? (STATUS_LABELS[profile?.subscription_status] || 'No subscription')
                : 'Demo mode — no backend configured'}
            </div>
          </div>
          {isConfigured && (
            <>
              <button className="account-item" onClick={handleBilling}>Manage billing</button>
              <button className="account-item" onClick={handleReconnectDrive}>
                {driveConnected ? 'Reconnect Google Drive' : 'Connect Google Drive'}
              </button>
            </>
          )}
          <button className="account-item" onClick={() => { setOpen(false); openGoogleImport?.(); }}>
            Import from Google Form…
          </button>
          <button className="account-item" onClick={() => { setOpen(false); setImporting(true); }}>
            Import desktop data…
          </button>
          <div className="account-divider" />
          <button className="account-item" onClick={() => { setOpen(false); signOut(); }}>Sign out</button>
        </div>
      )}
      {importing && <ImportDataModal onClose={() => setImporting(false)} />}
    </div>
  );
}
