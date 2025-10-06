import type { BrokerClient, RoomEvent, RoomID, UserID } from '@repo/typesystem';
import { z } from 'zod/v4';

export class RoomEventManager {
  #client: BrokerClient;

  constructor(client: BrokerClient) {
    this.#client = client;
  }

  async roomCreated(roomId: RoomID) {
    const { response } = await this.#request({
      type: 'room:created',
      payload: {
        roomId,
      },
    });
    return z.object({ success: z.boolean() }).parse(response);
  }

  roomDisposed(roomId: RoomID) {
    this.#publish({
      type: 'room:disposed',
      payload: {
        roomId,
      },
    });
  }

  userConnected(userId: UserID, roomId: RoomID) {
    this.#publish({
      type: 'user:connected',
      payload: {
        userId,
        roomId,
      },
    });
  }

  userDisconnected(userId: UserID, roomId: RoomID) {
    this.#publish({
      type: 'user:disconnected',
      payload: {
        userId,
        roomId,
      },
    });
  }

  dispose() {
    return this.#client.dispose();
  }

  #publish(event: RoomEvent) {
    return this.#client.publish(event);
  }

  #request(event: RoomEvent) {
    return this.#client.request(event);
  }
}
