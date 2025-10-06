import { Code, ConnectError, type Interceptor } from '@connectrpc/connect';
import { httpClient } from '~/core/HttpClient';

export function signalingAuthInterceptor(): Interceptor {
  return (next) => async (request) => {
    try {
      return await next(request);
    } catch (error) {
      if (error instanceof ConnectError) {
        switch (error.code) {
          case Code.Unauthenticated: {
            const areTokensRefreshed = await httpClient.refreshTokens();
            if (areTokensRefreshed) return await next(request);
            break;
          }
        }
      }
      throw new Error('Unknown error occurred');
    }
  };
}
