import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '../../features/cart/CartContext';
import { useAuth } from '../../features/auth/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  const navLinks = [
    { label: 'Shop', path: '/shop' },
    { label: 'Colouring', path: '/shop?category=colouring-books' },
    { label: 'Puzzles', path: '/shop?category=puzzles-sudoku' },
    { label: 'Drawing', path: '/shop?category=drawing-sketching' },
    { label: 'Gift Sets', path: '/shop?category=gift-sets' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <nav className="container flex items-center justify-between h-16 md:h-18">
        {/* Mobile menu button */}
        <button
          className="btn-ghost p-2 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline" aria-label="Minds Matter Home">
          <span
            className="text-xl md:text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
          >
            Minds Matter
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium no-underline transition-colors"
              style={{
                color:
                  location.pathname + location.search === link.path
                    ? 'var(--color-primary)'
                    : 'var(--color-charcoal)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Search toggle */}
          <button
            className="btn-ghost p-2 rounded-full"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Account — goes to sign-in when signed out */}
          <Link
            to={user ? '/account' : '/login'}
            className="btn-ghost p-2 rounded-full relative no-underline"
            aria-label={user ? 'My account' : 'Sign in'}
          >
            <User size={20} style={{ color: 'var(--color-charcoal)' }} />
            {user && (
              <span
                className="absolute bottom-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-sage)' }}
                aria-hidden="true"
              />
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="btn-ghost p-2 rounded-full relative no-underline" aria-label="Cart">
            <ShoppingBag size={20} style={{ color: 'var(--color-charcoal)' }} />
            {itemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full text-white"
                style={{ backgroundColor: 'var(--color-secondary)', fontSize: '0.625rem' }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Search bar (expandable) */}
      {searchOpen && (
        <div className="border-t border-border py-3 animate-fade-in" style={{ backgroundColor: 'var(--color-cream)' }}>
          <form onSubmit={handleSearch} className="container flex gap-2">
            <input
              type="search"
              className="input flex-1"
              placeholder="Search for colouring books, puzzles, gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              aria-label="Search products"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-border animate-fade-in"
          style={{ backgroundColor: 'var(--color-white)' }}
        >
          <div className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="py-3 px-2 text-base font-medium no-underline rounded-lg transition-colors"
                style={{
                  color: 'var(--color-charcoal)',
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
