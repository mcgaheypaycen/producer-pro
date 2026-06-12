import React, { useMemo, useState } from 'react';
import { useData } from '../data.jsx';
import { useTopBar } from '../shell.jsx';
import { SearchInput, EmptyState, ConfirmDialog, useToast, money, formatDate, StatusBadge, formatRuntime, parseMinutes } from '../ui.jsx';

export default function ShowsPage({ onOpenShow }) {
  const { shows, venues, save, remove } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const venueName = (id) => venues.find((v) => v.id === id)?.name || '';

  const newShow = async () => {
    const saved = await save('shows', {
      title: '',
      dateLabel: new Date().toISOString().slice(0, 10),
      venueId: '',
      ticketPrice: '',
      lineup: [],
      status: 'draft',
    });
    onOpenShow(saved.id);
  };

  useTopBar(
    [{ label: 'Shows' }],
    <button className="btn primary" onClick={newShow}>New show</button>
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return shows
      .filter((s) => filter === 'all' || (s.status || 'draft') === filter)
      .filter((s) => !q || [s.title, venueName(s.venueId), s.dateLabel].some((v) => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => (b.dateLabel || '').localeCompare(a.dateLabel || '') || (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [shows, venues, query, filter]);

  const netProfit = (s) => {
    const c = s.closeout || {};
    const sum = (arr) => (arr || []).reduce((t, x) => t + (Number(x.amount) || 0), 0);
    const ticketRevenue = (Number(c.ticketsSold) || 0) * (Number(s.ticketPrice) || 0);
    return ticketRevenue + sum(c.revenues) - sum(c.expenses) - sum(c.payouts);
  };

  const runtime = (s) => {
    const mins = (s.lineup || []).reduce((t, e) => t + parseMinutes(e.length), 0);
    return formatRuntime(mins);
  };

  return (
    <div className="page">
      <div className="page-toolbar">
        <div>
          <h1 className="h1">Shows</h1>
          <p className="page-lead">Build running orders, generate packages, and close out the night.</p>
        </div>
        <div className="page-toolbar-actions">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by title, venue, or date…" />
        </div>
      </div>

      <div className="filter-tabs">
        {['all', 'draft', 'packaged', 'closed'].map((f) => (
          <button
            key={f}
            className={'filter-tab' + (filter === f ? ' active' : '')}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={query ? 'No matches' : filter === 'closed' ? 'No closed shows' : 'No shows yet'}
          body={query ? 'Try a different search term.' : 'Create a show to start building your running order.'}
          action={!query && filter !== 'closed' ? <button className="btn primary" onClick={newShow}>New show</button> : null}
        />
      ) : (
        <div className="card-grid">
          {filtered.map((s) => {
            const actCount = (s.lineup || []).filter((e) => e.type === 'act').length;
            const segCount = (s.lineup || []).filter((e) => e.type === 'segment').length;
            const status = s.status || 'draft';
            return (
              <div
                key={s.id}
                className={'card clickable' + (status === 'packaged' ? ' packaged' : '')}
                onClick={() => onOpenShow(s.id)}
              >
                <div className="card-row">
                  <div>
                    <div className="card-title">{s.title || 'Untitled show'}</div>
                    <div className="card-sub">{formatDate(s.dateLabel)}{venueName(s.venueId) ? ` · ${venueName(s.venueId)}` : ''}</div>
                  </div>
                  <button
                    className="icon-btn danger"
                    title="Delete show"
                    onClick={(e) => { e.stopPropagation(); setDeleting(s); }}
                  >✕</button>
                </div>
                <div className="card-meta">
                  <div className="meta-line">
                    <span className="meta-label">Lineup</span>
                    <span className="data">{actCount} act{actCount === 1 ? '' : 's'}, {segCount} segment{segCount === 1 ? '' : 's'} · {runtime(s)}</span>
                  </div>
                  <div className="meta-line">
                    <span className="meta-label">Tickets</span>
                    <span className="data">{s.ticketPrice !== '' && s.ticketPrice != null ? money(s.ticketPrice) : '—'}</span>
                  </div>
                  {status === 'closed' && (
                    <div className="meta-line">
                      <span className="meta-label">Net</span>
                      <span className="data" style={{ color: netProfit(s) >= 0 ? 'var(--ledger-green)' : 'var(--ledger-brick)' }}>
                        {money(netProfit(s))}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 12 }}>
                  <StatusBadge status={status} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this show?"
          body={`"${deleting.title || 'Untitled show'}" will be removed from your records. Files already on disk are not affected.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await remove('shows', deleting.id);
            toast('Show deleted', deleting.title || 'Untitled show');
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
