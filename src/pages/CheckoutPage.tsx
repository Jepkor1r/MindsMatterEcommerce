import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, Phone } from 'lucide-react';
import { useCart } from '../features/cart/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import type { CheckoutFormData } from '../types';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CheckoutFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    city: '',
    country: 'Kenya',
    payment_method: 'mpesa',
  });

  const shippingFee = 300;
  const total = subtotal + shippingFee;

  function updateField(field: keyof CheckoutFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.customer_name.trim()) newErrors.customer_name = 'Name is required';
    if (!form.customer_email.trim() || !form.customer_email.includes('@'))
      newErrors.customer_email = 'Valid email is required';
    if (!form.customer_phone.trim()) newErrors.customer_phone = 'Phone number is required';
    if (!form.shipping_address.trim()) newErrors.shipping_address = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Generate order number (will be done server-side in Phase 5)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    const generatedOrderNumber = `MM-${dateStr}-${seq}`;

    setOrderNumber(generatedOrderNumber);
    setOrderPlaced(true);
    clearCart();
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <main className="container py-16 text-center">
        <h1 className="mb-2" style={{ color: 'var(--color-primary)' }}>Nothing to Checkout</h1>
        <p className="mb-6" style={{ color: 'var(--color-muted)' }}>Your cart is empty.</p>
        <Link to="/shop" className="btn btn-primary no-underline">
          <ArrowLeft size={16} /> Go to Shop
        </Link>
      </main>
    );
  }

  // Order confirmation
  if (orderPlaced) {
    return (
      <main className="container py-16 text-center max-w-lg mx-auto animate-fade-in">
        <CheckCircle size={64} className="mx-auto mb-4" style={{ color: 'var(--color-sage)' }} />
        <h1 className="mb-2" style={{ color: 'var(--color-primary)' }}>
          Thank You for Your Order!
        </h1>
        <p className="mb-1 text-lg font-semibold" style={{ color: 'var(--color-charcoal)' }}>
          Order {orderNumber}
        </p>
        <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
          We've received your order. A confirmation email will be sent to {form.customer_email}.
        </p>
        <p className="text-sm italic mb-8" style={{ color: 'var(--color-secondary)' }}>
          Thank you for choosing to slow down, create, and reconnect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/account')} className="btn btn-primary">
            View My Orders
          </button>
          <Link to="/shop" className="btn btn-outline no-underline">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="container py-10">
        <Link to="/cart" className="inline-flex items-center gap-1 text-sm mb-6 no-underline" style={{ color: 'var(--color-muted)' }}>
          <ArrowLeft size={14} /> Back to Cart
        </Link>

        <h1 className="mb-8" style={{ color: 'var(--color-primary)' }}>Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer info */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                  Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer_name">Full Name</label>
                    <input
                      id="customer_name"
                      className={`input ${errors.customer_name ? 'input-error' : ''}`}
                      value={form.customer_name}
                      onChange={(e) => updateField('customer_name', e.target.value)}
                      placeholder="e.g. Jane Wanjiku"
                    />
                    {errors.customer_name && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.customer_name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="customer_email">Email</label>
                    <input
                      id="customer_email"
                      type="email"
                      className={`input ${errors.customer_email ? 'input-error' : ''}`}
                      value={form.customer_email}
                      onChange={(e) => updateField('customer_email', e.target.value)}
                      placeholder="jane@example.com"
                    />
                    {errors.customer_email && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.customer_email}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="customer_phone">Phone Number</label>
                    <input
                      id="customer_phone"
                      type="tel"
                      className={`input ${errors.customer_phone ? 'input-error' : ''}`}
                      value={form.customer_phone}
                      onChange={(e) => updateField('customer_phone', e.target.value)}
                      placeholder="e.g. 0712 345 678"
                    />
                    {errors.customer_phone && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.customer_phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="shipping_address">Address</label>
                    <input
                      id="shipping_address"
                      className={`input ${errors.shipping_address ? 'input-error' : ''}`}
                      value={form.shipping_address}
                      onChange={(e) => updateField('shipping_address', e.target.value)}
                      placeholder="Street address, building, apartment"
                    />
                    {errors.shipping_address && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.shipping_address}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      className={`input ${errors.city ? 'input-error' : ''}`}
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g. Nairobi"
                    />
                    {errors.city && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      className="input"
                      value={form.country}
                      onChange={(e) => updateField('country', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left"
                    style={{
                      borderColor: form.payment_method === 'mpesa' ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: form.payment_method === 'mpesa' ? 'var(--color-blush)' : 'var(--color-white)',
                    }}
                    onClick={() => updateField('payment_method', 'mpesa')}
                  >
                    <Phone size={20} style={{ color: 'var(--color-sage)' }} />
                    <div>
                      <span className="font-semibold text-sm">M-Pesa</span>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Pay via M-Pesa STK Push</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-3 p-4 rounded-lg border-2 transition-colors text-left"
                    style={{
                      borderColor: form.payment_method === 'card' ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: form.payment_method === 'card' ? 'var(--color-blush)' : 'var(--color-white)',
                    }}
                    onClick={() => updateField('payment_method', 'card')}
                  >
                    <CreditCard size={20} style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <span className="font-semibold text-sm">Card Payment</span>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Visa, Mastercard</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Order summary sidebar */}
            <div>
              <div
                className="p-6 rounded-xl sticky top-24"
                style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="truncate flex-1 mr-2" style={{ color: 'var(--color-charcoal)' }}>
                        {product.name} × {quantity}
                      </span>
                      <span className="font-semibold shrink-0">
                        {formatCurrency(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-3 text-sm" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-muted)' }}>Shipping</span>
                    <span className="font-semibold">{formatCurrency(shippingFee)}</span>
                  </div>
                  <div
                    className="flex justify-between pt-3 text-base"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                  >
                    <span className="font-bold">Total</span>
                    <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-6">
                  Place Order — {formatCurrency(total)}
                </button>

                <p className="text-xs text-center mt-3" style={{ color: 'var(--color-muted)' }}>
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
