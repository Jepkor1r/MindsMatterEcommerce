/*
 * ============================================
 * ORDER EMAIL TEMPLATE
 * ============================================
 * Builds the HTML (and plain-text fallback) for
 * the order confirmation email.
 *
 * Email apps (Gmail, Outlook...) do NOT support
 * CSS variables or stylesheets, so the brand
 * palette from src/index.css is repeated here as
 * plain values and applied with inline styles.
 * Keep these in sync with index.css.
 * ============================================
 */

const BRAND = {
  primary: '#4A2545', // Deep Plum
  secondary: '#E87861', // Warm Coral
  accent: '#F4C95D', // Golden Yellow
  cream: '#FFF9F0',
  blush: '#F8E8E3',
  charcoal: '#292329',
  muted: '#716A70',
  border: '#E5D9D2',
  white: '#FFFFFF',
};

const HEADING_FONT = "'Playfair Display', Georgia, 'Times New Roman', serif";
const BODY_FONT = "Inter, Helvetica, Arial, sans-serif";

export interface EmailOrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface EmailOrder {
  order_number: string;
  created_at: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  country: string;
  items: EmailOrderItem[];
  payment_method?: string; // 'mpesa' | 'card'
  payment_status?: string; // 'pending' | 'successful' | ...
}

export interface EmailExtras {
  orderUrl?: string; // link to /orders/:id on the website
  contactEmail?: string; // where customers can reach Minds Matter
}

