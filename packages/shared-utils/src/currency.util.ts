/**
 * Currency utilities for handling price conversions
 * All prices are stored in cents (integer) in the database
 * to avoid floating-point precision errors
 */

/**
 * Convert cents (integer) to display format (dollars)
 * @param cents - Price in cents (e.g., 1000). Must be a non-negative integer.
 * @returns Price in dollars (e.g., 10.00)
 * @throws Error if cents is negative or not an integer
 * @example
 * centsToDisplay(1000) // returns 10.00
 * centsToDisplay(1599) // returns 15.99
 */
export function centsToDisplay(cents: number): number {
  if (!Number.isInteger(cents)) {
    throw new Error(`centsToDisplay expects an integer, received: ${cents}`);
  }
  if (cents < 0) {
    throw new Error(`centsToDisplay does not accept negative values: ${cents}`);
  }
  return cents / 100;
}

/**
 * Convert display format (dollars) to cents (integer)
 * Uses Math.round to avoid precision loss
 * @param dollars - Price in dollars (e.g., 10.00). Must be non-negative and have at most 2 decimal places.
 * @returns Price in cents (e.g., 1000)
 * @throws Error if dollars is negative
 * @example
 * displayToCents(10.00) // returns 1000
 * displayToCents(15.99) // returns 1599
 */
export function displayToCents(dollars: number): number {
  if (dollars < 0) {
    throw new Error(`displayToCents does not accept negative values: ${dollars}`);
  }
  return Math.round(dollars * 100);
}

/**
 * Format cents as currency string
 * @param cents - Price in cents
 * @param currency - Currency symbol (default: '$')
 * @returns Formatted currency string
 * @example
 * formatCurrency(1000) // returns "$10.00"
 * formatCurrency(1599, '€') // returns "€15.99"
 */
export function formatCurrency(cents: number, currency: string = '$'): string {
  const dollars = centsToDisplay(cents);
  return `${currency}${dollars.toFixed(2)}`;
}
