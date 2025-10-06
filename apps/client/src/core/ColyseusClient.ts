import type { Schema } from '@colyseus/schema';
import { Client, ErrorCode, MatchMakeError, type Room } from 'colyseus.js';
import { httpClient } from '~/core/HttpClient';
import { env } from '~/env/client';

interface HTTPClient {
  refreshTokens(): Promise<boolean>;
}

class ColyseusClient {
  #client: Client;
  #httpClient: HTTPClient;

  constructor(serverUrl: string, httpClient: HTTPClient) {
    this.#client = new Client(serverUrl);
    this.#httpClient = httpClient;
  }

  async createRoom<RoomSchema extends Schema, Options>(roomName: string, options: Options) {
    try {
      return await this.#createRoom<RoomSchema, Options>(roomName, options);
    } catch (error: unknown) {
      return this.#catchError<Room<RoomSchema>>(error, () => this.#createRoom(roomName, options));
    }
  }

  async joinRoom<RoomSchema extends Schema, Options>(roomId: string, options: Options) {
    try {
      return await this.#joinRoom<RoomSchema, Options>(roomId, options);
    } catch (error: unknown) {
      return this.#catchError<Room<RoomSchema>>(error, () => this.#joinRoom(roomId, options));
    }
  }

  #createRoom<T, U>(roomName: string, options: U) {
    return this.#client.create<T>(roomName, options);
  }

  #joinRoom<T, U>(roomId: string, options: U) {
    return this.#client.joinById<T>(roomId, options);
  }

  async #catchError<T>(error: unknown, next: () => Promise<T>) {
    if (error instanceof MatchMakeError && error.code === ErrorCode.AUTH_FAILED) {
      const areTokensRefreshed = await this.#httpClient.refreshTokens();
      if (areTokensRefreshed) {
        return await next();
      }
      throw error;
    }
    throw error;
  }
}

export const colyseusClient = new ColyseusClient(env.VITE_CORE_URL, httpClient);
