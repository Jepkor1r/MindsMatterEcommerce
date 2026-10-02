import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, User } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

// Mock order data for UI (will be replaced by Supabase data in Phase 3)
const mockOrders = [
  {
    id: 'order-1',
    order_number: 'MM-20260920-0042',
    date: '2026-09-20T14:30:00Z',
    status: 'delivered',
    payment_status: 'successful',
    total: 3100,
    items: 2,
  },
  {
    id: 'order-2',
    order_number: 'MM-20261001-0089',
    date: '2026-10-01T09:15:00Z',
    status: 'processing',
    payment_status: 'successful',
    total: 1500,
    items: 1,
  },
];

export default function AccountPage() {
  const navigate = useNavigate();

  // Mock logout handler
  function handleLogout() {
    // In Phase 4, this will call Supabase Auth
    alert('Logged out successfully (Mock)');
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
                  J
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>Jane Wanjiku</p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>jane@example.com</p>
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

              {mockOrders.length > 0 ? (
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                            {order.order_number}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: order.status === 'delivered' ? 'var(--color-sage)' : 'var(--color-accent)',
                              color: order.status === 'delivered' ? 'var(--color-white)' : 'var(--color-charcoal)',
                            }}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                          {new Date(order.date).toLocaleDateString()} • {order.items} item{order.items !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                          {formatCurrency(order.total)}
                        </span>
                        <Link to={`/account/orders/${order.id}`} className="btn btn-sm btn-outline no-underline">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
                  <p className="mb-4" style={{ color: 'var(--color-charcoal)' }}>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="btn btn-primary no-underline">
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
