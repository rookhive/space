import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SignalingService as SignalingRPCService } from '@repo/proto';
import { AppModule } from './app.module';
import { env } from './env';
import { SignalingService } from './signaling/signaling.service';

async function main() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      queue: 'sfu',
      servers: [env.NATS_URL],
    },
  });

  await app.register(fastifyCookie);

  await app.register(fastifyCors, {
    origin: [env.CLIENT_URL],
    credentials: true,
  });

  await app.register(fastifyConnectPlugin, {
    routes: (router) => {
      const signalingService = app.get(SignalingService);
      // @ts-expect-error: The problem is with google.protobuf.Struct, which is
      // compiled into TypeScript's JsonValue, but in the RtpCapabilities type
      // Record<string, unknown> is expected
      router.service(SignalingRPCService, signalingService);
    },
  });

  await app.startAllMicroservices();
  await app.listen(env.PORT, env.HOST);
}

main();
