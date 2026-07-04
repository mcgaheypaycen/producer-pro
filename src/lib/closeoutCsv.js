import { sanitizeFilename } from './runSheetRtf.js';
import { isSupabaseConfigured } from './supabaseClient.js';
import { uploadFile } from './drive.js';
import { googleFetch } from './drive.js';
import { closeoutTotals, ticketTierTotals } from './closeoutMath.js';

/** Settlement CSV builder. */

function formatMoney(n) {
  const num = Number(n) || 0;
  return '$' + num.toFixed(2);
}

function csvEscape(value) {
  const s = String(value === undefined || value === null ? '' : value);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function csvRow(...cells) {
  return cells.map(csvEscape).join(',');
}

export function buildCloseoutCsv(show, closeout, performersById) {
  const { closeout: normalized, ticketsSold, ticketRevenue, revenue, expenses, payouts, net } = closeoutTotals(closeout, show);
  const rows = [];

  rows.push(csvRow('Show', show.title || ''));
  rows.push(csvRow('Date', show.dateLabel || ''));
  rows.push(csvRow('Venue', show.venueName || ''));
  rows.push(csvRow('Tickets Sold', ticketsSold));
  rows.push(csvRow('Closed Out', normalized.closedAt ? new Date(normalized.closedAt).toLocaleString() : ''));
  rows.push('');

  rows.push(csvRow('TICKET SALES BY PRICE'));
  rows.push(csvRow('Label', 'Price', 'Quantity', 'Subtotal'));
  for (const tier of normalized.ticketTiers || []) {
    const qty = Number(tier.quantity) || 0;
    const price = Number(tier.price) || 0;
    const subtotal = qty * price;
    const label = tier.label?.trim() || (price === 0 ? 'Comp' : 'Tickets');
    rows.push(csvRow(label, price.toFixed(2), qty, subtotal.toFixed(2)));
  }
  rows.push(csvRow('Total ticket revenue', '', '', ticketRevenue.toFixed(2)));
  rows.push('');

  rows.push(csvRow('OTHER REVENUE'));
  rows.push(csvRow('Source', 'Amount'));
  for (const r of normalized.revenues || []) {
    rows.push(csvRow(r.source, (Number(r.amount) || 0).toFixed(2)));
  }
  rows.push(csvRow('Total Revenue', revenue.toFixed(2)));
  rows.push('');

  rows.push(csvRow('EXPENSES'));
  rows.push(csvRow('Item', 'Amount'));
  for (const e of normalized.expenses || []) {
    rows.push(csvRow(e.description, (Number(e.amount) || 0).toFixed(2)));
  }
  rows.push(csvRow('Total Expenses', expenses.toFixed(2)));
  rows.push('');

  rows.push(csvRow('PERFORMER PAYOUTS'));
  rows.push(csvRow('Performer', 'Amount Paid', 'Payment Method'));
  for (const p of normalized.payouts || []) {
    const performer = performersById[p.performerId];
    const name = p.performerName || (performer ? performer.stageName : 'Unknown');
    rows.push(csvRow(name, (Number(p.amount) || 0).toFixed(2), p.method || ''));
  }
  rows.push(csvRow('Total Payouts', payouts.toFixed(2)));
  rows.push('');

  if (normalized.appliedTreatmentName) {
    rows.push(csvRow('Payment treatment', normalized.appliedTreatmentName));
    rows.push('');
  }

  rows.push(csvRow('SUMMARY'));
  rows.push(csvRow('Total Revenue', revenue.toFixed(2)));
  rows.push(csvRow('Total Expenses', expenses.toFixed(2)));
  rows.push(csvRow('Total Payouts', payouts.toFixed(2)));
  rows.push(csvRow('Net Profit', net.toFixed(2)));

  return rows.join('\r\n') + '\r\n';
}

export function settlementFilename(show) {
  return sanitizeFilename(`${show.title || 'Show'} - Settlement`) + '.csv';
}

export function settlementSheetTitle(show) {
  return sanitizeFilename(`${show.title || 'Show'} - Settlement`).slice(0, 80);
}

/** Triggers a browser download of the given text content. */
export function downloadTextFile(name, content, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

/** Upload CSV to Drive as a native Google Sheet. */
async function uploadCsvAsGoogleSheet(csv, title, parentId) {
  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.spreadsheet',
    ...(parentId ? { parents: [parentId] } : {}),
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([csv], { type: 'text/csv' }));
  return googleFetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    body: form,
  });
}

/**
 * Export settlement in the requested format.
 * @returns {{ mode, webViewLink? }}
 */
export async function exportSettlement(show, closeout, performersById, {
  mode = 'download',
  folderId,
  getAppFolderId,
} = {}) {
  const csv = buildCloseoutCsv(show, closeout, performersById);
  const filename = settlementFilename(show);
  const sheetTitle = settlementSheetTitle(show);

  if (mode === 'download') {
    downloadTextFile(filename, csv);
    return { mode };
  }

  if (!isSupabaseConfigured) {
    downloadTextFile(filename, csv);
    return { mode: 'download' };
  }

  const targetFolder = folderId || show.driveFolderId || (getAppFolderId ? await getAppFolderId() : null);

  if (mode === 'drive') {
    const uploaded = await uploadFile(new Blob([csv], { type: 'text/csv' }), filename, targetFolder, 'text/csv');
    return { mode, webViewLink: uploaded.webViewLink };
  }

  if (mode === 'sheet') {
    const sheet = await uploadCsvAsGoogleSheet(csv, sheetTitle, targetFolder);
    return { mode, webViewLink: sheet.webViewLink };
  }

  downloadTextFile(filename, csv);
  return { mode: 'download' };
}

/** @deprecated Use exportSettlement with mode option. */
export async function exportSettlementLegacy(show, closeout, performersById) {
  const result = await exportSettlement(show, closeout, performersById, {
    mode: show.driveFolderId ? 'drive' : 'download',
    folderId: show.driveFolderId,
  });
  return result.mode === 'drive';
}

export { ticketTierTotals, closeoutTotals };
