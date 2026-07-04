const sumAmounts = (arr) => (arr || []).reduce((t, x) => t + (Number(x.amount) || 0), 0);

export function newTicketTier(overrides = {}) {
  return {
    id: `tier-${Math.random().toString(36).slice(2, 9)}`,
    label: '',
    price: '',
    quantity: '',
    ...overrides,
  };
}

/** Migrate legacy single-price closeout data to ticket tiers. */
export function normalizeCloseout(closeout, show = {}) {
  const base = closeout ? { ...closeout } : {};
  if (Array.isArray(base.ticketTiers) && base.ticketTiers.length > 0) {
    return base;
  }

  const tiers = [];
  if (base.ticketsSold || show.ticketPrice) {
    tiers.push(newTicketTier({
      label: 'General admission',
      price: show.ticketPrice ?? '',
      quantity: base.ticketsSold ?? '',
    }));
  } else {
    tiers.push(newTicketTier({ label: 'General admission' }));
  }

  return { ...base, ticketTiers: tiers };
}

export function tierLineTotal(tier) {
  return (Number(tier.price) || 0) * (Number(tier.quantity) || 0);
}

export function ticketTierTotals(closeout) {
  const tiers = closeout?.ticketTiers || [];
  const ticketsSold = tiers.reduce((t, tier) => t + (Number(tier.quantity) || 0), 0);
  const ticketRevenue = tiers.reduce((t, tier) => t + tierLineTotal(tier), 0);
  return { tiers, ticketsSold, ticketRevenue };
}

export function closeoutTotals(closeout, show = {}) {
  const normalized = normalizeCloseout(closeout, show);
  const { ticketsSold, ticketRevenue } = ticketTierTotals(normalized);
  const otherRevenue = sumAmounts(normalized.revenues);
  const expenses = sumAmounts(normalized.expenses);
  const payouts = sumAmounts(normalized.payouts);
  const revenue = ticketRevenue + otherRevenue;
  const net = revenue - expenses - payouts;

  return {
    closeout: normalized,
    ticketsSold,
    ticketRevenue,
    otherRevenue,
    revenue,
    expenses,
    payouts,
    net,
  };
}
