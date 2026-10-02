import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, RETURN_TO_KEY } from '../features/auth/AuthContext';

/**
 * If Google/Supabase sends the user back with an error, it is placed in
 * the URL (either after "?" or after "#"). Turn it into a friendly message.
 */
function getErrorFromUrl(): string | null {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const code = query.get('error') ?? hash.get('error');
  if (!code) return null;
  if (code === 'access_denied') {
    return 'Sign-in was cancelled or not allowed. Please try again.';
  }
  return 'Something went wrong while signing in with Google. Please try again.';
}

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(getErrorFromUrl);
  const [redirecting, setRedirecting] = useState(false);

  // Page the user was trying to reach before being sent here
  const from = (location.state as { from?: string } | null)?.from;

  // Already signed in (or just came back from Google) — go where they were headed
  if (!loading && user) {
    const returnTo = sessionStorage.getItem(RETURN_TO_KEY) ?? from ?? '/account';
    sessionStorage.removeItem(RETURN_TO_KEY);
    return <Navigate to={returnTo} replace />;
  }

  async function handleGoogleSignIn() {
    setError(null);
    setRedirecting(true);
    const message = await signInWithGoogle(from);
    if (message) {
      setError(message);
      setRedirecting(false);
    }
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="container py-16 max-w-md mx-auto">
        <div
          className="p-8 rounded-xl text-center"
          style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
        >
          <h1 className="mb-2" style={{ color: 'var(--color-primary)' }}>Welcome</h1>
          <p className="mb-8" style={{ color: 'var(--color-muted)' }}>
            Sign in to place orders and see your order history.
          </p>

          {error && (
            <p
              role="alert"
              className="mb-6 p-3 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={handleGoogleSignIn}
            disabled={loading || redirecting}
          >
            {redirecting ? 'Connecting to Google…' : 'Continue with Google'}
          </button>

          <p className="mt-6 text-xs" style={{ color: 'var(--color-muted)' }}>
            We only use your name and email to manage your orders.
          </p>
        </div>
      </div>
    </main>
  );
}
