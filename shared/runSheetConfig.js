/** Shared run sheet typography defaults and normalization. */

export const RUN_SHEET_FIELD_KEYS = ['aesthetic', 'length', 'lighting', 'stage'];

export const RUN_SHEET_FIELD_LABELS = {
  aesthetic: 'Aesthetic',
  length: 'Length',
  lighting: 'Lighting',
  stage: 'Stage',
};

export const DEFAULT_ELEMENT_STYLES = {
  showTitle: { fontFamily: 'Georgia', fontSize: 22, bold: true, italic: false },
  showMeta: { fontFamily: 'Arial', fontSize: 12, bold: false, italic: false },
  positionNumber: { fontFamily: 'Arial', fontSize: 16, bold: true, italic: false },
  performerName: { fontFamily: 'Georgia', fontSize: 14, bold: true, italic: false },
  actName: { fontFamily: 'Georgia', fontSize: 16, bold: true, italic: false },
  tagline: { fontFamily: 'Georgia', fontSize: 12, bold: false, italic: true },
  segmentTitle: { fontFamily: 'Georgia', fontSize: 16, bold: true, italic: false },
  segmentLength: { fontFamily: 'Arial', fontSize: 11, bold: false, italic: true },
  segmentNotes: { fontFamily: 'Arial', fontSize: 11, bold: false, italic: false },
  aesthetic: { fontFamily: 'Arial', fontSize: 11, bold: false, italic: false },
  length: { fontFamily: 'Arial', fontSize: 11, bold: false, italic: false },
  lighting: { fontFamily: 'Arial', fontSize: 11, bold: false, italic: false },
  stage: { fontFamily: 'Arial', fontSize: 11, bold: false, italic: false },
  fieldLabel: { fontFamily: 'Arial', fontSize: 11, bold: true, italic: false },
};

export const ELEMENT_LABELS = {
  showTitle: 'Show title',
  showMeta: 'Date, venue & tickets',
  positionNumber: 'Position number',
  performerName: 'Performer name',
  actName: 'Act name',
  tagline: 'Tagline',
  segmentTitle: 'Segment title',
  segmentLength: 'Segment length',
  segmentNotes: 'Segment notes',
  aesthetic: 'Aesthetic',
  length: 'Length',
  lighting: 'Lighting notes',
  stage: 'Stage notes',
  fieldLabel: 'Field labels (Aesthetic:, Lighting:, etc.)',
};

export function clampSize(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 12;
  return Math.min(72, Math.max(8, Math.round(v)));
}

function normalizeStyle(style, fallbackFamily) {
  const base = style && typeof style === 'object' ? style : {};
  return {
    fontFamily: String(base.fontFamily || fallbackFamily || 'Arial'),
    fontSize: clampSize(base.fontSize ?? 12),
    bold: !!base.bold,
    italic: !!base.italic,
  };
}

function normalizeFields(saved) {
  const fields = [];
  const seen = new Set();
  for (const f of (saved && Array.isArray(saved.fields) ? saved.fields : [])) {
    if (!f || !RUN_SHEET_FIELD_KEYS.includes(f.key) || seen.has(f.key)) continue;
    seen.add(f.key);
    fields.push({ key: f.key, enabled: f.enabled !== false });
  }
  for (const key of RUN_SHEET_FIELD_KEYS) {
    if (!seen.has(key)) fields.push({ key, enabled: true });
  }
  return fields;
}

function normalizeTypography(saved) {
  const legacyFont = saved && typeof saved.font === 'string' ? saved.font : 'Arial';
  const src = (saved && saved.typography) || {};
  const typography = {};
  for (const key of Object.keys(DEFAULT_ELEMENT_STYLES)) {
    typography[key] = normalizeStyle(src[key] || {}, legacyFont);
    // Preserve defaults for bold/italic when not specified in partial saves
    if (!src[key]) {
      typography[key].bold = DEFAULT_ELEMENT_STYLES[key].bold;
      typography[key].italic = DEFAULT_ELEMENT_STYLES[key].italic;
      typography[key].fontSize = DEFAULT_ELEMENT_STYLES[key].fontSize;
      if (!saved?.font) typography[key].fontFamily = DEFAULT_ELEMENT_STYLES[key].fontFamily;
    }
  }
  return typography;
}

export function normalizeRunSheetOptions(saved) {
  return {
    fields: normalizeFields(saved),
    typography: normalizeTypography(saved),
  };
}
