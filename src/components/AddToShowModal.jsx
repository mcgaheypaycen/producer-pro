import React, { useMemo, useState } from 'react';
import { useData } from '../data.jsx';
import { Modal, SearchInput, StatusBadge, formatDate, useToast } from '../ui.jsx';
import { icons } from '../assets/index.js';
import { BtnWithIcon } from './Icon.jsx';

export function newLineupKey() {
  return Math.random().toString(36).slice(2, 10);
}

/** Builds a lineup entry for an act, resolving the performer's stage name. */
export function actLineupEntry(act, performers) {
  const performer = performers.find((p) => p.id === act.performerId);
  return {
    key: newLineupKey(),
    type: 'act',
    actId: act.id,
    performerId: act.performerId,
    performerName: performer?.stageName || '',
    actName: act.name,
  };
}

/**
 * Shared picker: add something to an existing open show, or spin up a new
 * show with it already applied.
 *
 * - `entityLabel`: what's being added, for copy ("Feathers & Fire")
 * - `applyToShow(show)`: returns the modified show object to save; called
 *   with an existing show or a fresh draft
 * - `onOpenShow(showId)`: navigate to the show editor
 */
export default function AddToShowModal({ title, description, entityLabel, applyToShow, onOpenShow, onClose }) {
  const { shows, venues, save } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  const venueName = (id) => venues.find((v) => v.id === id)?.name || '';

  const openShows = useMemo(() => {
    const q = query.toLowerCase();
    return shows
      .filter((s) => (s.status || 'draft') !== 'closed')
      .filter((s) => !q || [s.title, venueName(s.venueId), s.dateLabel].some((v) => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => (b.dateLabel || '').localeCompare(a.dateLabel || '') || (a.title || '').localeCompare(b.title || ''));
  }, [shows, venues, query]);

  const addToExisting = async (show) => {
    if (busy) return;
    setBusy(true);
    try {
      await save('shows', applyToShow(show));
      toast('Added to show', `${entityLabel} → ${show.title || 'Untitled show'}`, 'success', onOpenShow ? {
        label: 'Open show',
        onClick: () => onOpenShow(show.id),
      } : undefined);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const createNew = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const draft = {
        title: '',
        dateLabel: new Date().toISOString().slice(0, 10),
        venueId: '',
        ticketPrice: '',
        lineup: [],
        status: 'draft',
      };
      const saved = await save('shows', applyToShow(draft));
      toast('Show created', `New show started with ${entityLabel}.`);
      onClose();
      onOpenShow?.(saved.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <BtnWithIcon icon={icons.action('add')} className="btn primary" onClick={createNew} disabled={busy}>
            New show
          </BtnWithIcon>
        </>
      }
    >
      <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12, fontSize: 14 }}>{description}</p>
      <div style={{ marginBottom: 12 }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search open shows…" />
      </div>
      {openShows.length === 0 ? (
        <div style={{ color: 'var(--on-paper-muted)', padding: '24px 4px', textAlign: 'center' }}>
          {shows.some((s) => (s.status || 'draft') !== 'closed')
            ? 'No open shows match your search.'
            : 'No open shows yet — use “New show” below to start one.'}
        </div>
      ) : (
        <div className="picker-list">
          {openShows.map((s) => {
            const actCount = (s.lineup || []).filter((e) => e.type === 'act').length;
            return (
              <button key={s.id} className="picker-item" onClick={() => addToExisting(s)} disabled={busy}>
                <div>
                  <div className="picker-name">{s.title || 'Untitled show'}</div>
                  <div className="picker-sub">
                    {[s.dateLabel ? formatDate(s.dateLabel) : '', venueName(s.venueId), `${actCount} act${actCount === 1 ? '' : 's'}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <StatusBadge status={s.status || 'draft'} />
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
