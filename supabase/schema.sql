-- =================================================================================
-- MINDS MATTER - DATABASE SCHEMA
-- Copy all this code and paste it into the Supabase SQL Editor
-- =================================================================================

-- 1. Create custom types
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded');

-- =================================================================================
-- TABLES
-- =================================================================================

-- 2. Profiles (Linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  author TEXT,
  pages INTEGER,
  age_range TEXT,
  difficulty TEXT,
  format TEXT,
  dimensions TEXT,
  weight NUMERIC(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable to allow guest checkout initially
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_fee NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Kenya',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items (Saving price & name historically)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Stored historically in case product name changes
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL, -- Stored historically in case price changes
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'mpesa', 'card'
  transaction_reference TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================================
-- TRIGGERS (Auto-update updated_at timestamps)
-- =================================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =================================================================================
-- SEED DATA (Minds Matter Products)
-- =================================================================================

-- Categories
INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Colouring Books', 'colouring-books', 'Beautiful colouring books designed for relaxation and creative expression.', '/images/colouring-book-1.png', 1),
('c2000000-0000-0000-0000-000000000002', 'Puzzles & Sudoku', 'puzzles-sudoku', 'Engaging puzzles and sudoku books for mindful focus and brain wellness.', '/images/puzzle-book-1.png', 2),
('c3000000-0000-0000-0000-000000000003', 'Drawing & Sketching', 'drawing-sketching', 'Drawing journals and sketch books for creative self-expression.', '/images/drawing-book-1.png', 3),
('c4000000-0000-0000-0000-000000000004', 'Kids'' Activity Books', 'kids-activity-books', 'Fun, screen-free activities designed for curious young minds.', '/images/kids-activity-book-1.png', 4),
('c5000000-0000-0000-0000-000000000005', 'Gift Sets', 'gift-sets', 'Thoughtfully curated gift bundles for the creative soul.', '/images/gift-bundle-1.png', 5);

-- Products
INSERT INTO products (name, slug, description, short_description, price, category_id, cover_image, gallery_images, stock_quantity, sku, is_featured, author, pages, format) VALUES 
('30 Days of Colour', '30-days-of-colour', 'A screen-free creative experience designed to encourage daily creativity, relaxation and intentional time away from screens.', 'A 30-day creative colouring journey for daily relaxation.', 1000, 'c1000000-0000-0000-0000-000000000001', '/images/colouring-book-1.png', ARRAY['/images/colouring-book-1.png', '/images/colouring-book-2.png'], 25, 'MM-CLR-001', true, 'Minds Matter Studio', 64, 'Paperback'),
('Botanical Bloom', 'botanical-bloom', 'Immerse yourself in the beauty of nature with this premium botanical colouring book. Featuring 50 elegant floral designs.', 'Premium botanical illustrations for creative relaxation.', 1200, 'c1000000-0000-0000-0000-000000000001', '/images/colouring-book-2.png', ARRAY['/images/colouring-book-2.png', '/images/colouring-book-1.png'], 18, 'MM-CLR-002', false, 'Minds Matter Studio', 52, 'Paperback'),
('Daily Brain Teasers', 'daily-brain-teasers', 'Challenge your mind with this curated collection of puzzles, logic games, and brain teasers.', 'A daily dose of puzzles for mental wellness and focus.', 800, 'c2000000-0000-0000-0000-000000000002', '/images/puzzle-book-1.png', ARRAY['/images/puzzle-book-1.png', '/images/puzzle-book-2.png'], 30, 'MM-PZL-001', true, 'Minds Matter Studio', 96, 'Paperback'),
('Sudoku Challenge', 'sudoku-challenge', 'From easy warm-ups to expert-level grids, this sudoku book offers 200 carefully graded puzzles.', '200 sudoku puzzles graded from easy to expert.', 750, 'c2000000-0000-0000-0000-000000000002', '/images/puzzle-book-2.png', ARRAY['/images/puzzle-book-2.png', '/images/puzzle-book-1.png'], 40, 'MM-PZL-002', false, 'Minds Matter Studio', 120, 'Paperback'),
('Creative Starter Bundle', 'creative-starter-bundle', 'The perfect introduction to screen-free creativity. This bundle includes our bestselling books.', 'Colouring book + puzzle book + coloured pencils gift set.', 2500, 'c5000000-0000-0000-0000-000000000005', '/images/gift-bundle-1.png', ARRAY['/images/gift-bundle-1.png'], 12, 'MM-GFT-001', true, 'Minds Matter Studio', NULL, 'Gift Box');
