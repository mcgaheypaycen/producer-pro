import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../data.jsx';
import { useToast, money, moneySigned, PaymentChip, Field } from '../ui.jsx';
import { icons } from '../assets/index.js';
import { IconButton, BtnWithIcon } from '../components/Icon.jsx';
import { PAYMENT_METHODS } from './PerformersPage.jsx';
import SettlementExportModal from '../components/SettlementExportModal.jsx';
import { closeoutTotals, newTicketTier, normalizeCloseout } from '../lib/closeoutMath.js';
import {
  allPaymentTreatments,
  loadCustomPaymentTreatments,
  addCustomPaymentTreatment,
  removeCustomPaymentTreatment,
  applyPaymentTreatment,
  treatmentSummary,
} from '../lib/paymentTreatments.js';

function LedgerSection({ title, subtitle, children, totalLabel, total, negative }) {
  return (
    <div className="ledger-section">
      <div className="ledger-section-title">
        {title}
        {subtitle && <span className="data">{subtitle}</span>}
      </div>
      {children}
      <div className="ledger-total">
        <span>{totalLabel}</span>
        <span className="data" style={{ color: negative ? 'var(--ledger-brick)' : 'var(--ledger-green)' }}>
          {negative ? moneySigned(total, false) : moneySigned(total, true)}
        </span>
      </div>
    </div>
  );
}

