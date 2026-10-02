import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { fetchMyOrders } from '../../services/orders';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatOrderDate, orderStatusBadge, paymentStatusBadge } from './orderLabels';
import type { Order } from '../../types';

/**
 * The signed-in user's order history, loaded from Supabase.
 * Used on both /account and /orders.
 */
export default function OrderList() {
  // undefined = still loading, null = failed to load
  const [orders, setOrders] = useState<Order[] | null | undefined>(undefined);

  useEffect(() => {
    fetchMyOrders().then(setOrders);
  }, []);

  if (orders === undefined) {
    return (
      <p className="py-10 text-center" aria-busy="true" style={{ color: 'var(--color-muted)' }}>
        Loading your orders…
      </p>
    );
  }

  if (orders === null) {
    return (
      <p role="alert" className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }}>
        We couldn't load your orders right now. Please refresh the page to try again.
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
        <p className="mb-4" style={{ color: 'var(--color-charcoal)' }}>You haven't placed any orders yet.</p>
        <Link to="/shop" className="btn btn-primary no-underline">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const status = orderStatusBadge(order.status);
        const payment = paymentStatusBadge(order.payment?.status);
        const itemCount = (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
        return (
          <div
            key={order.id}
            className="p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>
                  {order.order_number}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: status.backgroundColor, color: status.color }}>
                  {status.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: payment.backgroundColor, color: payment.color }}>
                  {payment.label}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                {formatOrderDate(order.created_at)} • {itemCount} item{itemCount !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
              <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                {formatCurrency(order.total, order.currency)}
              </span>
              <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline no-underline">
                View Details
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
