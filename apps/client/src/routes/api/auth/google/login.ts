import { json, redirect } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import {
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomPKCECodeVerifier,
  randomState,
} from 'openid-client';
import { useSession } from 'vinxi/http';
import { env, isDevelopment } from '~/env/server';
import { getGoogleDiscoveryConfig } from '~/lib/auth/google-oauth-config';
import { isAuthenticated } from '~/lib/auth/is-authenticated';
import type { AuthSessionData } from '~/types';

export async function POST({ nativeEvent }: APIEvent) {
  try {
    if (await isAuthenticated(nativeEvent)) {
      return json({ error: 'Already authenticated' }, { status: 403 });
    }

    const config = await getGoogleDiscoveryConfig();
    const codeVerifier = randomPKCECodeVerifier();
    const state = randomState();

    let continuePath: string | undefined;
    const referrer = nativeEvent.headers.get('referer');
    if (referrer) {
      try {
        const url = new URL(referrer);
        continuePath = url.searchParams.get('continue') || undefined;
      } catch {}
    }

    const loginSession = await useSession<AuthSessionData>(nativeEvent, {
      password: env.LOGIN_SESSION_SECRET,
    });

    await loginSession.update({
      codeVerifier,
      state,
      continuePath,
    });

    const authorizationUrl = buildAuthorizationUrl(config, {
      redirect_uri: env.GOOGLE_OAUTH_REDIRECT_URL,
      scope: 'openid email profile',
      code_challenge: await calculatePKCECodeChallenge(codeVerifier),
      code_challenge_method: 'S256',
      state,
    }).href;

    return redirect(authorizationUrl, {
      status: 303,
      // See https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid#get_your_google_api_client_id
      headers: isDevelopment ? { 'Referrer-Policy': 'no-referrer-when-downgrade' } : undefined,
    });
  } catch (error: unknown) {
    console.error(error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
