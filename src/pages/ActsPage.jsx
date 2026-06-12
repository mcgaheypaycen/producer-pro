import React, { useMemo, useState } from 'react';
import { useData } from '../data.jsx';
import { useTopBar } from '../shell.jsx';
import { Modal, Field, SearchInput, EmptyState, ConfirmDialog, useToast, formatDate, StatusBadge } from '../ui.jsx';
import { illustrations, icons } from '../assets/index.js';
import Icon, { IconButton, BtnWithIcon } from '../components/Icon.jsx';
import { PerformerForm } from './PerformersPage.jsx';

function newLineupKey() {
  return Math.random().toString(36).slice(2, 10);
}

function AddActToShowModal({ act, onClose }) {
  const { shows, performers, venues, save } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');

  const venueName = (id) => venues.find((v) => v.id === id)?.name || '';

  const openShows = useMemo(() => {
    const q = query.toLowerCase();
    return shows
      .filter((s) => (s.status || 'draft') !== 'closed')
      .filter((s) => !q || [s.title, venueName(s.venueId), s.dateLabel].some((v) => (v || '').toLowerCase().includes(q)))
      .sort((a, b) => (b.dateLabel || '').localeCompare(a.dateLabel || '') || (a.title || '').localeCompare(b.title || ''));
  }, [shows, venues, query]);

  const addToShow = async (show) => {
    const performer = performers.find((p) => p.id === act.performerId);
    const lineup = show.lineup || [];
    await save('shows', {
      ...show,
      lineup: [
        ...lineup,
        {
          key: newLineupKey(),
          type: 'act',
          actId: act.id,
          performerId: act.performerId,
          performerName: performer?.stageName || '',
          actName: act.name,
        },
      ],
    });
    toast('Added to show', `${act.name} → ${show.title || 'Untitled show'}`);
    onClose();
  };

  return (
    <Modal
      title="Add to show"
      onClose={onClose}
      footer={<button className="btn ghost" onClick={onClose}>Cancel</button>}
    >
      <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12, fontSize: 14 }}>
        Add <strong>{act.name}</strong> to the running order of an open show.
      </p>
      <div style={{ marginBottom: 12 }}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search open shows…" />
      </div>
      {openShows.length === 0 ? (
        <div style={{ color: 'var(--on-paper-muted)', padding: '24px 4px', textAlign: 'center' }}>
          {shows.some((s) => (s.status || 'draft') !== 'closed')
            ? 'No open shows match your search.'
            : 'No open shows. Create a show or reopen a draft first.'}
        </div>
      ) : (
        <div className="picker-list">
          {openShows.map((s) => {
            const actCount = (s.lineup || []).filter((e) => e.type === 'act').length;
            return (
              <button key={s.id} className="picker-item" onClick={() => addToShow(s)}>
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

export function ActFormModal({ act, defaultPerformerId, onClose, onSaved }) {
  const { performers, save } = useData();
  const toast = useToast();
  const [addingPerformer, setAddingPerformer] = useState(false);
  const [form, setForm] = useState({
    performerId: defaultPerformerId || '',
    name: '', aesthetic: '', length: '', tagline: '', lightingNotes: '', stageNotes: '',
    mediaPath: '', mediaName: '',
    ...act,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickMedia = async () => {
    const file = await window.api.pickMedia();
    if (!file) return;
    setForm((f) => ({
      ...f,
      mediaPath: file.path,
      mediaName: file.name,
      ...(file.length ? { length: file.length } : {}),
    }));
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast('Act name required', 'Give this act a name before saving.', 'error');
      return;
    }
    if (!form.performerId) {
      toast('Performer required', 'Choose which performer this act belongs to.', 'error');
      return;
    }
    const saved = await save('acts', form);
    toast(act?.id ? 'Act updated' : 'Act created', saved.name);
    onSaved?.(saved);
    onClose();
  };

  const sortedPerformers = [...performers].sort((a, b) => (a.stageName || '').localeCompare(b.stageName || ''));

  return (
    <Modal
      title={act?.id ? 'Edit act' : 'Add act'}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={submit}>Save act</button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Act name">
          <input className="input" value={form.name} onChange={set('name')} placeholder="Feathers & Fire" autoFocus />
        </Field>
        <Field label="Performer">
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="select" value={form.performerId} onChange={set('performerId')} style={{ flex: 1 }}>
              <option value="">Select performer…</option>
              {sortedPerformers.map((p) => <option key={p.id} value={p.id}>{p.stageName}</option>)}
            </select>
            <IconButton src={icons.action('add')} title="Add performer" onClick={() => setAddingPerformer(true)} />
          </div>
        </Field>
        <Field label="Aesthetic">
          <input className="input" value={form.aesthetic} onChange={set('aesthetic')} placeholder="Classic burlesque, art deco glam" />
        </Field>
        <Field label="Length" helper='Editable anytime — auto-fills from audio/video media; images keep your entered length'>
          <input className="input" value={form.length} onChange={set('length')} placeholder="4:30" />
        </Field>
        <Field label="Tagline" full>
          <input className="input" value={form.tagline} onChange={set('tagline')} placeholder="A smoldering tribute to the golden age of tease…" />
        </Field>
        <Field label="Lighting notes" full>
          <textarea className="textarea" value={form.lightingNotes} onChange={set('lightingNotes')} placeholder="Deep red wash, follow spot on entrance…" />
        </Field>
        <Field label="Stage notes" full>
          <textarea className="textarea" value={form.stageNotes} onChange={set('stageNotes')} placeholder="Chair set center stage…" />
        </Field>
        <Field label="Media file" full>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn secondary sm" onClick={pickMedia} type="button">
              {form.mediaPath ? 'Replace media' : 'Upload media'}
            </button>
            {form.mediaPath ? (
              <>
                <span className={'media-badge ok'}>
                  <Icon src={icons.status('badge-media-ok')} size={12} alt="" />
                  {form.mediaName}
                </span>
                <IconButton src={icons.action('delete')} className="danger" type="button" onClick={() => setForm((f) => ({ ...f, mediaPath: '', mediaName: '' }))} title="Remove media" />
              </>
            ) : (
              <span style={{ color: 'var(--on-paper-muted)', fontSize: 13 }}>No file attached</span>
            )}
          </div>
        </Field>
      </div>

      {addingPerformer && (
        <PerformerForm
          onClose={() => setAddingPerformer(false)}
          onSaved={(saved) => {
            setForm((f) => ({ ...f, performerId: saved.id }));
            setAddingPerformer(false);
          }}
        />
      )}
    </Modal>
  );
}

export default function ActsPage() {
  const { acts, performers, remove } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [addingToShow, setAddingToShow] = useState(null);

  const openAdd = () => setEditing({});

  useTopBar(
    [{ label: 'Acts' }],
    <BtnWithIcon icon={icons.action('add')} className="btn primary" onClick={openAdd}>Add act</BtnWithIcon>
  );

  const performerName = (id) => performers.find((p) => p.id === id)?.stageName || 'Unknown performer';

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return acts
      .filter((a) =>
        !q ||
        [a.name, a.aesthetic, a.tagline, performerName(a.performerId)]
          .some((s) => (s || '').toLowerCase().includes(q))
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [acts, performers, query]);

  return (
    <div className="page">
      <div className="page-toolbar">
        <div>
          <h1 className="h1">Acts</h1>
          <p className="page-lead">{acts.length} in your library</p>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search acts or performers…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration={!query ? illustrations.emptyActs() : null}
          title={query ? 'No matches' : 'No acts in the library'}
          body={query ? 'Try a different search.' : 'Create acts for your performers — reusable across every show.'}
          action={!query ? <BtnWithIcon icon={icons.action('add')} className="btn primary" onClick={openAdd}>Add act</BtnWithIcon> : null}
        />
      ) : (
        <div className="card-grid">
          {filtered.map((a) => (
            <div key={a.id} className="card clickable" onClick={() => setEditing(a)}>
              <div className="card-row">
                <div>
                  <div className="card-title">{a.name}</div>
                  <div className="card-sub" style={{ color: 'var(--wine-600)', fontWeight: 600, fontStyle: 'normal' }}>
                    {performerName(a.performerId)}
                  </div>
                </div>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="btn ghost sm" title="Add to open show" onClick={() => setAddingToShow(a)}>Add to show</button>
                  <IconButton src={icons.action('delete')} className="danger" title="Delete" onClick={() => setDeleting(a)} />
                </div>
              </div>
              {a.tagline && <div className="card-sub italic" style={{ marginTop: 8 }}>"{a.tagline}"</div>}
              <div className="card-meta">
                <div className="meta-line"><span className="meta-label">Aesthetic</span>{a.aesthetic || '—'}</div>
                <div className="meta-line"><span className="meta-label">Length</span><span className="data">{a.length || '—'}</span></div>
              </div>
              <span className={'media-badge ' + (a.mediaPath ? 'ok' : 'missing')} style={{ marginTop: 10, display: 'inline-flex' }}>
                <Icon src={icons.status(a.mediaPath ? 'badge-media-ok' : 'badge-media-missing')} size={12} alt="" />
                {a.mediaPath ? <>media · {a.mediaName}</> : 'no media'}
              </span>
            </div>
          ))}
        </div>
      )}

      {editing && <ActFormModal act={editing.id ? editing : null} onClose={() => setEditing(null)} />}

      {addingToShow && (
        <AddActToShowModal act={addingToShow} onClose={() => setAddingToShow(null)} />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete act?"
          body={`"${deleting.name}" will be removed from your act library.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await remove('acts', deleting.id);
            toast('Act deleted', deleting.name);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
