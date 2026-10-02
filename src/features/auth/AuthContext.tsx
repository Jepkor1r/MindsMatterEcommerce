/*
 * ============================================
 * AUTH CONTEXT
 * ============================================
 * This is the "security desk" of the app.
 *
 * Like the cart, it uses React Context so any
 * component can ask "who is signed in?" without
 * passing props everywhere.
 *
 * HOW SIGN-IN WORKS:
 * 1. signInWithGoogle() sends the browser to Google.
 * 2. Google sends the user to Supabase, which checks
 *    the "ID card" and creates a session.
 * 3. Supabase sends the user back to /login on our site.
 * 4. supabase-js reads the session from the URL, saves
 *    it in localStorage, and fires onAuthStateChange.
 *
 * Because the session is saved in localStorage and
 * refreshed automatically, the user stays signed in
 * after refreshing or closing the browser.
 * ============================================
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

// ── Define what the auth context provides ──
interface AuthContextType {
  user: User | null;
  loading: boolean; // true until we know whether someone is signed in
  signInWithGoogle: (returnTo?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Remembers which page to return to after the Google round-trip ──
export const RETURN_TO_KEY = 'minds-matter-return-to';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for an existing session (e.g. user signed in yesterday)
    supabase.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user ?? null))
      .catch(() => setUser(null)) // Supabase unreachable: treat as signed out, don't crash
      .finally(() => setLoading(false));

    // 2. Listen for sign-in / sign-out / token refresh from now on
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Stop listening when the provider unmounts
    return () => data.subscription.unsubscribe();
  }, []);

  /**
   * Start Google sign-in. Returns an error message if it could not start,
   * otherwise the browser leaves our site and this never resolves visibly.
   */
  async function signInWithGoogle(returnTo = '/account'): Promise<string | null> {
    sessionStorage.setItem(RETURN_TO_KEY, returnTo);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      console.error('Google sign-in failed to start:', error);
      return 'We could not connect to Google right now. Please try again.';
    }
    return null;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign-out error:', error);
    // Clear the user locally even if the network call failed
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth from any component.
 *
 * Usage:
 *   const { user, signInWithGoogle, signOut } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
