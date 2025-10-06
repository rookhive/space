import type { UserID, Vec3 } from '@repo/typesystem';
import {
  type AudioListener,
  Color,
  Group,
  IcosahedronGeometry,
  type IUniform,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  PointLight,
  PositionalAudio,
  type Scene,
  ShaderMaterial,
} from 'three';
import goglyaFragmentShader from '../shaders/goglya.fragment.glsl?raw';
import goglyaVertexShader from '../shaders/goglya.vertex.glsl?raw';

type Props = {
  id?: UserID;
  name?: string;
  color?: number;
  isFirstPersonView?: boolean;
};

export class User {
  static readonly #LIGHT_INTENSITY = 10;
  static readonly #HIDDEN_POSITION: Vec3 = { x: 0, y: -1000, z: 0 };

  readonly #mesh: Group;
  readonly #goglyaUniforms: Record<string, IUniform> = {
    u_time: { value: 0.0 },
    u_frequency: { value: 0.0 },
    u_color: { value: new Color(0x860a30) },
  };

  #id!: UserID;
  #name!: string;
  #screenSlot!: number;
  #audio?: PositionalAudio;
  #audioNode!: HTMLAudioElement;
  #audioAnalyser?: AnalyserNode;
  #voiceFrequencyData?: Uint8Array<ArrayBuffer>;
  #goglyaMesh?: Mesh;
  #glassMesh?: Mesh;
  #light?: PointLight;
  #isFirstPersonView = false;

  constructor(props?: Props) {
    const { id, name, color, isFirstPersonView } = props || {};
    this.#mesh = this.#createUserMesh();
    this.setId(id || '');
    this.setName(name || '');
    this.setColor(color || 0xffffff);
    this.setIsFirstPersonView(isFirstPersonView || false);
    this.#createAudioNode();
    this.hide();
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get screenSlot() {
    return this.#screenSlot;
  }

  dispose() {
    this.#mesh.traverse((child) => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        const material = child.material;
        Array.isArray(material) ? material.forEach((m) => m.dispose()) : material.dispose();
      }
    });
    this.#audioNode?.remove();
    this.free();
  }

  free() {
    this.#audioAnalyser?.disconnect();
  }

  step(elapsedTime: number) {
    this.#goglyaUniforms.u_time.value = elapsedTime;
    if (!this.#audioAnalyser || !this.#voiceFrequencyData) return;
    this.#audioAnalyser.getByteFrequencyData(this.#voiceFrequencyData);
    const averageFrequency =
      this.#voiceFrequencyData.reduce((a, b) => a + b) / this.#voiceFrequencyData.length;
    const normalizedFrequency = averageFrequency / 255;
    const intensifiedFrequency = normalizedFrequency * 3;
    const frequency = Math.max(0.1, Math.min(intensifiedFrequency, 1.0));
    this.#goglyaUniforms.u_frequency.value = MathUtils.lerp(
      this.#goglyaUniforms.u_frequency.value,
      frequency,
      0.1
    );
  }

  show() {
    if (this.#light) this.#light.intensity = User.#LIGHT_INTENSITY;
    this.#syncMeshVisibility();
  }

  hide() {
    if (this.#light) this.#light.intensity = 0;
    this.#syncMeshVisibility();
    this.#mesh.position.set(
      User.#HIDDEN_POSITION.x,
      User.#HIDDEN_POSITION.y,
      User.#HIDDEN_POSITION.z
    );
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

  setScreenSlot(screenSlot: number) {
    this.#screenSlot = screenSlot;
  }

  setAudioStream(track: MediaStreamTrack, audioListener?: AudioListener) {
    this.deleteAudioStream();
    audioListener
      ? this.#startPositionalAudioStream(track, audioListener)
      : this.#startAudioStream(track);
  }

  #startAudioStream(track: MediaStreamTrack) {
    const stream = new MediaStream([track]);
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    audioContext.resume();
    this.#audioAnalyser = analyser;
    this.#voiceFrequencyData = new Uint8Array(this.#audioAnalyser.frequencyBinCount);
  }

  #startPositionalAudioStream(track: MediaStreamTrack, audioListener: AudioListener) {
    const stream = new MediaStream([track]);
    this.#audioNode.srcObject = stream;
    this.#audioNode.play().catch(console.error);
    const audio = new PositionalAudio(audioListener);
    audio.setMediaStreamSource(stream);
    const analyser = audio.context.createAnalyser();
    analyser.fftSize = 256;
    audio.getOutput().connect(analyser);
    audio.setRefDistance(4);
    audio.setVolume(1);
    this.#audio = audio;
    this.#audioAnalyser = analyser;
    this.#voiceFrequencyData = new Uint8Array(this.#audioAnalyser.frequencyBinCount);
    this.#mesh.add(audio);
  }

  deleteAudioStream() {
    if (this.#audioAnalyser) {
      this.#audioAnalyser.disconnect();
      this.#audioAnalyser = undefined;
    }
    if (this.#audio) {
      this.#mesh.remove(this.#audio);
    }
    this.#audioNode.pause();
    this.#audioNode.srcObject = null;
    this.#resetUniforms();
  }

  setId(id: UserID) {
    this.#id = id;
  }

  setName(name: string) {
    this.#name = name;
  }

  setColor(color: number) {
    this.#goglyaUniforms.u_color.value = new Color(color);
  }

  setIsFirstPersonView(isFirstPersonView: boolean) {
    this.#isFirstPersonView = isFirstPersonView;
    this.#syncMeshVisibility();
  }

  #syncMeshVisibility() {
    const isActive = this.#light ? this.#light.intensity > 0 : true;
    const isVisible = isActive && !this.#isFirstPersonView;
    if (this.#goglyaMesh) this.#goglyaMesh.visible = isVisible;
    if (this.#glassMesh) this.#glassMesh.visible = isVisible;
  }

  #createAudioNode() {
    const node = document.createElement('audio');
    node.muted = true;
    node.autoplay = true;
    this.#audioNode = node;
  }

  #resetUniforms() {
    this.#goglyaUniforms.u_time.value = 0.0;
    this.#goglyaUniforms.u_frequency.value = 0.0;
  }

  #createUserMesh() {
    const group = new Group();

    const goglyaGeometry = new IcosahedronGeometry(0.25, 18);
    const goglyaMaterial = new ShaderMaterial({
      uniforms: this.#goglyaUniforms,
      vertexShader: goglyaVertexShader,
      fragmentShader: goglyaFragmentShader,
    });
    this.#goglyaMesh = new Mesh(goglyaGeometry, goglyaMaterial);
    group.add(this.#goglyaMesh);

    const outerGeometry = new IcosahedronGeometry(1, 20);
    const outerMaterial = new MeshPhysicalMaterial({
      transmission: 0.75,
      thickness: 0.6,
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.0,
      ior: 1.33,
      iridescence: 0.2,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.0,
    });
    this.#glassMesh = new Mesh(outerGeometry, outerMaterial);
    group.add(this.#glassMesh);

    const pointLight = new PointLight(0xffffff, User.#LIGHT_INTENSITY, 400);
    pointLight.position.set(0, 0, 0);
    pointLight.castShadow = true;
    this.#light = pointLight;
    group.add(pointLight);

    return group;
  }
}
