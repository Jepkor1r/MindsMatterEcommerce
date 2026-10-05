-- =================================================================================
-- MINDS MATTER - CART SYNC (website <-> mobile app)
-- Copy all this code and paste it into the Supabase SQL Editor, then click "Run".
-- Safe to run more than once.
--
-- WHY: the cart used to live only in the browser's localStorage, so the mobile app
-- could never see it. Now a signed-in user's cart is stored here, one row per
-- product, and both the website and the mobile app read/write the same rows.
--
-- SECURITY: this table only stores "which product, how many". Prices are NEVER
-- stored here — create_order() still recalculates every price from `products`.
-- =================================================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  -- DEFAULT auth.uid() = "the signed-in user making this request"
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 99),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- A product appears at most once per user's cart (adding again raises quantity)
  PRIMARY KEY (user_id, product_id)
);

DROP TRIGGER IF EXISTS set_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER set_cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------------
-- Row Level Security: each user can only see and change THEIR OWN cart rows.
-- Signed-out visitors (anon) get no access at all — their cart stays in the browser.
-- ---------------------------------------------------------------------------------
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cart_items FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;

DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
CREATE POLICY "Users can view own cart"
ON public.cart_items FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can add to own cart" ON public.cart_items;
CREATE POLICY "Users can add to own cart"
ON public.cart_items FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
CREATE POLICY "Users can update own cart"
ON public.cart_items FOR UPDATE TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can remove from own cart" ON public.cart_items;
CREATE POLICY "Users can remove from own cart"
ON public.cart_items FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- ---------------------------------------------------------------------------------
-- add_to_cart(): "add N of this product" in ONE safe step.
-- If the product is already in the cart, the quantity goes up instead of creating
-- a second row. The quantity is capped at the stock available (and at 99).
-- Runs as the calling user (SECURITY INVOKER), so the RLS policies above still apply.
-- Both the website and the mobile app call this.
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_to_cart(p_product_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS INTEGER  -- the new quantity in the cart
LANGUAGE plpgsql
SECURITY INVOKER SET search_path = ''
AS $$
DECLARE
  v_stock INTEGER;
  v_max INTEGER;
  v_new_quantity INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Please sign in first';
  END IF;
  IF p_quantity IS NULL OR p_quantity < 1 THEN
    RAISE EXCEPTION 'Quantity must be at least 1';
  END IF;

  SELECT stock_quantity INTO v_stock
  FROM public.products
  WHERE id = p_product_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This product is no longer available';
  END IF;
  IF COALESCE(v_stock, 0) < 1 THEN
    RAISE EXCEPTION 'This product is out of stock';
  END IF;

  v_max := LEAST(v_stock, 99);

  INSERT INTO public.cart_items (user_id, product_id, quantity)
  VALUES (auth.uid(), p_product_id, LEAST(p_quantity, v_max))
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET quantity = LEAST(public.cart_items.quantity + EXCLUDED.quantity, v_max)
  RETURNING quantity INTO v_new_quantity;

  RETURN v_new_quantity;
END;
$$;

REVOKE ALL ON FUNCTION public.add_to_cart(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_to_cart(UUID, INTEGER) TO authenticated;
