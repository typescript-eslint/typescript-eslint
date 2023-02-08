// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class Other {
  @foo({ baz: true })
  static get bar() {
    return this._bar;
  }
}
