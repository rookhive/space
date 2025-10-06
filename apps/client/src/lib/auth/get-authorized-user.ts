import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '@repo/constants';
import { query, redirect } from '@solidjs/router';
import { getRequestEvent } from 'solid-js/web';
import { getCookie, type HTTPEvent } from 'vinxi/http';
import { UnauthenticatedError } from '../errors';
import { isTokenExpired } from '../helpers';
import { refreshTokens } from './refresh-tokens';
import { revokeTokens } from './revoke-tokens';
import { verifyAccessToken } from './verify-access-token';
import { verifyRefreshToken } from './verify-refresh-token';

export const getAuthorizedUser = query(async () => {
  'use server';

  let event: HTTPEvent | undefined;

  try {
    const requestEvent = getRequestEvent();

    if (!requestEvent) {
      throw new Error('No request event found');
    }

    event = requestEvent.nativeEvent;

    const accessToken = getCookie(event, ACCESS_TOKEN_COOKIE_NAME);
    const refreshToken = getCookie(event, REFRESH_TOKEN_COOKIE_NAME);

    if (!accessToken && !refreshToken) {
      throw new UnauthenticatedError();
    }

    if (!accessToken || isTokenExpired(accessToken)) {
      if (refreshToken && !isTokenExpired(refreshToken)) {
        return await refreshTokens(event, await verifyRefreshToken(event));
      }
      await revokeTokens(event);
      throw new UnauthenticatedError();
    }

    return await verifyAccessToken(event);
  } catch (error: unknown) {
    console.error(error);
    if (event) {
      const referrer = event.headers.get('referer');
      if (referrer) {
        const url = new URL(referrer);
        if (url && url.pathname !== '/') {
          throw redirect(`/?continue=${url.pathname}`);
        }
      }
    }
    throw redirect('/');
  }
}, 'user');
