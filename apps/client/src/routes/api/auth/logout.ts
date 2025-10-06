import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { revokeSession } from '~/lib/auth/revoke-session';
import { revokeTokens } from '~/lib/auth/revoke-tokens';
import { verifyAccessToken } from '~/lib/auth/verify-access-token';
import { HTTPError } from '~/lib/errors';

export async function POST({ nativeEvent }: APIEvent) {
  try {
    const { id: userId } = await verifyAccessToken(nativeEvent);

    await revokeTokens(nativeEvent);
    await revokeSession(userId);

    return json({ status: 'success' });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof HTTPError) {
      return json({ error: error.message }, { status: error.status });
    }
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
