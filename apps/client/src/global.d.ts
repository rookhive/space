/// <reference types="@solidjs/start/env" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production';
    readonly HOST: string;
    readonly PORT: string;
    readonly NATS_URL: string;
    readonly REDIS_URL: string;
    readonly LOGIN_SESSION_SECRET: string;
    readonly ACCESS_TOKEN_SECRET: string;
    readonly ACCESS_TOKEN_EXPIRATION: string;
    readonly REFRESH_TOKEN_SECRET: string;
    readonly REFRESH_TOKEN_EXPIRATION: string;
    readonly GOOGLE_OAUTH_CLIENT_ID: string;
    readonly GOOGLE_OAUTH_CLIENT_SECRET: string;
    readonly GOOGLE_OAUTH_SERVER_URL: string;
    readonly GOOGLE_OAUTH_REDIRECT_URL: string;
  }
}
