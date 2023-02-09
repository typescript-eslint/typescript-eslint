// TODO: This fixture might be too large, and if so should be split up.

class StaticGreeter {
  static greet(@required name: string) {
    return 'Hello ' + name + '!';
  }
}
