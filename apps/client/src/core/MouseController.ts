import { Disposable } from './Disposable';

export type MouseInput = {
  yaw: number;
  pitch: number;
};

type Listeners = {
  onPointerLockToggle: (isPointerLocked: boolean) => void;
};

type Options = {
  listeners: Listeners;
};

export class MouseController extends Disposable {
  static readonly #MAX_PITCH = Math.PI / 2 - 0.01;
  static readonly #MAX_YAW = Math.PI * 2;

  readonly #container: HTMLElement;
  readonly #listeners: Listeners;

  #yaw = 0;
  #pitch = 0;
  #sensitivity = 0.001;
  #hasFreshInput = false;

  constructor(container: HTMLElement, options: Options) {
    super();

    this.#container = container;
    this.#listeners = options.listeners;

    this.#setupPointerLock();
    this.#setupMouseListeners();
  }

  hasFreshInput() {
    return this.#hasFreshInput;
  }

  flushCurrentInput() {
    this.#hasFreshInput = false;
    return this.getCurrentInput();
  }

  getCurrentInput(): MouseInput {
    return {
      yaw: this.#yaw,
      pitch: this.#pitch,
    };
  }

  setSensitivity(sensitivity: number) {
    this.#sensitivity = sensitivity;
  }

  async requestPointerLock() {
    if (document.pointerLockElement !== this.#container) {
      try {
        await this.#container.requestPointerLock();
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'SecurityError') return;
        throw error;
      }
    }
  }

  #setupPointerLock() {
    const handleClick = this.requestPointerLock.bind(this);
    const handlePointerLockChange = () => {
      const isPointerLocked = document.pointerLockElement === this.#container;
      this.#listeners.onPointerLockToggle(isPointerLocked);
    };

    this.#container.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    this.addDisposer(() => {
      this.#container.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    });
  }

  #setupMouseListeners() {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== this.#container) return;
      const MAX_PITCH = MouseController.#MAX_PITCH;
      const MAX_YAW = MouseController.#MAX_YAW;
      this.#hasFreshInput = true;
      this.#yaw -= event.movementX * this.#sensitivity;
      this.#yaw = ((this.#yaw % MAX_YAW) + MAX_YAW) % MAX_YAW;
      this.#pitch -= event.movementY * this.#sensitivity;
      this.#pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.#pitch));
    };

    document.addEventListener('mousemove', handleMouseMove);

    this.addDisposer(() => {
      document.removeEventListener('mousemove', handleMouseMove);
    });
  }
}
