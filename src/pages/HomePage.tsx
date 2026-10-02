import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brush, Gift, Sparkles, Star } from 'lucide-react';
import { fetchCategories, fetchFeaturedProducts } from '../services/api';
import type { Category, Product } from '../types';
import ProductCard from '../components/product/ProductCard';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchFeaturedProducts()
      ]);
      setCategories(cats);
      setFeatured(prods);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <main>
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-blush)' }}
      >
        <div className="container py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div className="animate-slide-up">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-charcoal)' }}
            >
              Screen-Free Creativity
            </span>
            <h1 className="mb-5" style={{ color: 'var(--color-primary)', lineHeight: 1.15 }}>
              Put the screen down.
              <br />
              Pick your creativity up.
            </h1>
            <p className="text-lg mb-8 max-w-lg" style={{ color: 'var(--color-muted)' }}>
              Screen-free books and creative tools designed to help you slow down, unwind, and
              reconnect with your mind.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn btn-primary btn-lg no-underline">
                Shop the Collection <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg no-underline">
                Explore Our Story
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="animate-fade-in hidden md:block">
            <img
              src="/images/hero.png"
              alt="Person enjoying a colouring book with a cup of tea in a cozy setting"
              className="w-full rounded-2xl shadow-lg"
              style={{ maxHeight: '480px', objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-10">
            <h2 style={{ color: 'var(--color-primary)' }}>Shop by Category</h2>
            <p className="mt-2" style={{ color: 'var(--color-muted)' }}>
              Find the perfect screen-free companion for your creative journey.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--color-muted)' }}>Loading categories...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="card p-4 text-center no-underline group"
                  style={{ backgroundColor: 'var(--color-white)' }}
                >
                  <div
                    className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-blush)' }}
                  >
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-charcoal)' }}
                  >
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="section section-blush">
        <div className="container">
          <div className="text-center mb-10">
            <h2 style={{ color: 'var(--color-primary)' }}>Featured Products</h2>
            <p className="mt-2" style={{ color: 'var(--color-muted)' }}>
              Handpicked by our team for creative minds.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-10" style={{ color: 'var(--color-muted)' }}>Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/shop" className="btn btn-outline no-underline">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY SCREEN-FREE? ── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-10">
            <h2 style={{ color: 'var(--color-primary)' }}>Why Screen-Free?</h2>
            <p className="mt-2 max-w-2xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              In a world of constant notifications, our products offer a simple invitation: slow down,
              create something with your hands, and give your mind the break it deserves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: <BookOpen size={28} />,
                title: 'Slow Down',
                desc: 'Step away from screens and give your mind intentional rest through tactile creativity.',
              },
              {
                icon: <Brush size={28} />,
                title: 'Create',
                desc: 'Engage your hands and imagination with colouring, drawing, and puzzles.',
              },
              {
                icon: <Sparkles size={28} />,
                title: 'Relax',
                desc: 'Experience the calming flow of creative activities without digital distractions.',
              },
              {
                icon: <Star size={28} />,
                title: 'Reconnect',
                desc: 'Rediscover the joy of simple, focused activities that nourish your mind.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-6 rounded-xl"
                style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                  style={{ backgroundColor: 'var(--color-blush)', color: 'var(--color-primary)' }}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GIFT BUNDLES CTA ── */}
      <section className="section section-blush">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <Gift size={20} style={{ color: 'var(--color-secondary)' }} />
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-secondary)' }}>
                  Gift Someone Special
                </span>
              </div>
              <h2 className="mb-4" style={{ color: 'var(--color-primary)' }}>
                Thoughtfully Curated Gift Bundles
              </h2>
              <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
                Give the gift of screen-free creativity. Our bundles pair colouring books, puzzles, and
                premium pencils into beautiful packages — perfect for birthdays, care packages, or
                simply saying "I thought of you."
              </p>
              <Link to="/shop?category=gift-sets" className="btn btn-secondary no-underline">
                Explore Gift Bundles <ArrowRight size={16} />
              </Link>
            </div>
            <div>
              <img
                src="/images/gift-bundle-1.png"
                alt="Creative Starter Bundle gift set"
                className="w-full rounded-2xl shadow-md"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT SNIPPET ── */}
      <section className="section">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="mb-4" style={{ color: 'var(--color-primary)' }}>About Minds Matter</h2>
          <p className="text-lg mb-3" style={{ color: 'var(--color-charcoal)' }}>
            We believe creativity shouldn't require a screen.
          </p>
          <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
            Minds Matter was born from a simple idea: that the best way to unwind isn't another app
            — it's a pencil, a beautiful page, and the quiet joy of making something with your own
            hands. We create books and creative tools that help people pause, create, and reconnect.
          </p>
          <Link to="/about" className="btn btn-outline no-underline">
            Read Our Story <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section section-blush">
        <div className="container">
          <h2 className="text-center mb-10" style={{ color: 'var(--color-primary)' }}>
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Amina K.',
                text: "I bought the Creative Starter Bundle for my sister's birthday. She absolutely loved it! The quality is beautiful.",
              },
              {
                name: 'David M.',
                text: "The Sudoku Challenge book has become my evening ritual. It's so much better than scrolling my phone before bed.",
              },
              {
                name: 'Grace W.',
                text: "Sketch Your Calm helped me discover I actually enjoy drawing. I never thought I'd say that!",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-xl"
                style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} fill="var(--color-accent)" color="var(--color-accent)" />
                  ))}
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--color-charcoal)', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                  — {t.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="section">
        <div className="container text-center max-w-xl mx-auto">
          <h2 className="mb-3" style={{ color: 'var(--color-primary)' }}>Join Our Creative Community</h2>
          <p className="mb-6" style={{ color: 'var(--color-muted)' }}>
            Get screen-free inspiration, new product launches, and exclusive offers delivered to
            your inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              className="input flex-1"
              placeholder="your@email.com"
              aria-label="Email for newsletter"
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
