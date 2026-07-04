import { supabase } from './supabaseClient.js';

async function invokeForUrl(fn) {
  const { data, error } = await supabase.functions.invoke(fn);
  if (error) {
    let message = error.message;
    try {
      const body = await error.context?.json();
      if (body?.error) message = body.error;
    } catch { /* keep original message */ }
    throw new Error(message);
  }
  if (!data?.url) throw new Error(data?.error || 'No redirect URL returned');
  return data.url;
}

/** Redirects to Stripe Checkout to start the subscription (with free trial). */
export async function startCheckout() {
  window.location.href = await invokeForUrl('create-checkout-session');
}

/** Redirects to the Stripe Customer Portal to manage/cancel the subscription. */
export async function openBillingPortal() {
  window.location.href = await invokeForUrl('create-portal-session');
}
