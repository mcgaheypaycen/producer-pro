import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './data.jsx';
import { ToastProvider } from './ui.jsx';
import { ShellProvider, useShell } from './shell.jsx';
import { brand, icons, ONBOARDING_KEY } from './assets/index.js';
import LoadingScreen from './components/LoadingScreen.jsx';
import OnboardingModal from './components/OnboardingModal.jsx';
import Icon from './components/Icon.jsx';
import ShowsPage from './pages/ShowsPage.jsx';
import ShowEditor from './pages/ShowEditor.jsx';
import PerformersPage from './pages/PerformersPage.jsx';
import VenuesPage from './pages/VenuesPage.jsx';
import ActsPage from './pages/ActsPage.jsx';

const NAV = [
  { id: 'shows', label: 'Shows' },
  { id: 'performers', label: 'Performers' },
  { id: 'venues', label: 'Venues' },
  { id: 'acts', label: 'Acts' },
];

function Shell() {
  const [route, setRoute] = useState({ page: 'shows', showId: null });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { loaded } = useData();
  const { topBar } = useShell();

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

  const navigate = (page) => setRoute({ page, showId: null });
  const openShow = (showId) => setRoute({ page: 'shows', showId });

  let content;
  if (route.page === 'shows' && route.showId) {
    content = <ShowEditor key={route.showId} showId={route.showId} onBack={() => navigate('shows')} />;
  } else if (route.page === 'shows') {
    content = <ShowsPage onOpenShow={openShow} />;
  } else if (route.page === 'performers') {
    content = <PerformersPage />;
  } else if (route.page === 'acts') {
    content = <ActsPage />;
  } else if (route.page === 'venues') {
    content = <VenuesPage />;
  }

  return (
    <div className="app">
      <aside className="rail">
        <div className="rail-brand">
          <img
            src={brand.wordmarkHorizontal()}
            alt="Producer Pro"
            className="rail-wordmark-img"
            height={22}
          />
        </div>
        <nav className="rail-nav">
          {NAV.map((item) => {
            const active = route.page === item.id && (!route.showId || item.id === 'shows');
            return (
              <button
                key={item.id}
                className={'rail-item' + (active ? ' active' : '')}
                onClick={() => navigate(item.id)}
              >
                <Icon src={icons.nav(item.id, active)} size={20} className="rail-nav-icon" alt="" />
                {item.label}
              </button>
            );
          })}
        </nav>
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
          {topBar.action && <div className="top-bar-action">{topBar.action}</div>}
        </header>
        <div className="workspace-scroll">
          <div className="workspace">{content}</div>
        </div>
      </div>
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ShellProvider>
        <DataProvider>
          <Shell />
        </DataProvider>
      </ShellProvider>
    </ToastProvider>
  );
}
