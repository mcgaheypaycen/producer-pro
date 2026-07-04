import React, { useState, useEffect, useRef } from 'react';
import { DataProvider, useData } from './data.jsx';
import { ToastProvider, useToast } from './ui.jsx';
import { ShellProvider, useShell } from './shell.jsx';
import { AuthProvider, useAuth } from './auth.jsx';
import { brand, icons, motion, ONBOARDING_KEY } from './assets/index.js';
import LoadingScreen from './components/LoadingScreen.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import AccountMenu from './components/AccountMenu.jsx';
import Icon from './components/Icon.jsx';
import { playSfx, toggleMuted, isMuted } from './lib/sfx.js';
import ShowsPage from './pages/ShowsPage.jsx';
import ShowEditor from './pages/ShowEditor.jsx';
import PerformersPage from './pages/PerformersPage.jsx';
import VenuesPage from './pages/VenuesPage.jsx';
import ActsPage from './pages/ActsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PaywallPage from './pages/PaywallPage.jsx';
import { GoogleImportProvider } from './googleImport.jsx';

const NAV = [
  { id: 'shows', label: 'Shows' },
  { id: 'performers', label: 'Performers' },
  { id: 'venues', label: 'Venues' },
  { id: 'acts', label: 'Acts' },
];

function RailBrandMark() {
  return (
    <span className="rail-brand-icon" aria-hidden>
      <Icon src={icons.nav('shows')} size={16} alt="" />
    </span>
  );
}

function MuteToggle() {
  const [, force] = useState(0);
  const muted = isMuted();
  return (
    <button
      className={'icon-btn' + (muted ? '' : ' active')}
      title={muted ? 'Unmute interface sounds' : 'Mute interface sounds'}
      aria-label={muted ? 'Unmute interface sounds' : 'Mute interface sounds'}
      onClick={() => { toggleMuted(); force((n) => n + 1); }}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}

function Shell({ openShowRef }) {
  const [route, setRoute] = useState({ page: 'shows', showId: null });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { loaded } = useData();
  const { topBarRef } = useShell();
  const topBar = topBarRef.current;

  useEffect(() => {
    if (loaded && !localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, [loaded]);

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
  };

  if (!loaded) return <LoadingScreen />;

  const navigate = (page) => {
    playSfx('navigate', 0.3);
    setRoute({ page, showId: null });
  };
  const openShow = (showId) => {
    playSfx('navigate', 0.3);
    setRoute({ page: 'shows', showId });
  };
  openShowRef.current = openShow;

  let content;
  if (route.page === 'shows' && route.showId) {
    content = <ShowEditor key={route.showId} showId={route.showId} onBack={() => navigate('shows')} />;
  } else if (route.page === 'shows') {
    content = <ShowsPage onOpenShow={openShow} />;
  } else if (route.page === 'performers') {
    content = <PerformersPage onOpenShow={openShow} />;
  } else if (route.page === 'acts') {
    content = <ActsPage onOpenShow={openShow} />;
  } else if (route.page === 'venues') {
    content = <VenuesPage onOpenShow={openShow} />;
  }

  return (
    <div className="app">
      <aside className="rail">
        <div className="rail-brand">
          <RailBrandMark />
          <img
            src={brand.wordmarkHorizontal()}
            alt="Producer Pro"
            className="rail-wordmark-img"
            height={18}
          />
        </div>
        <nav className="rail-nav">
          <div className="rail-section-label">Workspace</div>
          {NAV.map((item) => {
            const active = route.page === item.id && (!route.showId || item.id === 'shows');
            return (
              <button
                key={item.id}
                className={'rail-item' + (active ? ' active' : '')}
                onClick={() => navigate(item.id)}
                onMouseEnter={() => playSfx('hover', 0.12)}
              >
                <Icon src={icons.nav(item.id)} size={18} className="rail-nav-icon" alt="" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="rail-footer">
          <MuteToggle />
        </div>
      </aside>

      <div className="main-shell">
        <header className="top-bar">
          <div className="breadcrumb">
            {(topBar.breadcrumb || []).map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="breadcrumb-sep">/</span>}
                {crumb.onClick ? (
                  <button type="button" className="breadcrumb-link" onClick={crumb.onClick}>{crumb.label}</button>
                ) : i === (topBar.breadcrumb.length - 1) ? (
                  <span className="breadcrumb-current">{crumb.label}</span>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="top-bar-right">
            {topBar.action && <div className="top-bar-action">{topBar.action}</div>}
            <AccountMenu />
          </div>
        </header>
        <div className="workspace-scroll">
          <div className="workspace">{content}</div>
        </div>
      </div>
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
    </div>
  );
}

/** Gates the workspace on auth + subscription state. */
function Gate() {
  const { loading, user, subscriptionActive } = useAuth();
  const openShowRef = useRef(null);

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;
  if (!subscriptionActive) return <PaywallPage />;

  return (
    <ShellProvider>
      <DataProvider>
        <GoogleImportProvider onOpenShow={(id) => openShowRef.current?.(id)}>
          <Shell openShowRef={openShowRef} />
        </GoogleImportProvider>
      </DataProvider>
    </ShellProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  );
}
