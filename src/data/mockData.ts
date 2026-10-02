/*
 * ============================================
 * MOCK DATA — Static products and categories
 * ============================================
 * In Phase 3, this will be replaced with real
 * Supabase database queries. For now, this lets
 * us build and test the entire UI.
 *
 * Think of this as a "pretend warehouse" —
 * the shelves are stocked with sample products
 * so we can test the shop before connecting
 * the real warehouse (database).
 * ============================================
 */

import type { Category, Product } from '../types';

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Colouring Books',
    slug: 'colouring-books',
    description: 'Beautiful colouring books designed for relaxation and creative expression.',
    image_url: '/images/colouring-book-1.png',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'cat-2',
    name: 'Puzzles & Sudoku',
    slug: 'puzzles-sudoku',
    description: 'Engaging puzzles and sudoku books for mindful focus and brain wellness.',
    image_url: '/images/puzzle-book-1.png',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'cat-3',
    name: 'Drawing & Sketching',
    slug: 'drawing-sketching',
    description: 'Drawing journals and sketch books for creative self-expression.',
    image_url: '/images/drawing-book-1.png',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'cat-4',
    name: "Kids' Activity Books",
    slug: 'kids-activity-books',
    description: 'Fun, screen-free activities designed for curious young minds.',
    image_url: '/images/kids-activity-book-1.png',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'cat-5',
    name: 'Gift Sets',
    slug: 'gift-sets',
    description: 'Thoughtfully curated gift bundles for the creative soul.',
    image_url: '/images/gift-bundle-1.png',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'cat-6',
    name: 'Digital / Printables',
    slug: 'digital-printables',
    description: 'Downloadable creative resources to print and enjoy at home.',
    image_url: '/images/colouring-book-2.png',
    sort_order: 6,
    is_active: true,
  },
];

