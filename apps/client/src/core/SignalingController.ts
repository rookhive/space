import type { ProducerID, UserID } from '@repo/typesystem';
import { Device } from 'mediasoup-client';
import type {
  Consumer,
  DtlsParameters,
  IceCandidate,
  IceParameters,
  MediaKind,
  Producer,
  RtpCapabilities,
  RtpParameters,
  Transport,
} from 'mediasoup-client/types';
import { toPlainObject } from '~/utils/protobuf';
import type { SignalingClient } from './SignalingClient';

type Listeners = {
  onTrackReceive: (userId: UserID, track: MediaStreamTrack) => void;
  onTrackDispose: (userId: UserID, kind: MediaKind) => void;
};

type Options = {
  listeners: Listeners;
};

export class SignalingController {
  readonly #client: SignalingClient;
  readonly #producers = new Map<MediaKind, Producer>();
  readonly #consumers = new Map<ProducerID, Consumer>();

  #device?: Device;
  #sendTransport?: Transport;
  #receiveTransport?: Transport;
  #listeners: Listeners;
  #isDisposed = false;

  constructor(client: SignalingClient, options: Options) {
    this.#client = client;
    this.#listeners = options.listeners;
    this.#client.setEventListeners({
      onProducerCreate: this.#handleProducerCreate.bind(this),
      onProducerPause: this.#handleProducerPause.bind(this),
      onProducerResume: this.#handleProducerResume.bind(this),
    });
  }

  dispose() {
    this.#client.dispose();
    this.#producers.forEach((producer) => producer.close());
    this.#producers.clear();
    this.#sendTransport?.close();
    this.#receiveTransport?.close();
    this.#isDisposed = true;
  }

  async connect() {
    await this.#createDevice((await this.#getRtpCapabilities()) as RtpCapabilities);
    await this.#createTransports();
    await this.#fetchProducers();
  }

  async produce(track: MediaStreamTrack) {
    if (this.#isDisposed || !this.#sendTransport) return;
    const trackKind = track.kind as MediaKind;
    let producer = this.#producers.get(trackKind);
    if (producer) {
      await producer.replaceTrack({ track });
    } else {
      producer = await this.#sendTransport.produce({
        track,
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      });
      producer.on('trackended', () => this.#producers.delete(trackKind));
      producer.on('transportclose', () => this.#producers.delete(trackKind));
      this.#producers.set(trackKind, producer);
    }
    if (producer.paused) {
      await this.#client.api.resumeProducer({ kind: trackKind });
      producer.resume();
    }
  }

  async pauseProducer(kind: MediaKind) {
    const producer = this.#producers.get(kind);
    if (!producer) return;
    producer.pause();
    await this.#client.api.pauseProducer({ kind });
  }

  async resumeProducer(kind: MediaKind) {
    const producer = this.#producers.get(kind);
    if (!producer) return;
    producer.resume();
    await this.#client.api.resumeProducer({ kind });
  }

  async #getRtpCapabilities() {
    return toPlainObject<RtpCapabilities>(await this.#client.api.getRtpCapabilities({}));
  }

  async #createDevice(routerRtpCapabilities: RtpCapabilities) {
    if (this.#isDisposed) return;
    await (this.#device = new Device()).load({ routerRtpCapabilities });
  }

  async #createTransports() {
    if (this.#isDisposed) return;
    [this.#sendTransport, this.#receiveTransport] = await Promise.all([
      this.#createTransport({ isProducer: true }),
      this.#createTransport({ isProducer: false }),
    ]);
  }

  async #createTransport({ isProducer }: { isProducer: boolean }) {
    if (this.#isDisposed || !this.#device) return;
    const transportParams = await this.#client.api.createWebRtcTransport({ isProducer });
    const transport = this.#device[isProducer ? 'createSendTransport' : 'createRecvTransport']({
      id: transportParams.id,
      iceParameters: transportParams.iceParameters as IceParameters,
      iceCandidates: transportParams.iceCandidates as IceCandidate[],
      dtlsParameters: transportParams.dtlsParameters as DtlsParameters,
    });
    transport.on('connect', async ({ dtlsParameters }, onSuccess, onError) => {
      try {
        if (this.#isDisposed) return;
        await this.#client.api.connectWebRtcTransport({
          transportId: transport.id,
          dtlsParameters,
          isProducer,
        });
        onSuccess();
      } catch (error: unknown) {
        onError(error as Error);
      }
    });
    if (isProducer) {
      transport.on('produce', async ({ kind, rtpParameters }, onSuccess, onError) => {
        try {
          if (this.#isDisposed) return;
          const { producerId } = await this.#client.api.produceWebRtcTransport({
            kind,
            // @ts-expect-error: The problem is with google.protobuf.Struct, which is
            // compiled into TypeScript's JsonValue, but in the RtpCapabilities type
            // Record<string, unknown> is expected
            rtpParameters,
          });
          onSuccess({ id: producerId });
        } catch (error: unknown) {
          onError(error as Error);
        }
      });
    }
    return transport;
  }

  async #handleProducerCreate(userId: UserID, producerId: ProducerID) {
    if (this.#isDisposed || !this.#receiveTransport || !this.#device) return;
    const params = await this.#client.api.consume({
      producerId,
      // @ts-expect-error: Same problem with google.protobuf.Struct as in the
      // createTransport method
      rtpCapabilities: this.#device.rtpCapabilities,
    });
    const consumer = await this.#receiveTransport.consume({
      id: params.consumerId,
      producerId: params.producerId,
      kind: params.kind as MediaKind,
      rtpParameters: params.rtpParameters as RtpParameters,
    });
    this.#consumers.set(params.producerId, consumer);
    consumer.on('@close', () => {
      this.#consumers.delete(params.producerId);
      this.#listeners.onTrackDispose(userId, params.kind as MediaKind);
    });
    await this.#client.api.consumeResume({ consumerId: params.consumerId });
    this.#listeners.onTrackReceive(userId, consumer.track);
  }

  async #fetchProducers() {
    if (this.#isDisposed) return;
    const { producers } = await this.#client.api.getProducers({});
    producers.forEach(({ userId, producerId }) => this.#handleProducerCreate(userId, producerId));
  }

  #handleProducerPause(userId: UserID, producerId: ProducerID) {
    const consumer = this.#consumers.get(producerId);
    if (!consumer) return;
    consumer.pause();
    this.#listeners.onTrackDispose(userId, consumer.track.kind as MediaKind);
  }

  #handleProducerResume(userId: UserID, producerId: ProducerID) {
    const consumer = this.#consumers.get(producerId);
    if (!consumer) return;
    consumer.resume();
    this.#listeners.onTrackReceive(userId, consumer.track);
  }
}
