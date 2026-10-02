import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { fetchCategories, fetchProducts } from '../services/api';
import type { Category, Product } from '../types';
import ProductCard from '../components/product/ProductCard';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [sortBy, setSortBy] = useState('name');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products and categories once on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchProducts()
      ]);
      setCategories(cats);
      setProducts(prods);
      setLoading(false);
    }
    loadData();
  }, []);

  // Filter products client-side
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.short_description.toLowerCase().includes(lower) ||
          (p.description && p.description.toLowerCase().includes(lower)) ||
          (p.category_name && p.category_name.toLowerCase().includes(lower))
      );
    } else if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        result = result.filter(p => p.category_id === category.id);
      } else {
        result = []; // Category not found yet or invalid
      }
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        return result.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return result.sort((a, b) => b.price - a.price);
      case 'newest':
        return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return result.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [categorySlug, searchQuery, sortBy, products, categories]);

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch.trim() });
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  }

  function setCategory(slug: string) {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
    setLocalSearch('');
  }

  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Page header */}
      <section className="py-10" style={{ backgroundColor: 'var(--color-blush)' }}>
        <div className="container">
          <h1 style={{ color: 'var(--color-primary)' }}>
            {searchQuery
              ? `Search: "${searchQuery}"`
              : activeCategory
                ? activeCategory.name
                : 'Shop All Products'}
          </h1>
          <p className="mt-2" style={{ color: 'var(--color-muted)' }}>
            {loading 
              ? 'Loading products...'
              : searchQuery
                ? `${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''} found`
                : activeCategory
                  ? activeCategory.description
                  : 'Explore our full collection of screen-free creative tools.'}
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Controls bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-muted)' }}
              />
              <input
                type="search"
                className="input pl-9"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                aria-label="Search products"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} style={{ color: 'var(--color-muted)' }} />
            <select
              className="input"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="name">Sort: A–Z</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: !categorySlug && !searchQuery ? 'var(--color-primary)' : 'var(--color-white)',
              color: !categorySlug && !searchQuery ? 'var(--color-white)' : 'var(--color-charcoal)',
              border: '1px solid var(--color-border)',
            }}
            onClick={() => setCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="btn btn-sm"
              style={{
                backgroundColor: categorySlug === cat.slug ? 'var(--color-primary)' : 'var(--color-white)',
                color: categorySlug === cat.slug ? 'var(--color-white)' : 'var(--color-charcoal)',
                border: '1px solid var(--color-border)',
              }}
              onClick={() => setCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="text-center py-16" style={{ color: 'var(--color-muted)' }}>
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-charcoal)' }}>
              No products found
            </p>
            <p style={{ color: 'var(--color-muted)' }}>
              Try a different search term or browse our categories.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
