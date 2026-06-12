const fs = require('fs');
const path = require('path');
const {
  normalizeRunSheetOptions,
  RUN_SHEET_FIELD_LABELS,
} = require('../shared/runSheetConfig.cjs');

function sanitizeFilename(name) {
  return String(name || '')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function rtfEscape(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\r?\n/g, '\\line ');
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return '$' + num.toFixed(2);
}

function collectFonts(typography) {
  const set = new Set();
  for (const style of Object.values(typography)) {
    if (style?.fontFamily) set.add(style.fontFamily);
  }
  if (set.size === 0) set.add('Arial');
  return [...set];
}

function rtfFontTable(fonts) {
  const entries = fonts.map((name, i) => `\\f${i}\\fnil ${name};`);
  return `{\\fonttbl${entries.join('')}}`;
}

function rtfSpan(style, text, fonts) {
  if (!text) return '';
  const fi = Math.max(0, fonts.indexOf(style.fontFamily));
  const fs = (Number(style.fontSize) || 12) * 2;
  let open = `{\\f${fi}\\fs${fs}`;
  if (style.bold) open += '\\b';
  if (style.italic) open += '\\i';
  return `${open} ${rtfEscape(text)}\\b0\\i0}`;
}

const ACT_FIELD_GETTERS = {
  aesthetic: (e) => e.aesthetic,
  length: (e) => e.length,
  lighting: (e) => e.lightingNotes,
  stage: (e) => e.stageNotes,
};

/**
 * Builds the show run sheet as RTF with per-element typography.
 */
function buildRunSheetRtf(show, lineup, options) {
  const { fields, typography: t } = normalizeRunSheetOptions(options);
  const fonts = collectFonts(t);
  const lengthFieldEnabled = fields.some((f) => f.key === 'length' && f.enabled);
  const lines = [];
  lines.push(`{\\rtf1\\ansi\\deff0${rtfFontTable(fonts)}}`);

  lines.push(rtfSpan(t.showTitle, show.title || 'Untitled Show', fonts) + '\\par');

  const meta = [];
  if (show.dateLabel) meta.push(show.dateLabel);
  if (show.venueName) meta.push(show.venueName);
  if (show.ticketPrice !== undefined && show.ticketPrice !== null && show.ticketPrice !== '') {
    meta.push('Tickets: ' + formatMoney(show.ticketPrice));
  }
  if (meta.length) lines.push(rtfSpan(t.showMeta, meta.join('  \u2022  '), fonts) + '\\par');
  lines.push('\\par');

  lineup.forEach((entry, i) => {
    const pos = i + 1;
    const posPrefix = rtfSpan(t.positionNumber, `${pos}. `, fonts);

    if (entry.type === 'segment') {
      lines.push(posPrefix + rtfSpan(t.segmentTitle, entry.title || 'Segment', fonts) + '\\par');
      if (entry.length && lengthFieldEnabled) {
        lines.push(rtfSpan(t.segmentLength, `Length: ${entry.length}`, fonts) + '\\par');
      }
      if (entry.notes) lines.push(rtfSpan(t.segmentNotes, entry.notes, fonts) + '\\par');
    } else {
      const head = [
        posPrefix,
        rtfSpan(t.performerName, entry.performerName || 'Performer', fonts),
        ' \u2013 ',
        rtfSpan(t.actName, entry.actName || 'Act', fonts),
      ].join('');
      lines.push(head + '\\par');
      if (entry.tagline) lines.push(rtfSpan(t.tagline, entry.tagline, fonts) + '\\par');
      for (const field of fields) {
        if (!field.enabled) continue;
        const value = ACT_FIELD_GETTERS[field.key](entry);
        if (!value) continue;
        const label = RUN_SHEET_FIELD_LABELS[field.key] + ': ';
        const valueStyle = t[field.key] || t.aesthetic;
        lines.push(
          rtfSpan(t.fieldLabel, label, fonts) + rtfSpan(valueStyle, value, fonts) + '\\par'
        );
      }
    }
    lines.push('\\par');
  });

  lines.push('}');
  return lines.join('\n');
}

