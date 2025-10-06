import { TV_ARCH_RADIUS, TV_HEIGHT, TV_WIDTH, VIDEO_ROOM_MAX_USER_COUNT } from '@repo/constants';
import roomModelUrl from '@repo/glb-parser/dist/room.visual.glb?url';
import type { UserID, Vec3 } from '@repo/typesystem';
import {
  AudioListener,
  Clock,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three-stdlib';
import { Disposable } from '../../Disposable';
import { Screen } from '../entities/Screen';
import { User } from '../entities/User';

export class RoomScene extends Disposable {
  readonly #readyPromise: Promise<void>;
  readonly #container!: HTMLDivElement;
  readonly #renderer!: WebGLRenderer;
  readonly #scene!: Scene;
  readonly #camera!: PerspectiveCamera;
  readonly #clock!: Clock;
  readonly #audioListener!: AudioListener;
  readonly #screens: Array<Screen> = [];
  readonly #users: Map<UserID, User> = new Map();
  readonly #userModels: User[] = [];

  #audioContextReadyPromise!: Promise<void>;

  constructor(container: HTMLDivElement) {
    super();
    this.#container = container;
    this.#clock = new Clock();
    this.#scene = new Scene();
    this.#audioListener = this.#setupAudioListener();
    this.#camera = this.#setupCamera();
    this.#camera.add(this.#audioListener);
    this.#renderer = this.#setupRenderer();
    this.#createScreens();
    this.#setupLight();
    this.#setupResizeHandler();
    this.#prepareUserModels();
    this.#readyPromise = this.#loadRoomModel().then(this.#warmup.bind(this));
  }

  dispose() {
    super.dispose();
    this.#screens.forEach((screen) => screen.dispose());
    this.#users.forEach((user) => user.dispose());
  }

  ready() {
    return this.#readyPromise;
  }

  updateCameraPosition(position: Vec3) {
    this.#camera.position.set(position.x, position.y, position.z);
  }

  updateCameraRotation(yaw: number, pitch: number) {
    this.#camera.rotation.order = 'YXZ';
    this.#camera.rotation.y = yaw;
    this.#camera.rotation.x = pitch;
  }

  step() {
    this.#users.forEach((user) => user.step(this.#clock.getElapsedTime()));
    this.#screens.forEach((screen) => screen.step());
    this.#renderer.render(this.#scene, this.#camera);
  }

  addUserModel(
    userId: UserID,
    userName: string,
    userColor: number,
    position: Vec3,
    yaw: number,
    pitch: number,
    screenSlot: number,
    isFirstPersonView: boolean
  ) {
    const user = this.#userModels.pop()!;
    user.setId(userId);
    user.setName(userName);
    user.setColor(userColor);
    user.setScreenSlot(screenSlot);
    user.setPosition(position);
    user.setIsFirstPersonView(isFirstPersonView);
    user.setRotation({ x: yaw, y: pitch, z: 0 });
    user.show();
    this.#users.set(userId, user);
  }

  deleteUserModel(userId: UserID) {
    const user = this.#users.get(userId);
    if (user) {
      user.hide();
      user.free();
      this.deleteUserVideoStream(userId);
      this.#users.delete(userId);
      this.#userModels.push(user);
    }
  }

  updateUserModelPosition(userId: string, position: Vec3, yaw: number, pitch: number) {
    const user = this.#users.get(userId);
    if (user) {
      user.setPosition(position);
      user.setRotation({ x: pitch, y: yaw, z: 0 });
    }
  }

  setUserVideoStream(userId: UserID, track: MediaStreamTrack) {
    const user = this.#users.get(userId);
    if (user) {
      this.#screens[user.screenSlot].setVideoStream(track);
    }
  }

  deleteUserVideoStream(userId: UserID) {
    const user = this.#users.get(userId);
    if (user) {
      this.#screens[user.screenSlot].deleteVideoStream();
    }
  }

  async setUserAudioStream(userId: UserID, track: MediaStreamTrack) {
    await this.#audioContextReadyPromise;
    this.#users.get(userId)?.setAudioStream(track, this.#audioListener);
  }

  deleteUserAudioStream(userId: UserID) {
    this.#users.get(userId)?.deleteAudioStream();
  }

  #prepareUserModels() {
    for (let i = 0; i < VIDEO_ROOM_MAX_USER_COUNT; i++) {
      const user = new User();
      this.#userModels.push(user);
      user.addToScene(this.#scene);
    }
  }

  #warmup() {
    // We must make sure all user models are rendered at least once to initialize
    // their materials. So when they are shown later for real users (i.g. when a
    // user joins the room), there is no lag
    const warmupCamera = this.#camera.clone();
    warmupCamera.position.set(0, 1.6, 6);
    warmupCamera.lookAt(0, 1.6, 0);
    this.#userModels.forEach((user, i) => {
      user.setPosition({ x: i * 0.6 - 1.5, y: 1.6, z: 0 });
      user.show();
    });
    this.#renderer.render(this.#scene, warmupCamera);
    this.#userModels.forEach((user) => user.hide());
    warmupCamera.removeFromParent();
  }

  #setupRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(this.#container.clientWidth, this.#container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    this.#container.appendChild(renderer.domElement);
    return renderer;
  }

  #setupCamera() {
    const aspectRatio = this.#container.clientWidth / this.#container.clientHeight;
    const camera = new PerspectiveCamera(55, aspectRatio, 0.1, 1000);
    camera.position.set(0, 0, 0);
    return camera;
  }

  #setupAudioListener() {
    const audioListener = new AudioListener();
    this.#audioContextReadyPromise =
      audioListener.context.state === 'running'
        ? Promise.resolve()
        : new Promise((resolve) => {
            const resumeAudioContext = () => {
              audioListener.context.resume().then(resolve);
            };
            window.addEventListener('pointerdown', resumeAudioContext, { once: true });
            this.addDisposer(() => window.removeEventListener('pointerdown', resumeAudioContext));
          });
    return audioListener;
  }

  #setupLight() {
    const pointLight = new PointLight(0xffffff, 100, 400);
    pointLight.position.set(20, 10, 20);
    pointLight.castShadow = true;
    this.#scene.add(pointLight);
  }

  #loadRoomModel() {
    return new Promise<void>((resolve) => {
      new GLTFLoader().load(roomModelUrl, (gltf) => {
        this.#scene.add(gltf.scene);
        resolve();
      });
    });
  }

  #setupResizeHandler() {
    const handleResize = () => {
      this.#camera.aspect = this.#container.clientWidth / this.#container.clientHeight;
      this.#camera.updateProjectionMatrix();
      this.#renderer.setSize(this.#container.clientWidth, this.#container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    this.addDisposer(() => {
      window.removeEventListener('resize', handleResize);
      this.#renderer.dispose();
    });
  }

  #createScreens() {
    for (let i = 0; i < VIDEO_ROOM_MAX_USER_COUNT; i++) {
      const screen = new Screen();
      const { position, rotation } = this.#calculateScreenPosition(i);
      screen.setPosition(position);
      screen.setRotation(rotation);
      screen.addToScene(this.#scene);
      this.#screens.push(screen);
    }
  }

  // TODO: move to a shared utility, and use in CollisionManager also
  #calculateScreenPosition(screenIndex: number) {
    const angleStep = 2 * Math.asin(TV_WIDTH / (2 * TV_ARCH_RADIUS));
    const startAngle = -Math.PI / 2 - (angleStep * (VIDEO_ROOM_MAX_USER_COUNT - 1)) / 2;
    const angle = startAngle + screenIndex * angleStep;
    const position = {
      x: Math.cos(angle) * TV_ARCH_RADIUS,
      y: TV_HEIGHT / 2,
      z: Math.sin(angle) * TV_ARCH_RADIUS,
    };
    const rotation = {
      x: 0,
      y: -angle - Math.PI / 2,
      z: 0,
    };
    return { position, rotation };
  }
}
