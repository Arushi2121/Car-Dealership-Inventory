const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Formats a price in cents as whole US dollars, e.g. 2549900 -> "$25,499". */
export function formatPrice(cents: number): string {
  return usd.format(Math.floor(cents / 100));
}
