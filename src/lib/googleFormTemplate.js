import { googleFetch } from './drive.js';
import { searchSpreadsheets } from './googleSheetsImport.js';

const FORMS_API = 'https://forms.googleapis.com/v1/forms';
const STORAGE_KEY = 'producer-pro-tech-forms';

/** Question titles on the Producer Pro tech-notes form (must match import mapping). */
export const PRODUCER_PRO_FORM_QUESTIONS = [
  { title: 'Performer name', field: 'performerName', required: true, paragraph: false },
  { title: 'Act name', field: 'actName', required: true, paragraph: false },
  { title: 'Video / audio track', field: 'media', required: false, paragraph: false },
  { title: 'Lighting notes', field: 'lightingNotes', required: false, paragraph: true },
  { title: 'Stage notes', field: 'stageNotes', required: false, paragraph: true },
  { title: 'Emcee intro notes', field: 'introNotes', required: false, paragraph: true },
  { title: 'Aesthetic / vibe', field: 'aesthetic', required: false, paragraph: false },
  { title: 'Act length', field: 'length', required: false, paragraph: false },
];

export const PRODUCER_PRO_FORM_TITLE = 'Producer Pro — Tech Notes';

/** Google Forms response sheets prepend Timestamp; map known header labels to import fields. */
export const PRODUCER_PRO_HEADER_TO_FIELD = Object.fromEntries(
  PRODUCER_PRO_FORM_QUESTIONS.map((q) => [q.title, q.field]),
);

export function loadSavedForms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFormConnection(entry) {
  const forms = loadSavedForms().filter((f) => f.formId !== entry.formId);
  forms.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms.slice(0, 20)));
  return entry;
}

export function removeSavedForm(formId) {
  const forms = loadSavedForms().filter((f) => f.formId !== formId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
}

/** Build column-index mapping when headers match the Producer Pro template. */
export function mappingFromProducerProHeaders(headers) {
  const mapping = {};
  headers.forEach((header, index) => {
    const field = PRODUCER_PRO_HEADER_TO_FIELD[String(header || '').trim()];
    if (field) mapping[field] = index;
  });
  return mapping;
}

export function isProducerProMappingComplete(mapping) {
  return mapping.actName != null && mapping.performerName != null;
}

async function findResponseSpreadsheet(formTitle) {
  const results = await searchSpreadsheets(`${formTitle} (Responses)`);
  return results[0] || null;
}

/** Creates a Google Form with pre-mapped tech-note questions in the user's Drive. */
export async function createProducerProTechNotesForm({ title = PRODUCER_PRO_FORM_TITLE } = {}) {
  const form = await googleFetch(FORMS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: title,
      },
    }),
  });

  const formId = form.formId;
  const requests = PRODUCER_PRO_FORM_QUESTIONS.map((q, index) => ({
    createItem: {
      item: {
        title: q.title,
        questionItem: {
          question: {
            required: q.required,
            textQuestion: { paragraph: q.paragraph },
          },
        },
      },
      location: { index },
    },
  }));

  await googleFetch(`${FORMS_API}/${formId}:batchUpdate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });

  const refreshed = await googleFetch(`${FORMS_API}/${formId}`);
  const responseSheet = await findResponseSpreadsheet(title).catch(() => null);

  const entry = {
    formId,
    title,
    formEditUrl: `https://docs.google.com/forms/d/${formId}/edit`,
    responderUrl: refreshed.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
    responseSheetId: responseSheet?.id || null,
    responseSheetName: responseSheet?.name || null,
    presetMapping: true,
    createdAt: new Date().toISOString(),
  };

  return saveFormConnection(entry);
}

/** Attach a response spreadsheet id to a saved form (created after first response). */
export async function refreshFormResponseSheet(savedForm) {
  const sheet = await findResponseSpreadsheet(savedForm.title);
  if (!sheet) return savedForm;
  const updated = { ...savedForm, responseSheetId: sheet.id, responseSheetName: sheet.name };
  saveFormConnection(updated);
  return updated;
}