export default function CloseoutPanel({ show, venueName, onSave, onChange, readOnly }) {
  const { performers, acts } = useData();
  const toast = useToast();

  const buildInitial = () => {
    if (show.closeout) return normalizeCloseout(show.closeout, show);

    const seen = new Set();
    const payouts = [];
    for (const entry of show.lineup || []) {
      if (entry.type !== 'act') continue;
      const act = acts.find((a) => a.id === entry.actId);
      const performerId = act?.performerId || entry.performerId;
      if (!performerId || seen.has(performerId)) continue;
      seen.add(performerId);
      const performer = performers.find((p) => p.id === performerId);
      payouts.push({
        performerId,
        performerName: performer?.stageName || entry.performerName || 'Performer',
        amount: '',
        method: performer?.paymentMethod || 'Venmo',
      });
    }

    return normalizeCloseout({
      revenues: [{ source: 'Door cash', amount: '' }],
      expenses: [],
      payouts,
    }, show);
  };

  const [closeout, setCloseout] = useState(buildInitial);
  const [customTreatments, setCustomTreatments] = useState(() => loadCustomPaymentTreatments());
  const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [treatmentDraft, setTreatmentDraft] = useState({
    name: '',
    type: 'split_after_fee',
    producerFee: '200',
    flatRate: '75',
  });

  const treatments = useMemo(() => allPaymentTreatments(customTreatments), [customTreatments]);
  const totals = useMemo(() => closeoutTotals(closeout, show), [closeout, show]);
  const performersById = useMemo(
    () => Object.fromEntries(performers.map((p) => [p.id, p])),
    [performers],
  );

  const patch = (key) => (value) => setCloseout((c) => ({ ...c, [key]: value }));

  useEffect(() => {
    onChange?.(closeout);
  }, [closeout, onChange]);

  const updateTicketTier = (index, field, value) => {
    setCloseout((c) => {
      const tiers = (c.ticketTiers || []).slice();
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...c, ticketTiers: tiers };
    });
  };

  const applyTreatment = () => {
    const treatment = treatments.find((t) => t.id === selectedTreatmentId);
    if (!treatment) {
      toast('Choose a treatment', 'Select a payment treatment to apply.', 'error');
      return;
    }
    const nextPayouts = applyPaymentTreatment(treatment, {
      revenue: totals.revenue,
      expenses: closeout.expenses,
      payouts: closeout.payouts,
    });
    setCloseout((c) => ({
      ...c,
      payouts: nextPayouts,
      appliedTreatmentId: treatment.id,
      appliedTreatmentName: treatment.name,
    }));
    toast('Payouts updated', treatmentSummary(treatment));
  };

  const saveCustomTreatment = () => {
    const added = addCustomPaymentTreatment({
      name: treatmentDraft.name,
      type: treatmentDraft.type,
      producerFee: treatmentDraft.producerFee,
      flatRate: treatmentDraft.flatRate,
    });
    if (!added) return;
    setCustomTreatments(loadCustomPaymentTreatments());
    setSelectedTreatmentId(added.id);
    setShowAddTreatment(false);
    setTreatmentDraft({ name: '', type: 'split_after_fee', producerFee: '200', flatRate: '75' });
    toast('Treatment saved', added.name);
  };

  const saveDraft = async () => {
    await onSave({ closeout, status: show.status });
    toast('Closeout saved', 'You can finish settling later.');
  };

  const dimClass = readOnly ? ' read-only-dim' : '';

  return (
    <div className={dimClass}>
      <div className="ledger-section" style={{ marginBottom: 24 }}>
        <div className="ledger-section-title">
          Ticket sales
          <span className="data">{totals.ticketsSold} sold · {moneySigned(totals.ticketRevenue, true)}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--on-paper-muted)', marginTop: 0, marginBottom: 12 }}>
          Enter each price tier separately — general admission, VIP, comps at $0, etc.
        </p>

        <div className="ledger-rows">
          {(closeout.ticketTiers || []).map((tier, i) => (
            readOnly ? (
              <div key={tier.id || i} className="ledger-row">
                <span>
                  {tier.label || (Number(tier.price) === 0 ? 'Comp' : 'Tickets')}
                  {' · '}
                  <span className="data">{Number(tier.quantity) || 0} × {money(tier.price)}</span>
                </span>
                <span className="ledger-row-amount positive">{moneySigned((Number(tier.price) || 0) * (Number(tier.quantity) || 0), true)}</span>
              </div>
            ) : (
              <div key={tier.id || i} className="ledger-edit-row ticket-tier">
                <input
                  className="input"
                  placeholder="General, VIP, Comp…"
                  value={tier.label ?? ''}
                  onChange={(e) => updateTicketTier(i, 'label', e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={tier.price ?? ''}
                  onChange={(e) => updateTicketTier(i, 'price', e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Qty"
                  value={tier.quantity ?? ''}
                  onChange={(e) => updateTicketTier(i, 'quantity', e.target.value)}
                />
                <span className="ledger-tier-subtotal data">{money((Number(tier.price) || 0) * (Number(tier.quantity) || 0))}</span>
                <IconButton
                  src={icons.action('delete')}
                  className="danger"
                  title="Remove tier"
                  onClick={() => patch('ticketTiers')((closeout.ticketTiers || []).filter((_, j) => j !== i))}
                />
              </div>
            )
          ))}
        </div>

        {!readOnly && (
          <button
            className="btn ghost sm"
            style={{ marginTop: 8 }}
            onClick={() => patch('ticketTiers')([...(closeout.ticketTiers || []), newTicketTier()])}
          >
            Add price tier
          </button>
        )}

        <div className="ledger-total">
          <span>Ticket revenue</span>
          <span className="data" style={{ color: 'var(--ledger-green)' }}>{moneySigned(totals.ticketRevenue, true)}</span>
        </div>
      </div>

      <div className="ledger-section" style={{ marginBottom: 24 }}>
        <div className="ledger-section-title">Other revenue</div>
        <div className="ledger-rows">
          {(closeout.revenues || []).map((row, i) => (
            readOnly ? (
              <div key={i} className="ledger-row">
                <span>{row.source || '—'}</span>
                <span className="ledger-row-amount positive">{moneySigned(row.amount, true)}</span>
              </div>
            ) : (
              <div key={i} className="ledger-edit-row">
                <input className="input" placeholder="Venmo, Eventbrite, bar sales…" value={row.source ?? ''} onChange={(e) => {
                  const next = closeout.revenues.slice();
                  next[i] = { ...row, source: e.target.value };
                  patch('revenues')(next);
                }} />
                <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={row.amount ?? ''} onChange={(e) => {
                  const next = closeout.revenues.slice();
                  next[i] = { ...row, amount: e.target.value };
                  patch('revenues')(next);
                }} />
                <IconButton src={icons.action('delete')} className="danger" title="Remove" onClick={() => patch('revenues')(closeout.revenues.filter((_, j) => j !== i))} />
              </div>
            )
          ))}
        </div>
        {!readOnly && (
          <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => patch('revenues')([...(closeout.revenues || []), { source: '', amount: '' }])}>
            Add source
          </button>
        )}
        <div className="ledger-total">
          <span>Total revenue</span>
          <span className="data" style={{ color: 'var(--ledger-green)' }}>{moneySigned(totals.revenue, true)}</span>
        </div>
      </div>

      <LedgerSection title="Expenses" totalLabel="Total expenses" total={totals.expenses} negative>
        <div className="ledger-rows">
          {(closeout.expenses || []).length === 0 && readOnly ? (
            <div style={{ color: 'var(--on-paper-muted)', fontSize: 13, padding: '8px 0' }}>Nothing recorded.</div>
          ) : (closeout.expenses || []).map((row, i) => (
            readOnly ? (
              <div key={i} className="ledger-row">
                <span>{row.description || '—'}</span>
                <span className="ledger-row-amount negative">{moneySigned(row.amount, false)}</span>
              </div>
            ) : (
              <div key={i} className="ledger-edit-row">
                <input className="input" placeholder="Venue rental, props, marketing…" value={row.description ?? ''} onChange={(e) => {
                  const next = closeout.expenses.slice();
                  next[i] = { ...row, description: e.target.value };
                  patch('expenses')(next);
                }} />
                <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={row.amount ?? ''} onChange={(e) => {
                  const next = closeout.expenses.slice();
                  next[i] = { ...row, amount: e.target.value };
                  patch('expenses')(next);
                }} />
                <IconButton src={icons.action('delete')} className="danger" title="Remove" onClick={() => patch('expenses')(closeout.expenses.filter((_, j) => j !== i))} />
              </div>
            )
          ))}
        </div>
        {!readOnly && (
          <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => patch('expenses')([...(closeout.expenses || []), { description: '', amount: '' }])}>
            Add expense
          </button>
        )}
      </LedgerSection>

      <LedgerSection title="Performer payouts" subtitle="from lineup" totalLabel="Total payouts" total={totals.payouts} negative>
        {!readOnly && (
          <div className="closeout-treatment-panel">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Payment treatment</div>
            <p style={{ fontSize: 12, color: 'var(--on-paper-muted)', marginTop: 0, marginBottom: 10 }}>
              Apply a preset rule to calculate payout amounts. You can still edit individual rows afterward.
            </p>
            <div className="closeout-treatment-row">
              <select className="select" value={selectedTreatmentId} onChange={(e) => setSelectedTreatmentId(e.target.value)}>
                <option value="">Select treatment…</option>
                {treatments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button type="button" className="btn secondary sm" onClick={applyTreatment}>Apply</button>
            </div>
            {selectedTreatmentId && (
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '8px 0 0' }}>
                {treatmentSummary(treatments.find((t) => t.id === selectedTreatmentId))}
              </p>
            )}
            {closeout.appliedTreatmentName && (
              <p style={{ fontSize: 12, color: 'var(--rose-600)', margin: '8px 0 0' }}>
                Applied: {closeout.appliedTreatmentName}
              </p>
            )}
            {showAddTreatment ? (
              <div className="import-segment-add-form" style={{ marginTop: 12 }}>
                <Field label="Treatment name">
                  <input className="input" value={treatmentDraft.name} onChange={(e) => setTreatmentDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Door split w/ $150 fee" />
                </Field>
                <Field label="Rule type">
                  <select className="select" value={treatmentDraft.type} onChange={(e) => setTreatmentDraft((d) => ({ ...d, type: e.target.value }))}>
                    <option value="split_after_fee">Producer fee off top, split remainder equally</option>
                    <option value="flat_rate">Flat rate per performer</option>
                  </select>
                </Field>
                {treatmentDraft.type === 'split_after_fee' ? (
                  <Field label="Producer fee ($)">
                    <input className="input" type="number" min="0" step="0.01" value={treatmentDraft.producerFee} onChange={(e) => setTreatmentDraft((d) => ({ ...d, producerFee: e.target.value }))} />
                  </Field>
                ) : (
                  <Field label="Flat rate per performer ($)">
                    <input className="input" type="number" min="0" step="0.01" value={treatmentDraft.flatRate} onChange={(e) => setTreatmentDraft((d) => ({ ...d, flatRate: e.target.value }))} />
                  </Field>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="button" className="btn primary sm" onClick={saveCustomTreatment}>Save treatment</button>
                  <button type="button" className="btn ghost sm" onClick={() => setShowAddTreatment(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button type="button" className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setShowAddTreatment(true)}>
                + Save custom treatment
              </button>
            )}
            {customTreatments.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {customTreatments.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="btn ghost sm"
                    onClick={() => {
                      removeCustomPaymentTreatment(t.id);
                      setCustomTreatments(loadCustomPaymentTreatments());
                      if (selectedTreatmentId === t.id) setSelectedTreatmentId('');
                    }}
                  >
                    Remove {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ledger-rows" style={{ marginTop: readOnly ? 0 : 16 }}>
          {(closeout.payouts || []).map((row, i) => (
            readOnly ? (
              <div key={i} className="ledger-row">
                <span className="ledger-row-label">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{row.performerName}</span>
                  <PaymentChip method={row.method} />
                </span>
                <span className="ledger-row-amount negative">{moneySigned(row.amount, false)}</span>
              </div>
            ) : (
              <div key={i} className="ledger-edit-row payout">
                <input className="input" placeholder="Performer name" value={row.performerName ?? ''} onChange={(e) => {
                  const next = closeout.payouts.slice();
                  next[i] = { ...row, performerName: e.target.value };
                  patch('payouts')(next);
                }} />
                <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={row.amount ?? ''} onChange={(e) => {
                  const next = closeout.payouts.slice();
                  next[i] = { ...row, amount: e.target.value };
                  patch('payouts')(next);
                }} />
                <select className="select" value={row.method || 'Venmo'} onChange={(e) => {
                  const next = closeout.payouts.slice();
                  next[i] = { ...row, method: e.target.value };
                  patch('payouts')(next);
                }}>
                  {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
                <IconButton src={icons.action('delete')} className="danger" title="Remove" onClick={() => patch('payouts')(closeout.payouts.filter((_, j) => j !== i))} />
              </div>
            )
          ))}
        </div>
        {!readOnly && (
          <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => patch('payouts')([...(closeout.payouts || []), { performerName: '', amount: '', method: 'Venmo' }])}>
            Add payout
          </button>
        )}
      </LedgerSection>

      <div className="net-bar">
        <span className="net-bar-label">Net profit</span>
        <span className={'net-bar-value' + (totals.net < 0 ? ' negative' : '')}>
          {totals.net >= 0 ? '+' : '−'}{money(Math.abs(totals.net))}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
        {readOnly ? (
          <BtnWithIcon icon={icons.action('export')} className="btn primary" onClick={() => setShowExportModal(true)}>
            Export settlement
          </BtnWithIcon>
        ) : (
          <button className="btn secondary" onClick={saveDraft}>Save progress</button>
        )}
      </div>

      {showExportModal && (
        <SettlementExportModal
          show={{ ...show, venueName }}
          closeout={closeout}
          performersById={performersById}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
