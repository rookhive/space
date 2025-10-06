import { UserData } from '@repo/typesystem';
import { json, redirect } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import { authorizationCodeGrant } from 'openid-client';
import { deleteCookie, useSession } from 'vinxi/http';
import { env } from '~/env/server';
import { getGoogleDiscoveryConfig } from '~/lib/auth/google-oauth-config';
import { isAuthenticated } from '~/lib/auth/is-authenticated';
import { refreshTokens } from '~/lib/auth/refresh-tokens';
import type { AuthSessionData } from '~/types';

// TODO: if receive a wrong code or something went wrong with OAuth on the
// TODO: Google's side, should response with 400 Bad Request
export async function GET({ nativeEvent, request }: APIEvent) {
  try {
    if (await isAuthenticated(nativeEvent)) {
      return json({ error: 'Already authenticated' }, { status: 403 });
    }

    const loginSession = await useSession<AuthSessionData>(nativeEvent, {
      password: env.LOGIN_SESSION_SECRET,
    });

    const deleteLoginSession = async () => {
      await loginSession.clear();
      deleteCookie(nativeEvent, 'h3');
    };

    const currentUrl = new URL(request.url);
    const { codeVerifier, state, continuePath } = loginSession.data;

    if (!codeVerifier || !state) {
      deleteLoginSession();
      return json({ error: 'Invalid loginSession' }, { status: 403 });
    }

    const config = await getGoogleDiscoveryConfig();
    const tokens = await authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedState: state,
    });

    const claims = tokens.claims();

    if (!claims) {
      throw new Error('Invalid token claims');
    }

    await deleteLoginSession();

    const userData = UserData.parse({
      id: claims.sub,
      name: claims.name,
      email: claims.email,
      avatarUrl: claims.picture,
    });

    await refreshTokens(nativeEvent, userData);

    if (continuePath) {
      try {
        // If this is a valid URL, something went wrong :)
        new URL(continuePath as string);
      } catch {
        return redirect(continuePath, 303);
      }
    }

    return redirect('/', 303);
  } catch (error: unknown) {
    console.error(error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
