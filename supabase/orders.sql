-- =================================================================================
-- MINDS MATTER - PHASE 5: ORDERS (trusted server-side order creation)
-- Copy all this code and paste it into the Supabase SQL Editor, then click "Run".
-- Safe to run more than once. Run supabase/auth.sql first.
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. Shipping fee — the ONE place the real shipping fee is decided.
--    (The browser shows the same number, but only this value is ever charged.)
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_shipping_fee()
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE
AS $$ SELECT 300::NUMERIC(10, 2) $$;

-- ---------------------------------------------------------------------------------
-- 2. Order number counter: MM-20261002-0001, MM-20261002-0002, ...
--    A sequence is a counter the database guarantees never repeats.
-- ---------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq;

-- ---------------------------------------------------------------------------------
-- 3. create_order(): the "kitchen". The browser sends only product ids, quantities
--    and delivery details. Prices, totals and the order number are decided HERE.
--
--    SECURITY DEFINER lets this function insert rows even though the browser has
--    no insert permission on orders. That is safe because the function checks
--    everything itself and always uses auth.uid() (the signed-in user).
--
--    Everything inside a function runs as ONE transaction: if any check fails,
--    nothing is saved (no half-created orders).
-- ---------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order(
  p_items JSONB,              -- [{"product_id": "...", "quantity": 2}, ...]
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_shipping_address TEXT,
  p_city TEXT,
  p_country TEXT,
  p_payment_method TEXT       -- 'mpesa' or 'card'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC(10, 2) := 0;
  v_shipping_fee NUMERIC(10, 2) := public.get_shipping_fee();
  v_line RECORD;
BEGIN
  -- ── Who is ordering? ──
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Please sign in to place an order.';
  END IF;

  -- ── Validate customer details (never trust the browser's validation alone) ──
  IF coalesce(trim(p_customer_name), '') = '' OR length(p_customer_name) > 200 THEN
    RAISE EXCEPTION 'Please enter your full name.';
  END IF;
  IF p_customer_email IS NULL OR p_customer_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(p_customer_email) > 200 THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;
  IF p_customer_phone IS NULL OR p_customer_phone !~ '^\+?[0-9 ]{9,20}$' THEN
    RAISE EXCEPTION 'Please enter a valid phone number.';
  END IF;
  IF coalesce(trim(p_shipping_address), '') = '' OR length(p_shipping_address) > 500 THEN
    RAISE EXCEPTION 'Please enter your delivery address.';
  END IF;
  IF coalesce(trim(p_city), '') = '' OR length(p_city) > 100 THEN
    RAISE EXCEPTION 'Please enter your city.';
  END IF;
  IF coalesce(trim(p_country), '') = '' OR length(p_country) > 100 THEN
    RAISE EXCEPTION 'Please enter your country.';
  END IF;
  IF p_payment_method IS NULL OR p_payment_method NOT IN ('mpesa', 'card') THEN
    RAISE EXCEPTION 'Please choose a payment method.';
  END IF;

  -- ── Validate the cart shape ──
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;
  IF jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Your cart has too many different items.';
  END IF;

  -- ── Create the order (totals are filled in below) ──
  v_order_number := 'MM-'
    || to_char(now() AT TIME ZONE 'Africa/Nairobi', 'YYYYMMDD')
    || '-'
    || lpad(nextval('public.order_number_seq')::TEXT, 4, '0');

  INSERT INTO public.orders (
    user_id, order_number, status, subtotal, shipping_fee, total, currency,
    customer_name, customer_email, customer_phone, shipping_address, city, country
  ) VALUES (
    v_user_id, v_order_number, 'pending', 0, v_shipping_fee, 0, 'KES',
    trim(p_customer_name), trim(p_customer_email), trim(p_customer_phone),
    trim(p_shipping_address), trim(p_city), trim(p_country)
  )
  RETURNING id INTO v_order_id;

  -- ── One line per product, using the REAL price from the products table ──
  --    (duplicate product ids in the cart are merged by SUM)
  FOR v_line IN
    SELECT
      cart.product_id,
      cart.quantity,
      p.name,
      p.price,
      p.stock_quantity,
      p.is_active
    FROM (
      SELECT (elem ->> 'product_id')::UUID AS product_id,
             SUM((elem ->> 'quantity')::INTEGER) AS quantity
      FROM jsonb_array_elements(p_items) AS elem
      GROUP BY 1
    ) AS cart
    LEFT JOIN public.products p ON p.id = cart.product_id
  LOOP
    IF v_line.name IS NULL OR NOT v_line.is_active THEN
      RAISE EXCEPTION 'One of the products in your cart is no longer available.';
    END IF;
    IF v_line.quantity IS NULL OR v_line.quantity < 1 OR v_line.quantity > 99 THEN
      RAISE EXCEPTION 'Please choose a quantity between 1 and 99 for "%".', v_line.name;
    END IF;
    -- Stock is CHECKED here; it will be REDUCED when payment is confirmed (Phase 7)
    IF v_line.quantity > v_line.stock_quantity THEN
      IF v_line.stock_quantity <= 0 THEN
        RAISE EXCEPTION '"%" is out of stock.', v_line.name;
      END IF;
      RAISE EXCEPTION 'Only % left in stock for "%".', v_line.stock_quantity, v_line.name;
    END IF;

    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
    VALUES (v_order_id, v_line.product_id, v_line.name, v_line.quantity, v_line.price, v_line.price * v_line.quantity);

    v_subtotal := v_subtotal + v_line.price * v_line.quantity;
  END LOOP;

  -- ── Save the trusted totals ──
  UPDATE public.orders
  SET subtotal = v_subtotal, total = v_subtotal + v_shipping_fee
  WHERE id = v_order_id;

  -- ── Record the chosen payment method; status stays 'pending' until a real
  --    payment provider confirms it (Phase 7) ──
  INSERT INTO public.payments (order_id, provider, amount, currency, status)
  VALUES (v_order_id, p_payment_method, v_subtotal + v_shipping_fee, 'KES', 'pending');

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'total', v_subtotal + v_shipping_fee
  );
END;
$$;

-- ---------------------------------------------------------------------------------
-- 4. Who may call these functions?
--    Only signed-in users can create orders. Anyone may read the shipping fee.
-- ---------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.create_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(JSONB, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_shipping_fee() TO anon, authenticated;
