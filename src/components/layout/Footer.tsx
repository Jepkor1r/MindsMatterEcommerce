import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}>
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3
              className="text-xl mb-3"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-white)' }}
            >
              Minds Matter
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              We craft screen-free tools for cognitive wellness. Helping people slow down, unwind, and
              reconnect with their creativity.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent)' }}>
              Shop
            </h4>
            <ul className="space-y-2 list-none">
              {[
                ['Colouring Books', '/shop?category=colouring-books'],
                ['Puzzles & Sudoku', '/shop?category=puzzles-sudoku'],
                ['Drawing & Sketching', '/shop?category=drawing-sketching'],
                ['Gift Sets', '/shop?category=gift-sets'],
                ['All Products', '/shop'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm no-underline transition-colors"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent)' }}>
              Company
            </h4>
            <ul className="space-y-2 list-none">
              {[
                ['Our Story', '/about'],
                ['Contact Us', '/about'],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-sm no-underline transition-colors"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-accent)' }}>
              Stay Creative
            </h4>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Join our community for creative inspiration, new product launches, and screen-free tips.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm rounded-lg border-none"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'var(--color-white)',
                }}
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="btn btn-sm"
                style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-white)' }}
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
        >
          <p>© {currentYear} Minds Matter. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={12} style={{ color: 'var(--color-secondary)' }} /> in Kenya
          </p>
        </div>
      </div>
    </footer>
  );
}
