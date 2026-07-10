/**
 * Formats a number into Indian Rupees (INR) using the Indian numbering system.
 * Example: 1250000 => ₹12,50,000
 * Example: 499 => ₹499
 */
export function formatINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return '₹' + new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount));
}
