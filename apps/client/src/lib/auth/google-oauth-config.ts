import { type Configuration, discovery } from 'openid-client';
import { env } from '~/env/server';

let config: Promise<Configuration>;

export async function getGoogleDiscoveryConfig() {
  'use server';

  return (config ??= discovery(
    new URL(env.GOOGLE_OAUTH_SERVER_URL),
    env.GOOGLE_OAUTH_CLIENT_ID,
    env.GOOGLE_OAUTH_CLIENT_SECRET
  ));
}
