import React, { useMemo, useState } from 'react';
import { useData } from '../data.jsx';
import { useTopBar } from '../shell.jsx';
import { Drawer, Field, SearchInput, EmptyState, ConfirmDialog, useToast } from '../ui.jsx';
import { illustrations, icons } from '../assets/index.js';
import { IconButton, BtnWithIcon } from '../components/Icon.jsx';

export function VenueForm({ venue, onClose, onSaved }) {
  const { save } = useData();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '', address: '', contactName: '', contactEmail: '', contactPhone: '', capacity: '', notes: '',
    ...venue,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) {
      toast('Venue name required', 'Give this venue a name before saving.', 'error');
      return;
    }
    const saved = await save('venues', form);
    toast(venue?.id ? 'Venue updated' : 'Venue added', saved.name);
    onSaved?.(saved);
    onClose();
  };

  return (
    <Drawer
      title={venue?.id ? 'Edit venue' : 'Add venue'}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={submit}>Save venue</button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Venue name" full>
          <input className="input" value={form.name} onChange={set('name')} placeholder="The Red Curtain Lounge" autoFocus />
        </Field>
        <Field label="Address" full>
          <input className="input" value={form.address} onChange={set('address')} placeholder="123 Main St, City" />
        </Field>
        <Field label="Contact name">
          <input className="input" value={form.contactName} onChange={set('contactName')} />
        </Field>
        <Field label="Capacity">
          <input className="input" type="number" min="0" value={form.capacity} onChange={set('capacity')} placeholder="120" />
        </Field>
        <Field label="Contact email">
          <input className="input" type="email" value={form.contactEmail} onChange={set('contactEmail')} />
        </Field>
        <Field label="Contact phone">
          <input className="input" value={form.contactPhone} onChange={set('contactPhone')} />
        </Field>
        <Field label="Notes" full>
          <textarea className="textarea" value={form.notes} onChange={set('notes')} placeholder="Load-in through the back alley…" />
        </Field>
      </div>
    </Drawer>
  );
}

export const VenueFormModal = VenueForm;

export default function VenuesPage() {
  const { venues, shows, remove } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => setEditing({});

  useTopBar(
    [{ label: 'Venues' }],
    <BtnWithIcon icon={icons.action('add')} className="btn primary" onClick={openAdd}>Add venue</BtnWithIcon>
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return venues
      .filter((v) =>
        !q ||
        [v.name, v.address, v.contactName, v.notes]
          .some((s) => (s || '').toLowerCase().includes(q))
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [venues, query]);

  return (
    <div className="page">
      <div className="page-toolbar">
        <div>
          <h1 className="h1">Venues</h1>
          <p className="page-lead">{venues.length} saved</p>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search venues…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration={!query ? illustrations.emptyVenues() : null}
          title={query ? 'No matches' : 'No venues saved'}
          body={query ? 'Try a different search.' : 'Add the venues where you produce shows.'}
          action={!query ? <BtnWithIcon icon={icons.action('add')} className="btn primary" onClick={openAdd}>Add venue</BtnWithIcon> : null}
        />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Contact</th>
                <th>Capacity</th>
                <th>Shows</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const showCount = shows.filter((s) => s.venueId === v.id).length;
                return (
                  <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => setEditing(v)}>
                    <td>
                      <div className="name-cell">{v.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--on-paper-muted)', fontStyle: 'italic' }}>{v.address || ''}</div>
                    </td>
                    <td>
                      <div>{v.contactName || '—'}</div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--on-paper-muted)' }}>{v.contactPhone || ''}</div>
                    </td>
                    <td className="mono">{v.capacity || '—'}</td>
                    <td className="mono">{showCount}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <IconButton src={icons.action('delete')} className="danger" title="Delete" onClick={() => setDeleting(v)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && <VenueForm venue={editing.id ? editing : null} onClose={() => setEditing(null)} />}

      {deleting && (
        <ConfirmDialog
          title="Delete venue?"
          body={`${deleting.name} will be removed from your saved venues.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await remove('venues', deleting.id);
            toast('Venue deleted', deleting.name);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
