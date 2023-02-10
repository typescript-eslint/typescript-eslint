// TODO: This fixture might be too large, and if so should be split up.

class Foo {
  #priv1: number;
  #priv2: number = 1;

  constructor() {
    this.#priv1 = 1;
  }
}
