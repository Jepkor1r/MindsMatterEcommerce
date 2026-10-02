import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Google gives us the name and email; fall back gracefully if missing
  const fullName = user?.user_metadata?.full_name ?? 'Minds Matter customer';
  const email = user?.email ?? '';

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="container py-10">
        <h1 className="mb-8" style={{ color: 'var(--color-primary)' }}>My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div
              className="p-6 rounded-xl flex flex-col gap-4"
              style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ backgroundColor: 'var(--color-blush)', color: 'var(--color-primary)' }}
                >
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>{fullName}</p>
                  <p className="text-xs break-all" style={{ color: 'var(--color-muted)' }}>{email}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                <Link
                  to="/account"
                  className="flex items-center gap-2 p-2 rounded-lg no-underline font-medium"
                  style={{ backgroundColor: 'var(--color-blush)', color: 'var(--color-primary)' }}
                >
                  <Package size={18} /> My Orders
                </Link>
                <button
                  className="flex items-center gap-2 p-2 rounded-lg btn-ghost text-left font-medium"
                  style={{ color: 'var(--color-charcoal)' }}
                  onClick={handleLogout}
                >
                  <LogOut size={18} /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content - Orders */}
          <div className="lg:col-span-3">
            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
            >
              <h2 className="text-xl mb-6" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                Order History
              </h2>

              {/* Real orders are loaded from Supabase in Phase 5 */}
              <div className="text-center py-10">
                <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
                <p className="mb-4" style={{ color: 'var(--color-charcoal)' }}>You haven't placed any orders yet.</p>
                <Link to="/shop" className="btn btn-primary no-underline">
                  Start Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
