import { createClient } from 'redis';
import { env } from '~/env/server';

export const redisClient = await createClient({ url: env.REDIS_URL })
  .on('error', console.error)
  .connect();
