import type { FetchEvent } from '@solidjs/start/server';

export const requestLogger = {
  onRequest(event: FetchEvent) {
    console.log(`\nRequest received at ${new Date().toLocaleString()}`);
    console.log(`  > URL: ${event.request.method} ${event.request.url}`);
    event.locals.startTime = Date.now();
  },
  onBeforeResponse(event: FetchEvent) {
    console.log(`  < Responded in ${Date.now() - event.locals.startTime}ms`);
  },
};
