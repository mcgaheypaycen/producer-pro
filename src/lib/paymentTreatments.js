const STORAGE_KEY = 'producer-pro-payment-treatments';

export const BUILTIN_PAYMENT_TREATMENTS = [
  {
    id: 'producer-fee-split',
    name: 'Producer fee + equal split',
    type: 'split_after_fee',
    producerFee: 200,
    builtin: true,
  },
  {
    id: 'flat-75',
    name: 'Flat $75 per performer',
    type: 'flat_rate',
    flatRate: 75,
    builtin: true,
  },
  {
    id: 'flat-100',
    name: 'Flat $100 per performer',
    type: 'flat_rate',
    flatRate: 100,
    builtin: true,
  },
];

export function loadCustomPaymentTreatments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPaymentTreatments(treatments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(treatments.slice(0, 30)));
}

export function addCustomPaymentTreatment({ name, type, producerFee, flatRate }) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;
  const entry = {
    id: `custom-${Date.now().toString(36)}`,
    name: trimmed,
    type: type || 'split_after_fee',
    producerFee: Number(producerFee) || 0,
    flatRate: Number(flatRate) || 0,
    builtin: false,
  };
  saveCustomPaymentTreatments([...loadCustomPaymentTreatments(), entry]);
  return entry;
}

export function removeCustomPaymentTreatment(id) {
  saveCustomPaymentTreatments(loadCustomPaymentTreatments().filter((t) => t.id !== id));
}

export function allPaymentTreatments(custom = loadCustomPaymentTreatments()) {
  return [...BUILTIN_PAYMENT_TREATMENTS, ...custom];
}

/**
 * Applies a payment treatment to performer payout rows.
 * Returns new payout rows with suggested amounts (strings, 2 decimals).
 */
export function applyPaymentTreatment(treatment, { revenue, expenses, payouts }) {
  const rows = (payouts || []).map((p) => ({ ...p }));
  if (!treatment || rows.length === 0) return rows;

  if (treatment.type === 'flat_rate') {
    const rate = Number(treatment.flatRate) || 0;
    return rows.map((p) => ({ ...p, amount: rate.toFixed(2) }));
  }

  if (treatment.type === 'split_after_fee') {
    const producerFee = Number(treatment.producerFee) || 0;
    const expenseTotal = (expenses || []).reduce((t, e) => t + (Number(e.amount) || 0), 0);
    const pool = (Number(revenue) || 0) - producerFee - expenseTotal;
    const each = rows.length > 0 ? Math.max(0, pool) / rows.length : 0;
    return rows.map((p) => ({ ...p, amount: each.toFixed(2) }));
  }

  return rows;
}

export function treatmentSummary(treatment) {
  if (!treatment) return '';
  if (treatment.type === 'flat_rate') {
    return `$${Number(treatment.flatRate || 0).toFixed(2)} per performer`;
  }
  return `$${Number(treatment.producerFee || 0).toFixed(2)} producer fee off the top, then split remainder equally after expenses`;
}
