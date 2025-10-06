import { z } from 'zod/v4';

export const UserData = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.email(),
  avatarUrl: z.url().optional(),
});

export type UserData = z.infer<typeof UserData>;

export const RefreshTokenData = z.object({
  id: z.string(),
});

export type RefreshTokenData = z.infer<typeof RefreshTokenData>;

export const SessionData = z.object({
  sessionId: z.string(),
  hashedRefreshToken: z.string(),
  userId: z.string(),
  name: z.string().optional(),
  email: z.email(),
  avatarUrl: z.url().optional(),
});

export type SessionData = z.infer<typeof SessionData>;
