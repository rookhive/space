import type { BrokerClient, BrokerEvent } from '@repo/typesystem';
import { connect, type NatsConnection, StringCodec } from 'nats';

export class NatsClient implements BrokerClient {
  #connection: Promise<NatsConnection>;

  constructor(servers: string[]) {
    this.#connection = connect({ servers });
  }

  async subscribe(eventType: string, listener: (data: unknown) => void) {
    const subscription = (await this.#connection).subscribe(eventType);
    for await (const message of subscription) {
      listener(this.#decode(message.data));
    }
    return () => {
      subscription.unsubscribe();
    };
  }

  async publish(event: BrokerEvent) {
    return (await this.#connection).publish(event.type, this.#encode(event.payload));
  }

  async request(event: BrokerEvent) {
    const { data } = await (await this.#connection).request(
      event.type,
      this.#encode({
        id: crypto.randomUUID(),
        pattern: event.type,
        data: event.payload,
      }),
      { timeout: 5000 }
    );
    return this.#decode(data);
  }

  async dispose() {
    return (await this.#connection).drain();
  }

  #encode(data: unknown) {
    return StringCodec().encode(JSON.stringify(data));
  }

  #decode(binary: Uint8Array) {
    return JSON.parse(StringCodec().decode(binary));
  }
}
