// TODO: This fixture might be too large, and if so should be split up.

class User {
  @adminonly
  static set y(a) {
    this._y = a;
  }
}
