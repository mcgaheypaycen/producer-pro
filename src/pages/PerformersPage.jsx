import React, { useMemo, useState } from 'react';
import { useData } from '../data.jsx';
import { useTopBar } from '../shell.jsx';
import { Drawer, Field, SearchInput, EmptyState, ConfirmDialog, useToast, PaymentChip } from '../ui.jsx';

export const PAYMENT_METHODS = ['Venmo', 'CashApp', 'PayPal', 'Zelle', 'Cash', 'Check', 'Other'];

export function PerformerForm({ performer, onClose, onSaved }) {
  const { save } = useData();
  const toast = useToast();
  const isNew = !performer?.id;
  const [addAct, setAddAct] = useState(false);
  const [actDraft, setActDraft] = useState({ name: '', aesthetic: '', length: '', tagline: '' });
  const [form, setForm] = useState({
    stageName: '', legalName: '', email: '', phone: '',
    paymentMethod: 'Venmo', paymentInfo: '',
    ...performer,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setAct = (key) => (e) => setActDraft((f) => ({ ...f, [key]: e.target.value }));

  const submit = async () => {
    if (!form.stageName.trim()) {
      toast('Stage name required', 'Give this performer a stage name before saving.', 'error');
      return;
    }
    if (addAct && !actDraft.name.trim()) {
      toast('Act name required', 'Enter an act name or uncheck “Also add an act”.', 'error');
      return;
    }
    const saved = await save('performers', form);
    if (addAct && actDraft.name.trim()) {
      const act = await save('acts', { ...actDraft, performerId: saved.id });
      toast('Performer and act added', `${saved.stageName} · ${act.name}`);
    } else {
      toast(performer?.id ? 'Performer updated' : 'Performer added', saved.stageName);
    }
    onSaved?.(saved);
    onClose();
  };

  return (
    <Drawer
      title={performer?.id ? 'Edit performer' : 'Add performer'}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={submit}>Save performer</button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Stage name">
          <input className="input" value={form.stageName} onChange={set('stageName')} placeholder="Velvet Thunder" autoFocus />
        </Field>
        <Field label="Legal name">
          <input className="input" value={form.legalName} onChange={set('legalName')} placeholder="Jane Doe" />
        </Field>
        <Field label="Email">
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" />
        </Field>
        <Field label="Phone">
          <input className="input" value={form.phone} onChange={set('phone')} placeholder="(555) 123-4567" />
        </Field>
        <Field label="Payment method">
          <select className="select" value={form.paymentMethod} onChange={set('paymentMethod')}>
            {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Payment info">
          <input className="input" value={form.paymentInfo} onChange={set('paymentInfo')} placeholder="@velvet-thunder" />
        </Field>

        {isNew && (
          <>
            <Field label="Also add an act" full>
              <label className="style-toggle" style={{ marginBottom: addAct ? 12 : 0 }}>
                <input type="checkbox" checked={addAct} onChange={(e) => setAddAct(e.target.checked)} />
                Create an act for this performer
              </label>
            </Field>
            {addAct && (
              <>
                <Field label="Act name">
                  <input className="input" value={actDraft.name} onChange={setAct('name')} placeholder="Feathers & Fire" />
                </Field>
                <Field label="Aesthetic">
                  <input className="input" value={actDraft.aesthetic} onChange={setAct('aesthetic')} placeholder="Classic burlesque, art deco glam" />
                </Field>
                <Field label="Length">
                  <input className="input" value={actDraft.length} onChange={setAct('length')} placeholder="4:30" />
                </Field>
                <Field label="Tagline" full>
                  <input className="input" value={actDraft.tagline} onChange={setAct('tagline')} placeholder="A smoldering tribute to the golden age of tease…" />
                </Field>
              </>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}

/** @deprecated use PerformerForm — kept for ActFormModal imports */
export const PerformerFormModal = PerformerForm;

export default function PerformersPage() {
  const { performers, acts, remove } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const openAdd = () => setEditing({});

  useTopBar(
    [{ label: 'Performers' }],
    <button className="btn primary" onClick={openAdd}>Add performer</button>
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return performers
      .filter((p) =>
        !q ||
        [p.stageName, p.legalName, p.email, p.phone, p.paymentInfo]
          .some((v) => (v || '').toLowerCase().includes(q))
      )
      .sort((a, b) => (a.stageName || '').localeCompare(b.stageName || ''));
  }, [performers, query]);

  return (
    <div className="page">
      <div className="page-toolbar">
        <div>
          <h1 className="h1">Performers</h1>
          <p className="page-lead">{performers.length} in your roster</p>
        </div>
        <SearchInput value={query} onChange={setQuery} placeholder="Search roster…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={query ? 'No matches' : 'No performers in the roster'}
          body={query ? 'Try a different search.' : 'Add performers to build shows and pre-fill payouts.'}
          action={!query ? <button className="btn primary" onClick={openAdd}>Add performer</button> : null}
        />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Stage name</th>
                <th>Contact</th>
                <th>Payment</th>
                <th>Acts</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const actCount = acts.filter((a) => a.performerId === p.id).length;
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setEditing(p)}>
                    <td className="name-cell">{p.stageName}</td>
                    <td>
                      <div>{p.email || '—'}</div>
                      <div className="mono" style={{ color: 'var(--on-paper-muted)', fontSize: 12 }}>{p.phone || ''}</div>
                    </td>
                    <td><PaymentChip method={p.paymentMethod} info={p.paymentInfo} /></td>
                    <td className="mono">{actCount}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn danger" title="Delete" onClick={() => setDeleting(p)}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && <PerformerForm performer={editing.id ? editing : null} onClose={() => setEditing(null)} />}

      {deleting && (
        <ConfirmDialog
          title="Delete performer?"
          body={`${deleting.stageName} will be removed from your roster. Their acts remain but lose their performer link.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await remove('performers', deleting.id);
            toast('Performer deleted', deleting.stageName);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
