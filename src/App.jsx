import React, { useState } from 'react';
import { DataProvider, useData } from './data.jsx';
import { ToastProvider } from './ui.jsx';
import { ShellProvider, useShell } from './shell.jsx';
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

function formatLastSaved(iso) {
  if (!iso) return 'Not saved yet';
  try {
    return 'Saved ' + new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function Shell() {
  const [route, setRoute] = useState({ page: 'shows', showId: null });
  const { loaded } = useData();
  const { topBar, dataInfo } = useShell();

  if (!loaded) return null;

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

  const shortPath = dataInfo.path
    ? dataInfo.path.replace(/^.*[\\/]AppData[\\/]Roaming[\\/]/i, '')
    : 'producer-pro-data.json';

  return (
    <div className="app">
      <aside className="rail">
        <div className="rail-brand">
          <div className="rail-wordmark">Producer Pro</div>
          <div className="rail-tagline">Cabaret show manager</div>
        </div>
        <nav className="rail-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={'rail-item' + (route.page === item.id && !route.showId ? ' active' : route.page === 'shows' && item.id === 'shows' && route.showId ? ' active' : '')}
              onClick={() => navigate(item.id)}
            >
              <span className="rail-dot" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="rail-footer">
          <div className="data-path" title={dataInfo.path}>{shortPath}</div>
          <div className="last-saved">{formatLastSaved(dataInfo.lastSaved)}</div>
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
          {topBar.action && <div className="top-bar-action">{topBar.action}</div>}
        </header>
        <div className="workspace-scroll">
          <div className="workspace">{content}</div>
        </div>
      </div>
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
