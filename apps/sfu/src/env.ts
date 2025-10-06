import 'dotenv/config';
import { z } from 'zod/v4';

export const env = z
  .object({
    NODE_ENV: z.enum(['development', 'production']),
    HOST: z.string(),
    PORT: z.coerce.number().int().positive(),
    NATS_URL: z.url(),
    CLIENT_URL: z.url(),
    ACCESS_TOKEN_SECRET: z.string(),
    MEDIASOUP_ANNOUNCED_IP: z.ipv4(),
    MEDIASOUP_MIN_PORT: z.coerce.number().min(1),
    MEDIASOUP_MAX_PORT: z.coerce.number().min(1),
    MEDIASOUP_WORKERS: z.coerce.number().optional(),
  })
  .parse(process.env);

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
