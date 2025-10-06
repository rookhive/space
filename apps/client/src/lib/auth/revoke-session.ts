import { REVOKED_SESSION_EVENT_NAME } from '@repo/constants';
import type { UserID } from '@repo/typesystem';
import { natsClient } from '../nats-client';
import { redisClient } from '../redis-client';

export async function revokeSession(userId: UserID) {
  'use server';

  await redisClient.del(`session:${userId}`);
  await natsClient.publish({ type: REVOKED_SESSION_EVENT_NAME, payload: { userId } });
}