/**
 * Customer-entered text (name, address...) must be escaped before going into
 * HTML, otherwise someone could inject links or markup into our email.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function money(amount: number, currency: string): string {
  return `${currency} ${Number(amount).toLocaleString('en-KE')}`;
}

function orderDate(iso: string): string {
  return new Date(iso).toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function paymentMethodLabel(method?: string): string {
  if (method === 'mpesa') return 'M-Pesa';
  if (method === 'card') return 'Card';
  return 'Not selected';
}

function paymentStatusLabel(status?: string): string {
  if (status === 'successful') return 'Paid';
  if (status === 'failed') return 'Payment failed';
  if (status === 'refunded') return 'Refunded';
  return 'Awaiting payment';
}

export function buildOrderReceivedEmail(order: EmailOrder, extras: EmailExtras = {}) {
  const e = escapeHtml;
  const currency = order.currency || 'KES';
  const subject = `Thank you for your order! (${order.order_number})`;

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.charcoal};">
            ${e(item.product_name)}<br>
            <span style="color:${BRAND.muted};font-size:13px;">${money(item.unit_price, currency)} &times; ${item.quantity}</span>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid ${BRAND.border};color:${BRAND.charcoal};font-weight:600;white-space:nowrap;">
            ${money(item.subtotal, currency)}
          </td>
        </tr>`
    )
    .join('');

  const viewOrderButton = extras.orderUrl
    ? `<p style="margin:28px 0 0;text-align:center;">
         <a href="${e(extras.orderUrl)}" style="display:inline-block;background:${BRAND.primary};color:${BRAND.white};text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;">View your order</a>
       </p>`
    : '';

  const contactLine = extras.contactEmail
    ? `Questions about your order? Email us at <a href="mailto:${e(extras.contactEmail)}" style="color:${BRAND.primary};">${e(extras.contactEmail)}</a> or simply reply to this email.`
    : 'Questions about your order? Simply reply to this email.';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(subject)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:${BODY_FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.cream};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:${BRAND.primary};padding:28px 32px;text-align:center;">
          <p style="margin:0;font-family:${HEADING_FONT};font-size:28px;font-weight:700;color:${BRAND.white};">Minds Matter</p>
          <p style="margin:6px 0 0;font-size:13px;color:${BRAND.blush};">Screen-free tools for cognitive wellness</p>
        </td></tr>
        <tr><td style="height:4px;background:${BRAND.secondary};font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Greeting -->
        <tr><td style="padding:32px 32px 8px;">
          <h1 style="margin:0 0 12px;font-family:${HEADING_FONT};font-size:24px;color:${BRAND.primary};">Thank you for your order!</h1>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:${BRAND.charcoal};">Hi ${e(order.customer_name)},</p>
          <p style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.charcoal};">We've received your order and saved it to your account. Here are the details.</p>
        </td></tr>

        <!-- Order meta -->
        <tr><td style="padding:16px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.blush};border-radius:8px;">
            <tr><td style="padding:16px 20px;font-size:14px;line-height:1.8;color:${BRAND.charcoal};">
              <strong>Order number:</strong> ${e(order.order_number)}<br>
              <strong>Order date:</strong> ${e(orderDate(order.created_at))}<br>
              <strong>Payment method:</strong> ${e(paymentMethodLabel(order.payment_method))}<br>
              <strong>Payment status:</strong>
              <span style="background:${BRAND.accent};color:${BRAND.charcoal};padding:2px 8px;border-radius:999px;font-size:12px;font-weight:600;">${e(paymentStatusLabel(order.payment_status))}</span>
            </td></tr>
          </table>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:8px 32px;">
          <h2 style="margin:0 0 4px;font-family:${HEADING_FONT};font-size:18px;color:${BRAND.primary};">Your items</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${itemRows}
            <tr>
              <td style="padding:12px 0 4px;color:${BRAND.muted};">Subtotal</td>
              <td align="right" style="padding:12px 0 4px;color:${BRAND.charcoal};">${money(order.subtotal, currency)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:${BRAND.muted};">Shipping</td>
              <td align="right" style="padding:4px 0;color:${BRAND.charcoal};">${money(order.shipping_fee, currency)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;border-top:1px solid ${BRAND.border};font-size:16px;font-weight:700;color:${BRAND.charcoal};">Total</td>
              <td align="right" style="padding:12px 0 0;border-top:1px solid ${BRAND.border};font-size:16px;font-weight:700;color:${BRAND.primary};">${money(order.total, currency)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Delivery -->
        <tr><td style="padding:24px 32px 8px;">
          <h2 style="margin:0 0 8px;font-family:${HEADING_FONT};font-size:18px;color:${BRAND.primary};">Delivery information</h2>
          <p style="margin:0;font-size:14px;line-height:1.7;color:${BRAND.charcoal};">
            ${e(order.customer_name)}<br>
            ${e(order.shipping_address)}<br>
            ${e(order.city)}, ${e(order.country)}<br>
            <span style="color:${BRAND.muted};">${e(order.customer_phone)} &middot; ${e(order.customer_email)}</span>
          </p>
          ${viewOrderButton}
        </td></tr>

        <!-- Brand message + contact -->
        <tr><td style="padding:28px 32px 32px;text-align:center;">
          <p style="margin:0 0 16px;font-family:${HEADING_FONT};font-size:17px;font-style:italic;color:${BRAND.primary};">Thank you for choosing to slow down, create, and reconnect.</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.muted};">${contactLine}</p>
        </td></tr>

        <tr><td style="background:${BRAND.blush};padding:16px 32px;text-align:center;font-size:12px;color:${BRAND.muted};">
          &copy; ${new Date().getFullYear()} Minds Matter &middot; We craft screen-free tools for cognitive wellness.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Plain-text version for email apps that don't show HTML (and for spam filters)
  const text = [
    'Thank you for your order!',
    '',
    `Hi ${order.customer_name},`,
    "We've received your order and saved it to your account.",
    '',
    `Order number: ${order.order_number}`,
    `Order date: ${orderDate(order.created_at)}`,
    `Payment method: ${paymentMethodLabel(order.payment_method)}`,
    `Payment status: ${paymentStatusLabel(order.payment_status)}`,
    '',
    'Items:',
    ...order.items.map(
      (item) => `- ${item.product_name}: ${item.quantity} x ${money(item.unit_price, currency)} = ${money(item.subtotal, currency)}`
    ),
    '',
    `Subtotal: ${money(order.subtotal, currency)}`,
    `Shipping: ${money(order.shipping_fee, currency)}`,
    `Total: ${money(order.total, currency)}`,
    '',
    'Delivery information:',
    order.customer_name,
    order.shipping_address,
    `${order.city}, ${order.country}`,
    `${order.customer_phone} / ${order.customer_email}`,
    ...(extras.orderUrl ? ['', `View your order: ${extras.orderUrl}`] : []),
    '',
    'Thank you for choosing to slow down, create, and reconnect.',
    extras.contactEmail ? `Questions? Email ${extras.contactEmail} or reply to this email.` : 'Questions? Reply to this email.',
    '— Minds Matter',
  ].join('\n');

  return { subject, html, text };
}
