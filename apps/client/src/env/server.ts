import { z } from 'zod/v4';

const envScheme = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  HOST: z.string(),
  PORT: z.coerce.number().int().positive(),
  NATS_URL: z.url(),
  REDIS_URL: z.url(),
  LOGIN_SESSION_SECRET: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRATION: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRATION: z.string(),
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  GOOGLE_OAUTH_SERVER_URL: z.url(),
  GOOGLE_OAUTH_REDIRECT_URL: z.url(),
});

export const env = envScheme.safeParse(process.env).data ?? ({} as z.infer<typeof envScheme>);

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
