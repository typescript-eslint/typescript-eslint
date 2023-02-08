// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Foo {
  #priv1: number;
  #priv2: number = 1;

  constructor() {
    this.#priv1 = 1;
  }
}
