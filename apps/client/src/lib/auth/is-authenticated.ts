import type { HTTPEvent } from 'vinxi/http';
import { verifyAccessToken } from './verify-access-token';

export const isAuthenticated = async (event: HTTPEvent) => {
  'use server';

  try {
    await verifyAccessToken(event);
    return true;
  } catch {
    return false;
  }
};
