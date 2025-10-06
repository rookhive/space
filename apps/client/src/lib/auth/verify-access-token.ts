import { ACCESS_TOKEN_COOKIE_NAME } from '@repo/constants';
import { UserData } from '@repo/typesystem';
import { jwtVerify } from 'jose';
import { deleteCookie, getCookie, type HTTPEvent } from 'vinxi/http';
import { env } from '~/env/server';
import { UnauthenticatedError } from '../errors';

export async function verifyAccessToken(event: HTTPEvent) {
  'use server';

  try {
    const accessToken = getCookie(event, ACCESS_TOKEN_COOKIE_NAME);
    const accessTokenSecret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);

    const { payload } = await jwtVerify(String(accessToken), accessTokenSecret);

    return UserData.parse(payload);
  } catch {
    deleteCookie(event, ACCESS_TOKEN_COOKIE_NAME);
    throw new UnauthenticatedError();
  }
}
