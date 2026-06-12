import React, { useEffect, useState } from 'react';
import { useData } from '../data.jsx';
import { useToast, money, moneySigned, PaymentChip } from '../ui.jsx';
import { PAYMENT_METHODS } from './PerformersPage.jsx';

const sum = (arr) => (arr || []).reduce((t, x) => t + (Number(x.amount) || 0), 0);

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
        <span className={'data ' + (negative ? '' : '')} style={{ color: negative ? 'var(--ledger-brick)' : 'var(--ledger-green)' }}>
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
    if (show.closeout) return show.closeout;
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
    return {
      ticketsSold: '',
      revenues: [{ source: 'Door cash', amount: '' }],
      expenses: [],
      payouts,
    };
  };

  const [closeout, setCloseout] = useState(buildInitial);

  const patch = (key) => (value) => setCloseout((c) => ({ ...c, [key]: value }));

  useEffect(() => {
    onChange?.(closeout);
  }, [closeout, onChange]);

  const hasTicketPrice = show.ticketPrice !== '' && show.ticketPrice != null;
  const ticketRevenue = (Number(closeout.ticketsSold) || 0) * (Number(show.ticketPrice) || 0);
  const revenue = ticketRevenue + sum(closeout.revenues);
  const expenses = sum(closeout.expenses);
  const payouts = sum(closeout.payouts);
  const net = revenue - expenses - payouts;

  const saveDraft = async () => {
    await onSave({ closeout, status: show.status });
    toast('Closeout saved', 'You can finish settling later.');
  };

  const exportCsv = async () => {
    const result = await window.api.exportCsv({
      show: { ...show, venueName },
      closeout: show.closeout || closeout,
    });
    if (result?.canceled) return;
    if (result?.error) toast('Export failed', result.error, 'error');
    else toast('Settlement exported', result.filePath);
  };

  const dimClass = readOnly ? ' read-only-dim' : '';

  return (
    <div className={dimClass}>
      <div className="ledger-section" style={{ marginBottom: 24 }}>
        <div className="ledger-section-title">Revenue · <span className="data">{closeout.ticketsSold || 0} tickets sold</span></div>
        {!readOnly ? (
          <div style={{ marginBottom: 12 }}>
            <label className="field-label">Tickets sold</label>
            <input
              className="input"
              style={{ width: 140, marginTop: 6 }}
              type="number"
              min="0"
              placeholder="0"
              value={closeout.ticketsSold ?? ''}
              onChange={(e) => patch('ticketsSold')(e.target.value)}
            />
            {!hasTicketPrice && (
              <p style={{ fontSize: 12, color: 'var(--on-paper-muted)', marginTop: 6 }}>
                Set a ticket price on the show to count ticket sales as revenue.
              </p>
            )}
          </div>
        ) : null}

        <div className="ledger-rows">
          {hasTicketPrice && (
            <div className="ledger-row">
              <span>Ticket sales · <span className="data">{Number(closeout.ticketsSold) || 0} × {money(show.ticketPrice)}</span></span>
              <span className="ledger-row-amount positive">{moneySigned(ticketRevenue, true)}</span>
            </div>
          )}
          {(closeout.revenues || []).map((row, i) => (
            readOnly ? (
              <div key={i} className="ledger-row">
                <span>{row.source || '—'}</span>
                <span className="ledger-row-amount positive">{moneySigned(row.amount, true)}</span>
              </div>
            ) : (
              <div key={i} className="ledger-edit-row">
                <input className="input" placeholder="Venmo, Eventbrite, door cash…" value={row.source ?? ''} onChange={(e) => {
                  const next = closeout.revenues.slice();
                  next[i] = { ...row, source: e.target.value };
                  patch('revenues')(next);
                }} />
                <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={row.amount ?? ''} onChange={(e) => {
                  const next = closeout.revenues.slice();
                  next[i] = { ...row, amount: e.target.value };
                  patch('revenues')(next);
                }} />
                <button className="icon-btn danger" onClick={() => patch('revenues')(closeout.revenues.filter((_, j) => j !== i))}>✕</button>
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
          <span className="data" style={{ color: 'var(--ledger-green)' }}>{moneySigned(revenue, true)}</span>
        </div>
      </div>

      <LedgerSection title="Expenses" totalLabel="Total expenses" total={expenses} negative>
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
                <button className="icon-btn danger" onClick={() => patch('expenses')(closeout.expenses.filter((_, j) => j !== i))}>✕</button>
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

      <LedgerSection title="Performer payouts" subtitle="pre-filled from lineup" totalLabel="Total payouts" total={payouts} negative>
        <div className="ledger-rows">
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
                <button className="icon-btn danger" onClick={() => patch('payouts')(closeout.payouts.filter((_, j) => j !== i))}>✕</button>
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
        <span className={'net-bar-value' + (net < 0 ? ' negative' : '')}>
          {net >= 0 ? '+' : '−'}{money(Math.abs(net))}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
        {readOnly ? (
          <button className="btn primary" onClick={exportCsv}>Export settlement</button>
        ) : (
          <>
            <button className="btn secondary" onClick={saveDraft}>Save progress</button>
          </>
        )}
      </div>

    </div>
  );
}
