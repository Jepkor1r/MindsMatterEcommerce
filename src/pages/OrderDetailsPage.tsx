import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Package } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

// Mock order details for UI
const mockOrder = {
  id: 'order-1',
  order_number: 'MM-20260920-0042',
  date: '2026-09-20T14:30:00Z',
  status: 'delivered',
  payment_status: 'successful',
  payment_method: 'M-Pesa',
  subtotal: 2800,
  shipping_fee: 300,
  total: 3100,
  shipping_address: '123 Kimathi Street, Nairobi, Kenya',
  items: [
    {
      id: 'item-1',
      product_name: '30 Days of Colour',
      quantity: 2,
      unit_price: 1000,
      subtotal: 2000,
      image: '/images/colouring-book-1.png',
    },
    {
      id: 'item-2',
      product_name: 'Daily Brain Teasers',
      quantity: 1,
      unit_price: 800,
      subtotal: 800,
      image: '/images/puzzle-book-1.png',
    },
  ],
};

export default function OrderDetailsPage() {

  // In Phase 5, we will read the order id from the URL (useParams) and fetch it.
  // For now, we just use the mock data regardless of ID.

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="container py-10">
        <Link to="/account" className="inline-flex items-center gap-1 text-sm mb-6 no-underline" style={{ color: 'var(--color-muted)' }}>
          <ArrowLeft size={14} /> Back to My Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl mb-1" style={{ color: 'var(--color-primary)' }}>
              Order {mockOrder.order_number}
            </h1>
            <p style={{ color: 'var(--color-muted)' }}>
              Placed on {new Date(mockOrder.date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
              style={{ backgroundColor: 'var(--color-sage)', color: 'var(--color-white)' }}
            >
              <CheckCircle size={14} /> {mockOrder.payment_status.toUpperCase()}
            </span>
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-charcoal)' }}
            >
              <Package size={14} /> {mockOrder.status.toUpperCase()}
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
                {mockOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="w-16 h-16 rounded object-cover"
                      style={{ backgroundColor: 'var(--color-blush)' }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>{item.product_name}</p>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        {formatCurrency(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                      {formatCurrency(item.subtotal)}
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
                  <span className="font-semibold">{formatCurrency(mockOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Shipping</span>
                  <span className="font-semibold">{formatCurrency(mockOrder.shipping_fee)}</span>
                </div>
                <div
                  className="flex justify-between pt-3 text-base"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <span className="font-bold">Total</span>
                  <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(mockOrder.total)}
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
              <p className="text-sm mb-4" style={{ color: 'var(--color-charcoal)', whiteSpace: 'pre-line' }}>
                {mockOrder.shipping_address}
              </p>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-charcoal)' }}>Payment Method</h3>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{mockOrder.payment_method}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
