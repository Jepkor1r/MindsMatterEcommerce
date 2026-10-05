/*
 * Minds Matter brand colours — the same values as the website's src/index.css.
 * Use these names in styles instead of typing hex codes in screens.
 */
export const colors = {
  primary: '#4A2545', // Deep Plum
  secondary: '#E87861', // Warm Coral
  accent: '#F4C95D', // Golden Yellow
  sage: '#9CAF88',
  cream: '#FFF9F0',
  blush: '#F8E8E3',
  charcoal: '#292329',
  muted: '#716A70',
  border: '#E5D9D2',
  white: '#FFFFFF',
  error: '#C94C4C',
  errorLight: '#F8E0E0',
};

/** Format a number as Kenyan Shillings, e.g. 2500 → "KES 2,500" (same as the website). */
export function formatCurrency(amount: number, currency = 'KES'): string {
  const rounded = Math.round(amount * 100) / 100;
  const [whole, cents] = String(rounded).split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currency} ${withCommas}${cents ? '.' + cents : ''}`;
}
