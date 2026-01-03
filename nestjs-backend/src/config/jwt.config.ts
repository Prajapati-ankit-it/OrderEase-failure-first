import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'default-secret-change-me',
  expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret-change-me',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
}));
