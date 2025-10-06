import {
  createMiddleware,
  type RequestMiddleware,
  type ResponseMiddleware,
} from '@solidjs/start/middleware';
import { isDevelopment } from '~/env/server';
import { requestLogger } from './request-logger';

const onRequest: RequestMiddleware[] = [];
const onBeforeResponse: ResponseMiddleware[] = [];

if (isDevelopment) {
  onRequest.push(requestLogger.onRequest);
  onBeforeResponse.push(requestLogger.onBeforeResponse);
}

export default createMiddleware({
  onRequest,
  onBeforeResponse,
});