function createShowPackage(parentDir, show, lineup, runSheetOptions) {
  const folderName = sanitizeFilename(
    `${show.title || 'Untitled Show'}${show.dateLabel ? ' - ' + show.dateLabel : ''}`
  ) || 'Untitled Show';
  let folderPath = path.join(parentDir, folderName);
  let suffix = 2;
  while (fs.existsSync(folderPath)) {
    folderPath = path.join(parentDir, `${folderName} (${suffix++})`);
  }
  fs.mkdirSync(folderPath, { recursive: true });

  const copied = [];
  const missing = [];
  lineup.forEach((entry, i) => {
    if (!entry.mediaPath) return;
    const pos = i + 1;
    if (!fs.existsSync(entry.mediaPath)) {
      missing.push({ position: pos, file: entry.mediaPath });
      return;
    }
    const ext = path.extname(entry.mediaPath);
    const baseName = entry.type === 'segment'
      ? `${pos} ${entry.title || 'Segment'}`
      : `${pos} ${entry.performerName || ''} ${entry.actName || ''}`;
    const name = sanitizeFilename(baseName.trim()) + ext;
    fs.copyFileSync(entry.mediaPath, path.join(folderPath, name));
    copied.push(name);
  });

  const rtf = buildRunSheetRtf(show, lineup, runSheetOptions);
  const rtfName = sanitizeFilename(`${show.title || 'Show'} - Run Sheet`) + '.rtf';
  fs.writeFileSync(path.join(folderPath, rtfName), rtf, 'utf8');

  return { folderPath, copied, missing };
}

function csvEscape(value) {
  const s = String(value === undefined || value === null ? '' : value);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function csvRow(...cells) {
  return cells.map(csvEscape).join(',');
}

function buildCloseoutCsv(show, closeout, performersById) {
  const rows = [];
  rows.push(csvRow('Show', show.title || ''));
  rows.push(csvRow('Date', show.dateLabel || ''));
  rows.push(csvRow('Venue', show.venueName || ''));
  rows.push(csvRow('Ticket Price', Number(show.ticketPrice || 0).toFixed(2)));
  rows.push(csvRow('Tickets Sold', closeout.ticketsSold || 0));
  rows.push(csvRow('Closed Out', closeout.closedAt ? new Date(closeout.closedAt).toLocaleString() : ''));
  rows.push('');

  const ticketsSold = Number(closeout.ticketsSold) || 0;
  const ticketRevenue = ticketsSold * (Number(show.ticketPrice) || 0);

  rows.push(csvRow('REVENUE'));
  rows.push(csvRow('Source', 'Amount'));
  let revenueTotal = ticketRevenue;
  rows.push(csvRow(`Ticket sales (${ticketsSold} x ${formatMoney(show.ticketPrice)})`, ticketRevenue.toFixed(2)));
  for (const r of closeout.revenues || []) {
    revenueTotal += Number(r.amount) || 0;
    rows.push(csvRow(r.source, (Number(r.amount) || 0).toFixed(2)));
  }
  rows.push(csvRow('Total Revenue', revenueTotal.toFixed(2)));
  rows.push('');

  rows.push(csvRow('EXPENSES'));
  rows.push(csvRow('Item', 'Amount'));
  let expenseTotal = 0;
  for (const e of closeout.expenses || []) {
    expenseTotal += Number(e.amount) || 0;
    rows.push(csvRow(e.description, (Number(e.amount) || 0).toFixed(2)));
  }
  rows.push(csvRow('Total Expenses', expenseTotal.toFixed(2)));
  rows.push('');

  rows.push(csvRow('PERFORMER PAYOUTS'));
  rows.push(csvRow('Performer', 'Amount Paid', 'Payment Method'));
  let payoutTotal = 0;
  for (const p of closeout.payouts || []) {
    payoutTotal += Number(p.amount) || 0;
    const performer = performersById[p.performerId];
    const name = p.performerName || (performer ? performer.stageName : 'Unknown');
    rows.push(csvRow(name, (Number(p.amount) || 0).toFixed(2), p.method || ''));
  }
  rows.push(csvRow('Total Payouts', payoutTotal.toFixed(2)));
  rows.push('');

  rows.push(csvRow('SUMMARY'));
  rows.push(csvRow('Total Revenue', revenueTotal.toFixed(2)));
  rows.push(csvRow('Total Expenses', expenseTotal.toFixed(2)));
  rows.push(csvRow('Total Payouts', payoutTotal.toFixed(2)));
  rows.push(csvRow('Net Profit', (revenueTotal - expenseTotal - payoutTotal).toFixed(2)));

  return rows.join('\r\n') + '\r\n';
}

module.exports = { createShowPackage, buildCloseoutCsv, sanitizeFilename, buildRunSheetRtf };
