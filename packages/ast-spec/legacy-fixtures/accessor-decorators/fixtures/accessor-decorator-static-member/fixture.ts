// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

class User {
  @adminonly
  static set y(a) {
    this._y = a;
  }
}
