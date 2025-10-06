import crypto from 'node:crypto';
import { REFRESH_TOKEN_COOKIE_NAME } from '@repo/constants';
import { RefreshTokenData, SessionData } from '@repo/typesystem';
import { jwtVerify } from 'jose';
import { getCookie, type HTTPEvent } from 'vinxi/http';
import { env } from '~/env/server';
import { UnauthenticatedError } from '../errors';
import { redisClient } from '../redis-client';
import { revokeTokens } from './revoke-tokens';

export async function verifyRefreshToken(event: HTTPEvent) {
  'use server';

  try {
    const refreshToken = getCookie(event, REFRESH_TOKEN_COOKIE_NAME);
    if (!refreshToken) {
      throw new Error();
    }

    const refreshTokenSecret = new TextEncoder().encode(env.REFRESH_TOKEN_SECRET);
    const { payload } = await jwtVerify(refreshToken, refreshTokenSecret);
    const { id: userId } = RefreshTokenData.parse(payload);
    const session = await redisClient.get(`session:${userId}`);
    if (!session) {
      throw new Error();
    }
    const sessionData = SessionData.parse(JSON.parse(session));

    if (
      !crypto.timingSafeEqual(
        crypto.createHash('sha256').update(refreshToken).digest(),
        Buffer.from(sessionData.hashedRefreshToken, 'hex')
      )
    ) {
      throw new Error();
    }

    return {
      id: sessionData.userId,
      name: sessionData.name,
      email: sessionData.email,
      avatarUrl: sessionData.avatarUrl,
    };
  } catch (error: unknown) {
    console.error(error);
    await revokeTokens(event);
    throw new UnauthenticatedError();
  }
}
