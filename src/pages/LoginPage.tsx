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
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(getErrorFromUrl);
  const [redirecting, setRedirecting] = useState(false);

  // Email + password form
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    const message =
      mode === 'signup'
        ? await signUpWithEmail(fullName, email, password)
        : await signInWithEmail(email, password);
    setSubmitting(false);
    // On success the user is set and the redirect above happens automatically
    if (message) setError(message);
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

          <form onSubmit={handleEmailSubmit} className="space-y-4 text-left" noValidate>
            {mode === 'signup' && (
              <div>
                <label htmlFor="full_name">Full name</label>
                <input
                  id="full_name"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  placeholder="e.g. Jane Wanjiku"
                />
              </div>
            )}
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="jane@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="At least 6 characters"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading || submitting}>
              {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-sm" style={{ color: 'var(--color-muted)' }}>
            {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
            <button
              type="button"
              className="font-semibold underline"
              style={{ color: 'var(--color-primary)' }}
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setError(null);
              }}
            >
              {mode === 'signup' ? 'Sign in' : 'Create an account'}
            </button>
          </p>

          <p className="my-6 text-xs uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
            or
          </p>

          <button
            type="button"
            className="btn btn-secondary w-full"
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
