/*
 * Human-friendly labels and badge colours for order/payment states.
 * Kept in one place so every page shows statuses the same way.
 */
import type { OrderStatus, PaymentStatus } from '../../types';

interface BadgeStyle {
  label: string;
  backgroundColor: string;
  color: string;
}

export function orderStatusBadge(status: OrderStatus): BadgeStyle {
  switch (status) {
    case 'delivered':
      return { label: 'Delivered', backgroundColor: 'var(--color-sage)', color: 'var(--color-white)' };
    case 'cancelled':
      return { label: 'Cancelled', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' };
    case 'pending':
      return { label: 'Pending', backgroundColor: 'var(--color-accent)', color: 'var(--color-charcoal)' };
    default:
      // paid, processing, shipped
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        backgroundColor: 'var(--color-blush)',
        color: 'var(--color-primary)',
      };
  }
}

export function paymentStatusBadge(status: PaymentStatus | undefined): BadgeStyle {
  switch (status) {
    case 'successful':
      return { label: 'Paid', backgroundColor: 'var(--color-sage)', color: 'var(--color-white)' };
    case 'failed':
      return { label: 'Payment failed', backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' };
    case 'refunded':
      return { label: 'Refunded', backgroundColor: 'var(--color-blush)', color: 'var(--color-muted)' };
    default:
      return { label: 'Awaiting payment', backgroundColor: 'var(--color-accent)', color: 'var(--color-charcoal)' };
  }
}

export function paymentMethodLabel(provider: string | undefined): string {
  if (provider === 'mpesa') return 'M-Pesa';
  if (provider === 'card') return 'Card';
  return 'Not selected';
}

export function formatOrderDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
