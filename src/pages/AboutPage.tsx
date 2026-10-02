import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, Sun } from 'lucide-react';

export default function AboutPage() {
  return (
    <main style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Hero */}
      <section className="py-20 text-center" style={{ backgroundColor: 'var(--color-blush)' }}>
        <div className="container max-w-3xl">
          <h1 className="mb-6" style={{ color: 'var(--color-primary)' }}>
            We craft screen-free tools for cognitive wellness.
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--color-charcoal)' }}>
            Minds Matter was born from a simple realization: our minds are constantly buzzing with
            digital noise, and we've forgotten how to just <em>be</em>.
          </p>
        </div>
      </section>

      {/* The Story */}
      <section className="section">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/images/hero.png"
                alt="Woman relaxing with a colouring book"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="mb-6" style={{ color: 'var(--color-primary)' }}>Our Story</h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--color-charcoal)' }}>
                <p>
                  Modern life is increasingly screen-heavy. We work on laptops, relax by scrolling on phones,
                  and connect with loved ones through tablets. While technology connects us, it also
                  demands constant attention.
                </p>
                <p>
                  We created Minds Matter to provide simple, physical tools that encourage people to
                  pause, create, and engage with their minds away from screens.
                </p>
                <p>
                  We believe that the simple act of putting a pencil to paper—whether colouring a beautiful
                  botanical design, solving a challenging Sudoku, or sketching a memory—has profound benefits
                  for our mental wellbeing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-white)' }}>
        <div className="container">
          <h2 className="text-center mb-12" style={{ color: 'var(--color-white)' }}>What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Leaf size={32} style={{ color: 'var(--color-sage-light)' }} />
              </div>
              <h3 className="text-xl mb-3 font-semibold" style={{ color: 'var(--color-white)' }}>Slow Down</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                Life moves fast. We create reasons to pause, breathe, and enjoy the quiet moments.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Sun size={32} style={{ color: 'var(--color-accent)' }} />
              </div>
              <h3 className="text-xl mb-3 font-semibold" style={{ color: 'var(--color-white)' }}>Create Joy</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                Creativity isn't just for artists. It's a fundamental human need that brings joy and focus.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Heart size={32} style={{ color: 'var(--color-secondary)' }} />
              </div>
              <h3 className="text-xl mb-3 font-semibold" style={{ color: 'var(--color-white)' }}>Reconnect</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                When we disconnect from our devices, we reconnect with ourselves and the world around us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center">
        <div className="container max-w-2xl">
          <h2 className="mb-6" style={{ color: 'var(--color-primary)' }}>Start Your Screen-Free Journey</h2>
          <p className="mb-8 text-lg" style={{ color: 'var(--color-muted)' }}>
            Explore our collection of colouring books, puzzles, and creative journals designed to help you unwind.
          </p>
          <Link to="/shop" className="btn btn-primary btn-lg no-underline inline-flex items-center gap-2">
            Explore the Shop <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
