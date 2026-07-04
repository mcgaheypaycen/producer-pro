import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient.js';
import { storeProviderTokens, clearProviderTokens, ensureAppFolder, signInWithGoogle } from './lib/drive.js';

const AuthContext = createContext(null);

const DEMO_USER = { id: 'demo-user', email: 'demo@producer.pro' };
const DEMO_PROFILE = { id: 'demo-user', subscription_status: 'active', drive_folder_id: null };

/** Subscription states that unlock the app (free trial counts). */
export function hasActiveSubscription(profile) {
  return ['trialing', 'active', 'past_due'].includes(profile?.subscription_status);
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    session: null,
    user: isSupabaseConfigured ? null : DEMO_USER,
    profile: isSupabaseConfigured ? null : DEMO_PROFILE,
  });
  const profileRef = useRef(null);

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured) return DEMO_PROFILE;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const profile = await fetchProfile(session.user.id);
    profileRef.current = profile;
    setState((s) => ({ ...s, profile }));
    return profile;
  }, [fetchProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    let cancelled = false;

    const apply = async (session) => {
      if (cancelled) return;
      if (!session) {
        setState({ loading: false, session: null, user: null, profile: null });
        return;
      }
      const profile = await fetchProfile(session.user.id);
      if (cancelled) return;
      profileRef.current = profile;
      setState({ loading: false, session, user: session.user, profile });
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') storeProviderTokens(session);
      if (event === 'SIGNED_OUT') clearProviderTokens();
      // Deferred: supabase-js holds an auth lock during this callback, so
      // issuing further Supabase requests inside it can deadlock.
      setTimeout(() => apply(session), 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // After returning from Stripe Checkout, poll until the webhook lands.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'success' || !isSupabaseConfigured) return;
    window.history.replaceState({}, '', window.location.pathname);
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      const profile = await refreshProfile();
      if (hasActiveSubscription(profile) || attempts >= 15) clearInterval(timer);
    }, 2000);
    return () => clearInterval(timer);
  }, [refreshProfile]);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    clearProviderTokens();
    if (isSupabaseConfigured) await supabase.auth.signOut();
  }, []);

  /**
   * Returns the user's "Producer Pro" Drive folder id, creating the folder
   * and caching its id on the profile the first time.
   */
  const ensureDriveFolderId = useCallback(async () => {
    if (!isSupabaseConfigured) return null;
    const profile = profileRef.current;
    return ensureAppFolder(profile?.drive_folder_id, async (id) => {
      await supabase.from('profiles').update({ drive_folder_id: id }).eq('id', profile?.id);
      profileRef.current = { ...profileRef.current, drive_folder_id: id };
      setState((s) => ({ ...s, profile: { ...s.profile, drive_folder_id: id } }));
    });
  }, []);

  const value = {
    ...state,
    isConfigured: isSupabaseConfigured,
    subscriptionActive: !isSupabaseConfigured || hasActiveSubscription(state.profile),
    signIn,
    signOut,
    refreshProfile,
    ensureDriveFolderId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
