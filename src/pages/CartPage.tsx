import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../features/cart/CartContext';
import { SHIPPING_FEE } from '../services/orders';
import { formatCurrency } from '../utils/formatCurrency';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  const shippingFee = subtotal > 0 ? SHIPPING_FEE : 0; // Flat shipping (display estimate)
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <main className="container py-16 text-center">
        <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
        <h1 className="mb-2" style={{ color: 'var(--color-primary)' }}>
          Your Cart is Empty
        </h1>
        <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
          Looks like you haven't added any screen-free goodies yet.
        </p>
        <Link to="/shop" className="btn btn-primary no-underline">
          <ArrowLeft size={16} /> Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      <div className="container py-10">
        <h1 className="mb-8" style={{ color: 'var(--color-primary)' }}>
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-4 p-4 rounded-xl"
                style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                {/* Product image */}
                <Link to={`/shop/${product.slug}`} className="shrink-0">
                  <img
                    src={product.cover_image}
                    alt={product.name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover"
                    style={{ backgroundColor: 'var(--color-blush)' }}
                  />
                </Link>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/shop/${product.slug}`} className="no-underline">
                    <h3
                      className="text-base font-semibold mb-0.5 truncate"
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-charcoal)' }}
                    >
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-muted)' }}>
                    {product.category_name}
                  </p>
                  <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(product.price)}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    className="btn-ghost p-1 rounded"
                    onClick={() => removeItem(product.id)}
                    aria-label={`Remove ${product.name}`}
                  >
                    <Trash2 size={16} style={{ color: 'var(--color-error)' }} />
                  </button>

                  <div className="flex items-center gap-0 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                      className="btn-ghost p-2"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      className="btn-ghost p-2"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="text-sm font-bold" style={{ color: 'var(--color-charcoal)' }}>
                    {formatCurrency(product.price * quantity)}
                  </span>
                </div>
              </div>
            ))}

            {/* Cart actions */}
            <div className="flex justify-between items-center pt-2">
              <Link to="/shop" className="btn btn-ghost no-underline">
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
              <button className="btn btn-ghost text-sm" style={{ color: 'var(--color-error)' }} onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div
              className="p-6 rounded-xl sticky top-24"
              style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
            >
              <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 text-sm">
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

              <Link to="/checkout" className="btn btn-primary w-full no-underline">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <p className="text-xs text-center mt-4" style={{ color: 'var(--color-muted)' }}>
                Secure checkout. Your information is safe with us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
