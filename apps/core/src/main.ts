import 'dotenv/config';

import { createServer } from 'node:http';
import { ACCESS_TOKEN_COOKIE_NAME, VIDEO_ROOM_NAME } from '@repo/constants';
import { Server } from 'colyseus';
import cookieParser from 'cookie-parser';
import express from 'express';
import { env, isDevelopment } from './env';
import { verifyAuthentication } from './lib/auth/verify-authentication';
import { VideoRoom } from './rooms/VideoRoom';

const app = express();

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

const coreServer = new Server({
  server: createServer(app),
});

if (isDevelopment) {
  coreServer.simulateLatency(200);
}

coreServer.define(VIDEO_ROOM_NAME, VideoRoom);
coreServer.listen(env.PORT, env.HOST).catch(console.error);
