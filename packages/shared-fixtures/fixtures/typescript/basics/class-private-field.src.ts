class Foo {
  #bar: string

  constructor(name: string) {
    this.#bar = name;
  }

  get bar () {
    return this.#bar
  }
}
