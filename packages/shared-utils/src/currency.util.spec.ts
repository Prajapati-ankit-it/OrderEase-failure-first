import { displayToCents, centsToDisplay, formatCurrency } from './currency.util';

describe('Currency Utilities', () => {
  describe('displayToCents', () => {
    it('should convert dollars to cents', () => {
      expect(displayToCents(10.0)).toBe(1000);
      expect(displayToCents(15.99)).toBe(1599);
      expect(displayToCents(0.99)).toBe(99);
      expect(displayToCents(100.5)).toBe(10050);
    });

    it('should handle rounding for precision issues', () => {
      // Note: This handles floating-point arithmetic issues
      // 10.995 * 100 = 1099.5 due to floating-point, which rounds to 1100
      expect(displayToCents(10.995)).toBe(1100); // Rounds up
      expect(displayToCents(10.994)).toBe(1099); // Rounds down
    });

    it('should handle zero', () => {
      expect(displayToCents(0)).toBe(0);
    });

    it('should throw error for negative values', () => {
      expect(() => displayToCents(-10.0)).toThrow('does not accept negative values');
      expect(() => displayToCents(-0.01)).toThrow('does not accept negative values');
    });
  });

  describe('centsToDisplay', () => {
    it('should convert cents to dollars', () => {
      expect(centsToDisplay(1000)).toBe(10.0);
      expect(centsToDisplay(1599)).toBe(15.99);
      expect(centsToDisplay(99)).toBe(0.99);
      expect(centsToDisplay(10050)).toBe(100.5);
    });

    it('should handle zero', () => {
      expect(centsToDisplay(0)).toBe(0);
    });

    it('should throw error for negative values', () => {
      expect(() => centsToDisplay(-1000)).toThrow('does not accept negative values');
      expect(() => centsToDisplay(-1)).toThrow('does not accept negative values');
    });

    it('should throw error for non-integer values', () => {
      expect(() => centsToDisplay(10.5)).toThrow('expects an integer');
      expect(() => centsToDisplay(1599.99)).toThrow('expects an integer');
    });
  });

  describe('formatCurrency', () => {
    it('should format cents as currency string', () => {
      expect(formatCurrency(1000)).toBe('$10.00');
      expect(formatCurrency(1599)).toBe('$15.99');
      expect(formatCurrency(99)).toBe('$0.99');
    });

    it('should support custom currency symbols', () => {
      expect(formatCurrency(1000, '€')).toBe('€10.00');
      expect(formatCurrency(1599, '£')).toBe('£15.99');
    });
  });

  describe('round-trip conversions', () => {
    it('should maintain value after display->cents->display conversion', () => {
      const originalDollars = 15.99;
      const cents = displayToCents(originalDollars);
      const backToDollars = centsToDisplay(cents);
      expect(backToDollars).toBe(originalDollars);
    });

    it('should maintain value for various amounts', () => {
      const testCases = [0.99, 10.0, 15.99, 100.50, 999.99];
      testCases.forEach((dollars) => {
        const cents = displayToCents(dollars);
        const backToDollars = centsToDisplay(cents);
        expect(backToDollars).toBe(dollars);
      });
    });
  });
});
