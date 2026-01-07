import { validateEnv, envSchema, resetEnvCache } from './env.schema';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    resetEnvCache();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should pass with valid environment variables', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/dbname';
      process.env.JWT_SECRET =
        'a-very-secure-secret-that-is-at-least-32-characters-long';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.CORS_ORIGIN = 'http://localhost:3001';

      const config = validateEnv();

      expect(config).toBeDefined();
      expect(config.DATABASE_URL).toBe(
        'postgresql://user:pass@localhost:5432/dbname',
      );
      expect(config.JWT_SECRET).toBe(
        'a-very-secure-secret-that-is-at-least-32-characters-long',
      );
      expect(config.PORT).toBe(3000);
      expect(config.NODE_ENV).toBe('development');
    });

    it('should fail when DATABASE_URL is missing', () => {
      process.env.JWT_SECRET =
        'a-very-secure-secret-that-is-at-least-32-characters-long';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';

      expect(() => validateEnv()).toThrow('Invalid environment configuration');
    });

    it('should fail when DATABASE_URL is not a valid PostgreSQL URL', () => {
      process.env.DATABASE_URL = 'not-a-valid-url';
      process.env.JWT_SECRET =
        'a-very-secure-secret-that-is-at-least-32-characters-long';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';

      expect(() => validateEnv()).toThrow('Invalid environment configuration');
    });

    it('should fail when JWT_SECRET is too short', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/dbname';
      process.env.JWT_SECRET = 'tooshort';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';

      expect(() => validateEnv()).toThrow('Invalid environment configuration');
    });

    it('should fail when JWT_SECRET uses default value', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/dbname';
      process.env.JWT_SECRET =
        'your_super_secret_jwt_key_here_change_in_production';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';

      expect(() => validateEnv()).toThrow('Invalid environment configuration');
    });

    it('should fail when JWT_REFRESH_SECRET is too short', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/dbname';
      process.env.JWT_SECRET =
        'a-very-secure-secret-that-is-at-least-32-characters-long';
      process.env.JWT_REFRESH_SECRET = 'tooshort';

      expect(() => validateEnv()).toThrow('Invalid environment configuration');
    });

    it('should fail when PORT is invalid', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/dbname';
      process.env.JWT_SECRET =
        'a-very-secure-secret-that-is-at-least-32-characters-long';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';
      process.env.PORT = '99999';

      expect(() => validateEnv()).toThrow('Invalid environment configuration');
    });

    it('should fail when NODE_ENV has invalid value', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/dbname';
      process.env.JWT_SECRET =
        'a-very-secure-secret-that-is-at-least-32-characters-long';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';
      process.env.NODE_ENV = 'invalid';

      expect(() => validateEnv()).toThrow('Invalid environment configuration');
    });

    it('should use default values for optional fields', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/dbname';
      process.env.JWT_SECRET =
        'a-very-secure-secret-that-is-at-least-32-characters-long';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';
      // Remove NODE_ENV to test default
      delete process.env.NODE_ENV;

      const config = validateEnv();

      expect(config.PORT).toBe(3000);
      expect(config.NODE_ENV).toBe('development');
      expect(config.CORS_ORIGIN).toBe('http://localhost:3001');
      expect(config.JWT_EXPIRES_IN).toBe('7d');
      expect(config.JWT_REFRESH_EXPIRES_IN).toBe('30d');
    });

    it('should cache validation result and return same instance', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/dbname';
      process.env.JWT_SECRET =
        'a-very-secure-secret-that-is-at-least-32-characters-long';
      process.env.JWT_REFRESH_SECRET =
        'a-very-secure-refresh-secret-that-is-at-least-32-characters';

      const config1 = validateEnv();
      const config2 = validateEnv();

      expect(config1).toBe(config2);
    });
  });
});
