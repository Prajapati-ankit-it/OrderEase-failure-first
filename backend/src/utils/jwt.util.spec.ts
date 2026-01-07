import { parseJwtExpiration } from './jwt.util';

describe('JWT Utils', () => {
  describe('parseJwtExpiration', () => {
    it('should return the value if provided in correct format', () => {
      expect(parseJwtExpiration('7d', '1d')).toBe('7d');
      expect(parseJwtExpiration('24h', '1h')).toBe('24h');
      expect(parseJwtExpiration('30m', '15m')).toBe('30m');
      expect(parseJwtExpiration('3600s', '60s')).toBe('3600s');
    });

    it('should return default value if value is undefined', () => {
      expect(parseJwtExpiration(undefined, '7d')).toBe('7d');
      expect(parseJwtExpiration(undefined, '1h')).toBe('1h');
    });

    it('should return default value if value is empty string', () => {
      expect(parseJwtExpiration('', '7d')).toBe('7d');
    });

    it('should use 7d as default when no defaultValue is provided', () => {
      expect(parseJwtExpiration(undefined)).toBe('7d');
    });

    it('should handle numeric values with time units', () => {
      expect(parseJwtExpiration('30d', '7d')).toBe('30d');
      expect(parseJwtExpiration('168h', '24h')).toBe('168h');
      expect(parseJwtExpiration('1440m', '60m')).toBe('1440m');
    });
  });
});
