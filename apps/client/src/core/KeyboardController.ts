import { UserAction } from '@repo/typesystem';
import { Disposable } from './Disposable';

export class KeyboardController extends Disposable {
  readonly #pressedKeys = new Set<string>();
  readonly #actionMap = new Map<string, UserAction>([
    ['KeyW', UserAction.Forward],
    ['KeyD', UserAction.Right],
    ['KeyS', UserAction.Backward],
    ['KeyA', UserAction.Left],
    ['KeyC', UserAction.Crouch],
    ['Space', UserAction.Jump],
    ['ShiftLeft', UserAction.Run],
  ]);

  #hasFreshInput = false;

  constructor() {
    super();
    this.setupKeyboardListeners();
  }

  hasFreshInput() {
    return this.#hasFreshInput;
  }

  flushCurrentInput() {
    this.#hasFreshInput = false;
    return this.getCurrentInput();
  }

  getCurrentInput() {
    return Array.from(this.#pressedKeys).reduce(
      (action, key) => action | (this.#actionMap.get(key) || 0),
      0
    );
  }

  setupKeyboardListeners() {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (this.#actionMap.has(e.code)) {
        e.preventDefault();
        const isKeyPressed = this.#pressedKeys.has(e.code);
        if (!isKeyPressed) {
          this.#hasFreshInput = true;
          this.#pressedKeys.add(e.code);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (this.#actionMap.has(e.code)) {
        e.preventDefault();
        const isKeyPressed = this.#pressedKeys.has(e.code);
        if (isKeyPressed) {
          this.#hasFreshInput = true;
          this.#pressedKeys.delete(e.code);
        }
      }
    };

    // We need this to prevent accidentally closing the tab with Ctrl+W
    const handleUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    this.addDisposer(() => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    });
  }
}
