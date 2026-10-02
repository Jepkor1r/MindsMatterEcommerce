-- =================================================================================
-- MINDS MATTER - PHASE 6: EMAIL LOG
-- Copy all this code and paste it into the Supabase SQL Editor, then click "Run".
-- Safe to run more than once. Run supabase/orders.sql first.
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- One row per email we try to send for an order. This lets us:
--   • never send the same email twice (UNIQUE order_id + email_type)
--   • record failures safely instead of losing them
--   • retry a failed email later (the Edge Function retries rows with status 'failed')
-- An email failing NEVER changes the order or payment status.
-- ---------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('order_received', 'payment_confirmed')),
  status TEXT NOT NULL DEFAULT 'sending' CHECK (status IN ('sending', 'sent', 'failed')),
  recipient TEXT NOT NULL,
  provider_message_id TEXT, -- Mailgun's id for the message, useful when checking Mailgun logs
  error TEXT,               -- short, safe description of what went wrong (never secrets)
  attempts INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (order_id, email_type)
);

DROP TRIGGER IF EXISTS set_order_emails_updated_at ON public.order_emails;
CREATE TRIGGER set_order_emails_updated_at
  BEFORE UPDATE ON public.order_emails
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS on, with NO policies: browsers can't read or write this table at all.
-- Only the Edge Function (using the server-only service role) can.
ALTER TABLE public.order_emails ENABLE ROW LEVEL SECURITY;
