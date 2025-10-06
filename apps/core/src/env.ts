import { z } from 'zod/v4';

export const env = z
  .object({
    NODE_ENV: z.enum(['development', 'production']),
    HOST: z.string(),
    PORT: z.coerce.number().int().positive(),
    NATS_URL: z.url(),
    ACCESS_TOKEN_SECRET: z.string(),
  })
  .parse(process.env);

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
