import { TV_HEIGHT, USER_FLOATING_HEIGHT, USER_RADIUS } from '@repo/constants';
import {
  Clock,
  Color,
  FrontSide,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three-stdlib';
import { Disposable } from '../../Disposable';
import { Screen } from '../entities/Screen';
import { User } from '../entities/User';

export class PreviewScene extends Disposable {
  readonly #container: HTMLDivElement;
  readonly #scene: Scene;
  readonly #camera: PerspectiveCamera;
  readonly #renderer: WebGLRenderer;
  readonly #controls: OrbitControls;
  readonly #clock!: Clock;
  readonly #user: User;
  readonly #screen: Screen;
  readonly #userYPosition = USER_FLOATING_HEIGHT + USER_RADIUS;

  constructor(container: HTMLDivElement) {
    super();
    this.#container = container;
    this.#clock = new Clock();
    this.#scene = new Scene();
    this.#camera = this.#createCamera();
    this.#renderer = this.#createRenderer();
    this.#controls = this.#createControls();
    this.#user = this.#createUser();
    this.#screen = this.#createScreen();
    this.#renderScene();
    this.#renderUser();
    this.#setupResizeHandler();
    this.#renderer.compile(this.#scene, this.#camera);
  }

  get #aspectRatio() {
    return this.#container.clientWidth / this.#container.clientHeight;
  }

  dispose() {
    super.dispose();
    this.#renderer.dispose();
    this.#screen.dispose();
    this.#user.dispose();
    this.#scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        const material = child.material;
        Array.isArray(material) ? material.forEach((m) => m.dispose()) : material.dispose();
      }
    });
    this.#controls.dispose();
    this.#clock.stop();
  }

  step() {
    const elapsedTime = this.#clock.getElapsedTime();
    this.#user.step(elapsedTime);
    this.#stepUserBounce(elapsedTime);
    this.#screen.step();
    this.#controls.update();
    this.#renderer.render(this.#scene, this.#camera);
  }

  setUserColor(color: number) {
    this.#user.setColor(color);
  }

  setVideoStream(track: MediaStreamTrack) {
    this.#screen.setVideoStream(track);
  }

  deleteVideoStream() {
    this.#screen.deleteVideoStream();
  }

  setAudioStream(track: MediaStreamTrack) {
    this.#user.setAudioStream(track);
  }

  deleteAudioStream() {
    this.#user.deleteAudioStream();
  }

  #createCamera() {
    const camera = new PerspectiveCamera(45, this.#aspectRatio, 0.1, 1000);
    const initialPosition = { x: 0, y: this.#userYPosition, z: 10 };
    camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
    camera.lookAt(0, this.#userYPosition, 0);
    return camera;
  }

  #createRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.#container.clientWidth, this.#container.clientHeight);
    renderer.shadowMap.enabled = true;
    this.#container.appendChild(renderer.domElement);
    return renderer;
  }

  #createControls() {
    const controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    controls.target.set(0, this.#userYPosition, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minAzimuthAngle = -Math.PI / 2;
    controls.maxAzimuthAngle = Math.PI / 2;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 30;
    return controls;
  }

  #createUser() {
    const user = new User();
    user.show();
    return user;
  }

  #createScreen() {
    const screen = new Screen();
    screen.setPosition({ x: 0, y: TV_HEIGHT / 2, z: -18 });
    screen.setRotation({ x: 0, y: 0, z: 0 });
    screen.addToScene(this.#scene);
    return screen;
  }

  #renderScene() {
    this.#renderFloor();
    this.#renderLight();
  }

  #renderFloor() {
    const floorGeometry = new PlaneGeometry(200, 200);
    const floorMaterial = new MeshPhysicalMaterial({
      color: new Color(0x860a30),
      roughness: 0.6,
      metalness: 1.0,
      side: FrontSide,
    });
    const floorMesh = new Mesh(floorGeometry, floorMaterial);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, 0, 0);
    this.#scene.add(floorMesh);
  }

  #renderLight() {
    const light = new PointLight(0xffffff, 100);
    light.position.set(10, 10, 0);
    light.lookAt(0, 0, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 50;
    this.#scene.add(light);
  }

  #renderUser() {
    this.#user.setPosition({ x: 0, y: this.#userYPosition, z: 0 });
    this.#user.addToScene(this.#scene);
  }

  #stepUserBounce(elapsedTime: number) {
    this.#user.setPosition({
      x: 0,
      y: this.#userYPosition + Math.sin(elapsedTime) * 0.1,
      z: 0,
    });
  }

  #setupResizeHandler() {
    const handleResize = () => {
      this.#camera.aspect = this.#aspectRatio;
      this.#camera.updateProjectionMatrix();
      this.#renderer.setSize(this.#container.clientWidth, this.#container.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    this.addDisposer(() => {
      window.removeEventListener('resize', handleResize);
    });
  }
}
