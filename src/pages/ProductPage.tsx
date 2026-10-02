import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Zap } from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from '../services/api';
import type { Product } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../features/cart/CartContext';
import ProductCard from '../components/product/ProductCard';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      if (!slug) return;
      
      const foundProduct = await fetchProductBySlug(slug);
      setProduct(foundProduct);
      
      if (foundProduct) {
        // Fetch related products (same category)
        const allProducts = await fetchProducts();
        const relatedProducts = allProducts.filter(
          p => p.category_id === foundProduct.category_id && p.id !== foundProduct.id
        );
        setRelated(relatedProducts);
      }
      
      setLoading(false);
    }
    
    // Reset state when slug changes
    setQuantity(1);
    setSelectedImage(0);
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="container py-16 text-center" style={{ color: 'var(--color-muted)' }}>
        Loading product details...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container py-16 text-center">
        <h1 style={{ color: 'var(--color-primary)' }}>Product Not Found</h1>
        <p className="mt-2 mb-6" style={{ color: 'var(--color-muted)' }}>
          The product you're looking for doesn't exist or is no longer available.
        </p>
        <Link to="/shop" className="btn btn-primary no-underline">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </main>
    );
  }

  const inStock = product.stock_quantity > 0;

  function handleAddToCart() {
    addItem(product!, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Breadcrumb */}
      <div className="container py-4">
        <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-muted)' }} aria-label="Breadcrumb">
          <Link to="/" className="no-underline" style={{ color: 'var(--color-muted)' }}>Home</Link>
          <span>/</span>
          <Link to="/shop" className="no-underline" style={{ color: 'var(--color-muted)' }}>Shop</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-charcoal)' }}>{product.name}</span>
        </nav>
      </div>

      <div className="container pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image gallery */}
          <div>
            <div className="rounded-xl overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-blush)' }}>
              <img
                src={product.gallery_images[selectedImage] || product.cover_image}
                alt={product.name}
                className="w-full aspect-square object-cover"
              />
            </div>
            {product.gallery_images.length > 1 && (
              <div className="flex gap-2">
                {product.gallery_images.map((img, i) => (
                  <button
                    key={i}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors"
                    style={{
                      borderColor: i === selectedImage ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-secondary)' }}>
              {product.category_name}
            </span>
            <h1 className="mt-1 mb-4" style={{ color: 'var(--color-primary)' }}>
              {product.name}
            </h1>
            <p className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
              {formatCurrency(product.price)}
            </p>

            <p className="mb-6 leading-relaxed" style={{ color: 'var(--color-charcoal)' }}>
              {product.description}
            </p>

            {/* Stock */}
            <div className="mb-6">
              {inStock ? (
                <span className="badge badge-success">In Stock — {product.stock_quantity} available</span>
              ) : (
                <span className="badge badge-out-of-stock">Out of Stock</span>
              )}
            </div>

            {/* Quantity + Add to cart */}
            {inStock && (
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                  <button
                    className="btn-ghost p-3"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-semibold">{quantity}</span>
                  <button
                    className="btn-ghost p-3"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  className="btn btn-primary flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={18} />
                  {addedFeedback ? 'Added ✓' : 'Add to Cart'}
                </button>

                <Link to="/cart" className="btn btn-secondary no-underline" onClick={() => addItem(product, quantity)}>
                  <Zap size={18} />
                  Buy Now
                </Link>
              </div>
            )}

            {/* Product details table */}
            <div
              className="rounded-xl p-5 mt-4"
              style={{ backgroundColor: 'var(--color-blush)' }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-primary)' }}>
                Product Details
              </h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {product.author && (
                  <>
                    <dt style={{ color: 'var(--color-muted)' }}>Author</dt>
                    <dd className="font-medium">{product.author}</dd>
                  </>
                )}
                {product.pages && (
                  <>
                    <dt style={{ color: 'var(--color-muted)' }}>Pages</dt>
                    <dd className="font-medium">{product.pages}</dd>
                  </>
                )}
                {product.format && (
                  <>
                    <dt style={{ color: 'var(--color-muted)' }}>Format</dt>
                    <dd className="font-medium">{product.format}</dd>
                  </>
                )}
                {product.difficulty && (
                  <>
                    <dt style={{ color: 'var(--color-muted)' }}>Difficulty</dt>
                    <dd className="font-medium">{product.difficulty}</dd>
                  </>
                )}
                {product.dimensions && (
                  <>
                    <dt style={{ color: 'var(--color-muted)' }}>Dimensions</dt>
                    <dd className="font-medium">{product.dimensions}</dd>
                  </>
                )}
                {product.age_range && (
                  <>
                    <dt style={{ color: 'var(--color-muted)' }}>Age Range</dt>
                    <dd className="font-medium">{product.age_range}</dd>
                  </>
                )}
                <dt style={{ color: 'var(--color-muted)' }}>SKU</dt>
                <dd className="font-medium">{product.sku}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6" style={{ color: 'var(--color-primary)' }}>
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
