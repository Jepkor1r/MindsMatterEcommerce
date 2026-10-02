-- =================================================================================
-- MINDS MATTER - PHASE 4: AUTH (profiles trigger + Row Level Security)
-- Copy all this code and paste it into the Supabase SQL Editor, then click "Run".
-- Safe to run more than once.
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. Auto-create a profile when someone signs in with Google for the first time.
--    Supabase stores the login itself in auth.users (a private table we don't
--    control). This trigger copies the name/email/photo into OUR profiles table,
--    so orders can point at a profile.
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: create profiles for anyone who already signed in before this trigger existed.
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT id, email, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------------
-- 2. Turn on Row Level Security for every private table.
--    With RLS on and no matching policy, Supabase returns NOTHING. Policies below
--    open up only the rows a signed-in user owns.
-- ---------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------------
-- 3. Read-only policies: a user can only see THEIR OWN data.
--    auth.uid() = the id of the signed-in user making the request.
--
--    There are deliberately NO insert/update policies on orders, order_items or
--    payments. In Phase 5 orders will be created by trusted server-side code that
--    recalculates prices, so the browser can never write a fake order or total.
-- ---------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
ON payments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
      AND orders.user_id = (SELECT auth.uid())
  )
);
