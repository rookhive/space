export class Disposable {
  #disposers: VoidFunction[] = [];

  dispose() {
    for (const disposer of this.#disposers) {
      disposer();
    }
  }

  protected addDisposer(disposer: VoidFunction) {
    this.#disposers.push(disposer);
  }
}
