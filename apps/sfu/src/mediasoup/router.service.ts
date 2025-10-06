import { Injectable } from '@nestjs/common';
import { ConsumerID, ProducerID, RouterID, TransportID } from '@repo/typesystem';
import {
  Consumer,
  DtlsParameters,
  MediaKind,
  Producer,
  Router,
  RtpCapabilities,
  RtpParameters,
  Transport,
  WebRtcTransportOptions,
} from 'mediasoup/types';
import { env } from 'src/env';
import { WorkerService } from './worker.service';

@Injectable()
export class RouterService {
  readonly #routers = new Map<RouterID, Router>();
  readonly #consumers = new Map<ConsumerID, Consumer>();
  readonly #producers = new Map<ProducerID, Producer>();
  readonly #transports = new Map<TransportID, Transport>();
  readonly #webRtcTransportOptions: WebRtcTransportOptions = {
    listenIps: [{ ip: '0.0.0.0', announcedIp: env.MEDIASOUP_ANNOUNCED_IP }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  };

  #rtpCapabilities?: RtpCapabilities;

  constructor(private readonly workerService: WorkerService) {}

  async createRouter() {
    const worker = this.workerService.getWorker();
    const router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000,
          },
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000,
          },
        },
      ],
    });
    this.#routers.set(router.id, router);
    if (!this.#rtpCapabilities) this.#rtpCapabilities = router.rtpCapabilities;
    return router;
  }

  disposeRouter(routerId: RouterID) {
    const router = this.#routers.get(routerId);
    if (!router) return;
    router.close();
    this.#routers.delete(routerId);
  }

  disposeConsumer(consumerId: ConsumerID) {
    const consumer = this.#consumers.get(consumerId);
    if (!consumer) return;
    consumer.close();
    this.#consumers.delete(consumerId);
  }

  disposeProducer(producerId: ProducerID) {
    const producer = this.#producers.get(producerId);
    if (!producer) return;
    producer.close();
    this.#producers.delete(producerId);
  }

  disposeTransport(transportId: TransportID) {
    const transport = this.#transports.get(transportId);
    if (!transport) return;
    transport.close();
    this.#transports.delete(transportId);
  }

  getRtpCapabilities() {
    if (!this.#rtpCapabilities) throw new Error('RTP capabilities not initialized');
    return this.#rtpCapabilities;
  }

  async createWebRtcTransport(routerId: RouterID) {
    const router = this.#routers.get(routerId);
    if (!router) throw new Error(`Router ${routerId} not found`);
    const transport = await router.createWebRtcTransport(this.#webRtcTransportOptions);
    transport.on('dtlsstatechange', (state) => state === 'closed' && transport.close());
    transport.on('routerclose', () => this.#transports.delete(transport.id));
    transport.on('@close', () => this.#transports.delete(transport.id));
    this.#transports.set(transport.id, transport);
    return transport;
  }

  async connectWebRtcTransport(transportId: TransportID, dtlsParameters: DtlsParameters) {
    const transport = this.#transports.get(transportId);
    if (!transport) throw new Error(`Transport with ID ${transportId} not found`);
    await transport.connect({ dtlsParameters });
  }

  async produceWebRtcTransport(
    transportId: TransportID,
    kind: MediaKind,
    rtpParameters: RtpParameters
  ) {
    const transport = this.#transports.get(transportId);
    if (!transport) throw new Error(`Transport with ID ${transportId} not found`);
    const producer = await transport.produce({ kind, rtpParameters });
    this.#producers.set(producer.id, producer);
    producer.on('transportclose', () => producer.close());
    return producer.id;
  }

  async consume(
    routerId: RouterID,
    producerId: ProducerID,
    userRecvTransportId: TransportID,
    rtpCapabilities: RtpCapabilities
  ) {
    const transport = this.#transports.get(userRecvTransportId);
    if (!transport) throw new Error(`Transport with ID ${userRecvTransportId} not found`);
    const router = this.#routers.get(routerId);
    if (!router) throw new Error(`Router with ID ${routerId} not found`);
    if (!router.canConsume({ producerId, rtpCapabilities }))
      throw new Error(`Router ${routerId} cannot consume producer ${producerId}`);
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true,
    });
    consumer.on('transportclose', () => consumer.close());
    consumer.on('producerclose', () => consumer.close());
    this.#consumers.set(consumer.id, consumer);
    return {
      kind: consumer.kind,
      consumerId: consumer.id,
      producerId: consumer.producerId,
      rtpParameters: consumer.rtpParameters,
    };
  }

  async consumeResume(consumerId: string) {
    const consumer = this.#consumers.get(consumerId);
    if (!consumer) throw new Error(`Consumer with ID ${consumerId} not found`);
    await consumer.resume();
    await consumer.requestKeyFrame();
  }

  async pauseProducer(producerId: ProducerID) {
    const producer = this.#producers.get(producerId);
    if (!producer) throw new Error(`Producer with ID ${producerId} not found`);
    await producer.pause();
  }

  async resumeProducer(producerId: ProducerID) {
    const producer = this.#producers.get(producerId);
    if (!producer) throw new Error(`Producer with ID ${producerId} not found`);
    await producer.resume();
  }
}
