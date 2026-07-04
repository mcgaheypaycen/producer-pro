import { newLineupKey } from '../components/AddToShowModal.jsx';

const STORAGE_KEY = 'producer-pro-segment-presets';

/** Built-in segments available when creating a show from import. */
export const BUILTIN_SEGMENT_PRESETS = [
  {
    id: 'welcome-talk',
    title: 'Welcome Talk',
    length: '10:00',
    placement: 'start',
    sortOrder: 0,
    builtin: true,
  },
  {
    id: 'intermission',
    title: 'Intermission',
    length: '15:00',
    placement: 'middle',
    sortOrder: 1,
    builtin: true,
  },
  {
    id: 'curtain-call',
    title: 'Curtain Call',
    length: '5:00',
    placement: 'end',
    sortOrder: 2,
    builtin: true,
  },
];

export const SEGMENT_PLACEMENTS = [
  { id: 'start', label: 'Beginning of show' },
  { id: 'middle', label: 'Middle of acts' },
  { id: 'end', label: 'End of show' },
];

export function loadCustomSegmentPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomSegmentPresets(presets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.slice(0, 30)));
}

export function addCustomSegmentPreset({ title, length, placement }) {
  const trimmed = String(title || '').trim();
  if (!trimmed) return null;
  const entry = {
    id: `custom-${Date.now().toString(36)}`,
    title: trimmed,
    length: normalizeSegmentLength(length) || '5:00',
    placement: placement || 'start',
    sortOrder: 100,
    builtin: false,
  };
  const presets = [...loadCustomSegmentPresets(), entry];
  saveCustomSegmentPresets(presets);
  return entry;
}

export function removeCustomSegmentPreset(id) {
  const presets = loadCustomSegmentPresets().filter((p) => p.id !== id);
  saveCustomSegmentPresets(presets);
  return presets;
}

export function allSegmentPresets(customPresets = loadCustomSegmentPresets()) {
  return [...BUILTIN_SEGMENT_PRESETS, ...customPresets].sort(
    (a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.title.localeCompare(b.title),
  );
}

/** Default selection: all built-ins enabled with default lengths. */
export function defaultSegmentSelection(customPresets = loadCustomSegmentPresets()) {
  const selection = {};
  for (const preset of allSegmentPresets(customPresets)) {
    selection[preset.id] = {
      enabled: preset.builtin,
      length: preset.length,
    };
  }
  return selection;
}

/** Normalize "10", "10:00", "10 min" → mm:ss for lineup. */
export function normalizeSegmentLength(value) {
  const s = String(value || '').trim();
  if (!s) return '';
  const colon = s.match(/^(\d+):(\d{1,2})$/);
  if (colon) return `${Number(colon[1])}:${String(Number(colon[2])).padStart(2, '0')}`;
  const minutes = parseFloat(s.replace(/[^\d.]/g, ''));
  if (Number.isFinite(minutes) && minutes >= 0) {
    const whole = Math.floor(minutes);
    const secs = Math.round((minutes - whole) * 60);
    if (secs === 0) return `${whole}:00`;
    return `${whole}:${String(secs).padStart(2, '0')}`;
  }
  return s;
}

export function segmentLineupEntry({ title, length, notes = '' }) {
  return {
    key: newLineupKey(),
    type: 'segment',
    title,
    length: normalizeSegmentLength(length) || length,
    notes,
  };
}

/**
 * Builds a show lineup from act entries and enabled segment presets.
 * Start segments → first half of acts → middle segments → second half → end segments.
 */
export function buildLineupWithSegments(actEntries, enabledPresets) {
  const start = enabledPresets.filter((p) => p.placement === 'start');
  const middle = enabledPresets.filter((p) => p.placement === 'middle');
  const end = enabledPresets.filter((p) => p.placement === 'end');

  const lineup = [];
  start.forEach((preset) => lineup.push(segmentLineupEntry(preset)));

  const acts = actEntries.slice();
  if (acts.length === 0) {
    middle.forEach((preset) => lineup.push(segmentLineupEntry(preset)));
  } else if (middle.length === 0) {
    acts.forEach((act) => lineup.push(act));
  } else {
    const splitAt = Math.ceil(acts.length / 2);
    acts.slice(0, splitAt).forEach((act) => lineup.push(act));
    middle.forEach((preset) => lineup.push(segmentLineupEntry(preset)));
    acts.slice(splitAt).forEach((act) => lineup.push(act));
  }

  end.forEach((preset) => lineup.push(segmentLineupEntry(preset)));
  return lineup;
}

/** Resolve checked presets from selection map + preset catalog. */
export function resolveEnabledPresets(allPresets, selection) {
  return allPresets
    .filter((preset) => selection[preset.id]?.enabled)
    .map((preset) => ({
      ...preset,
      length: normalizeSegmentLength(selection[preset.id]?.length) || preset.length,
    }));
}
