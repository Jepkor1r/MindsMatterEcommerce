/*
 * AUTH CONTEXT — "who is signed in?"
 * Works like the website's AuthContext: any screen can call useAuth().
 * Uses Supabase email + password, so the SAME account works on the
 * website and in the app. The session is saved on the phone, so the
 * user stays signed in after closing the app.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  session: Session | null;
  loading: boolean; // true until we know whether someone is signed in
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (fullName: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Is someone already signed in from last time?
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));

    // 2. Listen for sign-in / sign-out / token refresh from now on
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  /** Returns an error message, or null on success. */
  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!error) return null;
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      return 'Wrong email or password. Please try again.';
    }
    return error.message;
  }

  /** Returns an error message, or null on success. */
  async function signUp(fullName: string, email: string, password: string): Promise<string | null> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    if (error) return error.message;
    if (!data.session) {
      return 'Account created. Please confirm your email, then sign in.';
    }
    return null;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign-out error:', error);
    setSession(null); // Sign out on the phone even if the network call failed
  }

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
