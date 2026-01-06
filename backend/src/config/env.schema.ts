import { z } from 'zod';

/**
 * Environment variable schema
 * Validates all required environment variables at application startup
 */
export const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid PostgreSQL connection string')
    .startsWith('postgresql://', {
      message: 'DATABASE_URL must be a PostgreSQL connection string',
    }),

  // JWT Configuration
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine(
      (val) =>
        val !== 'default-secret-change-me' &&
        val !== 'your_super_secret_jwt_key_here_change_in_production',
      {
        message:
          'JWT_SECRET must not use default/example values in production',
      },
    ),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security')
    .refine(
      (val) =>
        val !== 'default-refresh-secret-change-me' &&
        val !== 'your_super_secret_refresh_key_here_change_in_production',
      {
        message:
          'JWT_REFRESH_SECRET must not use default/example values in production',
      },
    ),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Application Configuration
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val < 65536, {
      message: 'PORT must be between 1 and 65535',
    }),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables
 * Throws error with clear message if validation fails
 */
export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => {
          const path = err.path.join('.');
          return `  ❌ ${path}: ${err.message}`;
        })
        .join('\n');

      console.error('\n🚨 Environment Validation Failed:\n');
      console.error(errorMessages);
      console.error('\n💡 Please check your .env file and ensure all required variables are set correctly.\n');
      
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}
