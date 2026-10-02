/*
 * ============================================
 * EDGE FUNCTION: send-order-email
 * ============================================
 * Runs on Supabase's servers, NOT in the browser.
 *
 * The browser calls this right after an order is
 * created: POST { "order_id": "..." }
 *
 * Steps:
 * 1. Check who is calling (their login token).
 * 2. Load the order — only if it belongs to them.
 * 3. "Claim" the email in order_emails so it is
 *    never sent twice (a failed one may be retried).
 * 4. Build the HTML and send it through Mailgun.
 * 5. Record "sent" or "failed". A failed email
 *    never changes the order or payment status.
 *
 * Secrets used (set in Supabase → Edge Functions → Secrets):
 *   MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL
 * Optional: MAILGUN_API_BASE, SITE_URL, STORE_CONTACT_EMAIL
 * Provided automatically by Supabase:
 *   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 * ============================================
 */

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { sendMailgunEmail } from '../_shared/mailgun.ts';
import { buildOrderReceivedEmail } from '../_shared/orderEmail.ts';

const EMAIL_TYPE = 'order_received';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// If a send started but never finished (e.g. the function crashed), allow a retry after this long
const STUCK_AFTER_MS = 5 * 60 * 1000;

/**
 * Reserve the right to send this email. Returns true if WE should send it now.
 * Returns false if it was already sent (or another request is sending it right now).
 */
async function claimEmail(admin: SupabaseClient, orderId: string, recipient: string): Promise<boolean> {
  // First attempt: create the log row. The UNIQUE (order_id, email_type) rule
  // means only one request can ever succeed here.
  const { error: insertError } = await admin
    .from('order_emails')
    .insert({ order_id: orderId, email_type: EMAIL_TYPE, recipient, status: 'sending' });

  if (!insertError) return true;
  if (insertError.code !== '23505') throw insertError; // 23505 = "already exists"

  // A row already exists — look at it
  const { data: existing, error: selectError } = await admin
    .from('order_emails')
    .select('id, status, attempts, updated_at')
    .eq('order_id', orderId)
    .eq('email_type', EMAIL_TYPE)
    .single();
  if (selectError) throw selectError;

  const isStuck =
    existing.status === 'sending' && Date.now() - new Date(existing.updated_at).getTime() > STUCK_AFTER_MS;
  if (existing.status !== 'failed' && !isStuck) return false;

  // Retry. Matching on updated_at means that if two retries race, only one wins.
  const { data: retried, error: updateError } = await admin
    .from('order_emails')
    .update({ status: 'sending', error: null, recipient, attempts: existing.attempts + 1 })
    .eq('id', existing.id)
    .eq('updated_at', existing.updated_at)
    .select('id');
  if (updateError) throw updateError;
  return (retried ?? []).length > 0;
}

Deno.serve(async (req) => {
  // Browser "may I call you?" check (CORS preflight)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

    // ── 1. Who is calling? ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Please sign in.' }, 401);

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return jsonResponse({ error: 'Please sign in.' }, 401);

    const body = await req.json().catch(() => null);
    const orderId = body?.order_id;
    if (typeof orderId !== 'string' || !UUID_PATTERN.test(orderId)) {
      return jsonResponse({ error: 'A valid order_id is required.' }, 400);
    }

    // ── 2. Load the order with the server-only admin client, but ONLY if it is theirs ──
    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return jsonResponse({ error: 'Order not found.' }, 404);

    // ── 3. Make sure we only send once ──
    const shouldSend = await claimEmail(admin, order.id, order.customer_email);
    if (!shouldSend) return jsonResponse({ status: 'already_sent' });

    // ── 4. Build and send ──
    const payments = [...(order.payments ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
    const siteUrl = Deno.env.get('SITE_URL');
    const contactEmail = Deno.env.get('STORE_CONTACT_EMAIL') || undefined;

    const email = buildOrderReceivedEmail(
      {
        ...order,
        items: order.order_items ?? [],
        payment_method: payments[0]?.provider,
        payment_status: payments[0]?.status,
      },
      {
        orderUrl: siteUrl ? `${siteUrl.replace(/\/$/, '')}/orders/${order.id}` : undefined,
        contactEmail,
      }
    );

    const result = await sendMailgunEmail({
      to: order.customer_email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: contactEmail,
    });

    // ── 5. Record the outcome (the order itself is never touched) ──
    if (result.ok) {
      await admin
        .from('order_emails')
        .update({ status: 'sent', provider_message_id: result.messageId, error: null })
        .eq('order_id', order.id)
        .eq('email_type', EMAIL_TYPE);
      return jsonResponse({ status: 'sent' });
    }

    console.error(`Order email failed for ${order.order_number}: ${result.error}`);
    await admin
      .from('order_emails')
      .update({ status: 'failed', error: result.error })
      .eq('order_id', order.id)
      .eq('email_type', EMAIL_TYPE);
    return jsonResponse({ status: 'failed' }, 502);
  } catch (err) {
    // Log details for us; give the browser nothing internal
    console.error('send-order-email crashed:', err);
    return jsonResponse({ error: 'Something went wrong.' }, 500);
  }
});
