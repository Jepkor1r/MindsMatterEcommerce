/*
 * ============================================
 * PROTECTED ROUTE
 * ============================================
 * The "bouncer" for private pages (account,
 * orders, checkout). Signed-out visitors are
 * sent to /login, and we remember where they
 * were going so they come back afterwards.
 *
 * NOTE: This only hides pages in the browser.
 * The REAL protection for data is Row Level
 * Security in Supabase (supabase/auth.sql).
 * ============================================
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still checking the session — don't redirect yet
  if (loading) {
    return (
      <main className="container py-16 text-center" aria-busy="true">
        <p style={{ color: 'var(--color-muted)' }}>Loading…</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
