import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * Google Drive integration (drive.file scope: the app only sees files it
 * created). Media files and generated show packages live in the user's own
 * Drive under a "Producer Pro" folder.
 *
 * Access tokens come from the Google OAuth session established through
 * Supabase Auth. Tokens expire after ~1h; we refresh them via the
 * `google-refresh-token` edge function (the refresh requires the Google
 * client secret, which stays server-side).
 */

const TOKEN_KEY = 'producer-pro-google-token';
const REFRESH_KEY = 'producer-pro-google-refresh-token';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
/** Scopes for Drive media upload, form creation, and sheet import. */
export const GOOGLE_SCOPES = [
  DRIVE_SCOPE,
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/forms.body',
].join(' ');
const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

export class DriveAuthError extends Error {
  constructor(message = 'Google Drive access expired. Reconnect Google Drive and try again.') {
    super(message);
    this.name = 'DriveAuthError';
  }
}

/* ---------- Token management ---------- */

export function storeProviderTokens(session) {
  if (session?.provider_token) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify({
      token: session.provider_token,
      // Google access tokens last ~3600s; refresh a bit early.
      expiresAt: Date.now() + 55 * 60 * 1000,
    }));
  }
  if (session?.provider_refresh_token) {
    localStorage.setItem(REFRESH_KEY, session.provider_refresh_token);
  }
}

export function clearProviderTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

function storedToken() {
  try {
    const { token, expiresAt } = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null') || {};
    if (token && expiresAt > Date.now()) return token;
  } catch { /* fall through */ }
  return null;
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken || !isSupabaseConfigured) return null;
  const { data, error } = await supabase.functions.invoke('google-refresh-token', {
    body: { refresh_token: refreshToken },
  });
  if (error || !data?.access_token) return null;
  localStorage.setItem(TOKEN_KEY, JSON.stringify({
    token: data.access_token,
    expiresAt: Date.now() + Math.max(60, (data.expires_in || 3600) - 300) * 1000,
  }));
  return data.access_token;
}

async function getAccessToken() {
  const token = storedToken();
  if (token) return token;
  const refreshed = await refreshAccessToken();
  if (refreshed) return refreshed;
  throw new DriveAuthError();
}

export function isDriveConnected() {
  return Boolean(storedToken() || localStorage.getItem(REFRESH_KEY));
}

/**
 * Kicks off the Google OAuth flow requesting Drive access (redirects away).
 * Also used for the initial sign-in: one consent grants login + Drive.
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: GOOGLE_SCOPES,
      redirectTo: window.location.origin,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throw new Error(error.message);
}

/* ---------- Drive API helpers ---------- */

export async function googleFetch(url, options = {}, retried = false) {
  const token = await getAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 && !retried) {
    localStorage.removeItem(TOKEN_KEY);
    if (await refreshAccessToken()) return googleFetch(url, options, true);
    throw new DriveAuthError();
  }
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json())?.error?.message || '';
    } catch { /* ignore */ }
    throw new Error(`Google API error (${res.status})${detail ? ': ' + detail : ''}`);
  }
  return res.json();
}

async function driveFetch(url, options = {}, retried = false) {
  return googleFetch(url, options, retried);
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

async function findChildByName(name, parentId, mimeType) {
  const clauses = [
    `name = '${name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`,
    'trashed = false',
  ];
  if (parentId) clauses.push(`'${parentId}' in parents`);
  if (mimeType) clauses.push(`mimeType = '${mimeType}'`);
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id, name, webViewLink)',
    pageSize: '10',
  });
  const body = await driveFetch(`${API}/files?${params}`);
  return body.files?.[0] || null;
}

export async function createFolder(name, parentId) {
  return driveFetch(`${API}/files?fields=id,name,webViewLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: FOLDER_MIME,
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
}

/**
 * Finds or creates the root "Producer Pro" folder in the user's Drive.
 * The id is cached on the profile so we don't search every session.
 */
export async function ensureAppFolder(cachedId, persistId) {
  if (cachedId) {
    try {
      const params = new URLSearchParams({ fields: 'id, trashed' });
      const file = await driveFetch(`${API}/files/${cachedId}?${params}`);
      if (!file.trashed) return cachedId;
    } catch (err) {
      if (err instanceof DriveAuthError) throw err;
      // Folder was deleted; recreate below.
    }
  }
  const existing = await findChildByName('Producer Pro', null, FOLDER_MIME);
  const folder = existing || await createFolder('Producer Pro');
  await persistId?.(folder.id);
  return folder.id;
}

export async function uploadFile(fileOrBlob, name, parentId, mimeType) {
  const metadata = {
    name,
    ...(parentId ? { parents: [parentId] } : {}),
    ...(mimeType ? { mimeType } : {}),
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', fileOrBlob);
  return driveFetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    body: form,
  });
}

/** Server-side copy within Drive: no re-download/re-upload of media. */
export async function copyFile(fileId, name, parentId) {
  return driveFetch(`${API}/files/${fileId}/copy?fields=id,name,webViewLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, ...(parentId ? { parents: [parentId] } : {}) }),
  });
}

/** Finds a folder name that doesn't collide with existing children. */
export async function availableFolderName(baseName, parentId) {
  let name = baseName;
  let suffix = 2;
  while (await findChildByName(name, parentId, FOLDER_MIME)) {
    name = `${baseName} (${suffix++})`;
  }
  return name;
}
