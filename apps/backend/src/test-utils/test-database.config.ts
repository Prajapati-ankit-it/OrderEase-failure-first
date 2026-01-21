import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

/**
 * Test database configuration for isolated testing
 */
export const testDatabaseConfig = {
  isGlobal: true,
  envFilePath: '.env.test',
};

/**
 * Test JWT module configuration
 */
export const testJwtConfig = JwtModule.register({
  secret: 'test-jwt-secret',
  signOptions: { expiresIn: '1h' },
});

/**
 * Test configuration module
 */
export const getTestConfigModule = () =>
  ConfigModule.forRoot({
    isGlobal: true,
    ignoreEnvFile: true,
    load: [
      () => ({
        jwt: {
          secret: 'test-jwt-secret',
          expiresIn: '1h',
          refreshSecret: 'test-refresh-secret',
          refreshExpiresIn: '7d',
        },
        database: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://test:test@localhost:5432/orderease_test',
        },
      }),
    ],
  });
