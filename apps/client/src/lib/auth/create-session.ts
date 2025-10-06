import crypto from 'node:crypto';
import type { UserData } from '@repo/typesystem';
import { InternalServerError } from '../errors';
import { redisClient } from '../redis-client';

// TODO: move to the environment variables
const sessionTTL = 60 * 60 * 24 * 30; // 30 days

export async function createSession(refreshToken: string, userData: UserData) {
  'use server';

  const sessionData = {
    sessionId: crypto.randomUUID(),
    hashedRefreshToken: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    userId: userData.id,
    name: userData.name,
    email: userData.email,
    avatarUrl: userData.avatarUrl,
  };

  const status = await redisClient.setEx(
    `session:${userData.id}`,
    sessionTTL,
    JSON.stringify(sessionData)
  );

  if (status !== 'OK') {
    throw new InternalServerError('Failed to create session');
  }
}
