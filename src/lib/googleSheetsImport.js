import { googleFetch, DriveAuthError } from './drive.js';

export { DriveAuthError };

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const SHEET_MIME = 'application/vnd.google-apps.spreadsheet';

/** Fields we map from form/sheet columns into act records. */
export const IMPORT_FIELDS = [
  'actName',
  'performerName',
  'media',
  'lightingNotes',
  'stageNotes',
  'introNotes',
  'aesthetic',
  'length',
];

export const FIELD_LABELS = {
  actName: 'Act name',
  performerName: 'Performer name',
  media: 'Video / audio track',
  lightingNotes: 'Lighting notes',
  stageNotes: 'Stage notes',
  introNotes: 'Emcee intro notes',
  aesthetic: 'Aesthetic / vibe',
  length: 'Act length',
  skip: '(Skip column)',
};

/** Act fields compared when reviewing import conflicts. */
export const CONFLICT_COMPARE_FIELDS = [
  { key: 'lightingNotes', label: 'Lighting notes' },
  { key: 'stageNotes', label: 'Stage notes' },
  { key: 'tagline', label: 'Emcee intro notes', incomingKey: 'tagline' },
  { key: 'aesthetic', label: 'Aesthetic / vibe' },
  { key: 'length', label: 'Act length' },
  { key: 'mediaName', label: 'Media file', altExisting: 'mediaLink', incomingKeys: ['mediaName', 'mediaLink'] },
];

const HEADER_HINTS = {
  actName: [/act\s*name/i, /^act$/i, /routine\s*name/i, /number\s*name/i],
  performerName: [/performer/i, /stage\s*name/i, /artist/i, /^name$/i],
  media: [/video/i, /audio/i, /track/i, /music/i, /media/i, /file/i],
  lightingNotes: [/light/i],
  stageNotes: [/stage/i, /prop/i, /set/i],
  introNotes: [/emcee/i, /intro/i, /host/i, /announce/i, /tagline/i],
  aesthetic: [/aesthetic/i, /vibe/i, /genre/i, /style/i],
  length: [/length/i, /duration/i, /time/i],
};

/** Sample responses for demo mode (no Google API). */
export const DEMO_SHEET = {
  id: 'demo-sheet',
  name: 'Tech Notes — Sample Form Responses',
  headers: [
    'Timestamp',
    'Performer name',
    'Act name',
    'Video/audio track',
    'Lighting notes',
    'Stage notes',
    'Emcee intro notes',
  ],
  rows: [
    [
      '2026-06-15 10:00',
      'Velvet Thunder',
      'Feathers & Fire',
      'feathers-remix.mp3',
      'Deep crimson wash, faster blackout',
      'Chair stage left, extra glitter cleanup',
      'Please welcome back the queen of tease!',
    ],
    [
      '2026-06-15 11:30',
      'Luna Foxx',
      'Moonlit Waltz',
      'https://drive.google.com/file/d/demo-moonlit/view',
      'Cool blue sidelight, moon gobo',
      'Slow walk from upstage',
      'Making her Producer Pro debut tonight',
    ],
    [
      '2026-06-16 09:00',
      'Nova Sparkle',
      'Starlight Serenade',
      'starlight.wav',
      'UV and pin spots',
      'Feather fan reveal at 2:00',
      'A rising star from the coast',
    ],
  ],
};

/* ---------- String helpers ---------- */

export function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s&'-]/g, '')
    .replace(/\s+/g, ' ');
}

function escapeDriveQuery(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function findBestMatch(name, items, getLabel) {
  const needle = normalizeName(name);
  if (!needle) return null;
  const exact = items.find((item) => normalizeName(getLabel(item)) === needle);
  if (exact) return exact;
  const partial = items.filter((item) => {
    const hay = normalizeName(getLabel(item));
    return hay.includes(needle) || needle.includes(hay);
  });
  if (partial.length === 1) return partial[0];
  return null;
}

/* ---------- Drive / Sheets API ---------- */

export async function listDriveFolders(parentId = 'root') {
  const clauses = [
    `mimeType = '${FOLDER_MIME}'`,
    'trashed = false',
    `'${parentId}' in parents`,
  ];
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id, name, modifiedTime)',
    orderBy: 'name',
    pageSize: '100',
  });
  const body = await googleFetch(`${DRIVE_API}/files?${params}`);
  return body.files || [];
}

export async function listSpreadsheetsInFolder(folderId) {
  const clauses = [
    `mimeType = '${SHEET_MIME}'`,
    'trashed = false',
    `'${folderId}' in parents`,
  ];
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id, name, modifiedTime, webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: '50',
  });
  const body = await googleFetch(`${DRIVE_API}/files?${params}`);
  return body.files || [];
}

