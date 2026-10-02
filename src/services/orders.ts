import { supabase } from '../lib/supabase';
import type { CartItem, CheckoutFormData, Order } from '../types';

/**
 * Shipping fee shown in the cart and checkout BEFORE an order exists.
 * This is for display only — the real fee is decided by get_shipping_fee()
 * in supabase/orders.sql. Keep the two in sync.
 */
export const SHIPPING_FEE = 300;

// What the database sends back after creating an order
export interface CreatedOrder {
  id: string;
  order_number: string;
  total: number;
}

// Errors we raise ourselves in create_order() use Postgres code P0001
// and have customer-friendly messages. Anything else is an internal error.
const FRIENDLY_ERROR_CODE = 'P0001';
const GENERIC_ERROR = 'We could not place your order right now. Please try again.';

/**
 * Create an order. We send ONLY product ids and quantities — never prices.
 * The database looks up real prices and calculates the total.
 */
export async function createOrder(
  items: CartItem[],
  form: CheckoutFormData
): Promise<{ order: CreatedOrder | null; error: string | null }> {
  const { data, error } = await supabase.rpc('create_order', {
    p_items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
    p_customer_name: form.customer_name,
    p_customer_email: form.customer_email,
    p_customer_phone: form.customer_phone,
    p_shipping_address: form.shipping_address,
    p_city: form.city,
    p_country: form.country,
    p_payment_method: form.payment_method,
  });

  if (error) {
    console.error('Error creating order:', error);
    return { order: null, error: error.code === FRIENDLY_ERROR_CODE ? error.message : GENERIC_ERROR };
  }
  return { order: data as CreatedOrder, error: null };
}

/**
 * Turn the raw Supabase row (with joined order_items / payments arrays)
 * into our Order shape. The newest payment attempt is the one that counts.
 */
function toOrder(row: any): Order {
  const payments = [...(row.payments ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return {
    ...row,
    items: (row.order_items ?? []).map((item: any) => ({ ...item, cover_image: item.products?.cover_image })),
    payment: payments[0],
  };
}

/**
 * Fetch the signed-in user's orders, newest first.
 * Row Level Security guarantees only THIS user's orders come back.
 * Returns null if the request failed (so the page can show an error).
 */
export async function fetchMyOrders(): Promise<Order[] | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return null;
  }
  return (data || []).map(toOrder);
}

/**
 * Fetch one order by id. Returns null if it doesn't exist, isn't
 * this user's order (RLS hides it), or the request failed.
 */
export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(cover_image)), payments(*)')
    .eq('id', id)
    .maybeSingle(); // null instead of an error when no row matches

  if (error) {
    console.error(`Error fetching order ${id}:`, error);
    return null;
  }
  return data ? toOrder(data) : null;
}

export type EmailStatus = 'sent' | 'failed';

/**
 * Ask our server-side Edge Function (supabase/functions/send-order-email)
 * to email the order confirmation. The browser never sees the Mailgun key —
 * it only sends the order id plus the user's login token.
 *
 * If this fails, the order is still safely saved; the failure is recorded
 * server-side so the email can be retried.
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<EmailStatus> {
  const { data, error } = await supabase.functions.invoke('send-order-email', {
    body: { order_id: orderId },
  });

  if (error) {
    console.error('Error sending confirmation email:', error);
    return 'failed';
  }
  // 'already_sent' counts as sent — the customer has their email
  return data?.status === 'sent' || data?.status === 'already_sent' ? 'sent' : 'failed';
}
