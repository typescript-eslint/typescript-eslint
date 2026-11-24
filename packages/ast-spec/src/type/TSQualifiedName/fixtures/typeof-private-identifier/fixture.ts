class Foo {
  #bar = 1;
  method(other: Foo): typeof other.#bar {
    return other.#bar;
  }
}
