import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OrderList from '../features/orders/OrderList';

export default function OrdersPage() {
  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="container py-10">
        <Link to="/account" className="inline-flex items-center gap-1 text-sm mb-6 no-underline" style={{ color: 'var(--color-muted)' }}>
          <ArrowLeft size={14} /> Back to My Account
        </Link>

        <h1 className="mb-8" style={{ color: 'var(--color-primary)' }}>My Orders</h1>

        <div
          className="p-6 rounded-xl"
          style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
        >
          <OrderList />
        </div>
      </div>
    </main>
  );
}
