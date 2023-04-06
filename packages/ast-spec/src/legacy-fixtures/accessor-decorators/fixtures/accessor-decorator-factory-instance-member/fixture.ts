// TODO: This fixture might be too large, and if so should be split up.

class Point {
  @configurable(false)
  get x() {
    return this._x;
  }
}
