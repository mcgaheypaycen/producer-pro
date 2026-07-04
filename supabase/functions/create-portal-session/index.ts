import Stripe from 'npm:stripe@17';
import { adminClient, corsHeaders, json, requireUser } from '../_shared/util.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const user = await requireUser(req);
    const { data: profile } = await adminClient()
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return json({ error: 'No billing account yet. Start a subscription first.' }, 400);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: Deno.env.get('SITE_URL') ?? 'http://localhost:5173',
    });

    return json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return json({ error: message }, message === 'Unauthorized' ? 401 : 500);
  }
});
