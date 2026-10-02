import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../features/cart/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const inStock = product.stock_quantity > 0;

  return (
    <article className="card flex flex-col">
      {/* Product image */}
      <Link to={`/shop/${product.slug}`} className="block relative overflow-hidden" aria-label={`View ${product.name}`}>
        <img
          src={product.cover_image}
          alt={product.name}
          className="w-full aspect-square object-cover transition-transform duration-300"
          style={{ backgroundColor: 'var(--color-blush)' }}
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_featured && <span className="badge badge-featured">Featured</span>}
          {!inStock && <span className="badge badge-out-of-stock">Out of Stock</span>}
        </div>
      </Link>

      {/* Product info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category label */}
        <span className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>
          {product.category_name}
        </span>

        {/* Name */}
        <Link to={`/shop/${product.slug}`} className="no-underline">
          <h3
            className="text-base font-semibold mb-1 leading-snug"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-charcoal)' }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Short description */}
        <p className="text-sm mb-3 flex-1" style={{ color: 'var(--color-muted)' }}>
          {product.short_description}
        </p>

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
            {formatCurrency(product.price)}
          </span>

          <button
            className="btn btn-primary btn-sm"
            disabled={!inStock}
            onClick={() => addItem(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={14} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
