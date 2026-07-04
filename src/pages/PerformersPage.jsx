import React, { useMemo, useState } from 'react';
import { useData } from '../data.jsx';
import { useTopBar } from '../shell.jsx';
import { Drawer, Modal, Field, SearchInput, EmptyState, ConfirmDialog, useToast, PaymentChip } from '../ui.jsx';
import { illustrations, icons } from '../assets/index.js';
import Icon, { IconButton, BtnWithIcon } from '../components/Icon.jsx';
import AddToShowModal, { actLineupEntry } from '../components/AddToShowModal.jsx';
import ImportGoogleFormButton from '../components/ImportGoogleFormButton.jsx';
import { ActFormModal } from './ActsPage.jsx';

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

/**
 * Two-step flow: performers join a show through one of their acts, so pick
 * (or create) the act first, then pick the show.
 */
function AddPerformerToShow({ performer, onOpenShow, onClose }) {
  const { acts, performers } = useData();
  const performerActs = acts
    .filter((a) => a.performerId === performer.id)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const [chosenAct, setChosenAct] = useState(null);
  // No acts yet: jump straight into creating one.
  const [creatingAct, setCreatingAct] = useState(performerActs.length === 0);

  if (chosenAct) {
    return (
      <AddToShowModal
        title="Add to show"
        description={<>Add <strong>{performer.stageName}</strong> ({chosenAct.name}) to the running order of an open show, or start a new one.</>}
        entityLabel={`${performer.stageName} · ${chosenAct.name}`}
        applyToShow={(show) => ({
          ...show,
          lineup: [...(show.lineup || []), actLineupEntry(chosenAct, performers)],
        })}
        onOpenShow={onOpenShow}
        onClose={onClose}
      />
    );
  }

  if (creatingAct) {
    return (
      <ActFormModal
        defaultPerformerId={performer.id}
        onClose={() => (performerActs.length === 0 ? onClose() : setCreatingAct(false))}
        onSaved={(saved) => setChosenAct(saved)}
      />
    );
  }

  return (
    <Modal
      title={`Add ${performer.stageName} to a show`}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <BtnWithIcon icon={icons.action('add')} className="btn secondary" onClick={() => setCreatingAct(true)}>
            New act
          </BtnWithIcon>
        </>
      }
    >
      <p style={{ color: 'var(--on-paper-muted)', marginBottom: 12, fontSize: 14 }}>
        Which act should {performer.stageName} perform?
      </p>
      <div className="picker-list">
        {performerActs.map((a) => (
          <button key={a.id} className="picker-item" onClick={() => setChosenAct(a)}>
            <div>
              <div className="picker-name">{a.name}</div>
              <div className="picker-sub">{[a.aesthetic, a.length].filter(Boolean).join(' · ') || '—'}</div>
            </div>
            <span style={{ color: 'var(--wine-600)' }}>
              <Icon src={icons.action('add')} size={16} alt="" />
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export default function PerformersPage({ onOpenShow }) {
  const { performers, acts, remove } = useData();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [addingToShow, setAddingToShow] = useState(null);

  const openAdd = () => setEditing({});

  useTopBar(
    [{ label: 'Performers' }],
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <ImportGoogleFormButton />
      <BtnWithIcon icon={icons.action('add')} className="btn primary" onClick={openAdd}>Add performer</BtnWithIcon>
    </div>
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
          illustration={!query ? illustrations.emptyPerformers() : null}
          title={query ? 'No matches' : 'No performers in the roster'}
          body={query ? 'Try a different search.' : 'Add performers to build shows and pre-fill payouts.'}
          action={!query ? <BtnWithIcon icon={icons.action('add')} className="btn primary" onClick={openAdd}>Add performer</BtnWithIcon> : null}
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
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button className="btn ghost sm" title="Add to a show" onClick={() => setAddingToShow(p)}>Add to show</button>
                        <IconButton src={icons.action('delete')} className="danger" title="Delete" onClick={() => setDeleting(p)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && <PerformerForm performer={editing.id ? editing : null} onClose={() => setEditing(null)} />}

      {addingToShow && (
        <AddPerformerToShow
          performer={addingToShow}
          onOpenShow={onOpenShow}
          onClose={() => setAddingToShow(null)}
        />
      )}

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
