import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { DEMO_SEED } from './demoSeed.js';

/**
 * Data access for the four app collections (performers, venues, acts, shows).
 * Same contract as the old Electron `window.api` bridge: records are opaque
 * objects with string ids; `save` upserts and stamps createdAt/updatedAt.
 *
 * Backed by Supabase Postgres (one JSONB document per row, RLS-scoped to the
 * signed-in user) or by localStorage in demo mode.
 */

const COLLECTIONS = ['performers', 'venues', 'acts', 'shows'];

function assertCollection(collection) {
  if (!COLLECTIONS.includes(collection)) {
    throw new Error('Unknown collection: ' + collection);
  }
}

/* ---------- Supabase backend ---------- */

const supabaseApi = {
  async list(collection) {
    assertCollection(collection);
    const { data, error } = await supabase
      .from(collection)
      .select('data')
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data.map((row) => row.data);
  },

  async save(collection, item) {
    assertCollection(collection);
    const now = new Date().toISOString();
    const doc = {
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
    const { error } = await supabase
      .from(collection)
      .upsert({ id: doc.id, data: doc }, { onConflict: 'id' });
    if (error) throw new Error(error.message);
    return doc;
  },

  async remove(collection, id) {
    assertCollection(collection);
    const { error } = await supabase.from(collection).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

/* ---------- Demo backend (no Supabase project configured) ---------- */

const DEMO_KEY = 'producer-pro-demo-data';

function demoLoad() {
  const stored = localStorage.getItem(DEMO_KEY);
  if (stored === null) {
    // First run: pre-fill with sample data so the demo is explorable.
    demoPersist(DEMO_SEED);
    return structuredClone(DEMO_SEED);
  }
  try {
    const raw = JSON.parse(stored);
    const db = {};
    for (const c of COLLECTIONS) db[c] = Array.isArray(raw[c]) ? raw[c] : [];
    return db;
  } catch {
    return Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
  }
}

function demoPersist(db) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(db));
}

const demoApi = {
  async list(collection) {
    assertCollection(collection);
    return demoLoad()[collection];
  },

  async save(collection, item) {
    assertCollection(collection);
    const db = demoLoad();
    const now = new Date().toISOString();
    const doc = {
      ...item,
      id: item.id || crypto.randomUUID(),
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
    const items = db[collection];
    const idx = items.findIndex((i) => i.id === doc.id);
    if (idx >= 0) items[idx] = doc;
    else items.push(doc);
    demoPersist(db);
    return doc;
  },

  async remove(collection, id) {
    assertCollection(collection);
    const db = demoLoad();
    db[collection] = db[collection].filter((i) => i.id !== id);
    demoPersist(db);
  },
};

export const api = isSupabaseConfigured ? supabaseApi : demoApi;
