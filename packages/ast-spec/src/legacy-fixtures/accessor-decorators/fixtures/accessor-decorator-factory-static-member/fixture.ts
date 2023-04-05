// TODO: This fixture might be too large, and if so should be split up.

class Other {
  @foo({ baz: true })
  static get bar() {
    return this._bar;
  }
}
