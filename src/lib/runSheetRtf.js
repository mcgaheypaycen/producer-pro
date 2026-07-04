import {
  normalizeRunSheetOptions,
  RUN_SHEET_FIELD_LABELS,
} from '../../shared/runSheetConfig.js';

/** RTF run sheet builder — ported unchanged from the desktop app. */

export function sanitizeFilename(name) {
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

export function buildRunSheetRtf(show, lineup, options) {
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
