import type { UserData } from '@repo/typesystem';

declare namespace NodeJS {
  interface ProcessEnv {
    readonly ACCESS_TOKEN_SECRET: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      userData: UserData;
    }
  }
}
