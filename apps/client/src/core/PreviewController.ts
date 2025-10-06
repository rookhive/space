import { PreviewScene } from './render/scenes/PreviewScene';

export class PreviewController {
  readonly #scene: PreviewScene;

  #graphicsRAFTimer!: number;

  constructor(container: HTMLDivElement) {
    this.#scene = new PreviewScene(container);
  }

  dispose() {
    cancelAnimationFrame(this.#graphicsRAFTimer);
  }

  startLoop() {
    const loop = () => {
      this.#graphicsRAFTimer = requestAnimationFrame(loop);
      this.#graphicsStep();
    };
    loop();
  }

  setAudioTrack(track: MediaStreamTrack) {
    this.#scene.setAudioStream(track);
  }

  setVideoTrack(track: MediaStreamTrack) {
    this.#scene.setVideoStream(track);
  }

  deleteAudioTrack() {
    this.#scene.deleteAudioStream();
  }

  deleteVideoTrack() {
    this.#scene.deleteVideoStream();
  }

  setUserColor(color: number) {
    this.#scene.setUserColor(color);
  }

  #graphicsStep() {
    this.#scene.step();
  }
}
