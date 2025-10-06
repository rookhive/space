import { TV_HEIGHT, TV_THICKNESS, TV_WIDTH } from '@repo/constants';
import type { Vec3 } from '@repo/typesystem';
import {
  BoxGeometry,
  Color,
  Group,
  LinearFilter,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RectAreaLight,
  RGBAFormat,
  type Scene,
  VideoTexture,
} from 'three';
import { RectAreaLightUniformsLib } from 'three-stdlib';

RectAreaLightUniformsLib.init();

export class Screen {
  #isOn = false;
  #mesh: Group;

  #screenLight!: RectAreaLight;
  #screenScaleY = 0.0;
  #screenIntensity = 0.0;

  #videoScreenMesh!: Mesh;
  #videoTexture!: VideoTexture;
  #videoNode!: HTMLVideoElement;
  #videoContext: CanvasRenderingContext2D;

  constructor() {
    this.#mesh = new Group();
    this.#videoContext = this.#createVideoContext();
    this.#createVideoNode();
    this.#createVideoTexture();
    this.#createScreen();
    this.#createScreenVideo();
    this.#createScreenLight();
  }

  get isOn() {
    return this.#isOn;
  }

  dispose() {
    // TODO: move mesh disposing to a shared helper
    this.#mesh.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        const material = child.material;
        Array.isArray(material) ? material.forEach((m) => m.dispose()) : material.dispose();
      }
    });
    this.#videoNode.remove();
    this.#videoTexture.dispose();
  }

  step() {
    if (this.#videoTexture && this.#videoContext) {
      this.#screenLight.color.lerp(this.#getAverageVideoColor(), 0.1);
    }

    this.#screenLight.intensity = MathUtils.lerp(
      this.#screenLight.intensity,
      this.#screenIntensity,
      0.1
    );

    const currentY = this.#videoScreenMesh.scale.y;
    const nextY = MathUtils.lerp(currentY, this.#screenScaleY, 0.2);
    this.#videoScreenMesh.scale.setY(nextY);
  }

  setVideoStream(track: MediaStreamTrack) {
    this.#isOn = true;
    this.#videoNode.srcObject = new MediaStream([track]);
    this.#videoNode.addEventListener('loadeddata', () => {
      this.#videoNode.play();
      this.#screenIntensity = 2.5;
      this.#screenScaleY = 1.0;
    });
  }

  deleteVideoStream() {
    this.#isOn = false;
    this.#screenIntensity = 0.0;
    this.#screenScaleY = 0.0;
    this.#videoNode.pause();
    this.#videoNode.srcObject = null;
  }

  addToScene(scene: Scene) {
    scene.add(this.#mesh);
  }

  removeFromScene(scene: Scene) {
    scene.remove(this.#mesh);
  }

  setPosition(position: Vec3) {
    this.#mesh.position.set(position.x, position.y, position.z);
  }

  setRotation(rotation: Vec3) {
    this.#mesh.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  #createVideoNode() {
    const videoNode = document.createElement('video');
    videoNode.muted = true;
    videoNode.autoplay = true;
    videoNode.playsInline = true;
    videoNode.style.display = 'none';
    document.body.appendChild(videoNode);
    this.#videoNode = videoNode;
  }

  #createVideoTexture() {
    const videoTexture = new VideoTexture(this.#videoNode);
    videoTexture.minFilter = videoTexture.magFilter = LinearFilter;
    videoTexture.format = RGBAFormat;
    this.#videoTexture = videoTexture;
  }

  #createScreen() {
    const geometry = new BoxGeometry(TV_WIDTH, TV_HEIGHT, TV_THICKNESS);
    const materials = [
      new MeshStandardMaterial({ color: 0x000000, metalness: 0.7 }),
      new MeshStandardMaterial({ color: 0x000000, metalness: 0.7 }),
      new MeshStandardMaterial({ color: 0x000000, metalness: 0.7 }),
      new MeshStandardMaterial({ color: 0x000000, metalness: 0.7 }),
      new MeshStandardMaterial({ color: 0x000000, metalness: 0.0, roughness: 0.5 }),
      new MeshStandardMaterial({ color: 0x000000, metalness: 0.7 }),
    ];
    const screenMesh = new Mesh(geometry, materials);
    screenMesh.castShadow = true;
    screenMesh.receiveShadow = true;
    this.#mesh.add(screenMesh);
  }

  #createScreenVideo() {
    const videoMaterial = new MeshStandardMaterial({
      map: this.#videoTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
      metalness: 0.0,
      roughness: 0.5,
      emissiveMap: this.#videoTexture,
    });
    const videoGeometry = new PlaneGeometry(TV_WIDTH, TV_HEIGHT);
    const videoMesh = new Mesh(videoGeometry, videoMaterial);
    videoMesh.scale.setY(0);
    videoMesh.position.set(0, 0, 0.065);
    this.#videoScreenMesh = videoMesh;
    this.#mesh.add(videoMesh);
  }

  #createScreenLight() {
    const screenLight = new RectAreaLight(0xffffff, 0, TV_WIDTH, TV_HEIGHT);
    screenLight.position.set(0, 0, 0);
    screenLight.lookAt(0, 0, 5);
    this.#screenLight = screenLight;
    this.#mesh.add(screenLight);
  }

  #createVideoContext() {
    const videoCanvas = document.createElement('canvas');
    videoCanvas.width = 64;
    videoCanvas.height = 64;
    return videoCanvas.getContext('2d') as CanvasRenderingContext2D;
  }

  #getAverageVideoColor() {
    this.#videoContext.drawImage(this.#videoTexture.image, 0, 0, 64, 64);
    const { data } = this.#videoContext.getImageData(0, 0, 64, 64);
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const count = data.length / 4;
    return new Color(r / count / 255, g / count / 255, b / count / 255);
  }
}
