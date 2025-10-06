import { CHAT_MESSAGE_NAME, SERVER_TICK_RATE, USER_INPUT_MESSAGE_NAME } from '@repo/constants';
import type { ChatMessage, User, UserData, UserID } from '@repo/typesystem';
import { getStateCallbacks, type Room } from 'colyseus.js';
import type { MediaKind } from 'mediasoup-client/types';
import { env } from '~/env/client';
import type { RoomDevices } from '~/types';
import { DeviceController } from './DeviceController';
import { KeyboardController } from './KeyboardController';
import { MouseController } from './MouseController';
import { RoomScene } from './render/scenes/RoomScene';
import { SignalingClient } from './SignalingClient';
import { SignalingController } from './SignalingController';

type RoomOptions = {
  user: UserData;
  room: Room;
  devices: RoomDevices;
};

type RoomListeners = {
  onRoomDispose: () => void;
  onUserJoin: (user: User) => void;
  onUserLeave: (userId: UserID) => void;
  onChatMessageReceive: (message: ChatMessage) => void;
  onPointerLockToggle: (isVisible: boolean) => void;
  onLocalVideoTrackStart: (track: MediaStreamTrack) => void;
  onLocalVideoTrackStop: () => void;
};

export class VideoRoomController {
  readonly #readyPromise: Promise<void>;
  readonly #room: Room;
  readonly #user: UserData;
  readonly #listeners: RoomListeners;
  readonly #scene: RoomScene;
  readonly #mouseController: MouseController;
  readonly #keyboardController: KeyboardController;
  readonly #deviceController: DeviceController;
  readonly #signalingController: SignalingController;

  #joinTimestamp = 0;
  #graphicsRAFTimer!: number;
  #physicsLoopTimer!: NodeJS.Timeout;

