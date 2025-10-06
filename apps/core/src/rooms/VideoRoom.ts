import { type AuthContext, type Client, ErrorCode, Room, ServerError } from '@colyseus/core';
import { User, VideoRoomState } from '@repo/colyseus-schema';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_MESSAGE_NAME,
  REVOKED_SESSION_EVENT_NAME,
  SERVER_TICK_RATE,
  USER_INPUT_MESSAGE_NAME,
  VIDEO_ROOM_MAX_USER_COUNT,
} from '@repo/constants';
import { NatsClient } from '@repo/nats-client';
import physicsModuleLoader, { type RoomPhysics } from '@repo/room-physics';
import type { ChatMessage, RoomJoinOptions, UserData, UserID, UserInput } from '@repo/typesystem';
import { parse as parseCookie } from 'cookie';
import z from 'zod/v4';
import { env } from '../env';
import { verifyAuthentication } from '../lib/auth/verify-authentication';
import { RoomEventManager } from '../lib/room-event-manager';

const userClients = new Map<UserID, Client>();
const natsClient = new NatsClient([env.NATS_URL]);
const roomEventManager = new RoomEventManager(natsClient);

natsClient.subscribe(REVOKED_SESSION_EVENT_NAME, (payload: { userId: UserID }) => {
  try {
    const { userId } = z.object({ userId: z.string() }).parse(payload);
    const client = userClients.get(userId);
    if (client) {
      client.leave();
      userClients.delete(userId);
    }
  } catch {}
});

export class VideoRoom extends Room<VideoRoomState> {
  state = new VideoRoomState();
  patchRate = 1000 / SERVER_TICK_RATE;
  maxClients = VIDEO_ROOM_MAX_USER_COUNT;

  readonly #occupiedScreens = Array.from({ length: VIDEO_ROOM_MAX_USER_COUNT }, () => false);

  #physics!: RoomPhysics;

  static async onAuth(_token: string, _options: unknown, context: AuthContext) {
    try {
      const cookieHeader = context.headers.cookie;
      if (!cookieHeader) throw new ServerError(ErrorCode.AUTH_FAILED, 'MISSING_COOKIE');
      const accessToken = parseCookie(cookieHeader)[ACCESS_TOKEN_COOKIE_NAME];
      if (!accessToken) throw new ServerError(ErrorCode.AUTH_FAILED, 'MISSING_ACCESS_TOKEN');
      const userData = await verifyAuthentication(accessToken);
      if (userClients.has(userData.id))
        throw new ServerError(ErrorCode.MATCHMAKE_INVALID_CRITERIA, 'USER_ALREADY_IN_ROOM');
      return userData;
    } catch (error: unknown) {
      if (error instanceof ServerError) throw error;
      return false;
    }
  }

  async onCreate() {
    const { VideoRoomPhysics } = await physicsModuleLoader();
    this.#physics = new VideoRoomPhysics();
    await roomEventManager.roomCreated(this.roomId);
    this.#addEventListeners();
    this.setSimulationInterval(this.#step.bind(this), this.patchRate);
  }

  onDispose() {
    roomEventManager.roomDisposed(this.roomId);
  }

  onJoin(client: Client, options: RoomJoinOptions) {
    const { id: userId, name, email, avatarUrl } = this.#getUserData(client);
    const user = new User();
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    user.color = options.userColor;
    user.screenSlot = this.#occupyScreenSlot()!;
    this.#physics.addUser(userId);
    const { position, yaw, pitch } = this.#physics.getUser(userId)!.getState();
    user.position.x = position.x;
    user.position.y = position.y;
    user.position.z = position.z;
    user.yaw = yaw;
    user.pitch = pitch;
    this.state.users.set(userId, user);
    userClients.set(userId, client);
    roomEventManager.userConnected(userId, this.roomId);
  }

  onLeave(client: Client) {
    const { id: userId } = this.#getUserData(client);
    userClients.delete(userId);
    const user = this.state.users.get(userId);
    user?.screenSlot && (this.#occupiedScreens[user.screenSlot] = false);
    this.state.users.delete(userId);
    this.#physics.removeUser(userId);
    roomEventManager.userDisconnected(userId, this.roomId);
  }

  #step() {
    this.#physics.step();
    this.#updateState();
  }

  #updateState() {
    for (const userBody of this.#physics.getAllUsers()) {
      const userState = this.state.users.get(userBody.id);
      if (!userState) continue;
      const { position, yaw, pitch } = userBody.getState();
      userState.position.x = position.x;
      userState.position.y = position.y;
      userState.position.z = position.z;
      yaw && (userState.yaw = yaw);
      pitch && (userState.pitch = pitch);
    }
  }

  #addEventListeners() {
    this.onMessage<UserInput>(USER_INPUT_MESSAGE_NAME, (client, userInput) => {
      const { id: userId } = this.#getUserData(client);
      if (!this.state.users.has(userId)) return;
      this.#physics.applyUserInput(userId, userInput);
    });

    this.onMessage<{ message: string }>(CHAT_MESSAGE_NAME, (client, { message }) => {
      const { id: userId } = this.#getUserData(client);
      if (!this.state.users.has(userId)) return;
      this.broadcast(CHAT_MESSAGE_NAME, {
        type: 'user',
        userId,
        message: message.slice(0, CHAT_MESSAGE_MAX_LENGTH),
        timestamp: Date.now(),
      } satisfies ChatMessage);
    });
  }

  #getUserData(client: Client) {
    return client.auth as UserData;
  }

  #occupyScreenSlot() {
    const startingSlotIndex = Math.floor(VIDEO_ROOM_MAX_USER_COUNT / 2);
    for (let i = 0; i < VIDEO_ROOM_MAX_USER_COUNT; i++) {
      const slotOffset = Math.ceil((i - 1) / 2);
      const slotIndex = startingSlotIndex + (i % 2 ? 1 : -1) * slotOffset;
      if (!this.#occupiedScreens[slotIndex]) {
        this.#occupiedScreens[slotIndex] = true;
        return slotIndex;
      }
    }
  }
}
