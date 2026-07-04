import React, { useState } from 'react';
import { brand, illustrations } from '../assets/index.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../ui.jsx';
import { startCheckout, openBillingPortal } from '../lib/billing.js';

const FEATURES = [
  'Performer, act, and venue library',
  'Drag-and-drop running orders with styled RTF run sheets',
  'Show packages delivered straight to your Google Drive',
  'Night-of closeout ledger with settlement CSV export',
];

export default function PaywallPage() {
  const { user, profile, signOut } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  // canceled / incomplete subscriptions have a Stripe customer to manage.
  const hadSubscription = profile?.subscription_status && profile.subscription_status !== 'none';

  const run = (fn) => async () => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast('Billing error', err.message, 'error');
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div
          className="auth-art"
          style={{ backgroundImage: `url(${illustrations.authArt()})` }}
          aria-hidden
        />
        <div className="auth-card">
          <img src={brand.wordmarkHorizontal()} alt="Producer Pro" height={26} />
          <h1 className="auth-title">
            {hadSubscription ? 'Your subscription has ended' : 'Start your free trial'}
          </h1>
          <p className="auth-lead">
            {hadSubscription
              ? 'Renew to pick up right where you left off — your shows and library are saved.'
              : 'Everything you need to produce the night, in one subscription.'}
          </p>
          <ul className="auth-features">
            {FEATURES.map((f) => <li key={f}>{f}</li>)}
          </ul>
          <button className="btn primary" style={{ width: '100%' }} onClick={run(startCheckout)} disabled={busy}>
            {busy ? 'Redirecting…' : hadSubscription ? 'Renew subscription' : 'Start free trial'}
          </button>
          {hadSubscription && (
            <button className="btn secondary" style={{ width: '100%', marginTop: 10 }} onClick={run(openBillingPortal)} disabled={busy}>
              Manage billing
            </button>
          )}
          <p className="auth-fineprint">
            Signed in as {user?.email}
            {' · '}
            <button className="auth-link" onClick={signOut}>Sign out</button>
          </p>
        </div>
      </div>
    </div>
  );
}
