import 'dotenv/config';

import { ACCESS_TOKEN_COOKIE_NAME, VIDEO_ROOM_NAME } from '@repo/constants';
import { Server, WebSocketTransport } from 'colyseus';
import cookieParser from 'cookie-parser';
import { env, isDevelopment } from './env';
import { verifyAuthentication } from './lib/auth/verify-authentication';
import { VideoRoom } from './rooms/VideoRoom';

const coreServer = new Server({
  transport: new WebSocketTransport(),
  express: (app) => {
    app.use(cookieParser());
    app.use((request, response, next) => {
      (async () => {
        try {
          const accessToken = request.cookies[ACCESS_TOKEN_COOKIE_NAME];
          if (!accessToken) throw Error;
          request.userData = await verifyAuthentication(accessToken);
          next();
        } catch {
          return response.status(401).json({ error: 'Unauthenticated' });
        }
      })();
    });
  },
});

if (isDevelopment) {
  coreServer.simulateLatency(200);
}

coreServer.define(VIDEO_ROOM_NAME, VideoRoom);
coreServer.listen(env.PORT, env.HOST).catch(console.error);
