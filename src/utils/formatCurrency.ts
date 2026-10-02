/**
 * Format a number as Kenyan Shillings (KES).
 *
 * Example:
 *   formatCurrency(1000)  → "KES 1,000"
 *   formatCurrency(2500)  → "KES 2,500"
 */
export function formatCurrency(amount: number, currency = 'KES'): string {
  return `${currency} ${amount.toLocaleString('en-KE')}`;
}
