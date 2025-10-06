import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '@repo/constants';
import type { UserData } from '@repo/typesystem';
import { SignJWT } from 'jose';
import { type HTTPEvent, setCookie } from 'vinxi/http';
import { env, isProduction } from '~/env/server';
import { createSession } from './create-session';

export async function refreshTokens(event: HTTPEvent, userData: UserData) {
  'use server';

  const accessToken = await new SignJWT(userData)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(env.ACCESS_TOKEN_EXPIRATION)
    .sign(new TextEncoder().encode(env.ACCESS_TOKEN_SECRET));

  const refreshToken = await new SignJWT({ id: userData.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRATION)
    .sign(new TextEncoder().encode(env.REFRESH_TOKEN_SECRET));

  setCookie(event, ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });

  setCookie(event, REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });

  await createSession(refreshToken, userData);

  return userData;
}
