// Exchanges a Google OAuth refresh token for a fresh access token.
// Needed because refreshing requires the Google client secret, which must
// never ship to the browser.
import { corsHeaders, json, requireUser } from '../_shared/util.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    await requireUser(req);
    const { refresh_token } = await req.json();
    if (!refresh_token) return json({ error: 'Missing refresh_token' }, 400);

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      return json({ error: body.error_description || body.error || 'Token refresh failed' }, 400);
    }
    return json({ access_token: body.access_token, expires_in: body.expires_in });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return json({ error: message }, message === 'Unauthorized' ? 401 : 500);
  }
});
