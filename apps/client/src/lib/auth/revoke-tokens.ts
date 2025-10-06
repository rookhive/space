import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '@repo/constants';
import { deleteCookie, type HTTPEvent } from 'vinxi/http';

export async function revokeTokens(event: HTTPEvent) {
  'use server';

  deleteCookie(event, ACCESS_TOKEN_COOKIE_NAME);
  deleteCookie(event, REFRESH_TOKEN_COOKIE_NAME);
}