export async function searchSpreadsheets(query = '') {
  const clauses = [`mimeType = '${SHEET_MIME}'`, 'trashed = false'];
  if (query.trim()) {
    clauses.push(`name contains '${escapeDriveQuery(query.trim())}'`);
  }
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id, name, modifiedTime, webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: '30',
  });
  const body = await googleFetch(`${DRIVE_API}/files?${params}`);
  return body.files || [];
}

async function firstSheetTitle(spreadsheetId) {
  const meta = await googleFetch(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties.title`);
  return meta.sheets?.[0]?.properties?.title || 'Sheet1';
}

export async function fetchSpreadsheetGrid(spreadsheetId) {
  const sheetTitle = await firstSheetTitle(spreadsheetId);
  const range = encodeURIComponent(`${sheetTitle}!A1:ZZ`);
  const body = await googleFetch(`${SHEETS_API}/${spreadsheetId}/values/${range}`);
  const values = body.values || [];
  if (values.length === 0) {
    return { headers: [], rows: [], sheetTitle, name: '' };
  }
  const [headers, ...rows] = values;
  return {
    headers: headers.map((h) => String(h || '').trim()),
    rows: rows.filter((row) => row.some((cell) => String(cell || '').trim())),
    sheetTitle,
    name: '',
  };
}

export async function loadSpreadsheetById(spreadsheetId) {
  const params = new URLSearchParams({ fields: 'id, name' });
  const file = await googleFetch(`${DRIVE_API}/files/${spreadsheetId}?${params}`);
  const grid = await fetchSpreadsheetGrid(spreadsheetId);
  return { id: file.id, name: file.name, ...grid };
}

export async function loadSpreadsheetsFromFolder(folderId) {
  const files = await listSpreadsheetsInFolder(folderId);
  const loaded = [];
  for (const file of files) {
    try {
      const grid = await fetchSpreadsheetGrid(file.id);
      loaded.push({ id: file.id, name: file.name, webViewLink: file.webViewLink, ...grid });
    } catch {
      // Skip unreadable sheets (permissions, etc.)
    }
  }
  return loaded;
}

/* ---------- Parsing & mapping ---------- */

export function detectColumnMapping(headers) {
  const mapping = {};
  const used = new Set();
  for (const field of IMPORT_FIELDS) {
    const idx = headers.findIndex((header, i) => {
      if (used.has(i)) return false;
      const h = String(header || '');
      return HEADER_HINTS[field]?.some((re) => re.test(h));
    });
    if (idx >= 0) {
      mapping[field] = idx;
      used.add(idx);
    }
  }
  return mapping;
}

export function parseMediaValue(raw) {
  const text = String(raw || '').trim();
  if (!text) return { mediaName: '', mediaLink: '' };
  const driveMatch = text.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (driveMatch) {
    return { mediaName: text.split('/').pop() || 'Drive file', mediaLink: text };
  }
  if (/^https?:\/\//i.test(text)) {
    const name = text.split('/').pop()?.split('?')[0] || 'Linked file';
    return { mediaName: decodeURIComponent(name), mediaLink: text };
  }
  return { mediaName: text, mediaLink: '' };
}

export function rowToActFields(parsed) {
  const media = parseMediaValue(parsed.media);
  return {
    name: parsed.actName?.trim() || '',
    lightingNotes: parsed.lightingNotes?.trim() || '',
    stageNotes: parsed.stageNotes?.trim() || '',
    tagline: parsed.introNotes?.trim() || '',
    aesthetic: parsed.aesthetic?.trim() || '',
    length: parsed.length?.trim() || '',
    mediaName: media.mediaName,
    mediaLink: media.mediaLink,
  };
}

function incomingValue(incoming, field) {
  if (field.incomingKeys) {
    for (const key of field.incomingKeys) {
      const val = String(incoming[key] || '').trim();
      if (val) return val;
    }
    return '';
  }
  const key = field.incomingKey || field.key;
  return String(incoming[key] || '').trim();
}

function existingValue(existingAct, field) {
  const primary = String(existingAct[field.key] || '').trim();
  if (primary) return primary;
  if (field.altExisting) return String(existingAct[field.altExisting] || '').trim();
  return '';
}

/** Field-level diffs between an existing act and incoming form data. */
export function getConflictDetails(existingAct, incoming) {
  if (!existingAct) return [];
  const diffs = [];
  for (const field of CONFLICT_COMPARE_FIELDS) {
    const existing = existingValue(existingAct, field);
    const next = incomingValue(incoming, field);
    if (!next || !existing) continue;
    if (normalizeName(existing) !== normalizeName(next)) {
      diffs.push({
        key: field.key,
        label: field.label,
        existing,
        incoming: next,
      });
    }
  }
  return diffs;
}

export function defaultVersionLabel() {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function stripVersionSuffix(name) {
  return String(name || '').replace(/\s*[—–-]\s*[^—–-]+$/, '').trim();
}

export function parseSheetRows(headers, rows, mapping) {
  return rows.map((row, rowIndex) => {
    const parsed = { rowIndex };
    for (const field of IMPORT_FIELDS) {
      const col = mapping[field];
      parsed[field] = col != null ? String(row[col] ?? '').trim() : '';
    }
    parsed.actName = parsed.actName || '';
    parsed.performerName = parsed.performerName || '';
    return parsed;
  }).filter((row) => row.actName || row.performerName);
}

/** Returns enriched rows with match status for the review step. */
export function matchImportRows(parsedRows, performers, acts) {
  return parsedRows.map((row) => {
    const performer = findBestMatch(row.performerName, performers, (p) => p.stageName)
      || findBestMatch(row.performerName, performers, (p) => p.legalName);

    let act = null;
    if (performer) {
      const performerActs = acts.filter((a) => a.performerId === performer.id);
      act = findBestMatch(row.actName, performerActs, (a) => a.name);
    }
    if (!act) {
      act = findBestMatch(row.actName, acts, (a) => a.name);
    }

    let status = 'unmatched';
    if (performer && act && act.performerId === performer.id) status = 'matched';
    else if (performer && !act) status = 'new_act';
    else if (!performer && act) status = 'act_only';
    else if (performer && act && act.performerId !== performer.id) status = 'performer_mismatch';
    else status = 'unmatched';

    const incoming = rowToActFields(row);
    const conflictDetails = act ? getConflictDetails(act, incoming) : [];
    const hasConflict = conflictDetails.length > 0;

    return {
      ...row,
      performerMatch: performer || null,
      actMatch: act || null,
      status,
      hasConflict,
      conflictDetails,
      incoming,
    };
  });
}

const MERGEABLE_KEYS = ['lightingNotes', 'stageNotes', 'tagline', 'aesthetic', 'length', 'mediaName', 'mediaLink'];

export function applyConflictAction(existingAct, incoming, action, options = {}) {
  if (action === 'discard') return null;
  if (action === 'version') {
    return buildActVersion(existingAct, incoming, options);
  }
  if (action === 'overwrite') {
    return { ...existingAct, ...incoming, id: existingAct.id };
  }
  // merge: fill empty fields only
  const merged = { ...existingAct };
  for (const key of MERGEABLE_KEYS) {
    const next = incoming[key];
    if (next && !String(merged[key] || '').trim()) merged[key] = next;
  }
  if (incoming.name && !merged.name) merged.name = incoming.name;
  return merged;
}

export function buildActVersion(existingAct, incoming, options = {}) {
  const versionLabel = options.versionLabel?.trim() || defaultVersionLabel();
  const rootId = existingAct.parentActId || existingAct.id;
  const baseName = existingAct.baseName || stripVersionSuffix(existingAct.name);
  const versionName = options.versionName?.trim() || `${baseName} — ${versionLabel}`;

  return {
    performerId: existingAct.performerId,
    name: versionName,
    baseName,
    parentActId: rootId,
    versionOf: existingAct.id,
    versionLabel,
    aesthetic: incoming.aesthetic || existingAct.aesthetic || '',
    length: incoming.length || existingAct.length || '',
    tagline: incoming.tagline || '',
    lightingNotes: incoming.lightingNotes || '',
    stageNotes: incoming.stageNotes || '',
    mediaFileId: '',
    mediaName: incoming.mediaName || '',
    mediaLink: incoming.mediaLink || '',
  };
}

export function buildNewAct(incoming, performerId) {
  return {
    performerId,
    name: incoming.name,
    aesthetic: incoming.aesthetic || '',
    length: incoming.length || '',
    tagline: incoming.tagline || '',
    lightingNotes: incoming.lightingNotes || '',
    stageNotes: incoming.stageNotes || '',
    mediaFileId: '',
    mediaName: incoming.mediaName || '',
    mediaLink: incoming.mediaLink || '',
  };
}

export function demoSheetPayload() {
  const mapping = detectColumnMapping(DEMO_SHEET.headers);
  const parsed = parseSheetRows(DEMO_SHEET.headers, DEMO_SHEET.rows, mapping);
  return {
    id: DEMO_SHEET.id,
    name: DEMO_SHEET.name,
    headers: DEMO_SHEET.headers,
    rows: DEMO_SHEET.rows,
    mapping,
    parsed,
  };
}

export function summarizeMatches(matchedRows) {
  const counts = {
    matched: 0,
    new_act: 0,
    unmatched: 0,
    conflicts: 0,
    skipped: 0,
  };
  for (const row of matchedRows) {
    if (row.status === 'matched') counts.matched += 1;
    else if (row.status === 'new_act') counts.new_act += 1;
    else counts.unmatched += 1;
    if (row.hasConflict) counts.conflicts += 1;
  }
  return counts;
}
