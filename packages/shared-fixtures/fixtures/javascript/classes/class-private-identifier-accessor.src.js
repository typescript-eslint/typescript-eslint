class Foo {
  get #priv1() { return 1 }
  set #priv1(value) { }

  constructor() {
    this.#priv1 = 1;
  }
}
