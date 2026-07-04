import React, { useState } from 'react';
import { brand, illustrations, motion } from '../assets/index.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../ui.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const authLoop = motion.authLoop();
  const authArt = illustrations.authArt();

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await signIn();
    } catch (err) {
      toast('Sign-in failed', err.message, 'error');
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-art" aria-hidden>
          {authLoop && (
            <video
              className="auth-art-video"
              src={authLoop}
              autoPlay
              loop
              muted
              playsInline
              poster={authArt || undefined}
            />
          )}
          {!authLoop && authArt && (
            <div
              className="auth-art-fallback"
              style={{ backgroundImage: `url(${authArt})`, position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center top' }}
            />
          )}
        </div>
        <div className="auth-card">
          <span className="auth-brand-mark" aria-hidden>
            <img src={brand.logoIcon()} alt="" width={40} height={40} style={{ filter: 'brightness(0) invert(1)' }} />
          </span>
          <h1 className="auth-title">Producer Pro</h1>
          <p className="auth-lead">
            Build running orders, generate show packages, and close out the night —
            from any browser, with your files in your own Google Drive.
          </p>
          <button className="btn primary auth-google-btn" onClick={handleSignIn} disabled={busy}>
            <GoogleGlyph />
            {busy ? 'Redirecting…' : 'Continue with Google'}
          </button>
          <p className="auth-fineprint">
            One sign-in covers your account and Google Drive access. New accounts
            start with a free trial — no card required until it ends.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 5.1 29.3 3 24 3 15.9 3 8.9 7.6 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.2 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C8.8 40.3 15.8 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41.4 34.9 45 30 45 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
