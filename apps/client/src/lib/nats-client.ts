import { NatsClient } from '@repo/nats-client';
import { env } from '~/env/server';

export const natsClient = new NatsClient([env.NATS_URL]);
