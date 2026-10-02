import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Package } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { fetchOrderById } from '../services/orders';
import {
  formatOrderDate,
  orderStatusBadge,
  paymentMethodLabel,
  paymentStatusBadge,
} from '../features/orders/orderLabels';
import type { Order } from '../types';

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  // undefined = still loading, null = not found (or not this user's order)
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (id) fetchOrderById(id).then(setOrder);
  }, [id]);

  if (order === undefined) {
    return (
      <main className="container py-16 text-center" aria-busy="true">
        <p style={{ color: 'var(--color-muted)' }}>Loading order…</p>
      </main>
    );
  }

  // RLS hides other people's orders, so "not yours" and "doesn't exist" look the same
  if (order === null) {
    return (
      <main className="container py-16 text-center">
        <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
        <h1 className="mb-2" style={{ color: 'var(--color-primary)' }}>Order Not Found</h1>
        <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
          We couldn't find this order in your account.
        </p>
        <Link to="/orders" className="btn btn-primary no-underline">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </main>
    );
  }

  const status = orderStatusBadge(order.status);
  const payment = paymentStatusBadge(order.payment?.status);

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="container py-10">
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm mb-6 no-underline" style={{ color: 'var(--color-muted)' }}>
          <ArrowLeft size={14} /> Back to My Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--color-primary)' }}>
              Order {order.order_number}
            </h1>
            <p style={{ color: 'var(--color-muted)' }}>
              Placed on {formatOrderDate(order.created_at, true)}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
              style={{ backgroundColor: payment.backgroundColor, color: payment.color }}
            >
              <CreditCard size={14} /> {payment.label}
            </span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
              style={{ backgroundColor: status.backgroundColor, color: status.color }}
            >
              <Package size={14} /> {status.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <div
              className="p-6 rounded-xl mb-6"
              style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
            >
              <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                Items Ordered
              </h2>
              <div className="space-y-4">
                {(order.items ?? []).map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.product_name}
                        className="w-16 h-16 rounded object-cover"
                        style={{ backgroundColor: 'var(--color-blush)' }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded" style={{ backgroundColor: 'var(--color-blush)' }} aria-hidden="true" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>{item.product_name}</p>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        {formatCurrency(item.unit_price, order.currency)} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {formatCurrency(item.subtotal, order.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Shipping */}
          <div className="space-y-6">
            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
            >
              <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                Order Summary
              </h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Shipping</span>
                  <span className="font-semibold">{formatCurrency(order.shipping_fee, order.currency)}</span>
                </div>
                <div
                  className="flex justify-between pt-3 text-base"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <span className="font-bold">Total</span>
                  <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
            >
              <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                Delivery Details
              </h2>
              <p className="text-sm mb-1 font-semibold" style={{ color: 'var(--color-charcoal)' }}>{order.customer_name}</p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-charcoal)' }}>
                {order.shipping_address}<br />
                {order.city}, {order.country}
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                {order.customer_phone}<br />
                {order.customer_email}
              </p>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-charcoal)' }}>Payment Method</h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{paymentMethodLabel(order.payment?.provider)}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
