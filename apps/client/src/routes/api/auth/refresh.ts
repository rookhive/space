import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { refreshTokens } from '~/lib/auth/refresh-tokens';
import { verifyRefreshToken } from '~/lib/auth/verify-refresh-token';

export async function POST({ nativeEvent: event }: APIEvent) {
  try {
    await refreshTokens(event, await verifyRefreshToken(event));

    return json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