  constructor(container: HTMLDivElement, options: RoomOptions, listeners: RoomListeners) {
    const { user, room, devices } = options;
    this.#user = user;
    this.#room = room;
    this.#listeners = listeners;
    this.#scene = new RoomScene(container);
    this.#keyboardController = new KeyboardController();
    this.#mouseController = new MouseController(container, {
      listeners: { onPointerLockToggle: this.#listeners.onPointerLockToggle },
    });
    this.#deviceController = new DeviceController();
    this.#deviceController.setDevices(devices);
    this.#signalingController = new SignalingController(new SignalingClient(env.VITE_SFU_URL), {
      listeners: {
        onTrackReceive: this.#handleTrackReceive.bind(this),
        onTrackDispose: this.#handleTrackDispose.bind(this),
      },
    });
    this.#setRoomListeners();
    this.#readyPromise = this.#scene.ready().then(() => this.#start());
  }

  get joinTimestamp() {
    return this.#joinTimestamp;
  }

  dispose() {
    cancelAnimationFrame(this.#graphicsRAFTimer);
    clearInterval(this.#physicsLoopTimer);
    this.#room.removeAllListeners();
    this.#room.leave();
    this.#scene.dispose();
    this.#mouseController.dispose();
    this.#keyboardController.dispose();
    this.#deviceController.dispose();
    this.#signalingController.dispose();
  }

  ready() {
    return this.#readyPromise;
  }

  startVideoStream() {
    this.#deviceController.stopVideoTrack();
    return this.#deviceController.startVideoTrack().then((track) => {
      if (!track) return;
      this.#listeners.onLocalVideoTrackStart(track);
      this.#scene.setUserVideoStream(this.#user.id, track);
      this.#signalingController.produce(track);
      return track;
    });
  }

  stopVideoStream() {
    this.#listeners.onLocalVideoTrackStop();
    this.#deviceController.stopVideoTrack();
    this.#signalingController.pauseProducer('video');
  }

  startAudioStream() {
    this.#deviceController.stopAudioTrack();
    return this.#deviceController.startAudioTrack().then((track) => {
      if (!track) return;
      this.#signalingController.produce(track);
      return track;
    });
  }

  stopAudioStream() {
    this.#deviceController.stopAudioTrack();
    this.#signalingController.pauseProducer('audio');
  }

  disposeKeyboardListeners() {
    this.#keyboardController.dispose();
  }

  setupKeyboardListeners() {
    this.#keyboardController.setupKeyboardListeners();
  }

  requestPointerLock() {
    this.#mouseController.requestPointerLock();
  }

  sendChatMessage(message: string) {
    this.#room.send(CHAT_MESSAGE_NAME, { message });
  }

  #start() {
    this.#startLoop();
    return this.#signalingController.connect();
  }

  #startLoop() {
    this.#startGraphicsLoop();
    this.#startPhysicsLoop();
  }

  #setRoomListeners() {
    this.#room.onError(() => {
      this.#listeners.onRoomDispose();
    });

    this.#room.onLeave(() => {
      this.#listeners.onRoomDispose();
    });

    this.#room.onMessage<ChatMessage>(CHAT_MESSAGE_NAME, (message) => {
      this.#listeners.onChatMessageReceive(message);
    });

    let isAnyoneJoined = false;
    const $ = getStateCallbacks(this.#room);

    $(this.#room.state).users.onAdd((user, userId) => {
      const isCurrentUser = this.#isCurrentUser(userId);
      const isFirstPersonView = !!isCurrentUser;

      if (!isAnyoneJoined) {
        this.#joinTimestamp = Date.now();
        isAnyoneJoined = true;
      }

      this.#listeners.onUserJoin({
        id: userId,
        name: user.name,
        email: user.email,
        color: user.color,
        avatarUrl: user.avatarUrl,
      });

      this.#scene.addUserModel(
        userId,
        user.name,
        user.color,
        user.position,
        user.yaw,
        user.pitch,
        user.screenSlot,
        isFirstPersonView
      );

      $(user).onChange(() => {
        if (!this.#isCurrentUser(userId)) {
          this.#scene.updateUserModelPosition(userId, user.position, user.yaw, user.pitch);
        }
      });

      $(user.position).onChange(() => {
        if (this.#isCurrentUser(userId)) this.#scene.updateCameraPosition(user.position);
        this.#scene.updateUserModelPosition(userId, user.position, user.yaw, user.pitch);
      });
    });

    $(this.#room.state).users.onRemove((_, userId) => {
      if (this.#isCurrentUser(userId)) this.#scene.deleteUserVideoStream(userId);
      this.#listeners.onUserLeave(userId);
      this.#scene.deleteUserModel(userId);
    });
  }

  #startGraphicsLoop() {
    const loop = () => {
      this.#graphicsRAFTimer = requestAnimationFrame(loop);
      this.#graphicsStep();
    };
    loop();
  }

  #startPhysicsLoop() {
    this.#physicsLoopTimer = setInterval(this.#physicsStep.bind(this), 1000 / SERVER_TICK_RATE);
  }

  #graphicsStep() {
    const mouseInput = this.#mouseController.getCurrentInput();
    this.#scene.updateCameraRotation(mouseInput.yaw, mouseInput.pitch);
    this.#scene.step();
  }

  #physicsStep() {
    const isActionUpdated = this.#keyboardController.hasFreshInput();
    const isLookUpdated = this.#mouseController.hasFreshInput();
    if (isLookUpdated || isActionUpdated) {
      const look = isLookUpdated
        ? this.#mouseController.flushCurrentInput()
        : this.#mouseController.getCurrentInput();
      const userInput = {
        action: isActionUpdated
          ? this.#keyboardController.flushCurrentInput()
          : this.#keyboardController.getCurrentInput(),
        ...look,
      };
      this.#room.send(USER_INPUT_MESSAGE_NAME, userInput);
    }
  }

  #handleTrackReceive(userId: UserID, track: MediaStreamTrack) {
    const isVideoTrack = track.kind === 'video';
    isVideoTrack
      ? this.#scene.setUserVideoStream(userId, track)
      : this.#scene.setUserAudioStream(userId, track);
  }

  #handleTrackDispose(userId: UserID, kind: MediaKind) {
    const isVideoTrack = kind === 'video';
    isVideoTrack
      ? this.#scene.deleteUserVideoStream(userId)
      : this.#scene.deleteUserAudioStream(userId);
  }

  #isCurrentUser(userId: UserID) {
    return userId === this.#user.id;
  }
}
