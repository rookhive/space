import { type Client, createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import {
  PRODUCER_CREATED_MESSAGE_NAME,
  PRODUCER_PAUSED_MESSAGE_NAME,
  PRODUCER_RESUMED_MESSAGE_NAME,
} from '@repo/constants';
import { SignalingService } from '@repo/proto/generated/signaling_pb';
import type { ProducerID, RoomSignalingEvent, UserID } from '@repo/typesystem';
import { signalingAuthInterceptor } from './auth/signaling-auth-interceptor';

type SignalingListeners = {
  onProducerCreate: (userId: UserID, producerId: ProducerID) => void;
  onProducerPause: (userId: UserID, producerId: ProducerID) => void;
  onProducerResume: (userId: UserID, producerId: ProducerID) => void;
};

export class SignalingClient {
  readonly #api: Client<typeof SignalingService>;
  readonly #sse: EventSource;
  readonly #listeners: Partial<SignalingListeners> = {};

  constructor(serverUrl: string) {
    this.#api = this.#createBufConnectClient(serverUrl);
    this.#sse = this.#createSSEClient(serverUrl);
  }

  get api() {
    return this.#api;
  }

  get sse() {
    return this.#sse;
  }

  dispose() {
    this.#sse.close();
  }

  setEventListeners(listeners: SignalingListeners) {
    Object.assign(this.#listeners, listeners);
  }

  #createBufConnectClient(serverUrl: string) {
    return createClient(
      SignalingService,
      createConnectTransport({
        baseUrl: serverUrl,
        interceptors: [signalingAuthInterceptor()],
        fetch: (input, init = {}) =>
          fetch(input, {
            ...init,
            credentials: 'include',
          }),
      })
    );
  }

  #createSSEClient(serverUrl: string) {
    const eventSource = new EventSource(`${serverUrl}/signaling/events`, {
      withCredentials: true,
    });

    eventSource.addEventListener('message', (event: MessageEvent) => {
      const message = JSON.parse(event.data) as RoomSignalingEvent;
      switch (message.type) {
        case PRODUCER_CREATED_MESSAGE_NAME: {
          const { userId, producerId } = message.data;
          this.#listeners.onProducerCreate?.(userId, producerId);
          break;
        }
        case PRODUCER_PAUSED_MESSAGE_NAME: {
          const { userId, producerId } = message.data;
          this.#listeners.onProducerPause?.(userId, producerId);
          break;
        }
        case PRODUCER_RESUMED_MESSAGE_NAME: {
          const { userId, producerId } = message.data;
          this.#listeners.onProducerResume?.(userId, producerId);
          break;
        }
      }
    });

    return eventSource;
  }
}