export const products: Product[] = [
  {
    id: 'prod-1',
    name: '30 Days of Colour',
    slug: '30-days-of-colour',
    description:
      'A screen-free creative experience designed to encourage daily creativity, relaxation and intentional time away from screens. Each page features a unique, hand-illustrated botanical design that invites you to slow down, pick up your pencils, and lose yourself in the simple joy of colouring. Perfect for beginners and experienced colourists alike.',
    short_description: 'A 30-day creative colouring journey for daily relaxation.',
    price: 1000,
    currency: 'KES',
    category_id: 'cat-1',
    category_name: 'Colouring Books',
    cover_image: '/images/colouring-book-1.png',
    gallery_images: ['/images/colouring-book-1.png', '/images/colouring-book-2.png'],
    stock_quantity: 25,
    sku: 'MM-CLR-001',
    is_active: true,
    is_featured: true,
    author: 'Minds Matter Studio',
    pages: 64,
    difficulty: 'All Levels',
    format: 'Paperback',
    dimensions: '21 × 29.7 cm (A4)',
    weight: 0.35,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Botanical Bloom',
    slug: 'botanical-bloom',
    description:
      'Immerse yourself in the beauty of nature with this premium botanical colouring book. Featuring 50 elegant floral designs — from delicate wildflowers to lush garden arrangements — each page is a canvas for your creativity. Printed on thick, high-quality paper that handles pencils, pens, and light markers beautifully.',
    short_description: 'Premium botanical illustrations for creative relaxation.',
    price: 1200,
    currency: 'KES',
    category_id: 'cat-1',
    category_name: 'Colouring Books',
    cover_image: '/images/colouring-book-2.png',
    gallery_images: ['/images/colouring-book-2.png', '/images/colouring-book-1.png'],
    stock_quantity: 18,
    sku: 'MM-CLR-002',
    is_active: true,
    is_featured: false,
    author: 'Minds Matter Studio',
    pages: 52,
    difficulty: 'Intermediate',
    format: 'Paperback',
    dimensions: '21 × 29.7 cm (A4)',
    weight: 0.32,
    created_at: '2026-09-05T00:00:00Z',
    updated_at: '2026-09-05T00:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Daily Brain Teasers',
    slug: 'daily-brain-teasers',
    description:
      'Challenge your mind with this curated collection of puzzles, logic games, and brain teasers. Designed for daily practice, each puzzle is carefully crafted to exercise different cognitive skills — from pattern recognition to logical reasoning. A screen-free way to keep your mind sharp and engaged.',
    short_description: 'A daily dose of puzzles for mental wellness and focus.',
    price: 800,
    currency: 'KES',
    category_id: 'cat-2',
    category_name: 'Puzzles & Sudoku',
    cover_image: '/images/puzzle-book-1.png',
    gallery_images: ['/images/puzzle-book-1.png', '/images/puzzle-book-2.png'],
    stock_quantity: 30,
    sku: 'MM-PZL-001',
    is_active: true,
    is_featured: true,
    author: 'Minds Matter Studio',
    pages: 96,
    difficulty: 'Mixed',
    format: 'Paperback',
    dimensions: '15 × 21 cm (A5)',
    weight: 0.28,
    created_at: '2026-09-10T00:00:00Z',
    updated_at: '2026-09-10T00:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'Sudoku Challenge',
    slug: 'sudoku-challenge',
    description:
      'From easy warm-ups to expert-level grids, this sudoku book offers 200 carefully graded puzzles for every skill level. Each puzzle is designed to provide a satisfying mental workout without needing a screen. Compact enough to carry anywhere — perfect for commutes, breaks, or quiet evenings.',
    short_description: '200 sudoku puzzles graded from easy to expert.',
    price: 750,
    currency: 'KES',
    category_id: 'cat-2',
    category_name: 'Puzzles & Sudoku',
    cover_image: '/images/puzzle-book-2.png',
    gallery_images: ['/images/puzzle-book-2.png', '/images/puzzle-book-1.png'],
    stock_quantity: 40,
    sku: 'MM-PZL-002',
    is_active: true,
    is_featured: false,
    author: 'Minds Matter Studio',
    pages: 120,
    difficulty: 'Easy to Expert',
    format: 'Paperback',
    dimensions: '15 × 21 cm (A5)',
    weight: 0.25,
    created_at: '2026-09-12T00:00:00Z',
    updated_at: '2026-09-12T00:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'Sketch Your Calm',
    slug: 'sketch-your-calm',
    description:
      'A mindful drawing journal that guides you through 30 calming sketch exercises. No experience needed — each exercise starts with a simple prompt and gentle guidance, helping you discover the meditative quality of putting pencil to paper. Printed on premium artist paper that brings out the best in your work.',
    short_description: 'A guided drawing journal for creative mindfulness.',
    price: 950,
    currency: 'KES',
    category_id: 'cat-3',
    category_name: 'Drawing & Sketching',
    cover_image: '/images/drawing-book-1.png',
    gallery_images: ['/images/drawing-book-1.png'],
    stock_quantity: 15,
    sku: 'MM-DRW-001',
    is_active: true,
    is_featured: true,
    author: 'Minds Matter Studio',
    pages: 80,
    difficulty: 'Beginner Friendly',
    format: 'Hardcover',
    dimensions: '21 × 29.7 cm (A4)',
    weight: 0.45,
    created_at: '2026-09-15T00:00:00Z',
    updated_at: '2026-09-15T00:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Little Minds Matter',
    slug: 'little-minds-matter',
    description:
      'A delightful activity book designed for children aged 4–8. Packed with colouring pages, simple puzzles, dot-to-dots, mazes, and creative drawing prompts — all featuring friendly woodland animals and nature scenes. A wonderful screen-free companion for curious young minds.',
    short_description: 'Screen-free fun and learning for ages 4–8.',
    price: 650,
    currency: 'KES',
    category_id: 'cat-4',
    category_name: "Kids' Activity Books",
    cover_image: '/images/kids-activity-book-1.png',
    gallery_images: ['/images/kids-activity-book-1.png'],
    stock_quantity: 35,
    sku: 'MM-KID-001',
    is_active: true,
    is_featured: false,
    age_range: '4–8 years',
    author: 'Minds Matter Studio',
    pages: 48,
    difficulty: 'Kids',
    format: 'Paperback',
    dimensions: '21 × 29.7 cm (A4)',
    weight: 0.3,
    created_at: '2026-09-18T00:00:00Z',
    updated_at: '2026-09-18T00:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Creative Starter Bundle',
    slug: 'creative-starter-bundle',
    description:
      'The perfect introduction to screen-free creativity. This bundle includes our bestselling "30 Days of Colour" colouring book, the "Daily Brain Teasers" puzzle book, and a set of 12 premium coloured pencils — all beautifully wrapped and ready to gift. Ideal for birthdays, care packages, or treating yourself.',
    short_description: 'Colouring book + puzzle book + coloured pencils gift set.',
    price: 2500,
    currency: 'KES',
    category_id: 'cat-5',
    category_name: 'Gift Sets',
    cover_image: '/images/gift-bundle-1.png',
    gallery_images: ['/images/gift-bundle-1.png'],
    stock_quantity: 12,
    sku: 'MM-GFT-001',
    is_active: true,
    is_featured: true,
    author: 'Minds Matter Studio',
    format: 'Gift Box',
    dimensions: '30 × 22 × 5 cm',
    weight: 0.9,
    created_at: '2026-09-20T00:00:00Z',
    updated_at: '2026-09-20T00:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Colour & Calm Bundle',
    slug: 'colour-calm-bundle',
    description:
      'Two of our most relaxing colouring books in one beautiful package. Includes "30 Days of Colour" and "Botanical Bloom," plus a curated selection of calming herbal tea sachets. The ultimate self-care gift for anyone who deserves a creative break.',
    short_description: 'Two colouring books + herbal tea — the ultimate self-care set.',
    price: 2800,
    currency: 'KES',
    category_id: 'cat-5',
    category_name: 'Gift Sets',
    cover_image: '/images/gift-bundle-1.png',
    gallery_images: ['/images/gift-bundle-1.png'],
    stock_quantity: 8,
    sku: 'MM-GFT-002',
    is_active: true,
    is_featured: false,
    author: 'Minds Matter Studio',
    format: 'Gift Box',
    dimensions: '30 × 22 × 5 cm',
    weight: 1.0,
    created_at: '2026-09-22T00:00:00Z',
    updated_at: '2026-09-22T00:00:00Z',
  },
];

/**
 * Helper: get all active categories
 */
export function getCategories(): Category[] {
  return categories.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Helper: get all active products
 */
export function getProducts(): Product[] {
  return products.filter((p) => p.is_active);
}

/**
 * Helper: get featured products
 */
export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.is_active && p.is_featured);
}

/**
 * Helper: get a single product by slug
 */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.is_active);
}

/**
 * Helper: get products by category slug
 */
export function getProductsByCategory(categorySlug: string): Product[] {
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return products.filter((p) => p.category_id === category.id && p.is_active);
}

/**
 * Helper: search products by name or description
 */
export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.is_active &&
      (p.name.toLowerCase().includes(lower) ||
        p.short_description.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        (p.category_name && p.category_name.toLowerCase().includes(lower)))
  );
}
