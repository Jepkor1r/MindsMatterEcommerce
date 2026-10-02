-- =================================================================================
-- MINDS MATTER - RLS POLICIES
-- Copy all this code and paste it into the Supabase SQL Editor to fix the issue
-- =================================================================================

-- 1. Enable Row Level Security on our public tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Create policies allowing ANYONE (public) to READ categories and products
CREATE POLICY "Public profiles can view active categories" 
ON categories FOR SELECT 
USING (is_active = true);

CREATE POLICY "Public profiles can view active products" 
ON products FOR SELECT 
USING (is_active = true);

-- 3. Since the previous insert might have failed, let's re-insert the categories
INSERT INTO categories (id, name, slug, description, image_url, sort_order) 
VALUES 
('c1000000-0000-0000-0000-000000000001', 'Colouring Books', 'colouring-books', 'Beautiful colouring books designed for relaxation and creative expression.', '/images/colouring-book-1.png', 1),
('c2000000-0000-0000-0000-000000000002', 'Puzzles & Sudoku', 'puzzles-sudoku', 'Engaging puzzles and sudoku books for mindful focus and brain wellness.', '/images/puzzle-book-1.png', 2),
('c3000000-0000-0000-0000-000000000003', 'Drawing & Sketching', 'drawing-sketching', 'Drawing journals and sketch books for creative self-expression.', '/images/drawing-book-1.png', 3),
('c4000000-0000-0000-0000-000000000004', 'Kids'' Activity Books', 'kids-activity-books', 'Fun, screen-free activities designed for curious young minds.', '/images/kids-activity-book-1.png', 4),
('c5000000-0000-0000-0000-000000000005', 'Gift Sets', 'gift-sets', 'Thoughtfully curated gift bundles for the creative soul.', '/images/gift-bundle-1.png', 5)
ON CONFLICT (slug) DO NOTHING;

-- 4. Re-insert the products
INSERT INTO products (name, slug, description, short_description, price, category_id, cover_image, gallery_images, stock_quantity, sku, is_featured, author, pages, format) 
VALUES 
('30 Days of Colour', '30-days-of-colour', 'A screen-free creative experience designed to encourage daily creativity, relaxation and intentional time away from screens.', 'A 30-day creative colouring journey for daily relaxation.', 1000, 'c1000000-0000-0000-0000-000000000001', '/images/colouring-book-1.png', ARRAY['/images/colouring-book-1.png', '/images/colouring-book-2.png'], 25, 'MM-CLR-001', true, 'Minds Matter Studio', 64, 'Paperback'),
('Botanical Bloom', 'botanical-bloom', 'Immerse yourself in the beauty of nature with this premium botanical colouring book. Featuring 50 elegant floral designs.', 'Premium botanical illustrations for creative relaxation.', 1200, 'c1000000-0000-0000-0000-000000000001', '/images/colouring-book-2.png', ARRAY['/images/colouring-book-2.png', '/images/colouring-book-1.png'], 18, 'MM-CLR-002', false, 'Minds Matter Studio', 52, 'Paperback'),
('Daily Brain Teasers', 'daily-brain-teasers', 'Challenge your mind with this curated collection of puzzles, logic games, and brain teasers.', 'A daily dose of puzzles for mental wellness and focus.', 800, 'c2000000-0000-0000-0000-000000000002', '/images/puzzle-book-1.png', ARRAY['/images/puzzle-book-1.png', '/images/puzzle-book-2.png'], 30, 'MM-PZL-001', true, 'Minds Matter Studio', 96, 'Paperback'),
('Sudoku Challenge', 'sudoku-challenge', 'From easy warm-ups to expert-level grids, this sudoku book offers 200 carefully graded puzzles.', '200 sudoku puzzles graded from easy to expert.', 750, 'c2000000-0000-0000-0000-000000000002', '/images/puzzle-book-2.png', ARRAY['/images/puzzle-book-2.png', '/images/puzzle-book-1.png'], 40, 'MM-PZL-002', false, 'Minds Matter Studio', 120, 'Paperback'),
('Creative Starter Bundle', 'creative-starter-bundle', 'The perfect introduction to screen-free creativity. This bundle includes our bestselling books.', 'Colouring book + puzzle book + coloured pencils gift set.', 2500, 'c5000000-0000-0000-0000-000000000005', '/images/gift-bundle-1.png', ARRAY['/images/gift-bundle-1.png'], 12, 'MM-GFT-001', true, 'Minds Matter Studio', NULL, 'Gift Box')
ON CONFLICT (slug) DO NOTHING;
