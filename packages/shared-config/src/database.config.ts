import { registerAs } from '@nestjs/config';
import { validateEnv } from './env.schema';

export default registerAs('database', () => {
  const env = validateEnv();
  return {
    url: env.DATABASE_URL,
  };
});
